const Anthropic = require("@anthropic-ai/sdk");

// Lazy instantiation: if ANTHROPIC_API_KEY is not configured, the server
// must still start normally (only the generate-description route will fail)
let anthropic = null;
const getAnthropicClient = () => {
    if (!anthropic) {
        anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    }
    return anthropic;
};

module.exports = getAnthropicClient;
