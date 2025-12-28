import express from "express";
import { addStock, getStockByTeam, updateStock, deleteStock } from "../controller/stockController.js";
import Stock from "../models/Stock.js";
import BuyList from "../models/BuyList.js";
import { notifyTeam } from "../services/teamNotifier.js";

const router = express.Router();

router.post("/", addStock);

router.get("/team/:teamId", getStockByTeam);

router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { expiryDate, consumptionRate, userName } = req.body;

    if (!expiryDate && !consumptionRate) {
      return res.status(400).json({ error: "At least one field (expiryDate or consumptionRate) is required" });
    }

    const updateData = {};
    if (expiryDate) updateData.expiryDate = expiryDate;
    if (consumptionRate) updateData.consumptionRate = consumptionRate;

    const updated = await Stock.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updated) {
      return res.status(404).json({ error: "Stock item not found" });
    }

    try {
      await notifyTeam(
        updated.teamId,
        `STOCK UPDATED\nItem: ${updated.name}\n${expiryDate ? `Expiry: ${new Date(expiryDate).toLocaleDateString()}\n` : ''}${consumptionRate ? `Consumption: ${consumptionRate}\n` : ''}By: ${userName || 'Team member'}`
      );
    } catch (notifyError) {
      console.error("Notification failed:", notifyError.message);
    }

    res.json(updated);
  } catch (err) {
    console.error("Error updating stock:", err);
    res.status(500).json({ error: "Server error" });
  }
});

router.delete("/:id", deleteStock);

router.patch("/:id/decrement", async (req, res) => {
  try {
    const stock = await Stock.findById(req.params.id);
    if (!stock) {
      return res.status(404).json({ message: "Stock not found" });
    }

    const userName = req.body.userName || 'Team member';

    if (stock.quantity <= 0) {
      return res.status(400).json({ 
        message: "Stock is already at zero. Cannot decrease further.",
        stock,
        remove: false
      });
    }

    stock.quantity -= 1;
    await stock.save();

    try {
      await notifyTeam(
        stock.teamId,
        `STOCK DECREASED\nItem: ${stock.name}\nRemaining: ${stock.quantity} ${stock.unit}\nBy: ${userName}`
      );
    } catch (notifyError) {
      console.error("Notification failed:", notifyError.message);
    }

    if (stock.quantity === 0) {
      const buyItem = await BuyList.create({
        teamId: stock.teamId,
        itemName: stock.name,
        unit: stock.unit,
        brand: stock.brand
      });

      try {
        await notifyTeam(
          stock.teamId,
          `STOCK FINISHED\nItem: ${stock.name} is out of stock\nAdded to BuyList\nBy: ${userName}`
        );
      } catch (notifyError) {
        console.error("Notification failed:", notifyError.message);
      }

      await Stock.findByIdAndDelete(stock._id);
      return res.json({
        message: "Stock finished and added to BuyList",
        buyItem,
        remove: true
      });
    }

    res.json({ stock, remove: false });
  } catch (err) {
    console.error("Decrement error:", err);
    res.status(500).json({ message: err.message });
  }
});

router.patch("/:id/increment", async (req, res) => {
  try {
    const stock = await Stock.findByIdAndUpdate(
      req.params.id,
      { $inc: { quantity: 1 } },
      { new: true }
    );
    
    if (!stock) {
      return res.status(404).json({ message: "Stock not found" });
    }

    const userName = req.body.userName || 'Team member';
    
    try {
      await notifyTeam(
        stock.teamId,
        `STOCK INCREASED\nItem: ${stock.name}\nNow: ${stock.quantity} ${stock.unit}\nBy: ${userName}`
      );
    } catch (notifyError) {
      console.error("Notification failed (but stock was updated):", notifyError.message);
    }

    res.json({ stock });
  } catch (err) {
    console.error("Increment error:", err);
    res.status(500).json({ message: err.message });
  }
});

router.get("/buylist/:teamId", async (req, res) => {
  try {
    const { teamId } = req.params;
    const buyList = await BuyList.find({ teamId });
    res.json(buyList);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post("/buylist", async (req, res) => {
  try {
    const { teamId, itemName, unit, brand, userName } = req.body;

    const buyItem = await BuyList.create({
      teamId,
      itemName,
      unit,
      brand
    });

    try {
      await notifyTeam(
        teamId,
        `NEW ITEM ADDED TO BUYLIST\nItem: ${itemName}\nBy: ${userName || 'Team member'}`
      );
    } catch (notifyError) {
      console.error("Notification failed:", notifyError.message);
    }

    res.json({ message: "Item added to BuyList", buyItem });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete("/buylist/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const item = await BuyList.findById(id);
    
    if (!item) {
      return res.status(404).json({ message: "BuyList item not found" });
    }

    const userName = req.body.userName || 'Team member';
    const itemName = item.itemName;
    const teamId = item.teamId;

    await BuyList.findByIdAndDelete(id);

    try {
      await notifyTeam(
        teamId,
        `REMOVED FROM BUYLIST\nItem: ${itemName}\nBy: ${userName}`
      );
    } catch (notifyError) {
      console.error("Notification failed:", notifyError.message);
    }

    res.json({ message: "Item removed from BuyList", item });
  } catch (err) {
    console.error("Delete BuyList error:", err);
    res.status(500).json({ message: "Server error: " + err.message });
  }
});

export default router;
