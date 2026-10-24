// Utility script: updates only the imageProd field of 4 "men" products
// already in database (Clarks Tilden Cap, Ecco Melbourne Cap-Toe Oxford,
// Florsheim Kingston Moc-Toe, Frye Jackson Chelsea Boot).
//
// The other 7 "men" products (Timberland Amherst Boat Shoe, Clarks Un
// Loafer, Timberland 6-Inch Waterproof Boot, Birkenstock Arizona,
// Havaianas Top, Adidas Predator Accuracy, Puma RS-X Efekt) are NOT
// modified: their existing images are already appropriate.
//
// Leaves all other fields and products untouched.
//
// Usage: node scripts/updateMenProductImages.js

require("dotenv").config({ path: require("path").resolve(__dirname, "../.env") });

const mongoose = require("mongoose");
const connectDB = require("../config/connectDB");
const Product = require("../model/Product");

const imagesByTitle = [
    {
        title: "Clarks Tilden Cap",
        imageProd: "https://images.unsplash.com/photo-1552422554-0d5af0c79fc6?q=80&w=1200&auto=format&fit=crop",
    },
    {
        title: "Ecco Melbourne Cap-Toe Oxford",
        imageProd: "https://images.unsplash.com/photo-1563434649554-58f91d22ec2c?q=80&w=1200&auto=format&fit=crop",
    },
    {
        title: "Florsheim Kingston Moc-Toe",
        imageProd: "https://images.unsplash.com/photo-1632729393665-60e4e4812eed?q=80&w=1200&auto=format&fit=crop",
    },
    {
        title: "Frye Jackson Chelsea Boot",
        imageProd: "https://images.unsplash.com/photo-1777987601677-3059be0e1388?q=80&w=1200&auto=format&fit=crop",
    },
];

const updateImages = async () => {
    await connectDB();

    let updated = 0;
    let notFound = 0;

    for (const { title, imageProd } of imagesByTitle) {
        const product = await Product.findOneAndUpdate(
            { title },
            { $set: { imageProd } },
            { returnDocument: "after" }
        );

        if (!product) {
            notFound += 1;
            console.log(`- not found, skipped: ${title}`);
            continue;
        }

        updated += 1;
        console.log(`+ ${title}: ${product.imageProd}`);
    }

    console.log(`\nFinished: ${updated} product(s) updated, ${notFound} not found.`);
    await mongoose.disconnect();
    process.exit(0);
};

updateImages().catch((error) => {
    console.error("Script failed:", error);
    process.exit(1);
});
