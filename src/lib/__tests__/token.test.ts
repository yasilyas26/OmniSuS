import { describe, expect, it } from "vitest";

import { generateToken, hashToken } from "../token";

describe("token", () => {
  it("menghasilkan token acak yang berbeda setiap kali", () => {
    expect(generateToken()).not.toBe(generateToken());
  });

  it("token berpanjang 43 karakter (32 byte base64url) dan aman untuk URL", () => {
    const token = generateToken();
    expect(token).toHaveLength(43);
    expect(token).toMatch(/^[A-Za-z0-9_-]+$/);
  });

  it("hash deterministik, 64 hex, dan tidak sama dengan token", () => {
    const token = generateToken();
    expect(hashToken(token)).toBe(hashToken(token));
    expect(hashToken(token)).toMatch(/^[0-9a-f]{64}$/);
    expect(hashToken(token)).not.toBe(token);
  });

  it("token berbeda → hash berbeda", () => {
    expect(hashToken("a")).not.toBe(hashToken("b"));
  });
});
