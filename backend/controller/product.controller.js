const Product = require("../model/Product")
const cloudinary = require("../util/cloudinary")
const { destroyProductImages } = require("../util/productImages")
const getAnthropicClient = require("../util/anthropic")
const Anthropic = require("@anthropic-ai/sdk")

// Upload main image ("imageProd" field) and gallery ("images" field) to cloudinary
const uploadProductImages = async (files) => {
    const result = {};
    if (files?.imageProd?.[0]) {
        const uploaded = await cloudinary.uploader.upload(files.imageProd[0].path);
        result.imageProd = uploaded.secure_url;
    }
    if (files?.images?.length) {
        const uploaded = await Promise.all(
            files.images.map((file) => cloudinary.uploader.upload(file.path))
        );
        result.images = uploaded.map((img) => img.secure_url);
    }
    return result;
};

// Multipart requests (file upload) send "sizes" as stringified JSON
const parseBody = (body) => {
    if (typeof body.sizes === "string") {
        try {
            return { ...body, sizes: JSON.parse(body.sizes) };
        } catch {
            return body;
        }
    }
    return body;
};

// add product
exports.addProduct = async (req, res) => {

    try {
        const uploaded = await uploadProductImages(req.files);
        // Construct product document
        const newProd = new Product({ ...parseBody(req.body), ...uploaded, createdBy: req.user._id })
        // Save to database
        await newProd.save()
        res.status(201).json({ msg: "product created successfully", newProd })

    } catch (error) {
        console.error("❌ addProduct error:", error.message, error.stack);
        res.status(500).json({ msg: "Fail to add this product", error: error.message });
    }

};

// getAll
exports.getAllProd = async (req, res) => {

    try {
        // Optional filter by gender / category (?gender=men&category=shoes)
        const filter = {};
        if (req.query.gender) filter.gender = req.query.gender;
        if (req.query.category) filter.category = req.query.category;
        // Optional filter for "Sale" page (?onSale=true)
        if (req.query.onSale === "true") filter.isOnSale = true;
        let query = Product.find(filter);

        // Optional sort (?sort=newest): newest first, for "New Arrivals" section
        if (req.query.sort === "newest") query = query.sort({ createdAt: -1 });

        // Optional limit (?limit=8), no impact on existing calls that don't pass it
        const limit = Number(req.query.limit);
        if (Number.isInteger(limit) && limit > 0) query = query.limit(limit);

        const Prod = await query;
        res.status(200).json({ msg: "Products:", Prod })

    } catch (error) {
        console.error("❌ getAllProd error:", error.message, error.stack);
        res.status(500).json({ msg: "Fail to get products", error: error.message });
    }

};

// search: ?q=... case-insensitive filter, "contains" on TITLE and BRAND only.
// No search in description (nor category, "shoes" everywhere): with 1 letter (e.g. "l"),
// long text almost always contains it ("leather", "lightweight"...) causing ALL products
// to return in db order -> navbar was always displaying the same 5 products.
exports.searchProd = async (req, res) => {
    try {
        const q = (req.query.q || "").trim();
        if (!q) return res.status(200).json({ msg: "Products:", Prod: [] });

        const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        const contains = new RegExp(escaped, "i");
        const Prod = await Product.find({ $or: [{ title: contains }, { brand: contains }] });

        // Sort by relevance, then alphabetical if relevance is equal:
        // 0 = title starts with q
        // 1 = brand starts with q
        // 2 = a word in title/brand starts with q (after space, dash, dot, slash)
        // 3 = q appears anywhere in title/brand
        const startsWith = new RegExp(`^${escaped}`, "i");
        const wordStart = new RegExp(`[\\s\\-./]${escaped}`, "i");
        const rank = (p) => {
            const brand = p.brand || "";
            if (startsWith.test(p.title)) return 0;
            if (startsWith.test(brand)) return 1;
            if (wordStart.test(p.title) || wordStart.test(brand)) return 2;
            return 3;
        };
        Prod.sort((a, b) => rank(a) - rank(b) || a.title.localeCompare(b.title));

        res.status(200).json({ msg: "Products:", Prod });
    } catch (error) {
        console.error("❌ searchProd error:", error.message, error.stack);
        res.status(500).json({ msg: "Fail to search products", error: error.message });
    }
};

// getOne
exports.getOneProd = async (req, res) => {

    try {
        const { id } = req.params;
        const prodToGet = await Product.findById(id)
        if (!prodToGet) return res.status(404).json({ msg: 'Product not found' })
        res.status(200).json({ msg: "The product is:", prodToGet })

    } catch (error) {
        // Malformed id (not a valid Mongo ObjectId, e.g. placeholder id never replaced
        // on frontend): 400, not 500 - not a server error
        if (error.name === "CastError") {
            return res.status(400).json({ msg: "Invalid product id" });
        }
        console.error("❌ getOneProd error:", error.message, error.stack);
        res.status(500).json({ msg: "Fail to get this prod", error: error.message });
    }

};

// getmyprod
exports.getMyProd = async (req, res) => {
    try {
        const myListProd = await Product.find({ createdBy: req.user._id });
        res.status(200).json({ msg: "your product is:", myListProd });

    } catch (error) {
        console.error("❌ getMyProd error:", error.message, error.stack);
        res.status(500).json({ msg: "Fail to get your prod", error: error.message });
    }

}

// update my product 
exports.updateMyProd = async (req, res) => {
    try {
        // Retrieve id from request
        const { id } = req.params;
        // Find product in collection
        const foundProd = await Product.findById(id);
        if (!foundProd) return res.status(404).json({ msg: "Product not found" });
        if (foundProd.createdBy.toString() !== req.user._id.toString())
            return res.status(403).json({ msg: "you can't update this prod" });
        const uploaded = await uploadProductImages(req.files);
        // Update
        const prodToUpdate = await Product.findByIdAndUpdate(
            id,
            { ...parseBody(req.body), ...uploaded },
            { new: true },
        );
        res.status(200).json({ msg: "Updated", prodToUpdate });

    } catch (error) {
        console.error("❌ updateMyProd error:", error.message, error.stack);
        res.status(500).json({ msg: "Fail to update this prod", error: error.message });
    }

};

// Generates (or enhances) a product description via Claude using provided info
exports.generateDescription = async (req, res) => {
    try {
        const { title, category, brand, gender, price, keywords, draft } = req.body;
        if (!title) return res.status(400).json({ msg: "title is required" });

        const details = [
            `Title: ${title}`,
            category && `Category: ${category}`,
            brand && `Brand: ${brand}`,
            gender && `Gender: ${gender}`,
            price && `Price: ${price} EUR`,
            Array.isArray(keywords) && keywords.length && `Keywords: ${keywords.join(", ")}`,
            draft && `Existing draft to improve: ${draft}`,
        ].filter(Boolean).join("\n");

        const anthropic = getAnthropicClient();
        const response = await anthropic.messages.create({
            model: "claude-opus-5",
            max_tokens: 1024,
            output_config: { effort: "medium" },
            system:
                "You are an e-commerce copywriter specializing in footwear and fashion. " +
                "Based on the provided product information, write a product description in " +
                "English: 2 to 4 compelling sentences followed by 3 to 5 key bullet points. " +
                "Do not invent any characteristics (materials, warranty, origin...) not provided " +
                "in the information. Respond only with the description, without preamble or title.",
            messages: [{ role: "user", content: details }],
        });

        const textBlock = response.content.find((block) => block.type === "text");
        res.status(200).json({ msg: "Description generated", description: textBlock?.text ?? "" });

    } catch (error) {
        if (error instanceof Anthropic.RateLimitError) {
            return res.status(429).json({ msg: "AI service is rate limited, try again later" });
        }
        if (
            error instanceof Anthropic.AuthenticationError ||
            error instanceof Anthropic.BadRequestError ||
            error.message?.includes("Could not resolve authentication method")
        ) {
            return res.status(502).json({ msg: "AI service is not configured (missing ANTHROPIC_API_KEY)" });
        }
        console.error("❌ generateDescription error:", error.message, error.stack);
        res.status(500).json({ msg: "Fail to generate description", error: error.message });
    }
};

// delete
exports.deleteProd = async (req, res) => {
    try {
        // Retrieve id from request
        const { id } = req.params;
        // Find product in collection
        const prodToFind = await Product.findById(id);
        if (!prodToFind) return res.status(404).json({ msg: "Product not found" });
        if (prodToFind.createdBy.toString() !== req.user._id.toString()) {
            return res.status(403).json({ msg: "You are not authorized to delete this product!" });
        }

        // Delete images (main + gallery) on Cloudinary so they are not orphaned
        // Best effort: a Cloudinary error must not block product deletion, which is the user's primary action
        await destroyProductImages(prodToFind);

        await Product.findByIdAndDelete(id);
        res.status(200).json({ msg: "Product deleted!", prodToFind });

    } catch (error) {
        console.error("❌ deleteProd error:", error.message, error.stack);
        res.status(500).json({ msg: "Fail to update this prod", error: error.message });
    }

};