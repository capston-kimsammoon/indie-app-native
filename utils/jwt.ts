// utils/jwt.ts
import { Buffer } from "buffer";

export function decodeJwtPayload<T = any>(jwt: string): T | null {
  try {
    const payload = jwt.split(".")[1];
    if (!payload) return null;

    // base64url -> base64 (+ 패딩 보정)
    let base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    const pad = base64.length % 4;
    if (pad === 2) base64 += "==";
    else if (pad === 3) base64 += "=";
    else if (pad !== 0) return null;

    const json = Buffer.from(base64, "base64").toString("utf8");
    return JSON.parse(json) as T;
  } catch (e) {
    console.warn("JWT payload decode failed:", e);
    return null;
  }
}