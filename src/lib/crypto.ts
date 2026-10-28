import { createCipheriv, createDecipheriv, createHash, createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { env } from "@/lib/env";

function encryptionKey() {
  return createHash("sha256").update(env.AUTH_SECRET).digest();
}

export function encryptText(plaintext: string) {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", encryptionKey(), iv);
  const ciphertext = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return [iv.toString("base64"), tag.toString("base64"), ciphertext.toString("base64")].join(":");
}

export function decryptText(payload: string) {
  const parts = payload.split(":");
  if (parts.length !== 3) {
    throw new Error("Invalid encrypted payload");
  }
  const [iv, tag, ciphertext] = parts.map((part) => Buffer.from(part, "base64"));
  const decipher = createDecipheriv("aes-256-gcm", encryptionKey(), iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(ciphertext), decipher.final()]).toString("utf8");
}

export function signValue(value: string) {
  const signature = createHmac("sha256", env.AUTH_SECRET).update(value).digest("base64url");
  return `${Buffer.from(value, "utf8").toString("base64url")}.${signature}`;
}

export function verifySignedValue(signed: string) {
  const separator = signed.lastIndexOf(".");
  if (separator === -1) {
    return null;
  }
  const encoded = signed.slice(0, separator);
  const signature = signed.slice(separator + 1);
  const value = Buffer.from(encoded, "base64url").toString("utf8");
  const expected = createHmac("sha256", env.AUTH_SECRET).update(value).digest("base64url");
  if (signature.length !== expected.length) {
    return null;
  }
  if (!timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) {
    return null;
  }
  return value;
}
