interface Env {
  GOOGLE_CLIENT_ID: string;
  GOOGLE_REDIRECT_URI: string;
  GOOGLE_AUTH_URI: string;
  CURRENT_PAGE_URL: string;
  WORDSWITHCHAT_AUTH: KVNamespace;
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const search = new URL(context.request.url).search;
  const query = new URLSearchParams(search);

  if (
    !query.has("client_id") ||
    !query.has("redirect_uri") ||
    !query.has("state")
  ) {
    return Response.redirect(
      `${context.env.CURRENT_PAGE_URL}?error=Something Bad Happened`,
      302,
    );
  }

  await context.env.WORDSWITHCHAT_AUTH.put(
    `state:${query.get("state")}`,
    search,
  );

  const params = new URLSearchParams({
    access_type: "offline",
    client_id: context.env.GOOGLE_CLIENT_ID,
    include_granted_scopes: "true",
    redirect_uri: `${context.env.CURRENT_PAGE_URL}${context.env.GOOGLE_REDIRECT_URI}`,
    response_type: "code",
    scope: "openid",
    state: query.get("state")!,
  }).toString();

  return Response.redirect(`${context.env.GOOGLE_AUTH_URI}?${params}`, 302);
};
