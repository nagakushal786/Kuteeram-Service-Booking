import mongoose from "mongoose";

const buyerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: {
    type: String,
    required: true,
    validate: {
      validator: function(v) {
        return /^\+91\d{10}$/.test(v);
      },
      message: props => `${props.value} is not a valid Indian phone number!`
    }
  }
});

const buyerModel = mongoose.model("Buyer", buyerSchema);

export default buyerModel;