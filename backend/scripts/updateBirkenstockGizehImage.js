// Utility script: updates only the imageProd field of "Birkenstock Gizeh"
// in the database (previous image showed legs/feet on a beach rather than a product shot).
// Leaves all other fields and products untouched.
//
// Usage: node scripts/updateBirkenstockGizehImage.js

require("dotenv").config({ path: require("path").resolve(__dirname, "../.env") });

const mongoose = require("mongoose");
const connectDB = require("../config/connectDB");
const Product = require("../model/Product");

const TITLE = "Birkenstock Gizeh";
const NEW_IMAGE = "https://images.unsplash.com/photo-1628626126093-97c2c464ca5d?q=80&w=1200&auto=format&fit=crop";

const updateImage = async () => {
    await connectDB();

    const product = await Product.findOneAndUpdate(
        { title: TITLE },
        { $set: { imageProd: NEW_IMAGE } },
        { new: true }
    );

    if (!product) {
        console.log(`Not found: ${TITLE}`);
    } else {
        console.log(`Image updated for "${TITLE}": ${product.imageProd}`);
    }

    await mongoose.disconnect();
    process.exit(product ? 0 : 1);
};

updateImage().catch((error) => {
    console.error("Script failed:", error);
    process.exit(1);
});
