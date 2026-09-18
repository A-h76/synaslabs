import { NextResponse } from "next/server";
import type { Actor } from "@/domain/entities";
import { loadDocumentObject } from "@/server/dal/commercial";

export async function documentFileResponse(actor: Actor, id: string) {
  const result = await loadDocumentObject(actor, id);
  if (!result.ok) {
    return new NextResponse(
      "This document is recorded. File storage is not connected, so bytes are not served from guessed or stored URLs.",
      {
        status: 503,
        headers: { "Cache-Control": "private, no-store" },
      },
    );
  }
  return new NextResponse(Buffer.from(result.body), {
    headers: {
      "Content-Type": result.mimeType || "application/octet-stream",
      "Content-Disposition": `attachment; filename="${encodeURIComponent(result.title)}"`,
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
