interface Env {
  ENCRYPT_SALT: string;
  ENCRYPT_INIT_VECTOR: string;
  ENCRYPT_PASSWORD: string;
}

const encoder = new TextEncoder();
const decoder = new TextDecoder();

const bytesToBase64 = (bytes: Iterable<number>) =>
  btoa(String.fromCharCode(...bytes));

const bytesToBase64URL = (bytes: Iterable<number>) =>
  bytesToBase64(bytes)
    .replaceAll("+", "-")
    .replaceAll("/", "_")
    .replaceAll("=", "");

const base64ToBytes = (str: string) =>
  Uint8Array.from(atob(str), (c) => c.charCodeAt(0));

const base64URLToBytes = (str: string) =>
  base64ToBytes(str.replaceAll("-", "+").replaceAll("_", "/"));

const deriveKey = async (
  password: string,
  salt: Uint8Array
): Promise<CryptoKey> => {
  const passwordKey = await crypto.subtle.importKey(
    "raw",
    encoder.encode(password),
    "PBKDF2",
    false,
    ["deriveKey"]
  );

  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt,
      iterations: 100000,
      hash: "SHA-256",
    },
    passwordKey,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
};

export const encrypt = async (value: string, env: Env) => {
  try {
    const encodedValue = encoder.encode(value);

    const salt = new Uint8Array(encoder.encode(env.ENCRYPT_SALT));
    const iv = new Uint8Array(encoder.encode(env.ENCRYPT_INIT_VECTOR));
    const aesKey = await deriveKey(env.ENCRYPT_PASSWORD, salt);

    const encryptedContent = await crypto.subtle.encrypt(
      {
        name: "AES-GCM",
        iv,
      },
      aesKey,
      encodedValue
    );

    return bytesToBase64URL(new Uint8Array(encryptedContent));
  } catch (e: any) {
    console.error("Failed to encrypt.", e.message);
    throw e;
  }
};

export const decrypt = async (secret: string, env: Env) => {
  try {
    const decodedData = base64URLToBytes(secret);

    const salt = new Uint8Array(encoder.encode(env.ENCRYPT_SALT));
    const iv = new Uint8Array(encoder.encode(env.ENCRYPT_INIT_VECTOR));
    const aesKey = await deriveKey(env.ENCRYPT_PASSWORD, salt);

    const decryptedContent = await crypto.subtle.decrypt(
      {
        name: "AES-GCM",
        iv,
      },
      aesKey,
      decodedData
    );

    return decoder.decode(decryptedContent);
  } catch (e: any) {
    console.error("Failed to decrypt.", e.message);
    throw e;
  }
};
