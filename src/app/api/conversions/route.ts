import { NextResponse } from "next/server";
import { auth } from "@/auth";
import {
  cleanupExpiredConversions,
  ensureUserRecord,
  getExpirationIso,
  getCanonicalUserId,
  getConversionsForOwner,
  insertConversionForUser,
  mapConversionRow,
} from "@/lib/conversionsServer";

type CreateConversionPayload = {
  id: string;
  toolId: string;
  toolSlug: string;
  toolName: string;
  fileName: string;
  status: "completed" | "failed";
  uploadUrl: string;
  cloudinaryPublicId?: string | null;
  cloudinaryResourceType?: string | null;
};

type MaybeSupabaseError = {
  code?: string | null;
  details?: string | null;
  hint?: string | null;
  message?: string | null;
};

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ conversions: [] });
  }

  const { error, userId } = await ensureUserRecord({
    id: session.user.id,
    name: session.user.name ?? null,
    email: session.user.email ?? null,
    image: session.user.image ?? null,
  });

  if (error) {
    console.error("Supabase user sync failed:", error);
    return NextResponse.json({ error: "Failed to load conversions." }, { status: 500 });
  }

  const conversions = await getConversionsForOwner({
    userId: userId ?? (await getCanonicalUserId({ id: session.user.id, email: session.user.email ?? null })),
  });
  return NextResponse.json({ conversions });
}

export async function POST(request: Request) {
  await cleanupExpiredConversions();
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  const { error: userError, userId } = await ensureUserRecord({
    id: session.user.id,
    name: session.user.name ?? null,
    email: session.user.email ?? null,
    image: session.user.image ?? null,
  });

  if (userError) {
    console.error("Supabase user sync failed:", userError);
    return NextResponse.json(
      {
        error: userError.message ?? "Failed to sync user.",
        code: userError.code ?? null,
        details: userError.details ?? null,
        hint: userError.hint ?? null,
      },
      { status: 500 },
    );
  }

  const payload = (await request.json()) as Partial<CreateConversionPayload>;

  if (!payload.id || !payload.toolId || !payload.toolSlug || !payload.toolName || !payload.fileName) {
    return NextResponse.json({ error: "Missing conversion data." }, { status: 400 });
  }

  if (!payload.uploadUrl) {
    return NextResponse.json({ error: "Upload URL missing." }, { status: 400 });
  }

  const expiresAt = getExpirationIso();

  const insertPayload = {
    id: payload.id,
    toolid: payload.toolId,
    toolslug: payload.toolSlug,
    toolname: payload.toolName,
    filename: payload.fileName,
    status: payload.status ?? "completed",
    uploadurl: payload.uploadUrl,
    expiresat: expiresAt,
    cloudinarypublicid: payload.cloudinaryPublicId ?? null,
    cloudinaryresourcetype: payload.cloudinaryResourceType ?? null,
    userid: userId ?? session.user.id,
  };

  const { data, error } = await insertConversionForUser(insertPayload);

  if (error || !data) {
    const supabaseError = error as MaybeSupabaseError | null;
    console.error("Supabase insert failed:", supabaseError);
    return NextResponse.json(
      {
        error: supabaseError?.message ?? "Failed to save conversion.",
        code: supabaseError?.code ?? null,
        details: supabaseError?.details ?? null,
        hint: supabaseError?.hint ?? null,
      },
      { status: 500 },
    );
  }

  const conversion = mapConversionRow(data as Parameters<typeof mapConversionRow>[0]);
  return NextResponse.json({ conversion });
}
