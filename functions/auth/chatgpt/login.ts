import { encrypt } from "../../crypto";
import html from "./login.html";

interface Env {
  CURRENT_PAGE_URL: string;
  APP_CLIENT_ID: string;
}

export const onRequest: PagesFunction<Env> = async (context) => {
  let query = new URLSearchParams(new URL(context.request.url).search);
  console.log("🚀 ~ constonRequest:PagesFunction<Env>= ~ query:", query)
  if (
    !query.has("client_id") ||
    query.get("client_id") !== context.env.APP_CLIENT_ID ||
    !query.has("redirect_uri") ||
    !query.has("state")
  ) {
    return Response.redirect(
      `${context.env.CURRENT_PAGE_URL}?error=Something Bad Happened`,
      302
    );
  }

  let transformedHtml = html
    .replace("WORDS_REDIRECT_URI", query.get("redirect_uri")!)
    .replace("WORDS_CLIENT_ID", query.get("client_id")!)
    .replace("WORDS_STATE", query.get("state")!);

  return new Response(transformedHtml, {
    headers: { "Content-Type": "text/html" },
  });
};
