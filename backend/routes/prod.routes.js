const express = require("express")
const { addProduct, getAllProd, searchProd, getOneProd, getMyProd, updateMyProd, deleteProd, generateDescription } = require("../controller/product.controller")
const isAuth = require("../middlewares/isAuth")
const isRole = require("../middlewares/isRole")
const upload = require("../util/multer")

// Accepts a main image (imageProd) and up to 5 gallery images (images)
const productImages = upload.fields([
    { name: "imageProd", maxCount: 1 },
    { name: "images", maxCount: 5 },
]);

const router = express.Router()

// add product
router.post('/addProd', isAuth, isRole("admin"), productImages, addProduct)
// Generate product description via AI (Claude)
router.post('/generate-description', isAuth, isRole("admin"), generateDescription)
// get all products
router.get('/allProd', getAllProd)
router.get('/', getAllProd)
// Search (title/brand)
router.get('/search', searchProd)
// get one
router.get("/prod/:id", getOneProd)
// get myProd
router.get("/myProd", isAuth, getMyProd)
// update prod
router.put("/:id", isAuth, isRole("admin"), productImages, updateMyProd)
// delete prod
router.delete("/:id", isAuth, isRole("admin"), deleteProd)

module.exports = router;