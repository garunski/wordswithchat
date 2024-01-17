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
  salt: string,
): Promise<CryptoKey> => {
  const saltArray = new Uint8Array(encoder.encode(salt));
  const passwordKey = await crypto.subtle.importKey(
    "raw",
    encoder.encode(password),
    "PBKDF2",
    false,
    ["deriveKey"],
  );

  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: saltArray,
      iterations: 256,
      hash: "SHA-256",
    },
    passwordKey,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"],
  );
};

const generateKeys = (value: string) => ({
  password: value.slice(0, 60),
  salt: value.slice(value.length - 40, value.length),
  iv: value.slice(value.length - 60, value.length - 20),
});

export const encrypt = async (value: string, key: string) => {
  try {
    const { password, salt, iv } = generateKeys(key);
    const aesKey = await deriveKey(password, salt);

    const encryptedContent = await crypto.subtle.encrypt(
      {
        name: "AES-GCM",
        iv: new Uint8Array(encoder.encode(iv)),
      },
      aesKey,
      encoder.encode(value),
    );

    return bytesToBase64URL(new Uint8Array(encryptedContent));
  } catch (e: any) {
    console.error("Failed to encrypt.", e.message);
    throw e;
  }
};

export const decrypt = async (secret: string, key: string) => {
  try {
    const { password, salt, iv } = generateKeys(key);

    const aesKey = await deriveKey(password, salt);

    const decryptedContent = await crypto.subtle.decrypt(
      {
        name: "AES-GCM",
        iv: new Uint8Array(encoder.encode(iv)),
      },
      aesKey,
      base64URLToBytes(secret),
    );

    return decoder.decode(decryptedContent);
  } catch (e: any) {
    console.error("Failed to decrypt.", e.message);
    throw e;
  }
};

export const getRefreshPadding = (refresh: string) =>
  refresh.slice(refresh.length / 2, refresh.length / 2 + 40);

export const getAccessPadding = (access: string) =>
  access.slice(access.length / 2, access.length / 2 + 40);
