import mongoose from "mongoose";

const sellerSchema = new mongoose.Schema({
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
  },
  riceMillName: { type: String, required: true },
  city: { type: String, required: true },
  gps: {
    type: {
      type: String,
      enum: ['Point'],
      required: true,
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      required: true,
      validate: {
        validator: function(arr) {
          return arr.length === 2 && arr.every(num => typeof num === 'number');
        },
        message: props => `Coordinates must be an array of two numbers [longitude, latitude]!`
      }
    }
  },
  products: { type: Object, default: {} }
});

const sellerModel = mongoose.model("Seller", sellerSchema);

export default sellerModel;
