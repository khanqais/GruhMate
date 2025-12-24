import express from "express";
import multer from "multer";
import fs from "fs";
import { scanInventory } from "../controller/ImageScan.js";
import Stock from "../models/Stock.js";
const router = express.Router();
const upload = multer({ dest: "uploads/" });

router.post("/scan-stock", upload.single("image"), async (req, res) => {
  try {
    const imagePath = req.file.path;
const { teamId } = req.body;
    const items = await scanInventory(imagePath);
const savedItems = await Promise.all(
      items.map(async (item) => {
        // Option: Upsert (Update if exists, otherwise create)
        return await Stock.findOneAndUpdate(
          { teamId: teamId, name: item.item }, // Search criteria
          { 
            $inc: { quantity: item.quantity }, // Increment quantity
            $set: { unit: item.unit || "pcs" }, // Update unit if provided
            $setOnInsert: { teamId: teamId}
          },
          { upsert: true, new: true } // Create if doesn't exist
        );
      })
    );

    // 3. Cleanup
    if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);

    res.status(200).json({
      message: "Stock updated successfully",
      updatedItems: savedItems
    });
    // fs.unlinkSync(imagePath); // cleanup image

    // res.json(items);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Image scan failed" });
  }
});

export default router;
