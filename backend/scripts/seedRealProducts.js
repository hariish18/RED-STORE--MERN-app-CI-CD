// Permanent seed script: inserts the real Red Store - Shoes catalog.
// Idempotent (based on exact imageProd URL): re-running this script never creates
// duplicates and leaves products modified manually since creation untouched.
//
// This script first removes the legacy "sneakers" catalog (Nike/Jordan) by
// exact URL, before inserting the new multi-category catalog.
//
// Usage: npm run seed:products   (from backend/)
//    or: node scripts/seedRealProducts.js

require("dotenv").config({ path: require("path").resolve(__dirname, "../.env") });

const mongoose = require("mongoose");
const connectDB = require("../config/connectDB");
const Product = require("../model/Product");

// Legacy "sneakers" catalog (Nike/Jordan) to remove before repopulating.
// Identified by exact Cloudinary imageProd URL to delete only these 7 specific
// products without affecting any products added manually since.
const legacyImageUrls = [
    "https://res.cloudinary.com/dvvekltxc/image/upload/v1783451934/COURT_BOROUGH_LOW_RECRAFT_TD_qnnos2.avif",
    "https://res.cloudinary.com/dvvekltxc/image/upload/v1783451944/GIANNIS_FREAK_7_aw7iuy.avif",
    "https://res.cloudinary.com/dvvekltxc/image/upload/v1783451954/NIKE_PEGASUS_PREMIUM_p18nob.avif",
    "https://res.cloudinary.com/dvvekltxc/image/upload/v1783451970/W_AIR_FORCE_1_07_v0l5sa.avif",
    "https://res.cloudinary.com/dvvekltxc/image/upload/v1783451994/JORDAN_LUKA_77_GS_gruehm.avif",
    "https://res.cloudinary.com/dvvekltxc/image/upload/v1783452009/W_NIKE_COURT_VISION_LO_P_NBK_xp0odn.avif",
    "https://res.cloudinary.com/dvvekltxc/image/upload/v1783452026/AIR_JORDAN_1_LOW_1_kymf9u.avif",
];

const products = [
    // --- Formal / dress shoes ---
    {
        title: "Clarks Tilden Cap",
        description: "Classic cap-toe derby in polished black leather, built on a cushioned Ortholite footbed for all-day comfort at the office.",
        price: 145,
        brand: "Clarks",
        category: "shoes",
        gender: "men",
        imageProd: "https://images.unsplash.com/photo-1668069226492-508742b03147?q=80&w=1200&auto=format&fit=crop",
        sizes: [
            { size: 40, stock: 5 },
            { size: 41, stock: 6 },
            { size: 42, stock: 6 },
            { size: 43, stock: 4 },
            { size: 44, stock: 0 },
            { size: 45, stock: 2 },
        ],
        createdAt: new Date("2025-10-03"),
    },
    {
        title: "Ecco Melbourne Cap-Toe Oxford",
        description: "Hand-finished black leather oxford with a lightweight comfort sole, sharp enough for the boardroom, soft enough for the commute.",
        price: 165,
        brand: "Ecco",
        category: "shoes",
        gender: "men",
        imageProd: "https://images.unsplash.com/photo-1784822041270-7cc959c33cbb?q=80&w=1200&auto=format&fit=crop",
        sizes: [
            { size: 40, stock: 4 },
            { size: 41, stock: 5 },
            { size: 42, stock: 5 },
            { size: 43, stock: 3 },
            { size: 44, stock: 2 },
            { size: 45, stock: 0 },
        ],
        createdAt: new Date("2025-10-18"),
    },
    {
        title: "Florsheim Kingston Moc-Toe",
        description: "Rich brown leather moc-toe dress shoe with hand-sewn detailing, a versatile pick for both suits and dark denim.",
        price: 135,
        brand: "Florsheim",
        category: "shoes",
        gender: "men",
        imageProd: "https://images.unsplash.com/photo-1472591651607-70e2d88ae3c4?q=80&w=1200&auto=format&fit=crop",
        sizes: [
            { size: 40, stock: 5 },
            { size: 41, stock: 5 },
            { size: 42, stock: 4 },
            { size: 43, stock: 0 },
            { size: 44, stock: 3 },
        ],
        createdAt: new Date("2025-11-02"),
    },
    {
        title: "Cole Haan Harrison Grand Oxford",
        description: "Women's cognac leather oxford with Grand.OS cushioning technology, pairing menswear-inspired style with genuine all-day comfort.",
        price: 155,
        brand: "Cole Haan",
        category: "shoes",
        gender: "women",
        imageProd: "https://images.unsplash.com/photo-1689855217805-c47cd002dbe8?q=80&w=1200&auto=format&fit=crop",
        sizes: [
            { size: 36, stock: 4 },
            { size: 37, stock: 5 },
            { size: 38, stock: 5 },
            { size: 39, stock: 0 },
            { size: 40, stock: 3 },
        ],
        createdAt: new Date("2025-11-20"),
    },

    // --- Casual shoes ---
    {
        title: "Timberland Amherst Leather Boat Shoe",
        description: "Soft nubuck leather upper with a hand-sewn moc-toe and rawhide laces, a non-marking rubber outsole ready for the boat dock or a sunny weekend.",
        price: 75,
        brand: "Timberland",
        category: "shoes",
        gender: "men",
        imageProd: "https://images.unsplash.com/photo-1715764783691-da317960ba09?q=80&w=1200&auto=format&fit=crop",
        sizes: [
            { size: 40, stock: 6 },
            { size: 41, stock: 6 },
            { size: 42, stock: 5 },
            { size: 43, stock: 4 },
            { size: 44, stock: 0 },
        ],
        createdAt: new Date("2025-12-05"),
    },
    {
        title: "Superga 2750 Cotu Classic",
        description: "The iconic Italian canvas plimsoll in crisp white, a wardrobe staple that pairs with everything from jeans to summer dresses.",
        price: 65,
        brand: "Superga",
        category: "shoes",
        gender: "women",
        imageProd: "https://images.unsplash.com/photo-1608053874302-694caf700023?q=80&w=1200&auto=format&fit=crop",
        sizes: [
            { size: 36, stock: 6 },
            { size: 37, stock: 6 },
            { size: 38, stock: 5 },
            { size: 39, stock: 4 },
            { size: 40, stock: 0 },
        ],
        createdAt: new Date("2025-12-22"),
    },
    {
        title: "Clarks Un Loafer",
        description: "Slip-on leather loafer with Clarks' Cushion Plus insole, a smart-casual go-to for the office or dinner out.",
        price: 115,
        brand: "Clarks",
        category: "shoes",
        gender: "men",
        imageProd: "https://images.unsplash.com/photo-1777987601447-266e128de448?q=80&w=1200&auto=format&fit=crop",
        sizes: [
            { size: 40, stock: 5 },
            { size: 41, stock: 5 },
            { size: 42, stock: 4 },
            { size: 43, stock: 3 },
            { size: 44, stock: 0 },
        ],
        createdAt: new Date("2026-01-10"),
    },
    {
        title: "Clarks Fawn Sparkle Mary-Jane",
        description: "Glitter-finish mary-jane flat with an adjustable buckle strap and a cushioned sole, dressy enough for school photos and sturdy enough for the playground.",
        price: 45,
        brand: "Clarks",
        category: "shoes",
        gender: "kids",
        imageProd: "https://images.unsplash.com/photo-1777307224337-9bdd87591433?q=80&w=1200&auto=format&fit=crop",
        sizes: [
            { size: 28, stock: 6 },
            { size: 29, stock: 6 },
            { size: 30, stock: 5 },
            { size: 31, stock: 4 },
            { size: 32, stock: 0 },
            { size: 33, stock: 3 },
        ],
        createdAt: new Date("2026-01-28"),
    },

    // --- Boots ---
    {
        title: "Timberland 6-Inch Premium Waterproof Boot",
        description: "The original waterproof leather boot with seam-sealed construction and anti-fatigue cushioning, built for rain, mud, and everything between.",
        price: 210,
        brand: "Timberland",
        category: "shoes",
        gender: "men",
        imageProd: "https://images.unsplash.com/photo-1549660299-31c4ea5f34c2?q=80&w=1200&auto=format&fit=crop",
        sizes: [
            { size: 40, stock: 5 },
            { size: 41, stock: 6 },
            { size: 42, stock: 6 },
            { size: 43, stock: 4 },
            { size: 44, stock: 2 },
            { size: 45, stock: 0 },
        ],
        createdAt: new Date("2026-02-14"),
    },
    {
        title: "Dr. Martens 2976 Chelsea Boot",
        description: "Women's smooth leather Chelsea boot with elastic side gussets and the signature air-cushioned sole, easy to pull on and hard to wear out.",
        price: 175,
        brand: "Dr. Martens",
        category: "shoes",
        gender: "women",
        imageProd: "https://images.unsplash.com/photo-1615737168659-247ede7a7c9b?q=80&w=1200&auto=format&fit=crop",
        sizes: [
            { size: 36, stock: 5 },
            { size: 37, stock: 5 },
            { size: 38, stock: 4 },
            { size: 39, stock: 3 },
            { size: 40, stock: 0 },
        ],
        createdAt: new Date("2026-03-03"),
    },
    {
        title: "Frye Jackson Chelsea Boot",
        description: "Men's full-grain leather Chelsea boot, hand-burnished with a stacked leather heel for a boot that only looks better with age.",
        price: 260,
        brand: "Frye",
        category: "shoes",
        gender: "men",
        imageProd: "https://images.unsplash.com/photo-1773425975272-35f0900a9d8f?q=80&w=1200&auto=format&fit=crop",
        sizes: [
            { size: 40, stock: 4 },
            { size: 41, stock: 5 },
            { size: 42, stock: 5 },
            { size: 43, stock: 3 },
            { size: 44, stock: 2 },
        ],
        createdAt: new Date("2026-03-25"),
    },

    // --- Sandals ---
    {
        title: "Birkenstock Arizona",
        description: "The classic two-strap sandal with a contoured cork-latex footbed that molds to your foot over time, adjustable buckles for a custom fit.",
        price: 110,
        brand: "Birkenstock",
        category: "shoes",
        gender: "men",
        imageProd: "https://images.unsplash.com/photo-1603487742131-4160ec999306?q=80&w=1200&auto=format&fit=crop",
        sizes: [
            { size: 40, stock: 6 },
            { size: 41, stock: 6 },
            { size: 42, stock: 5 },
            { size: 43, stock: 4 },
            { size: 44, stock: 0 },
        ],
        createdAt: new Date("2026-04-12"),
    },
    {
        title: "Birkenstock Gizeh",
        description: "Women's toe-post sandal on the same contoured cork footbed as the Arizona, a warm-weather essential.",
        price: 95,
        brand: "Birkenstock",
        category: "shoes",
        gender: "women",
        imageProd: "https://images.unsplash.com/photo-1628626126093-97c2c464ca5d?q=80&w=1200&auto=format&fit=crop",
        sizes: [
            { size: 36, stock: 6 },
            { size: 37, stock: 6 },
            { size: 38, stock: 5 },
            { size: 39, stock: 4 },
            { size: 40, stock: 0 },
        ],
        createdAt: new Date("2026-05-01"),
    },
    {
        title: "Havaianas Top",
        description: "The original Brazilian flip-flop, with a textured rice-pattern footbed and soft rubber straps that get more comfortable with wear.",
        price: 28,
        brand: "Havaianas",
        category: "shoes",
        gender: "men",
        imageProd: "https://images.unsplash.com/photo-1567347167012-29482aa7a9a8?q=80&w=1200&auto=format&fit=crop",
        sizes: [
            { size: 40, stock: 8 },
            { size: 41, stock: 8 },
            { size: 42, stock: 6 },
            { size: 43, stock: 5 },
            { size: 44, stock: 4 },
        ],
        createdAt: new Date("2026-05-20"),
    },

    // --- Athletic / sports shoes ---
    {
        title: "Adidas Predator Accuracy",
        description: "Technical firm-ground football boot with a soft synthetic upper for touch and control, built for players who dictate the game.",
        price: 120,
        brand: "Adidas",
        category: "shoes",
        gender: "men",
        imageProd: "https://images.unsplash.com/photo-1511886929837-354d827aae26?q=80&w=1200&auto=format&fit=crop",
        sizes: [
            { size: 40, stock: 5 },
            { size: 41, stock: 5 },
            { size: 42, stock: 5 },
            { size: 43, stock: 4 },
            { size: 44, stock: 2 },
            { size: 45, stock: 0 },
        ],
        createdAt: new Date("2026-06-15"),
    },
    {
        title: "Puma RS-X Efekt",
        description: "Chunky retro-tech sneaker with layered foam cushioning and a rugged R-System outsole, built for all-day wear on and off the track.",
        price: 125,
        brand: "Puma",
        category: "shoes",
        gender: "men",
        imageProd: "https://images.unsplash.com/photo-1750270438660-f57de76532cc?q=80&w=1200&auto=format&fit=crop",
        sizes: [
            { size: 40, stock: 5 },
            { size: 41, stock: 6 },
            { size: 42, stock: 5 },
            { size: 43, stock: 4 },
            { size: 44, stock: 0 },
        ],
        createdAt: new Date("2026-07-08"),
    },
    {
        title: "Adidas Ultraboost Light",
        description: "Women's premium running shoe with Boost midsole cushioning and a Primeknit upper for an adaptive, sock-like fit.",
        price: 190,
        brand: "Adidas",
        category: "shoes",
        gender: "women",
        imageProd: "https://images.unsplash.com/photo-1555972635-8a10402b49b2?q=80&w=1200&auto=format&fit=crop",
        sizes: [
            { size: 36, stock: 5 },
            { size: 37, stock: 5 },
            { size: 38, stock: 4 },
            { size: 39, stock: 3 },
            { size: 40, stock: 0 },
        ],
        createdAt: new Date("2026-08-02"),
    },
    {
        title: "Puma Smash 3.0",
        description: "Clean white leather court sneaker with the signature Formstrip and a durable rubber cupsole, a versatile everyday trainer that pairs with anything.",
        price: 90,
        brand: "Puma",
        category: "shoes",
        gender: "women",
        imageProd: "https://images.unsplash.com/photo-1715003132895-b10a23d3c90f?q=80&w=1200&auto=format&fit=crop",
        sizes: [
            { size: 36, stock: 6 },
            { size: 37, stock: 6 },
            { size: 38, stock: 5 },
            { size: 39, stock: 4 },
            { size: 40, stock: 0 },
        ],
        createdAt: new Date("2026-08-25"),
    },

    // --- Kids ---
    {
        title: "Robeez Soft Soles Floral Sneaker",
        description: "Flexible soft-sole crib sneaker in a turquoise floral print with stretchy laces and a non-slip suede bottom, made for first steps and tiny growing feet.",
        price: 34,
        brand: "Robeez",
        category: "shoes",
        gender: "kids",
        imageProd: "https://images.unsplash.com/photo-1678192568478-9488ee55def6?fm=jpg&q=80&w=1200&auto=format&fit=crop",
        sizes: [
            { size: 19, stock: 6 },
            { size: 20, stock: 6 },
            { size: 21, stock: 5 },
            { size: 22, stock: 4 },
            { size: 23, stock: 0 },
        ],
        createdAt: new Date("2026-08-28"),
    },
    {
        title: "See Kai Run Leather High-Top",
        description: "Soft grey leather high-top with pink cotton laces, a padded collar and a flexible rubber outsole that keeps up with every playground sprint.",
        price: 65,
        brand: "See Kai Run",
        category: "shoes",
        gender: "kids",
        imageProd: "https://images.unsplash.com/photo-1552912276-56ef47874741?fm=jpg&q=80&w=1200&auto=format&fit=crop",
        sizes: [
            { size: 26, stock: 5 },
            { size: 27, stock: 6 },
            { size: 28, stock: 6 },
            { size: 29, stock: 4 },
            { size: 30, stock: 0 },
            { size: 31, stock: 3 },
        ],
        createdAt: new Date("2026-08-31"),
    },
    {
        title: "Vans Kids Old Skool Checkerboard",
        description: "The skate-classic low top in black canvas and checkerboard panels, with the signature side stripe and a waffle-grip rubber sole built for recess.",
        price: 50,
        brand: "Vans",
        category: "shoes",
        gender: "kids",
        imageProd: "https://images.unsplash.com/photo-1636130748629-655be0c60041?fm=jpg&q=80&w=1200&auto=format&fit=crop",
        sizes: [
            { size: 28, stock: 7 },
            { size: 29, stock: 7 },
            { size: 30, stock: 6 },
            { size: 31, stock: 5 },
            { size: 32, stock: 4 },
            { size: 33, stock: 0 },
            { size: 34, stock: 3 },
        ],
        createdAt: new Date("2026-09-03"),
    },
    {
        title: "Converse Kids Chuck Taylor All Star High Top",
        description: "The original canvas high top in pink with a vulcanized rubber toe cap, metal eyelets and the classic ankle patch, sized down for young trendsetters.",
        price: 55,
        brand: "Converse",
        category: "shoes",
        gender: "kids",
        imageProd: "https://images.unsplash.com/photo-1707013537977-90e0a6cfa484?fm=jpg&q=80&w=1200&auto=format&fit=crop",
        sizes: [
            { size: 28, stock: 6 },
            { size: 29, stock: 7 },
            { size: 30, stock: 6 },
            { size: 31, stock: 5 },
            { size: 32, stock: 4 },
            { size: 33, stock: 0 },
            { size: 34, stock: 3 },
            { size: 35, stock: 2 },
        ],
        createdAt: new Date("2026-09-06"),
    },
    {
        title: "Skechers Twinkle Toes Shuffles High-Top",
        description: "Sparkly denim-look high top with a rhinestone toe cap, glitter overlays and an easy lace-up fit, a dress-up favorite that still handles the playground.",
        price: 58,
        brand: "Skechers",
        category: "shoes",
        gender: "kids",
        imageProd: "https://images.unsplash.com/photo-1600455745764-ebd75e6cd567?fm=jpg&q=80&w=1200&auto=format&fit=crop",
        sizes: [
            { size: 26, stock: 5 },
            { size: 27, stock: 6 },
            { size: 28, stock: 6 },
            { size: 29, stock: 5 },
            { size: 30, stock: 4 },
            { size: 31, stock: 0 },
        ],
        createdAt: new Date("2026-09-09"),
    },
    {
        title: "Sperry Kids Crest Vibe Suede Boat Sneaker",
        description: "Tan suede boat-style sneaker with blue rawhide laces and a cream non-marking outsole, a smart casual pick for school days and weekends by the water.",
        price: 60,
        brand: "Sperry",
        category: "shoes",
        gender: "kids",
        imageProd: "https://images.unsplash.com/photo-1742390671657-c8738e123962?fm=jpg&q=80&w=1200&auto=format&fit=crop",
        sizes: [
            { size: 28, stock: 5 },
            { size: 29, stock: 6 },
            { size: 30, stock: 6 },
            { size: 31, stock: 4 },
            { size: 32, stock: 3 },
            { size: 33, stock: 0 },
        ],
        createdAt: new Date("2026-09-12"),
    },
    {
        title: "Teva Kids Hurricane XLT2 Sport Sandal",
        description: "Adjustable hook-and-loop sport sandal in soft pastel straps with a cushioned EVA footbed and a grippy sole, ready for splash pads, trails and summer camp.",
        price: 45,
        brand: "Teva",
        category: "shoes",
        gender: "kids",
        imageProd: "https://images.unsplash.com/photo-1742390671765-c87aaed67ad8?fm=jpg&q=80&w=1200&auto=format&fit=crop",
        sizes: [
            { size: 27, stock: 6 },
            { size: 28, stock: 7 },
            { size: 29, stock: 6 },
            { size: 30, stock: 5 },
            { size: 31, stock: 4 },
            { size: 32, stock: 0 },
        ],
        createdAt: new Date("2026-09-15"),
    },
    {
        title: "Livie & Luca Shine Suede High-Top",
        description: "Blush pink suede high-top with metallic gold side stripes and a padded ankle, easy on with a cushioned insole and a flexible sole for early walkers.",
        price: 72,
        brand: "Livie & Luca",
        category: "shoes",
        gender: "kids",
        imageProd: "https://images.unsplash.com/photo-1742390671609-9811019fe538?fm=jpg&q=80&w=1200&auto=format&fit=crop",
        sizes: [
            { size: 22, stock: 5 },
            { size: 23, stock: 5 },
            { size: 24, stock: 4 },
            { size: 25, stock: 4 },
            { size: 26, stock: 0 },
            { size: 27, stock: 2 },
        ],
        createdAt: new Date("2026-09-18"),
    },

    // --- New arrivals (8 most recent: powers "New Arrivals" section) ---
    {
        title: "Clarks Cognac Leather Zip Ankle Boot",
        description: "Cognac leather ankle boot with a stacked block heel, inner zip closure and a cushioned footbed, an easy everyday boot for jeans and everything in between.",
        price: 135,
        brand: "Clarks",
        category: "shoes",
        gender: "women",
        imageProd: "https://images.unsplash.com/photo-1531310197839-ccf54634509e?fm=jpg&q=80&w=1200&auto=format&fit=crop",
        sizes: [
            { size: 36, stock: 4 },
            { size: 37, stock: 5 },
            { size: 38, stock: 5 },
            { size: 39, stock: 3 },
            { size: 40, stock: 0 },
            { size: 41, stock: 2 },
        ],
        createdAt: new Date("2026-09-19T08:00:00Z"),
    },
    {
        title: "Nine West Snake-Embossed Ankle-Tie Pump",
        description: "Pointed-toe stiletto pump in black snake-embossed leather with a cut-out vamp and a tie-back ankle detail, a sharp finish for evenings out.",
        price: 89,
        brand: "Nine West",
        category: "shoes",
        gender: "women",
        imageProd: "https://images.unsplash.com/photo-1554062614-6da4fa67725a?fm=jpg&q=80&w=1200&auto=format&fit=crop",
        sizes: [
            { size: 36, stock: 5 },
            { size: 37, stock: 6 },
            { size: 38, stock: 5 },
            { size: 39, stock: 4 },
            { size: 40, stock: 0 },
        ],
        createdAt: new Date("2026-09-19T14:00:00Z"),
    },
    {
        title: "Aldo Stessy Floral Satin Pump",
        description: "Statement stiletto pump in vivid blue floral satin with a pointed toe and a slim 10 cm heel, made to turn a simple outfit into an occasion.",
        price: 85,
        brand: "Aldo",
        category: "shoes",
        gender: "women",
        imageProd: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?fm=jpg&q=80&w=1200&auto=format&fit=crop",
        sizes: [
            { size: 36, stock: 4 },
            { size: 37, stock: 5 },
            { size: 38, stock: 5 },
            { size: 39, stock: 3 },
            { size: 40, stock: 2 },
        ],
        createdAt: new Date("2026-09-19T20:00:00Z"),
    },
    {
        title: "Sam Edelman Nude Suede Block-Heel Sandal",
        description: "Soft nude suede ankle-strap sandal on a comfortable block heel, a warm-weather neutral that works from the office to weekend brunch.",
        price: 130,
        brand: "Sam Edelman",
        category: "shoes",
        gender: "women",
        imageProd: "https://images.unsplash.com/photo-1519415943484-9fa1873496d4?fm=jpg&q=80&w=1200&auto=format&fit=crop",
        sizes: [
            { size: 36, stock: 5 },
            { size: 37, stock: 5 },
            { size: 38, stock: 4 },
            { size: 39, stock: 0 },
            { size: 40, stock: 3 },
        ],
        createdAt: new Date("2026-09-20T08:00:00Z"),
    },
    {
        title: "Steve Madden Stecy Glitter Ankle-Strap Sandal",
        description: "Barely-there stiletto sandal in silver glitter with a slim ankle strap and a padded footbed, the go-to shoe for weddings and party season.",
        price: 99,
        brand: "Steve Madden",
        category: "shoes",
        gender: "women",
        imageProd: "https://images.unsplash.com/photo-1632761298177-51e35403e27e?fm=jpg&q=80&w=1200&auto=format&fit=crop",
        sizes: [
            { size: 36, stock: 4 },
            { size: 37, stock: 5 },
            { size: 38, stock: 5 },
            { size: 39, stock: 3 },
            { size: 40, stock: 0 },
        ],
        createdAt: new Date("2026-09-20T14:00:00Z"),
    },
    {
        title: "Stride Rite Soft Motion Floral Crib Sneaker",
        description: "Lightweight crib sneaker in a soft teal floral print with stretch laces and a flexible sole, gentle on baby's feet from the first wiggle to the first steps.",
        price: 36,
        brand: "Stride Rite",
        category: "shoes",
        gender: "kids",
        imageProd: "https://images.unsplash.com/photo-1513091250092-b06c2b7981bc?fm=jpg&q=80&w=1200&auto=format&fit=crop",
        sizes: [
            { size: 18, stock: 5 },
            { size: 19, stock: 6 },
            { size: 20, stock: 6 },
            { size: 21, stock: 4 },
            { size: 22, stock: 0 },
        ],
        createdAt: new Date("2026-09-20T20:00:00Z"),
    },
    {
        title: "Carter's Every Step Floral Crib Shoe",
        description: "Breathable canvas crib shoe with a floral print, elastic lacing and a padded collar for an easy on-and-off fit for growing infant feet.",
        price: 32,
        brand: "Carter's",
        category: "shoes",
        gender: "kids",
        imageProd: "https://images.unsplash.com/photo-1678192568444-78b428b7cd1a?fm=jpg&q=80&w=1200&auto=format&fit=crop",
        sizes: [
            { size: 18, stock: 6 },
            { size: 19, stock: 6 },
            { size: 20, stock: 5 },
            { size: 21, stock: 4 },
            { size: 22, stock: 3 },
            { size: 23, stock: 0 },
        ],
        createdAt: new Date("2026-09-21T06:00:00Z"),
    },
    {
        title: "Fila Kids Heritage Chunky Sneaker",
        description: "Retro-inspired toddler trainer in grey and white with layered overlays, a padded ankle collar and a grippy sole for busy little explorers.",
        price: 55,
        brand: "Fila",
        category: "shoes",
        gender: "kids",
        imageProd: "https://images.unsplash.com/photo-1775813282325-7c154e126f73?fm=jpg&q=80&w=1200&auto=format&fit=crop",
        sizes: [
            { size: 24, stock: 5 },
            { size: 25, stock: 6 },
            { size: 26, stock: 6 },
            { size: 27, stock: 5 },
            { size: 28, stock: 4 },
            { size: 29, stock: 0 },
            { size: 30, stock: 3 },
        ],
        createdAt: new Date("2026-09-21T08:00:00Z"),
    },
    {
        title: "Cole Haan Lenox Hill Double Monk Strap",
        description: "Burnished brown leather double monk strap with twin brass buckles and a sleek leather sole, a smart step up from laces for the office or a wedding.",
        price: 175,
        brand: "Cole Haan",
        category: "shoes",
        gender: "men",
        imageProd: "https://images.unsplash.com/photo-1533867617858-e7b97e060509?fm=jpg&q=80&w=1200&auto=format&fit=crop",
        sizes: [
            { size: 40, stock: 4 },
            { size: 41, stock: 5 },
            { size: 42, stock: 6 },
            { size: 43, stock: 4 },
            { size: 44, stock: 0 },
            { size: 45, stock: 2 },
        ],
        createdAt: new Date("2026-09-22T08:00:00Z"),
    },
];

const seed = async () => {
    await connectDB();

    // Remove legacy sneakers catalog before repopulating
    const { deletedCount } = await Product.deleteMany({ imageProd: { $in: legacyImageUrls } });
    console.log(`- ${deletedCount} legacy sneaker product(s) deleted.`);

    let created = 0;
    let skipped = 0;

    for (const product of products) {
        try {
            // Mongoose 9 renamed legacy "rawResult" option to
            // "includeResultMetadata" for findOneAndUpdate (legacy name is
            // silently ignored and breaks insert/skip detection).
            // "overwriteImmutable" is needed because Mongoose timestamps plugin
            // would otherwise silently replace our manual createdAt (in $setOnInsert)
            // with current date, making ?sort=newest useless since all products
            // would share the exact same timestamp.
            const result = await Product.findOneAndUpdate(
                { imageProd: product.imageProd },
                { $setOnInsert: product },
                { upsert: true, includeResultMetadata: true, overwriteImmutable: true }
            );

            if (result.lastErrorObject?.updatedExisting) {
                skipped += 1;
                console.log(`- already present, skipped: ${product.title}`);
            } else {
                created += 1;
                console.log(`+ created: ${product.title}`);
            }
        } catch (error) {
            console.error(`✗ failed for "${product.title}":`, error.message);
        }
    }

    console.log(`\nFinished: ${deletedCount} deleted, ${created} created, ${skipped} already present.`);
    await mongoose.disconnect();
    process.exit(0);
};

seed().catch((error) => {
    console.error("Seed failed:", error);
    process.exit(1);
});
