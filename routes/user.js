import express from "express";
import User from "../models/user.js";

const router = express.Router();

// ✅ Get user by ID with team field
router.get("/:userId", async (req, res) => {
  try {
    const user = await User.findById(req.params.userId)
      .select("-password"); // Don't send password
    
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    
    res.json(user);
  } catch (err) {
    console.error("❌ Get user error:", err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
