// Utility script: marks a selection of seeded products as on sale
// to populate the "Sale" page.
//
// Never touches "price" (current selling price remains unchanged):
// simply adds a higher originalPrice (strikethrough price), a consistent
// discountPercentage, and isOnSale: true. Idempotent: re-running this
// script updates the same products with the same values.
//
// Targets products by "title" (unlike seedRealProducts.js which targets
// imageProd) because title is the most readable identifier for existing products.
//
// Usage: npm run seed:sale   (from backend/)
//    or: node scripts/markProductsOnSale.js

require("dotenv").config({ path: require("path").resolve(__dirname, "../.env") });

const mongoose = require("mongoose");
const connectDB = require("../config/connectDB");
const Product = require("../model/Product");

// originalPrice chosen as round number above current price; discountPercentage
// recalculated from actual gap between originalPrice and price (15-40%).
const salesByTitle = [
    { title: "Clarks Tilden Cap", originalPrice: 189 },
    { title: "Timberland Amherst Leather Boat Shoe", originalPrice: 99 },
    { title: "Superga 2750 Cotu Classic", originalPrice: 89 },
    { title: "Dr. Martens 2976 Chelsea Boot", originalPrice: 249 },
    { title: "Birkenstock Arizona", originalPrice: 149 },
    { title: "Adidas Ultraboost Light", originalPrice: 259 },
    { title: "Puma RS-X Efekt", originalPrice: 179 },
    { title: "Frye Jackson Chelsea Boot", originalPrice: 349 },
];

const markOnSale = async () => {
    await connectDB();

    let updated = 0;
    let notFound = 0;

    for (const { title, originalPrice } of salesByTitle) {
        const product = await Product.findOne({ title });
        if (!product) {
            notFound += 1;
            console.log(`- not found, skipped: ${title}`);
            continue;
        }

        const discountPercentage = Math.round(((originalPrice - product.price) / originalPrice) * 100);

        await Product.updateOne(
            { _id: product._id },
            { $set: { originalPrice, discountPercentage, isOnSale: true } }
        );

        updated += 1;
        console.log(`+ ${title}: $${product.price} (original $${originalPrice}, -${discountPercentage}%)`);
    }

    console.log(`\nFinished: ${updated} product(s) marked on sale, ${notFound} not found.`);
    await mongoose.disconnect();
    process.exit(0);
};

markOnSale().catch((error) => {
    console.error("Script failed:", error);
    process.exit(1);
});
