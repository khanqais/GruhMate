import mongoose from 'mongoose';

const stockSchema = new mongoose.Schema(
  {
    // Team Reference yes relation ke liye necessary
    teamId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Team',
      required: true
    },

    name: {
      type: String,
      required: true,
      trim: true
    },

    quantity: {
      type: Number,
      required: true,
      min: 0
    },

    unit: {
      type: String,
      enum: ['kg', 'g', 'litre', 'ml', 'piece', 'packet', 'bottle', 'box'],
      required: true
    },

    consumptionRate: {
      type: String,
      enum: ['daily', 'weekly', 'monthly', 'rare'],
      // required: true
    },

    expiryDate: {
      type: Date,
      default: null
    },

    brand: {
      type: String,
      trim: true
    }
  },
  { timestamps: true }
);

export default mongoose.model('Stock', stockSchema);
