const mongoose = require("mongoose")


const productSchema = new mongoose.Schema({

    title: {

     type: String,
     require: true,
     trim: true,
    },
    description : {

        type: String,
        require: true,
        trim: true,
    },
    price :{
     type : Number,
     require : true
    },
    imageProd :{
        type : String,

    },
    // Additional image gallery
    images :{
        type : [String],
        default : [],
    },
    brand :{
        type : String,
        trim : true,
    },
    category :{
        type : String,
        trim : true,
        default : "shoes",
    },
    // To filter Men / Women / Kids in the catalog
    gender :{
        type : String,
        enum : ["men", "women", "kids", "unisex"],
        default : "unisex",
    },
    // Available stock per shoe size
    sizes :{
        type : [
            {
                size : { type : Number, required : true },
                stock : { type : Number, required : true, default : 0 },
            },
        ],
        default : [],
    },
    // Relationship between User collection and product
    createdBy :{
        type : mongoose.Schema.Types.ObjectId,
        ref : "user",
    },
    // Price before discount, displayed strikethrough next to price on Sale page
    originalPrice :{
        type : Number,
    },
    // Discount percentage displayed on product badge (e.g. 25 -> "-25%")
    discountPercentage :{
        type : Number,
        min : 0,
        max : 100,
    },
    // True to include product in /api/product/allProd?onSale=true
    isOnSale :{
        type : Boolean,
        default : false,
    },
    // Optional focal point of imageProd for cropped thumbnails (cart...): x/y in %
    // of image, zoom >= 1. Useful when photo has wider staging (decor) and
    // default center crop doesn't show shoe clearly. Omitted = center, without zoom.
    imageFocus :{
        x : { type : Number, min : 0, max : 100 },
        y : { type : Number, min : 0, max : 100 },
        zoom : { type : Number, min : 1, max : 3 },
    },

},

{ timestamps : true },
);

const Product = mongoose.model("product", productSchema);
module.exports = Product;