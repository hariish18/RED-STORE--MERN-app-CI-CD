const request = require("supertest");
const app = require("../app");
const User = require("../model/User");
const { createUser, tokenFor } = require("./helpers");

// /login is limited to 5 requests per IP per 15 min (loginLimiter): this file stays below that threshold
// (the counter is in-memory and Jest reloads modules for each test file).

const newUser = { name: "Alice", email: "alice@test.local", password: "secret123" };

// the password (plain text or hashed) must not appear anywhere in the response
const expectNoPassword = (body) => {
    const raw = JSON.stringify(body);
    expect(raw).not.toMatch(/"password"/);
    expect(raw).not.toContain(newUser.password);
};

describe("POST /api/auth/register", () => {
    it("creates the account, returns a token and no password", async () => {
        const res = await request(app).post("/api/auth/register").send(newUser);

        expect(res.status).toBe(201);
        expect(typeof res.body.token).toBe("string");
        expect(res.body.user).toMatchObject({ name: "Alice", email: "alice@test.local", role: "client" });
        expectNoPassword(res.body);
    });

    it("stores the password hashed, never in plain text", async () => {
        await request(app).post("/api/auth/register").send(newUser);

        const saved = await User.findOne({ email: newUser.email });
        expect(saved.password).not.toBe(newUser.password);
        expect(saved.password).toMatch(/^\$2[aby]\$/);
    });

    it("rejects an already used email", async () => {
        await createUser({ email: newUser.email });

        const res = await request(app).post("/api/auth/register").send(newUser);

        expect(res.status).toBe(400);
        expect(res.body.message).toBe("User already exists");
    });

    it("rejects invalid data (validation)", async () => {
        const res = await request(app)
            .post("/api/auth/register")
            .send({ name: "", email: "not-an-email", password: "123" });

        expect(res.status).toBe(400);
        expect(Array.isArray(res.body.errors)).toBe(true);
        expect(res.body.errors.map((e) => e.path).sort()).toEqual(["email", "name", "password"]);
    });
});

describe("POST /api/auth/login", () => {
    beforeEach(async () => {
        await createUser({ name: newUser.name, email: newUser.email, password: newUser.password });
    });

    it("logs in with valid credentials without returning the password", async () => {
        const res = await request(app)
            .post("/api/auth/login")
            .send({ email: newUser.email, password: newUser.password });

        expect(res.status).toBe(200);
        expect(typeof res.body.token).toBe("string");
        expect(res.body.user).toMatchObject({ name: "Alice", email: newUser.email, role: "client" });
        expectNoPassword(res.body);
    });

    it("rejects an incorrect password", async () => {
        const res = await request(app)
            .post("/api/auth/login")
            .send({ email: newUser.email, password: "wrongpass" });

        expect(res.status).toBe(401);
        expect(res.body.token).toBeUndefined();
    });

    it("rejects an unknown email", async () => {
        const res = await request(app)
            .post("/api/auth/login")
            .send({ email: "unknown@test.local", password: newUser.password });

        expect(res.status).toBe(400);
        expect(res.body.token).toBeUndefined();
    });
});

describe("GET /api/auth/current", () => {
    it("returns the logged-in user without password", async () => {
        const user = await createUser({ name: "Alice", email: newUser.email });

        const res = await request(app).get("/api/auth/current").set("authorization", tokenFor(user));

        expect(res.status).toBe(200);
        expect(res.body.user).toMatchObject({ name: "Alice", email: newUser.email, role: "client" });
        expectNoPassword(res.body);
    });
});
