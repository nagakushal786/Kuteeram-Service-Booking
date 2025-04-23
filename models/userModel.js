import mongoose from "mongoose";

const userSchema=new mongoose.Schema({
  name: { type: String },
  password: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  services_booked: { type: Object, default: {} }
});

const userModel=mongoose.model("User", userSchema);

export default userModel;