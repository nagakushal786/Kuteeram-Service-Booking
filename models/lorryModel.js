import mongoose from "mongoose";

const lorrySchema = new mongoose.Schema({
  agencyName: { type: String, required: true },
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
  available: { type: Boolean, default: true },
  vehicleNumber: { type: String, required: true },
  driverName: { type: String, required: true },
  driverPhone: {
    type: String,
    required: true,
    validate: {
      validator: function(v) {
        return /^\+91\d{10}$/.test(v);
      },
      message: props => `${props.value} is not a valid Indian phone number!`
    }
  },
  currentOrder: { type: mongoose.Schema.Types.ObjectId, ref: "Order" }
});

lorrySchema.index({ gps: "2dsphere" });

const lorryModel = mongoose.model("Lorry", lorrySchema);

export default lorryModel;