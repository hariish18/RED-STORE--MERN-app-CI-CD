// Test environment variables, loaded before any app module (Jest "setupFiles").
// DUMMY values only: .env is never read during tests (dotenv is in server.js).
process.env.NODE_ENV = "test";
process.env.SECRET_KEY = "test-secret-key-not-a-real-secret";
process.env.CLOUD_NAME = "test-cloud";
process.env.API_KEY = "test-api-key";
process.env.API_SECRET = "test-api-secret";
process.env.STRIPE_SECRET_KEY = "sk_test_fake_key_for_tests";
process.env.ANTHROPIC_API_KEY = "test-anthropic-key";
// No remote database: connection is made to mongodb-memory-server (see db.js)
delete process.env.MONGODB_URI;
delete process.env.APP_VERSION;
