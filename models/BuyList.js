import mongoose from "mongoose";

const buyListSchema = new mongoose.Schema({
  teamId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Team",
    required: true,
  },
  itemName: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("BuyList", buyListSchema);
