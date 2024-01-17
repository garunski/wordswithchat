import jwt from "@tsndr/cloudflare-worker-jwt";
import { encrypt, decrypt } from "../../crypto";

interface Env {
  GOOGLE_CLIENT_ID: string;
  GOOGLE_CLIENT_SECRET: string;
  GOOGLE_TOKEN_URI: string;
  GOOGLE_REDIRECT_URI: string;
  CF_PAGES_URL: string;
  WORDSWITHCHAT_AUTH: KVNamespace;
  ENCRYPT_CODE_SECRET: string;
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const query = new URLSearchParams(new URL(context.request.url).search);

  const response = await fetch(context.env.GOOGLE_TOKEN_URI, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      accept: "application/json",
    },
    body: JSON.stringify({
      client_id: context.env.GOOGLE_CLIENT_ID,
      client_secret: context.env.GOOGLE_CLIENT_SECRET,
      redirect_uri: `${context.env.CF_PAGES_URL}${context.env.GOOGLE_REDIRECT_URI}`,
      code: query.get("code"),
      grant_type: "authorization_code",
    }),
  });
  const result: any = await response.json();

  const idToken = jwt.decode(result.id_token);

  const initialCall = await context.env.WORDSWITHCHAT_AUTH.get(
    `state:${query.get("state")}`
  );
  const initialParams = new URLSearchParams(initialCall!);

  await context.env.WORDSWITHCHAT_AUTH.delete(`state:${query.get("state")}`);

  await context.env.WORDSWITHCHAT_AUTH.delete(`google:${idToken.payload!.sub}`);

  await context.env.WORDSWITHCHAT_AUTH.put(
    `google:${idToken.payload!.sub}`,
    JSON.stringify({
      accessToken: result.access_token,
      expiresIn: result.expires_in,
      refreshToken: result.refresh_token,
    })
  );

  const code = await encrypt(
    `google:${idToken.payload!.sub}%${Date.now() + 5 * 60 * 1000}`,
    context.env.ENCRYPT_CODE_SECRET
  );

  const params = new URLSearchParams({
    state: initialParams.get("state")!,
    code,
  }).toString();

  return Response.redirect(
    `${initialParams.get("redirect_uri")}?${params}`,
    302
  );
};
