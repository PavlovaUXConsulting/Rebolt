import { db } from "../server/db";
import { recipients } from "../shared/schema";
import { eq } from "drizzle-orm";

async function updateRecipients() {
  console.log("Starting to update recipients...");
  
  // Fetch all recipients
  const allRecipients = await db.select().from(recipients);
  console.log(`Found ${allRecipients.length} recipients to update`);
  
  if (allRecipients.length === 0) {
    console.log("No recipients found to update.");
    return;
  }
  
  // Calculate the number of recipients for each service
  const totalRecipients = allRecipients.length;
  const paypalCount = Math.floor(totalRecipients * 0.3); // 30% PayPal
  const reboltCount = Math.floor(totalRecipients * 0.3); // 30% Rebolt
  const venmoCount = totalRecipients - paypalCount - reboltCount; // Remaining are Venmo
  
  console.log(`Distribution: PayPal (${paypalCount}), Rebolt (${reboltCount}), Venmo (${venmoCount})`);
  
  // Update recipients in batches
  for (let i = 0; i < paypalCount; i++) {
    await db.update(recipients)
      .set({ service: "paypal" })
      .where(eq(recipients.id, allRecipients[i].id));
  }
  
  for (let i = paypalCount; i < paypalCount + reboltCount; i++) {
    await db.update(recipients)
      .set({ service: "rebolt" })
      .where(eq(recipients.id, allRecipients[i].id));
  }
  
  for (let i = paypalCount + reboltCount; i < totalRecipients; i++) {
    await db.update(recipients)
      .set({ service: "venmo" })
      .where(eq(recipients.id, allRecipients[i].id));
  }
  
  console.log("Successfully updated recipients with new service types!");
}

// Run the update function
updateRecipients()
  .then(() => {
    console.log("Recipients update completed!");
    process.exit(0);
  })
  .catch(error => {
    console.error("Error updating recipients:", error);
    process.exit(1);
  });