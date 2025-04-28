import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
  buyerId: { type: mongoose.Schema.Types.ObjectId, ref: "Buyer", required: true },
  sellerId: { type: mongoose.Schema.Types.ObjectId, ref: "Seller", required: true },
  productName: { type: String, required: true },
  bidPrice: { type: Number, required: true },
  finalPrice: { type: Number, required: true },
  status: { 
    type: String, 
    enum: ["Pending", "Accepted", "Paid", "Assigned", "PickupVerified", "InTransit", "Delivered"], 
    default: "Pending" 
  },
  orderedAt: { type: Date, default: Date.now },
  lorryId: { type: mongoose.Schema.Types.ObjectId, ref: "Lorry" },
  sellerOTP: { type: String },
  isOTPVerified: { type: Boolean, default: false },
  deliveryConfirmed: { type: Boolean, default: false }
});

const orderModel = mongoose.model("Order", orderSchema);

export default orderModel;