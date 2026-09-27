import { jest } from "@jest/globals";
import request from "supertest";
import jwt from "jsonwebtoken";
import app from "../src/index.js";
import { generateToken } from "../src/lib/utils.js";

process.env.JWT_SECRET = "test-secret";

describe("Health check", () => {
  test("GET /health returns 200 and status ok", async () => {
    const res = await request(app).get("/health");
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ status: "ok" });
  });
});

describe("Signup validation", () => {
  test("returns 400 when fields are missing", async () => {
    const res = await request(app).post("/api/auth/signup").send({ email: "a@test.com" });
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe("All fields are required");
  });

  test("returns 400 when password is shorter than 6 characters", async () => {
    const res = await request(app)
      .post("/api/auth/signup")
      .send({ fullName: "Test User", email: "a@test.com", password: "123" });
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe("Password must be at least 6 characters");
  });
});

describe("Protected routes", () => {
  test("GET /api/auth/check without a token returns 401", async () => {
    const res = await request(app).get("/api/auth/check");
    expect(res.statusCode).toBe(401);
  });

  test("GET /api/messages/users without a token returns 401", async () => {
    const res = await request(app).get("/api/messages/users");
    expect(res.statusCode).toBe(401);
  });
});

describe("Logout", () => {
  test("POST /api/auth/logout clears the jwt cookie", async () => {
    const res = await request(app).post("/api/auth/logout");
    expect(res.statusCode).toBe(200);
    expect(res.headers["set-cookie"][0]).toMatch(/^jwt=;/);
  });
});

describe("generateToken", () => {
  test("creates a valid JWT and sets it as an httpOnly cookie", () => {
    const res = { cookie: jest.fn() };
    const token = generateToken("user123", res);

    const decoded = jwt.verify(token, "test-secret");
    expect(decoded.userId).toBe("user123");
    expect(res.cookie).toHaveBeenCalledWith(
      "jwt",
      token,
      expect.objectContaining({ httpOnly: true, sameSite: "strict" })
    );
  });
});
