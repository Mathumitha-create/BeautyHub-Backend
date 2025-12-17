const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    Name: { type: String, required: true },
    Category: { type: String, required: true },
    image: { type: String, required: true },
    OriginalPrice: { type: Number, required: true },
    SellingPrice: { type: Number, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", productSchema);
