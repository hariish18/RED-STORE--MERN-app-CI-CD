const request = require("supertest");
const jwt = require("jsonwebtoken");
const app = require("../app");
const cloudinary = require("../util/cloudinary");
const { createUser, tokenFor } = require("./helpers");

describe("Protected routes (isAuth)", () => {
    it("rejects access without token", async () => {
        const res = await request(app).get("/api/auth/current");

        expect(res.status).toBe(403);
        expect(res.body.message).toBe("No token provided");
    });

    it("rejects an invalid token", async () => {
        const res = await request(app).get("/api/auth/current").set("authorization", "not-a-jwt");

        expect(res.status).toBe(401);
    });

    it("rejects a token signed with a different key", async () => {
        const user = await createUser();
        const forged = jwt.sign({ id: user._id }, "another-key");

        const res = await request(app).get("/api/auth/current").set("authorization", forged);

        expect(res.status).toBe(401);
    });

    it("rejects a token whose user no longer exists", async () => {
        const user = await createUser();
        const token = tokenFor(user);
        await user.deleteOne();

        const res = await request(app).get("/api/auth/current").set("authorization", token);

        expect(res.status).toBe(404);
    });

    it("rejects cart access without token", async () => {
        const res = await request(app).get("/api/cart");

        expect(res.status).toBe(403);
    });
});

describe("Admin routes (isAuth + isRole('admin'))", () => {
    it("rejects /api/admin/stats without token", async () => {
        const res = await request(app).get("/api/admin/stats");

        expect(res.status).toBe(403);
    });

    it("rejects /api/admin/stats for non-admin user", async () => {
        const client = await createUser({ role: "client" });

        const res = await request(app).get("/api/admin/stats").set("authorization", tokenFor(client));

        expect(res.status).toBe(403);
        expect(res.body.message).toBe("Access denied: insufficient role");
    });

    it("rejects product creation for non-admin, without any Cloudinary upload", async () => {
        const client = await createUser({ role: "client" });

        const res = await request(app)
            .post("/api/product/addProd")
            .set("authorization", tokenFor(client))
            .send({ title: "Intruder", price: 1 });

        expect(res.status).toBe(403);
        expect(cloudinary.uploader.upload).not.toHaveBeenCalled();
    });

    it("rejects product deletion for non-admin", async () => {
        const client = await createUser({ role: "client" });

        const res = await request(app)
            .delete("/api/product/507f1f77bcf86cd799439011")
            .set("authorization", tokenFor(client));

        expect(res.status).toBe(403);
    });

    it("allows an admin on /api/admin/stats", async () => {
        const admin = await createUser({ role: "admin" });

        const res = await request(app).get("/api/admin/stats").set("authorization", tokenFor(admin));

        expect(res.status).toBe(200);
    });
});
