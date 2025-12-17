const express = require("express");
const Product = require("../models/Products");
const router = express.Router();

// GET /products - list all products
router.get("/", async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    
    const shaped = products.map((p) => ({
      id: p._id.toString(),
      Name: p.Name,
      Category: p.Category,
      image: p.image,
      OriginalPrice: p.OriginalPrice,
      SellingPrice: p.SellingPrice,
    }));

    res.json(shaped);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch products" });
  }
});

// POST /products - create a new product
router.post("/", async (req, res) => {
  try {
    const { Name, Category, image, OriginalPrice, SellingPrice } = req.body;
    if (
      !Name ||
      !Category ||
      !image ||
      OriginalPrice == null ||
      SellingPrice == null
    ) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    const product = await Product.create({
      Name: Name.trim(),
      Category: Category.trim(),
      image: image.trim(),
      OriginalPrice: OriginalPrice,
      SellingPrice: SellingPrice,
    });
    res.status(201).json({
      message: "Product created successfully",
      product: {
        id: product._id.toString(),
        Name: product.Name,
        Category: product.Category,
        image: product.image,
        OriginalPrice: product.OriginalPrice,
        SellingPrice: product.SellingPrice,
      },
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
