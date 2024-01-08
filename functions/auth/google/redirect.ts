interface Env {
  GOOGLE_CLIENT_ID: string;
  GOOGLE_REDIRECT_URI: string;
  GOOGLE_AUTH_URI: string;
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const params = new URLSearchParams({
    access_type: "offline",
    client_id: context.env.GOOGLE_CLIENT_ID,
    include_granted_scopes: "true",
    redirect_uri: context.env.GOOGLE_REDIRECT_URI,
    response_type: "code",
    scope: "openid email profile",
  }).toString();

  return Response.redirect(`${context.env.GOOGLE_AUTH_URI}?${params}`, 302);
};
