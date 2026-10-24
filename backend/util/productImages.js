const cloudinary = require("./cloudinary");

// Extracts Cloudinary public_id from secure_url for deletion
// (app stores only URL, not public_id, unlike User.cloudinary_id)
const publicIdFromUrl = (url) => {
    const match = url?.match(/\/upload\/(?:v\d+\/)?(.+)\.\w+$/);
    return match?.[1];
};

// Deletes images (main + gallery) of a product on Cloudinary - best effort:
// a Cloudinary error must not block product deletion
const destroyProductImages = (product) => {
    const urls = [product.imageProd, ...(product.images || [])].filter(Boolean);
    return Promise.all(
        urls.map((url) => {
            const publicId = publicIdFromUrl(url);
            return publicId ? cloudinary.uploader.destroy(publicId).catch(() => {}) : Promise.resolve();
        })
    );
};

module.exports = { destroyProductImages };
