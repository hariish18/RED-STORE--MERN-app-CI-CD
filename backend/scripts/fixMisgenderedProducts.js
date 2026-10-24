// Utility script: moves 2 "women" products mistakenly categorized as "men"
// (Nine West Snake-Embossed Ankle-Tie Pump, Clarks Cognac Leather Zip Ankle Boot)
// by updating their gender field and shoe sizes (36-41, women sizes).
//
// The seed script (seedRealProducts.js) is idempotent and never overwrites an existing
// product in database: this script corrects existing documents.
// The new men's product (Cole Haan Lenox Hill Double Monk Strap) is
// added via: npm run seed:products
//
// Leaves all other fields and products untouched.
//
// Usage: node scripts/fixMisgenderedProducts.js

require("dotenv").config({ path: require("path").resolve(__dirname, "../.env") });

const mongoose = require("mongoose");
const connectDB = require("../config/connectDB");
const Product = require("../model/Product");

const fixes = [
    {
        title: "Nine West Snake-Embossed Ankle-Tie Pump",
        sizes: [
            { size: 36, stock: 5 },
            { size: 37, stock: 6 },
            { size: 38, stock: 5 },
            { size: 39, stock: 4 },
            { size: 40, stock: 0 },
        ],
    },
    {
        title: "Clarks Cognac Leather Zip Ankle Boot",
        sizes: [
            { size: 36, stock: 4 },
            { size: 37, stock: 5 },
            { size: 38, stock: 5 },
            { size: 39, stock: 3 },
            { size: 40, stock: 0 },
            { size: 41, stock: 2 },
        ],
    },
];

const fixProducts = async () => {
    await connectDB();

    let updated = 0;
    let notFound = 0;

    for (const { title, sizes } of fixes) {
        const product = await Product.findOneAndUpdate(
            { title },
            { $set: { gender: "women", sizes } },
            { returnDocument: "after" }
        );

        if (!product) {
            notFound += 1;
            console.log(`- not found, skipped: ${title}`);
            continue;
        }

        updated += 1;
        console.log(`+ ${title}: gender=${product.gender}, sizes ${product.sizes.map((s) => s.size).join(", ")}`);
    }

    console.log(`\nFinished: ${updated} product(s) updated, ${notFound} not found.`);
    await mongoose.disconnect();
    process.exit(0);
};

fixProducts().catch((error) => {
    console.error("Script failed:", error);
    process.exit(1);
});
