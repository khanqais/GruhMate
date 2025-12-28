import Stock from "../models/Stock.js";
import { notifyTeam } from "./teamNotifier.js";

export const checkExpiringItems = async () => {
  try {
    console.log("Running smart expiry check...");
    console.log("=".repeat(60));
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    console.log(`Today: ${today.toLocaleDateString('en-IN')}`);
    console.log(`Time: ${new Date().toLocaleTimeString('en-IN')}\n`);

    const allItems = await Stock.find({}).populate('teamId');
    
    console.log(`Total items in database: ${allItems.length}\n`);
    
    if (allItems.length === 0) {
      console.log("No items found in stock database!\n");
      return;
    }

    let count30Day = 0;
    let count1Day = 0;
    let countExpired = 0;
    let countSkipped = 0;
    let countAlreadyNotified = 0;

    console.log("-".repeat(60));
    console.log("CHECKING EACH ITEM:");
    console.log("-".repeat(60) + "\n");

    for (let i = 0; i < allItems.length; i++) {
      const item = allItems[i];
      
      console.log(`[${i + 1}/${allItems.length}] Checking: ${item.name}`);
      console.log(`Brand: ${item.brand || 'N/A'}`);
      console.log(`Quantity: ${item.quantity} ${item.unit}`);
      
      if (!item.teamId) {
        console.log("SKIPPED: No team assigned");
        console.log(`Team ID: ${item.teamId}\n`);
        countSkipped++;
        continue;
      }
      
      console.log(`Team: ${item.teamId.teamName || 'Unknown'}`);
      
      if (!item.expiryDate) {
        console.log("SKIPPED: No expiry date set\n");
        countSkipped++;
        continue;
      }

      const expiryDate = new Date(item.expiryDate);
      expiryDate.setHours(0, 0, 0, 0);
      
      const diffTime = expiryDate - today;
      const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      console.log(`Expiry Date: ${expiryDate.toLocaleDateString('en-IN')}`);
      console.log(`Days Left: ${daysLeft}`);
      console.log(`Last Notification: ${item.lastExpiryNotification || 'None'}`);

      if (daysLeft < 0) {
        if (item.lastExpiryNotification === 'expired') {
          console.log("Already notified as EXPIRED\n");
          countAlreadyNotified++;
          continue;
        }
        
        try {
          console.log("Sending EXPIRED notification...");
          
          await notifyTeam(
            item.teamId._id,
            `EXPIRED ALERT\n\nItem: ${item.name}\nExpired: ${Math.abs(daysLeft)} day${Math.abs(daysLeft) !== 1 ? 's' : ''} ago\nExpiry Date: ${expiryDate.toLocaleDateString('en-IN')}\nQuantity: ${item.quantity} ${item.unit}\n${item.brand ? `Brand: ${item.brand}\n` : ''}\nPlease remove immediately and dispose safely.`
          );
          
          item.lastExpiryNotification = 'expired';
          item.lastNotificationDate = new Date();
          await item.save();
          
          console.log("EXPIRED notification sent successfully\n");
          countExpired++;
        } catch (err) {
          console.error("Failed to send EXPIRED notification:", err.message);
          console.log();
        }
      }
      else if (daysLeft >= 0 && daysLeft <= 1) {
        if (item.lastExpiryNotification === '1day' || item.lastExpiryNotification === 'expired') {
          console.log(`Already notified (${item.lastExpiryNotification})\n`);
          countAlreadyNotified++;
          continue;
        }
        
        try {
          const urgencyMsg = daysLeft === 0 ? "EXPIRES TODAY" : "EXPIRES TOMORROW";
          console.log(`Sending 1-DAY notification (${urgencyMsg})...`);

          await notifyTeam(
            item.teamId._id,
            `URGENT: ${urgencyMsg}\n\nItem: ${item.name}\nExpiry: ${expiryDate.toLocaleDateString('en-IN')}\nQuantity: ${item.quantity} ${item.unit}\n${item.brand ? `Brand: ${item.brand}\n` : ''}\nUse this item to avoid waste.`
          );
          
          item.lastExpiryNotification = '1day';
          item.lastNotificationDate = new Date();
          await item.save();
          
          console.log("1-DAY notification sent successfully\n");
          count1Day++;
        } catch (err) {
          console.error("Failed to send 1-DAY notification:", err.message);
          console.log();
        }
      }
      else if (daysLeft >= 28 && daysLeft <= 35) {
        if (item.lastExpiryNotification) {
          console.log(`Already notified earlier (${item.lastExpiryNotification})\n`);
          countAlreadyNotified++;
          continue;
        }
        
        try {
          console.log("Sending 30-DAY notification...");
          
          await notifyTeam(
            item.teamId._id,
            `1 MONTH EXPIRY REMINDER\n\nItem: ${item.name}\nExpires in: ${daysLeft} days\nExpiry Date: ${expiryDate.toLocaleDateString('en-IN')}\nQuantity: ${item.quantity} ${item.unit}\n${item.brand ? `Brand: ${item.brand}\n` : ''}\nPlan your usage accordingly.`
          );
          
          item.lastExpiryNotification = '30days';
          item.lastNotificationDate = new Date();
          await item.save();
          
          console.log("30-DAY notification sent successfully\n");
          count30Day++;
        } catch (err) {
          console.error("Failed to send 30-DAY notification:", err.message);
          console.log();
        }
      }
      else {
        console.log(`SAFE: ${daysLeft} days left (no notification needed)\n`);
      }
    }

    console.log("-".repeat(60));
    console.log("FINAL SUMMARY:");
    console.log("-".repeat(60));
    console.log(`Total items checked: ${allItems.length}`);
    console.log("Notifications sent:");
    console.log(`- ${countExpired} expired alerts`);
    console.log(`- ${count1Day} 1-day alerts`);
    console.log(`- ${count30Day} 30-day alerts`);
    console.log(`Already notified: ${countAlreadyNotified}`);
    console.log(`Skipped (no expiry/team): ${countSkipped}`);
    console.log("-".repeat(60) + "\n");
    
    const totalSent = countExpired + count1Day + count30Day;
    if (totalSent === 0) {
      console.log("No new notifications needed\n");
    } else {
      console.log(`Successfully sent ${totalSent} notifications\n`);
    }
  } catch (err) {
    console.error("CRITICAL ERROR in expiry checker:", err);
    console.error("Stack trace:", err.stack);
  }
};
