// Utility script: sets focal point (imageFocus) for products whose main photo
// is staged, so cropped thumbnails (cart) show the shoe rather than the decor. Idempotent.
//
// x / y = position of product in imageProd, in % (0 = left/top); zoom >= 1.
// Values measured from photo: for Adidas Predator, shoe is to the right
// of the ball (center ~63% / 51%) and occupies ~45% of width.
//
// Usage: node scripts/setImageFocus.js   (from backend/)

require("dotenv").config({ path: require("path").resolve(__dirname, "../.env") });

const mongoose = require("mongoose");
const connectDB = require("../config/connectDB");
const Product = require("../model/Product");

const focusByTitle = [
    { title: "Adidas Predator Accuracy", imageFocus: { x: 63, y: 51, zoom: 1.7 } },
];

const setImageFocus = async () => {
    await connectDB();

    for (const { title, imageFocus } of focusByTitle) {
        const result = await Product.updateOne({ title }, { $set: { imageFocus } });
        console.log(result.matchedCount ? `+ ${title}: ${JSON.stringify(imageFocus)}` : `- not found, skipped: ${title}`);
    }

    await mongoose.disconnect();
};

setImageFocus().catch((error) => {
    console.error(error);
    process.exit(1);
});
