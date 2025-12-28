import Stock from '../models/Stock.js';
import BuyList from '../models/BuyList.js';
import { notifyTeam } from '../services/teamNotifier.js';

export const addStock = async (req, res) => {
  try {
    const {
      teamId,
      name,
      quantity,
      unit,
      consumptionRate,
      expiryDate,
      brand,
      userName
    } = req.body;
    console.log(req.body);

    const stock = await Stock.create({
      teamId,
      name,
      quantity,
      unit,
      consumptionRate,
      expiryDate: expiryDate || null,
      brand
    });

    await notifyTeam(
      teamId,
      `✅ NEW STOCK ADDED!\n📦 Item: ${name}\n📊 Quantity: ${quantity} ${unit}\n🏷️ Brand: ${brand || 'N/A'}\n👤 Added by: ${userName || 'Team member'}`
    );

    res.status(201).json(stock);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getStockByTeam = async (req, res) => {
  try {
    const { teamId } = req.params;

    if (!teamId || teamId === "undefined" || teamId === "null") {
      return res.status(400).json({ message: "Invalid teamId" });
    }

    const stock = await Stock.find({ teamId }).populate("teamId", "teamName");
    res.json(stock);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateStock = async (req, res) => {
  try {
    const { id } = req.params;
    const { userName, ...updateData } = req.body;

    const stock = await Stock.findByIdAndUpdate(id, updateData, { new: true });
    
    if (!stock) {
      return res.status(404).json({ message: "Stock not found" });
    }

    await notifyTeam(
      stock.teamId,
      `✏️ STOCK UPDATED\n📦 ${stock.name} has been updated\n👤 By: ${userName || 'Team member'}`
    );

    res.json(stock);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteStock = async (req, res) => {
  try {
    const { id } = req.params;
    const { userName } = req.body;

    const stock = await Stock.findById(id);
    if (!stock) {
      return res.status(404).json({ message: "Stock not found" });
    }

    const stockName = stock.name;
    const teamId = stock.teamId;

    await Stock.findByIdAndDelete(id);

    try {
      await notifyTeam(
        teamId,
        `🗑️ STOCK DELETED\n📦 ${stockName} has been removed from inventory\n👤 By: ${userName || 'Team member'}`
      );
    } catch (notifyError) {
      console.error("⚠️ Notification failed:", notifyError.message);
    }

    res.json({ message: "Stock deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
