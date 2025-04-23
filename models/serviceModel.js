import mongoose from "mongoose";

const serviceSchema=new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  availability: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  category: { type: String, required: true },
  rating: { type: Number, min: 0, max: 5 },
}, {timestamps: true});

const serviceModel=mongoose.model("Service", serviceSchema);

export default serviceModel;