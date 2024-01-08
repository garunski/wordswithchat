//new URLSearchParams(new URL(url).search)

interface Env {
  GOOGLE_CLIENT_ID: string;
  GOOGLE_CLIENT_SECRET: string;
  GOOGLE_TOKEN_URI: string;
  GOOGLE_REDIRECT_URI: string;
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  let query = new URLSearchParams(new URL(context.request.url).search);

  const response = await fetch(context.env.GOOGLE_TOKEN_URI, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      accept: "application/json",
    },
    body: JSON.stringify({
      client_id: context.env.GOOGLE_CLIENT_ID,
      client_secret: context.env.GOOGLE_CLIENT_SECRET,
      redirect_uri: context.env.GOOGLE_REDIRECT_URI,
      code: query.get("code"),
      grant_type: "authorization_code",
    }),
  });
  const result: any = await response.json();

  console.log(result);

  return Response.json({ any: "test" });
};
