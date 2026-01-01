import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { scanInventory } from "../controller/ImageScan.js";
import Stock from "../models/Stock.js";

const router = express.Router();

// ✅ Configure multer to use /tmp directory (Vercel-compatible)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, '/tmp');  // Only writable location on Vercel
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png/;
    const mimeType = allowedTypes.test(file.mimetype);
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    
    if (mimeType && extname) {
      return cb(null, true);
    }
    cb(new Error('Only .jpeg, .jpg, and .png files are allowed!'));
  }
});

// POST /api/scan-stock - Upload image and extract items
router.post("/scan-stock", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No image file uploaded" });
    }

    const { teamId } = req.body;
    if (!teamId) {
      // Clean up uploaded file
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ error: "teamId is required" });
    }

    console.log("📸 Processing image:", req.file.filename);
    console.log("👥 Team ID:", teamId);

    // Call Gemini Vision API to scan the image
    const scannedItems = await scanInventory(req.file.path);

    console.log("✅ Scanned items:", scannedItems);

    // Save extracted items to database
    const savedItems = [];
    for (const item of scannedItems) {
      const stockItem = await Stock.create({
        team: teamId,
        name: item.item,
        quantity: item.quantity || 1,
        unit: item.unit || 'pcs',
        category: 'scanned',
        brand: 'Unknown',
      });
      savedItems.push(stockItem);
    }

    // ✅ Clean up: Delete the uploaded file from /tmp
    fs.unlinkSync(req.file.path);

    res.json({
      success: true,
      message: `Successfully scanned ${savedItems.length} items`,
      items: savedItems,
      scannedData: scannedItems
    });

  } catch (error) {
    console.error("❌ Scan stock error:", error);
    
    // Clean up file on error
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    res.status(500).json({ 
      error: "Failed to scan inventory",
      detail: error.message 
    });
  }
});

export default router;
