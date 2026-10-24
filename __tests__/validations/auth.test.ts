import { loginSchema, registerSchema } from "@/lib/validations/auth";

describe("auth validation", () => {
  it("accepts a valid login payload", () => {
    const result = loginSchema.safeParse({
      email: "aria@vaultforge.dev",
      password: "Password123!",
    });
    expect(result.success).toBe(true);
  });

  it("rejects weak registration passwords", () => {
    const result = registerSchema.safeParse({
      email: "new@vaultforge.dev",
      username: "newbie",
      password: "short",
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid usernames", () => {
    const result = registerSchema.safeParse({
      email: "new@vaultforge.dev",
      username: "Bad Name!",
      password: "Password123!",
    });
    expect(result.success).toBe(false);
  });
});
