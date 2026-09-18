import { documentFileResponse } from "@/server/http/document-response";
import { requireTeamActor } from "@/server/dal/access";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const actor = await requireTeamActor();
  const { id } = await context.params;
  return documentFileResponse(actor, id);
}
