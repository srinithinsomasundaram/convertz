import Link from "next/link";
import { auth } from "@/auth";
import { toolIdBySlug } from "@/lib/toolSlugs";
import { getCanonicalUserId, getConversionById } from "@/lib/conversionsServer";

export default async function ConversionDetailPage({
  params,
}: {
  params: Promise<{ tool: string; id: string }>;
}) {
  const { tool: toolParam, id: idParam } = await params;
  const session = await auth();
  const canonicalUserId = await getCanonicalUserId({
    id: session?.user?.id,
    email: session?.user?.email ?? null,
  });
  const entry = await getConversionById({
    id: idParam,
    userId: canonicalUserId,
  });

  const expectedToolId = toolParam ? toolIdBySlug[toolParam] : undefined;
  const resolvedEntry = entry && entry.toolSlug === toolParam ? entry : null;
  const status: "ready" | "notfound" = resolvedEntry ? "ready" : "notfound";

  return (
    <div className="min-h-screen bg-slate-50 px-6 py-10">
      <div className="mx-auto w-full max-w-3xl">
        <Link
          href="/"
          className="text-sm font-semibold text-slate-500 hover:text-indigo-600"
        >
          Back to tools
        </Link>

        <div className="mt-6 rounded-[32px] border border-slate-100 bg-white p-8 shadow-sm">
          {status === "notfound" && (
            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-slate-900">
                Conversion not found
              </h1>
              <p className="text-sm text-slate-500">
                We couldn&apos;t find this conversion. It may have expired or
                been cleared.
              </p>
            </div>
          )}

          {status === "ready" && resolvedEntry && (
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl font-bold text-slate-900">
                  {resolvedEntry.toolName}
                </h1>
                <p className="text-sm text-slate-500">
                  {resolvedEntry.fileName}
                </p>
              </div>

              <div className="grid gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-4 text-sm text-slate-600">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Status
                  </span>
                  <span
                    className={`rounded-full px-3 py-1 text-[11px] font-bold ${
                      resolvedEntry.status === "failed"
                        ? "bg-rose-100 text-rose-700"
                        : "bg-emerald-100 text-emerald-700"
                    }`}
                  >
                    {resolvedEntry.status === "failed" ? "Failed" : "Completed"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Conversion ID
                  </span>
                  <span className="font-mono text-xs text-slate-600">
                    {resolvedEntry.id}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Tool slug
                  </span>
                  <span className="text-xs font-semibold text-slate-600">
                    {resolvedEntry.toolSlug}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Created
                  </span>
                  <span className="text-xs font-semibold text-slate-600">
                    {new Date(resolvedEntry.createdAt).toLocaleString()}
                  </span>
                </div>
              </div>

              {resolvedEntry.uploadUrl ? (
                <div className="rounded-2xl border border-indigo-100 bg-indigo-50 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-bold text-indigo-700">
                        File stored in the cloud
                      </p>
                      <p className="text-xs text-indigo-500">
                        Available for 30 minutes from creation.
                      </p>
                    </div>
                    <a
                      href={resolvedEntry.uploadUrl}
                      download={resolvedEntry.fileName}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-full bg-indigo-600 px-6 py-2 text-sm font-bold text-white shadow hover:bg-indigo-500"
                    >
                      Download File
                    </a>
                  </div>
                </div>
              ) : (
                <div className="rounded-2xl border border-rose-100 bg-rose-50 p-6">
                  <p className="text-sm font-bold text-rose-700">
                    File no longer available
                  </p>
                  <p className="text-xs text-rose-500">
                    This conversion has expired and was removed.
                  </p>
                </div>
              )}

              {expectedToolId ? (
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 font-mono">
                  URL: /{toolParam}/{resolvedEntry.id}
                </p>
              ) : (
                <p className="text-xs font-semibold uppercase tracking-wide text-rose-500">
                  Unknown tool slug
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
