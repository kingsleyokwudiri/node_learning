// create an endpoint that returns all of the products that has a rating that is above 3

const express = require("express");

const app = express();
app.use(express.json());

const products = [
  {
    id: 1,
    name: "Wireless Bluetooth Headphones",
    slug: "wireless-bluetooth-headphones",
    description:
      "Premium wireless headphones with noise cancellation and crystal-clear sound.",
    price: 85000,
    discountPrice: 69999,
    category: "Electronics",
    brand: "SoundPro",
    sku: "ELEC-001",
    stock: 45,
    rating: 4.8,
    reviews: 124,
    images: ["/images/headphones-1.jpg", "/images/headphones-2.jpg"],
    colors: ["Black", "White", "Blue"],
    isFeatured: true,
    isAvailable: true,
    createdAt: "2026-10-01T10:00:00Z",
  },
  {
    id: 2,
    name: "Classic Leather Backpack",
    slug: "classic-leather-backpack",
    description:
      "A stylish and durable leather backpack suitable for work, school, and travel.",
    price: 55000,
    discountPrice: null,
    category: "Fashion",
    brand: "UrbanStyle",
    sku: "FAS-002",
    stock: 28,
    rating: 4.5,
    reviews: 86,
    images: ["/images/backpack-1.jpg", "/images/backpack-2.jpg"],
    colors: ["Brown", "Black"],
    isFeatured: true,
    isAvailable: true,
    createdAt: "2026-10-03T12:30:00Z",
  },
  {
    id: 3,
    name: "Smart Fitness Watch",
    slug: "smart-fitness-watch",
    description:
      "Track your daily activities, heart rate, sleep patterns, and fitness goals.",
    price: 120000,
    discountPrice: 99999,
    category: "Electronics",
    brand: "FitTech",
    sku: "ELEC-003",
    stock: 12,
    rating: 4.7,
    reviews: 203,
    images: ["/images/watch-1.jpg", "/images/watch-2.jpg"],
    colors: ["Black", "Silver", "Rose Gold"],
    isFeatured: true,
    isAvailable: true,
    createdAt: "2026-10-05T09:15:00Z",
  },
  {
    id: 4,
    name: "Minimalist Ceramic Coffee Mug",
    slug: "minimalist-ceramic-coffee-mug",
    description:
      "Elegant ceramic coffee mug with a comfortable handle and modern design.",
    price: 8500,
    discountPrice: null,
    category: "Home & Kitchen",
    brand: "HomeEssentials",
    sku: "HOM-004",
    stock: 100,
    rating: 4.3,
    reviews: 52,
    images: ["/images/mug-1.jpg", "/images/mug-2.jpg"],
    colors: ["White", "Beige", "Black"],
    isFeatured: false,
    isAvailable: true,
    createdAt: "2026-10-07T14:00:00Z",
  },
  {
    id: 5,
    name: "Men's Casual Sneakers",
    slug: "mens-casual-sneakers",
    description:
      "Comfortable everyday sneakers with a lightweight sole and breathable material.",
    price: 45000,
    discountPrice: 38000,
    category: "Footwear",
    brand: "StepUp",
    sku: "FOO-005",
    stock: 0,
    rating: 4.6,
    reviews: 167,
    images: ["/images/sneakers-1.jpg", "/images/sneakers-2.jpg"],
    colors: ["White", "Black", "Grey"],
    sizes: [40, 41, 42, 43, 44],
    isFeatured: false,
    isAvailable: false,
    createdAt: "2026-10-09T16:45:00Z",
  },
  {
    id: 6,
    name: "Portable Power Bank 20000mAh",
    slug: "portable-power-bank-20000mah",
    description:
      "High-capacity fast-charging power bank for smartphones and other devices.",
    price: 32000,
    discountPrice: 27500,
    category: "Electronics",
    brand: "PowerMax",
    sku: "ELEC-006",
    stock: 65,
    rating: 4.9,
    reviews: 312,
    images: ["/images/powerbank-1.jpg", "/images/powerbank-2.jpg"],
    colors: ["Black", "White"],
    isFeatured: true,
    isAvailable: true,
    createdAt: "2026-10-11T11:20:00Z",
  },
  {
    id: 7,
    name: "Luxury Skincare Gift Set",
    slug: "luxury-skincare-gift-set",
    description:
      "A complete skincare collection designed to keep your skin hydrated and refreshed.",
    price: 65000,
    discountPrice: 58000,
    category: "Beauty",
    brand: "GlowNaturals",
    sku: "BEA-007",
    stock: 19,
    rating: 4.4,
    reviews: 94,
    images: ["/images/skincare-1.jpg", "/images/skincare-2.jpg"],
    colors: [],
    isFeatured: false,
    isAvailable: true,
    createdAt: "2026-10-13T08:30:00Z",
  },
  {
    id: 8,
    name: "Adjustable Office Chair",
    slug: "adjustable-office-chair",
    description:
      "Ergonomic office chair with lumbar support, adjustable height, and breathable mesh.",
    price: 185000,
    discountPrice: 159000,
    category: "Furniture",
    brand: "ComfortSpace",
    sku: "FUR-008",
    stock: 8,
    rating: 4.7,
    reviews: 71,
    images: ["/images/chair-1.jpg", "/images/chair-2.jpg"],
    colors: ["Black", "Grey"],
    isFeatured: true,
    isAvailable: true,
    createdAt: "2026-10-15T13:10:00Z",
  },
];

app.get("/products/high-ratings", (req, res) => {
  // Defaults to the rating from the exercise: products above 3. An empty
  // ?rating= also falls back to the default, and repeated params
  // (?rating=1&rating=2) arrive as an array, so take the first element rather
  // than coercing the array to NaN.
  const rawRating = Array.isArray(req.query.rating)
    ? req.query.rating[0]
    : req.query.rating;
  const minRating =
    rawRating === undefined || rawRating === "" ? 3 : Number(rawRating);

  if (!Number.isFinite(minRating)) {
    return res.status(400).json({ message: "rating must be a number" });
  }

  const filteredProducts = products.filter(
    (product) => product.rating > minRating,
  );

  return res.json({
    message: `Products with rating above ${minRating} retrieved successfully`,
    products: filteredProducts,
  });
});

app.get("/product/:id", (req, res) => {
  const id = Number(req.params.id);
  const foundProduct = Number.isInteger(id)
    ? products.find((product) => product.id === id)
    : undefined;

  if (!foundProduct) {
    return res.status(404).json({ message: "Product not found" });
  }

  return res.json({
    message: "The product found successfully",
    product: foundProduct,
  });
});

// Only `stock` is updatable here, matched with the same Number() parsing that
// GET /product/:id uses so both routes agree on what a valid id is.
app.patch("/product/:id", (req, res) => {
  const id = Number(req.params.id);
  const productIndex = products.findIndex((product) => product.id === id);

  if (productIndex === -1) {
    return res.status(404).json({ message: "Product not found" });
  }

  const { stock } = req.body ?? {};

  if (!Number.isFinite(stock)) {
    return res.status(400).json({ message: "stock must be a number" });
  }

  // Write back into the array. Building a new object and returning it (the
  // previous version) left the stored product untouched.
  products[productIndex] = { ...products[productIndex], stock };

  return res.status(200).json({
    message: "Product updated successfully",
    product: products[productIndex],
  });
});

app.post("/add-product", (req, res) => {
  const { name, price, stock = 0 } = req.body ?? {};

  if (typeof name !== "string" || name.trim() === "") {
    return res.status(400).json({ message: "name is required" });
  }

  if (!Number.isFinite(price)) {
    return res.status(400).json({ message: "price must be a number" });
  }

  if (!Number.isFinite(stock)) {
    return res.status(400).json({ message: "stock must be a number" });
  }

  // Assign the id here, otherwise the stored product has id: undefined and
  // GET /product/:id can never find it.
  const nextId =
    products.reduce((highest, product) => Math.max(highest, product.id), 0) + 1;

  const newProduct = {
    id: nextId,
    name: name.trim(),
    price,
    stock,
    rating: 0,
    isAvailable: stock > 0,
    createdAt: new Date().toISOString(),
  };

  products.push(newProduct);

  return res.status(201).json({
    message: "Product added successfully",
    product: newProduct,
  });
});

// Unmatched routes return JSON. Keep this last: anything registered below it
// is unreachable, which is how PATCH and POST /add-product were dead before.
app.use((req, res) => {
  return res.status(404).json({ message: "Route not found" });
});

// Malformed JSON would otherwise fall through to Express's HTML error page.
// Mirrors the inventory app's handler; `next` is unused but Express only
// recognises error handlers by arity.
app.use((error, req, res, next) => {
  if (error.name === "SyntaxError" && error.status === 400) {
    return res.status(400).json({ message: "Invalid JSON body" });
  }

  console.error(error);
  return res.status(500).json({ message: "Internal server error" });
});

const port = process.env.PORT ?? 3000;

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
