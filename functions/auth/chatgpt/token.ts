import { encrypt, decrypt, getAccessPadding, getRefreshPadding } from "../../crypto";

interface Env {
  WORDSWITHCHAT_AUTH: KVNamespace;
  ENCRYPT_CODE_SECRET: string;
  APP_CLIENT_ID: string;
  APP_CLIENT_SECRET: string;
  ENCRYPT_ACCESS_TOKEN_SECRET: string;
  ENCRYPT_REFRESH_TOKEN_SECRET: string;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const formData = await context.request.formData();
  console.log(
    "🚀 ~ constonRequestPost:PagesFunction<Env>= ~ formData:",
    formData
  );

  if (formData.get("grant_type") === "authorization_code") {
    if (
      formData.get("client_id") !== context.env.APP_CLIENT_ID ||
      formData.get("client_secret") !== context.env.APP_CLIENT_SECRET
    ) {
      return new Response("", {
        status: 500,
        statusText: "Bad Client.",
      });
    }

    const decryptedCode = await decrypt(
      formData.get("code")!,
      context.env.ENCRYPT_CODE_SECRET
    );
    const parts = decryptedCode.split("%");

    if (Date.now() > Number(parts[1])) {
      return new Response("", {
        status: 500,
        statusText: "Bad Code.",
      });
    }

    const id = parts[0];
    const expires = Date.now() + 30 * 60 * 1000;

    const accessTokenPadding = getAccessPadding(
      context.env.ENCRYPT_ACCESS_TOKEN_SECRET
    );

    const refreshTokenPadding = getRefreshPadding(
      context.env.ENCRYPT_REFRESH_TOKEN_SECRET
    );

    const accessToken = await encrypt(
      `${id}%${accessTokenPadding}%${expires}`,
      context.env.ENCRYPT_ACCESS_TOKEN_SECRET
    );

    const refreshToken = await encrypt(
      `${id}%${refreshTokenPadding}`,
      context.env.ENCRYPT_REFRESH_TOKEN_SECRET
    );

    return Response.json({
      access_token: accessToken,
      token_type: "bearer",
      refresh_token: refreshToken,
      expires_in: 30 * 60 - 2,
    });
  } else if (formData.get("grant_type") === "refresh_token") {
    const decrypted = await decrypt(
      formData.get("refresh_token")!,
      context.env.ENCRYPT_REFRESH_TOKEN_SECRET
    );

    const random = getRefreshPadding(context.env.ENCRYPT_REFRESH_TOKEN_SECRET);
    const parts = decrypted.split("%");
    const isValid = parts[1] === random;

    if (!isValid) {
      return new Response("", {
        status: 401,
        statusText: "Bad Refresh Token.",
      });
    }

    // TODO: do a check against auth provider for validity of the token.
    // TODO: check the id startsWith and do a get to the token with the access token
    // TODO: if expired then get a new access and update KV

    const expires = Date.now() + 30 * 60 * 1000;
    const accessToken = await encrypt(
      `${parts[0]}%${getAccessPadding(
        context.env.ENCRYPT_ACCESS_TOKEN_SECRET
      )}%${expires}`,
      context.env.ENCRYPT_ACCESS_TOKEN_SECRET
    );

    return Response.json({
      access_token: accessToken,
      token_type: "bearer",
      expires_in: 30 * 60 - 2,
    });
  } else {
    console.error("Could not determine auth flow requested.");
    return new Response("", {
      status: 401,
      statusText: "Unauthorized.",
    });
  }
};
