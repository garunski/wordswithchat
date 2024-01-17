import { decrypt, getAccessPadding } from "../crypto";

interface Env {
  ENCRYPT_ACCESS_TOKEN_SECRET: string;
}

const authentication: PagesFunction<Env> = async (context) => {
  const authHeader = context.request.headers.get("Authorization");
  const acceptedTokenType = "Bearer ";
  if (!authHeader || !authHeader.startsWith(acceptedTokenType)) {
    return new Response("Unauthorized", { status: 403 });
  }

  const accessToken = authHeader.slice(acceptedTokenType.length);

  const decryptedCode = await decrypt(
    accessToken,
    context.env.ENCRYPT_ACCESS_TOKEN_SECRET,
  );

  const parts = decryptedCode.split("%");

  if (parts[1] !== getAccessPadding(context.env.ENCRYPT_ACCESS_TOKEN_SECRET)) {
    return new Response("Unauthorized", { status: 403 });
  }

  context.data.userId = parts[0];

  return context.next();
};

export const onRequest = [authentication];
