const request = require("supertest");
const app = require("../app");
const Product = require("../model/Product");

const sampleProduct = (overrides = {}) => ({
    title: "Air Test",
    description: "Test shoe",
    price: 99.99,
    brand: "TestBrand",
    gender: "men",
    ...overrides,
});

describe("GET /api/product/allProd", () => {
    it("responds 200 with an empty array when there are no products", async () => {
        const res = await request(app).get("/api/product/allProd");

        expect(res.status).toBe(200);
        expect(res.headers["content-type"]).toMatch(/application\/json/);
        expect(Array.isArray(res.body.Prod)).toBe(true);
        expect(res.body.Prod).toHaveLength(0);
    });

    it("returns registered products", async () => {
        await Product.create([sampleProduct(), sampleProduct({ title: "Runner Test", gender: "women" })]);

        const res = await request(app).get("/api/product/allProd");

        expect(res.status).toBe(200);
        expect(res.body.Prod).toHaveLength(2);
        expect(res.body.Prod.map((p) => p.title).sort()).toEqual(["Air Test", "Runner Test"]);
    });

    it("filters by gender and applies limit", async () => {
        await Product.create([
            sampleProduct({ title: "A" }),
            sampleProduct({ title: "B" }),
            sampleProduct({ title: "C", gender: "women" }),
        ]);

        const byGender = await request(app).get("/api/product/allProd?gender=women");
        expect(byGender.body.Prod.map((p) => p.title)).toEqual(["C"]);

        const limited = await request(app).get("/api/product/allProd?limit=1");
        expect(limited.body.Prod).toHaveLength(1);
    });
});

describe("GET /api/product/prod/:id", () => {
    it("returns an existing product", async () => {
        const product = await Product.create(sampleProduct());

        const res = await request(app).get(`/api/product/prod/${product._id}`);

        expect(res.status).toBe(200);
        expect(JSON.stringify(res.body)).toContain("Air Test");
    });
});
