import crypto from "crypto";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12;

function getEncryptionKeyBuffer(): Buffer {
  const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY;
  if (!ENCRYPTION_KEY || ENCRYPTION_KEY.length !== 32) {
    throw new Error("ENCRYPTION_KEY env var must be exactly 32 characters. Set it in .env.local or your deployment environment.");
  }
  return Buffer.from(ENCRYPTION_KEY);
}

export function encrypt(text: string): string {
  const key = getEncryptionKeyBuffer();
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");

  const tag = cipher.getAuthTag();
  return `${iv.toString("hex")}:${encrypted}:${tag.toString("hex")}`;
}

export function decrypt(text: string): string {
  try {
    const [ivHex, encryptedHex, tagHex] = text.split(":");
    if (!ivHex || !encryptedHex || !tagHex) return text;

    const key = getEncryptionKeyBuffer();
    const iv = Buffer.from(ivHex, "hex");
    const tag = Buffer.from(tagHex, "hex");
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(tag);

    let decrypted = decipher.update(encryptedHex, "hex", "utf8");
    decrypted += decipher.final("utf8");

    return decrypted;
  } catch (error) {
    console.error("Decryption failed:", error);
    return text;
  }
}
