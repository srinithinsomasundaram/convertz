import "server-only";
import cloudinary from "@/lib/cloudinary";
import { createSupabaseServerClient } from "@/lib/supabaseServer";
import { HISTORY_RETENTION_MS, type ConversionHistoryItem } from "@/lib/conversionHistory";

export const GUEST_COOKIE_NAME = "convertz_guest_id";

type ConversionRow = {
  id: string;
  toolid?: string | null;
  toolslug?: string | null;
  toolname?: string | null;
  filename?: string | null;
  status?: string | null;
  uploadurl: string | null;
  createdat: string | null;
  expiresat: string | null;
  cloudinarypublicid?: string | null;
  cloudinaryresourcetype?: string | null;
  userid?: string | null;
};

type MaybeSupabaseError = {
  code?: string | null;
  details?: string | null;
  hint?: string | null;
  message?: string | null;
};

type InsertConversionPayload = {
  id: string;
  toolid: string;
  toolslug: string;
  toolname: string;
  filename: string;
  status: "completed" | "failed";
  uploadurl: string;
  expiresat: string;
  userid: string;
  cloudinarypublicid?: string | null;
  cloudinaryresourcetype?: string | null;
};

type EnsureUserRecordParams = {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
};

type UserRow = {
  email: string | null;
  id: string;
  image?: string | null;
  name?: string | null;
};

const baseSelectColumns = [
  "id",
  "toolid",
  "toolslug",
  "toolname",
  "filename",
  "status",
  "uploadurl",
  "createdat",
  "expiresat",
] as const;

const cloudinaryColumns = ["cloudinarypublicid", "cloudinaryresourcetype"] as const;
const cleanupSelectColumns = ["id", ...cloudinaryColumns] as const;
const unsupportedConversionColumns = new Set<string>();

function getMissingColumnName(error: MaybeSupabaseError | null | undefined) {
  if (error?.code !== "PGRST204") {
    return null;
  }

  const match = error.message?.match(/Could not find the '([^']+)' column/);
  return match?.[1] ?? null;
}

function markColumnUnavailable(column: string) {
  unsupportedConversionColumns.add(column);
}

function getSupportedColumns(columns: readonly string[]) {
  return columns.filter((column) => !unsupportedConversionColumns.has(column));
}

function getSelectFields(columns: readonly string[]) {
  return getSupportedColumns(columns).join(",");
}

function normalizeConversionRow(row: Partial<ConversionRow>, fallback: Partial<ConversionRow> = {}) {
  const merged = { ...fallback, ...row };

  return {
    id: merged.id ?? "",
    toolid: merged.toolid ?? "",
    toolslug: merged.toolslug ?? merged.toolid ?? "",
    toolname: merged.toolname ?? merged.toolslug ?? merged.toolid ?? "Conversion",
    filename: merged.filename ?? "Converted file",
    status: merged.status ?? "completed",
    uploadurl: merged.uploadurl ?? null,
    createdat: merged.createdat ?? null,
    expiresat: merged.expiresat ?? null,
    cloudinarypublicid: merged.cloudinarypublicid ?? null,
    cloudinaryresourcetype: merged.cloudinaryresourcetype ?? null,
    userid: merged.userid ?? null,
  } satisfies ConversionRow;
}

function stripUnsupportedColumns(payload: InsertConversionPayload) {
  return Object.fromEntries(
    Object.entries(payload).filter(([column]) => !unsupportedConversionColumns.has(column)),
  );
}

function payloadToFallbackRow(payload: InsertConversionPayload): Partial<ConversionRow> {
  return {
    id: payload.id,
    toolid: payload.toolid,
    toolslug: payload.toolslug,
    toolname: payload.toolname,
    filename: payload.filename,
    status: payload.status,
    uploadurl: payload.uploadurl,
    createdat: new Date().toISOString(),
    expiresat: payload.expiresat,
    cloudinarypublicid: payload.cloudinarypublicid ?? null,
    cloudinaryresourcetype: payload.cloudinaryresourcetype ?? null,
    userid: payload.userid,
  };
}

export const mapConversionRow = (row: ConversionRow): ConversionHistoryItem => ({
  id: row.id,
  toolId: row.toolid ?? "",
  toolSlug: row.toolslug ?? row.toolid ?? "",
  toolName: row.toolname ?? row.toolslug ?? row.toolid ?? "Conversion",
  fileName: row.filename ?? "Converted file",
  status: row.status === "failed" ? "failed" : "completed",
  uploadUrl: row.uploadurl ?? null,
  createdAt: row.createdat ? Date.parse(row.createdat) : Date.now(),
  expiresAt: row.expiresat ? Date.parse(row.expiresat) : null,
});

export async function cleanupExpiredConversions() {
  const supabase = createSupabaseServerClient();
  const nowIso = new Date().toISOString();
  let expired: Array<{ id: string; cloudinarypublicid: string | null; cloudinaryresourcetype: string | null }> = [];

  for (let attempt = 0; attempt <= cleanupSelectColumns.length; attempt += 1) {
    const fields = getSelectFields(cleanupSelectColumns);
    const { data, error } = await supabase
      .from("conversions")
      .select(fields || "id")
      .lte("expiresat", nowIso);

    const missingColumn = getMissingColumnName(error);
    if (missingColumn) {
      markColumnUnavailable(missingColumn);
      continue;
    }

    if (error || !data) {
      return;
    }

    expired = (data as Array<Partial<ConversionRow>>).map((item) => ({
      id: item.id ?? "",
      cloudinarypublicid: item.cloudinarypublicid ?? null,
      cloudinaryresourcetype: item.cloudinaryresourcetype ?? null,
    }));
    break;
  }

  if (expired.length === 0) {
    return;
  }

  await supabase.from("conversions").delete().in(
    "id",
    expired.map((item) => item.id),
  );

  await Promise.allSettled(
    expired
      .filter((item) => item.cloudinarypublicid)
      .map((item) =>
        cloudinary.uploader.destroy(item.cloudinarypublicid as string, {
          resource_type: item.cloudinaryresourcetype ?? "raw",
          invalidate: true,
        }),
      ),
  );
}

export async function getConversionsForOwner(params: {
  userId?: string | null;
  limit?: number;
}) {
  const { userId, limit = 30 } = params;
  if (!userId) return [] as ConversionHistoryItem[];

  await cleanupExpiredConversions();
  const supabase = createSupabaseServerClient();
  const nowIso = new Date().toISOString();
  const ownerField = "userid";
  const ownerValue = userId;

  for (let attempt = 0; attempt <= baseSelectColumns.length + cloudinaryColumns.length; attempt += 1) {
    const fields = getSelectFields([...baseSelectColumns, ...cloudinaryColumns]);
    const { data, error } = await supabase
      .from("conversions")
      .select(fields || "id")
      .eq(ownerField, ownerValue)
      .gt("expiresat", nowIso)
      .order("createdat", { ascending: false })
      .limit(limit);

    const missingColumn = getMissingColumnName(error);
    if (missingColumn) {
      markColumnUnavailable(missingColumn);
      continue;
    }

    if (error) {
      return [] as ConversionHistoryItem[];
    }

    return (data as Array<Partial<ConversionRow>> | null | undefined ?? []).map((row) =>
      mapConversionRow(normalizeConversionRow(row)),
    );
  }

  return [] as ConversionHistoryItem[];
}

export async function getConversionById(params: {
  id: string;
  userId?: string | null;
}) {
  const { id, userId } = params;
  if (!userId) return null;

  await cleanupExpiredConversions();
  const supabase = createSupabaseServerClient();
  const ownerField = "userid";
  const ownerValue = userId;

  for (let attempt = 0; attempt <= baseSelectColumns.length + cloudinaryColumns.length; attempt += 1) {
    const fields = getSelectFields([...baseSelectColumns, ...cloudinaryColumns]);
    const { data, error } = await supabase
      .from("conversions")
      .select(fields || "id")
      .eq("id", id)
      .eq(ownerField, ownerValue)
      .maybeSingle();

    const missingColumn = getMissingColumnName(error);
    if (missingColumn) {
      markColumnUnavailable(missingColumn);
      continue;
    }

    if (error || !data) {
      return null;
    }

    return mapConversionRow(normalizeConversionRow(data as Partial<ConversionRow>));
  }

  return null;
}

export function getExpirationIso() {
  return new Date(Date.now() + HISTORY_RETENTION_MS).toISOString();
}

export async function insertConversionForUser(payload: InsertConversionPayload) {
  const supabase = createSupabaseServerClient();
  const fallbackRow = payloadToFallbackRow(payload);

  for (let attempt = 0; attempt <= Object.keys(payload).length; attempt += 1) {
    const insertPayload = stripUnsupportedColumns(payload);
    const fields = getSelectFields([...baseSelectColumns, ...cloudinaryColumns]);
    const { data, error } = await supabase
      .from("conversions")
      .insert(insertPayload)
      .select(fields || "id")
      .single();

    const missingColumn = getMissingColumnName(error);
    if (missingColumn) {
      markColumnUnavailable(missingColumn);
      continue;
    }

    if (error || !data) {
      return { data: null, error };
    }

    return {
      data: normalizeConversionRow(data as Partial<ConversionRow>, fallbackRow),
      error: null,
    };
  }

  return { data: null, error: { code: "PGRST204", message: "Could not find a compatible conversions schema." } };
}

export async function getCanonicalUserId(params: {
  email?: string | null;
  id?: string | null;
}) {
  const { email, id } = params;
  if (!id && !email) {
    return null;
  }

  const supabase = createSupabaseServerClient();

  if (id) {
    const { data, error } = await supabase
      .from("users")
      .select("id")
      .eq("id", id)
      .maybeSingle();

    if (!error && data?.id) {
      return data.id as string;
    }
  }

  if (email) {
    const { data, error } = await supabase
      .from("users")
      .select("id")
      .eq("email", email)
      .maybeSingle();

    if (!error && data?.id) {
      return data.id as string;
    }
  }

  return id ?? null;
}

export async function ensureUserRecord(params: EnsureUserRecordParams) {
  const supabase = createSupabaseServerClient();
  const userPayload = {
    id: params.id,
    name: params.name ?? null,
    email: params.email ?? null,
    image: params.image ?? null,
  };

  const canonicalUserId = await getCanonicalUserId({
    id: params.id,
    email: params.email,
  });

  if (canonicalUserId && canonicalUserId !== params.id) {
    const { data, error } = await supabase
      .from("users")
      .update({
        email: params.email ?? null,
        image: params.image ?? null,
        name: params.name ?? null,
      })
      .eq("id", canonicalUserId)
      .select("id")
      .single();

    return { error, userId: (data as Pick<UserRow, "id"> | null)?.id ?? canonicalUserId };
  }

  const { data, error } = await supabase
    .from("users")
    .upsert(userPayload, { onConflict: "id", ignoreDuplicates: false })
    .select("id")
    .single();

  if (error?.code === "23505" && params.email) {
    const existingUserId = await getCanonicalUserId({ email: params.email });
    if (existingUserId) {
      const { data: recoveredData, error: recoveredError } = await supabase
        .from("users")
        .update({
          email: params.email ?? null,
          image: params.image ?? null,
          name: params.name ?? null,
        })
        .eq("id", existingUserId)
        .select("id")
        .single();

      return {
        error: recoveredError,
        userId: (recoveredData as Pick<UserRow, "id"> | null)?.id ?? existingUserId,
      };
    }
  }

  return {
    error,
    userId: (data as Pick<UserRow, "id"> | null)?.id ?? params.id,
  };
}
