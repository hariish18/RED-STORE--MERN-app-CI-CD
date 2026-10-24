// Loaded before each test file (Jest "setupFilesAfterEnv"):
// External service mocks + in-memory MongoDB database, emptied between tests.
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");

// ---------- External services: no real network calls ----------
jest.mock("cloudinary", () => ({
    v2: {
        config: jest.fn(),
        uploader: {
            upload: jest.fn().mockResolvedValue({
                secure_url: "https://res.cloudinary.com/test/image/upload/fake.jpg",
                public_id: "fake-public-id",
            }),
            destroy: jest.fn().mockResolvedValue({ result: "ok" }),
        },
    },
}));

jest.mock("stripe", () =>
    jest.fn().mockImplementation(() => ({
        paymentIntents: {
            create: jest.fn().mockResolvedValue({
                id: "pi_test_fake",
                client_secret: "pi_test_fake_secret",
                status: "requires_payment_method",
            }),
            retrieve: jest.fn().mockResolvedValue({ id: "pi_test_fake", status: "succeeded" }),
        },
    }))
);

jest.mock("@anthropic-ai/sdk", () => {
    class APIError extends Error {}
    const Anthropic = jest.fn().mockImplementation(() => ({
        messages: {
            create: jest.fn().mockResolvedValue({
                content: [{ type: "text", text: "Test description" }],
            }),
        },
    }));
    Anthropic.APIError = APIError;
    Anthropic.RateLimitError = class extends APIError {};
    Anthropic.AuthenticationError = class extends APIError {};
    Anthropic.BadRequestError = class extends APIError {};
    return Anthropic;
});

// ---------- In-memory MongoDB database ----------
let mongoServer;

beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri());
});

afterEach(async () => {
    const { collections } = mongoose.connection;
    await Promise.all(Object.values(collections).map((c) => c.deleteMany({})));
    jest.clearAllMocks();
});

afterAll(async () => {
    await mongoose.disconnect();
    if (mongoServer) await mongoServer.stop();
});
