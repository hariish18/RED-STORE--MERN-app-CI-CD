const Cart = require("../model/Cart");
const Product = require("../model/Product");

// Retrieves cart of authenticated user (empty array if no cart saved yet)
// The stock for each item is refreshed from the actual product to avoid displaying
// outdated availability (item might have been sold elsewhere since being added to cart)
exports.getCart = async (req, res) => {
    try {
        const cart = await Cart.findOne({ user: req.user._id });
        let items = cart?.items || [];

        if (items.length > 0) {
            const products = await Product.find({ _id: { $in: items.map((i) => i.productId) } });
            const productsById = new Map(products.map((p) => [p.id, p]));
            // Plain objects (toObject): non-schema fields (stock, imageFocus) placed on
            // Mongoose subdocument are ignored during JSON serialization and never reached client
            items = items.map((item) => {
                const product = productsById.get(String(item.productId));
                const sizeEntry = product?.sizes.find((s) => s.size === item.size);
                return {
                    ...item.toObject(),
                    stock: sizeEntry ? sizeEntry.stock : 0,
                    imageFocus: product?.imageFocus,
                };
            });
        }

        const totalPrice =
            items.length > 0
                ? calcTotalPrice(items)
                : cart?.totalPrice ?? 0;
        res.status(200).json({ msg: "Cart:", items, totalPrice });
    } catch (error) {
        res.status(500).json({ msg: "Fail to get cart", error });
    }
};

const calcTotalPrice = (items) =>
    items.reduce((sum, i) => sum + (i.price || 0) * i.quantity, 0);

// Adds or updates item quantity (negative quantity to decrement)
exports.addToCart = async (req, res) => {
    try {
        const { productId, quantity = 1, size } = req.body;
        if (!productId) {
            return res.status(400).json({ msg: "productId is required" });
        }
        if (!Number.isInteger(quantity) || quantity === 0) {
            return res.status(400).json({ msg: "quantity must be a non-zero integer" });
        }

        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ msg: "Product not found" });
        }

        let itemSize = size;
        if (itemSize == null && product.sizes?.length > 0) {
            const available = product.sizes.find((s) => s.stock > 0);
            itemSize = available?.size ?? product.sizes[0].size;
        }

        let cart = await Cart.findOne({ user: req.user._id });
        if (!cart) {
            cart = new Cart({ user: req.user._id, items: [], totalPrice: 0 });
        }

        const idx = cart.items.findIndex(
            (i) => String(i.productId) === String(productId) && i.size === itemSize
        );

        if (idx >= 0) {
            const newQty = cart.items[idx].quantity + quantity;
            if (newQty <= 0) {
                cart.items.splice(idx, 1);
            } else {
                const sizeEntry = product.sizes?.find((s) => s.size === itemSize);
                const stock = sizeEntry?.stock ?? 99;
                if (newQty > stock) {
                    return res.status(400).json({ msg: "Not enough stock" });
                }
                cart.items[idx].quantity = newQty;
            }
        } else if (quantity > 0) {
            const sizeEntry = product.sizes?.find((s) => s.size === itemSize);
            const stock = sizeEntry?.stock ?? 99;
            if (quantity > stock) {
                return res.status(400).json({ msg: "Not enough stock" });
            }
            cart.items.push({
                productId,
                title: product.title,
                price: product.price,
                image: product.imageProd,
                brand: product.brand,
                size: itemSize,
                quantity,
            });
        }

        cart.totalPrice = calcTotalPrice(cart.items);
        await cart.save();
        res.status(200).json({ msg: "Cart updated", items: cart.items, totalPrice: cart.totalPrice });
    } catch (error) {
        res.status(500).json({ msg: "Fail to add to cart", error });
    }
};

// Removes an item from cart (optional size in query)
exports.removeFromCart = async (req, res) => {
    try {
        const { productId } = req.params;
        const { size } = req.query;

        const cart = await Cart.findOne({ user: req.user._id });
        if (!cart) {
            return res.status(404).json({ msg: "Cart not found" });
        }

        cart.items = cart.items.filter((item) => {
            if (String(item.productId) !== String(productId)) return true;
            if (size != null && item.size !== Number(size)) return true;
            return false;
        });

        cart.totalPrice = calcTotalPrice(cart.items);
        await cart.save();
        res.status(200).json({ msg: "Item removed", items: cart.items, totalPrice: cart.totalPrice });
    } catch (error) {
        res.status(500).json({ msg: "Fail to remove from cart", error });
    }
};

// Entirely replaces cart of authenticated user (upsert)
exports.saveCart = async (req, res) => {
    try {
        const { items } = req.body;
        if (!Array.isArray(items)) {
            return res.status(400).json({ msg: "items must be an array" });
        }
        const invalidItem = items.find(
            (item) => !item.productId || !Number.isInteger(item.quantity) || item.quantity < 1
        );
        if (invalidItem) {
            return res.status(400).json({ msg: "Each item needs a productId and a quantity >= 1" });
        }
        const cart = await Cart.findOneAndUpdate(
            { user: req.user._id },
            { items },
            { returnDocument: 'after', upsert: true }
        );
        res.status(200).json({ msg: "Cart saved", items: cart.items });
    } catch (error) {
        res.status(500).json({ msg: "Fail to save cart", error });
    }
};

// Clears cart of authenticated user
exports.clearCart = async (req, res) => {
    try {
        await Cart.findOneAndUpdate(
            { user: req.user._id },
            { items: [] },
            { upsert: true }
        );
        res.status(200).json({ msg: "Cart cleared" });
    } catch (error) {
        res.status(500).json({ msg: "Fail to clear cart", error });
    }
};
