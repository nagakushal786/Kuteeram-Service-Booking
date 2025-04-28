import mongoose from "mongoose";

const productSchema=new mongoose.Schema({
  name: { type: String, required: true },
  productType: { type: String, required: true },
  quantity: { type: Number, required: true },
  price: { type: Number, required: true },
  availability: { type: Boolean, default: true }
});

const productModel=mongoose.model("Product", productSchema);

export default productModel;