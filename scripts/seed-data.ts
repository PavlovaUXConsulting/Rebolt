import { db } from "../server/db";
import { users, recipients } from "../shared/schema";

async function seedDatabase() {
  console.log("Seeding database...");
  
  // Insert default user if not exists
  const existingUsers = await db.select().from(users);
  let userId = 1;
  
  if (existingUsers.length === 0) {
    console.log("Creating default user...");
    const [user] = await db.insert(users).values({
      username: "megan.wiseman",
      password: "password123", // In a real app, this would be hashed
      name: "Megan Wiseman",
      email: "megan.wiseman@example.com",
      avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Megan"
    }).returning();
    
    userId = user.id;
    console.log(`Created user with ID ${userId}`);
  } else {
    userId = existingUsers[0].id;
    console.log(`Using existing user with ID ${userId}`);
  }
  
  // Insert recipients
  const recipientData = [
    // PayPal recipients
    { name: "James Wilson", username: "@jameswilson", service: "paypal" },
    { name: "Emma Rodriguez", username: "@emmar", service: "paypal" },
    { name: "Michael Johnson", username: "@mjohnson", service: "paypal" },
    { name: "Sophia Martinez", username: "@sophiamtz", service: "paypal" },
    { name: "William Brown", username: "@willbrown", service: "paypal" },
    { name: "Olivia Davis", username: "@oliviad", service: "paypal" },
    { name: "Alexander Garcia", username: "@alexgarcia", service: "paypal" },
    { name: "Isabella Smith", username: "@isabellas", service: "paypal" },
    { name: "Daniel Miller", username: "@danielm", service: "paypal" },
    { name: "Charlotte Wilson", username: "@charlottew", service: "paypal" },
    { name: "Ethan Anderson", username: "@ethana", service: "paypal" },
    { name: "Amelia Taylor", username: "@ameliat", service: "paypal" },
    { name: "Benjamin Thomas", username: "@bent", service: "paypal" },
    { name: "Harper White", username: "@harperw", service: "paypal" },
    { name: "Mason Harris", username: "@masonh", service: "paypal" },
    
    // Venmo recipients
    { name: "Evelyn Martin", username: "@evemartin", service: "venmo" },
    { name: "Jack Lewis", username: "@jacklewis", service: "venmo" },
    { name: "Abigail Clark", username: "@abbyc", service: "venmo" },
    { name: "Lucas Walker", username: "@lucasw", service: "venmo" },
    { name: "Emily King", username: "@emilyking", service: "venmo" },
    { name: "Aiden Wright", username: "@aidenw", service: "venmo" },
    { name: "Sofia Scott", username: "@sofiascott", service: "venmo" },
    { name: "Logan Green", username: "@logang", service: "venmo" },
    { name: "Avery Nelson", username: "@averyn", service: "venmo" },
    { name: "Scarlett Baker", username: "@scarlettb", service: "venmo" },
    { name: "Jackson Adams", username: "@jackadams", service: "venmo" },
    { name: "Aria Hill", username: "@ariahill", service: "venmo" },
    { name: "Liam Carter", username: "@liamcarter", service: "venmo" },
    { name: "Riley Nelson", username: "@rileyn", service: "venmo" },
    { name: "Zoe Mitchell", username: "@zoem", service: "venmo" },
  ];
  
  // Check for existing recipients to avoid duplicates
  const existingRecipients = await db.select().from(recipients);
  
  if (existingRecipients.length > 0) {
    console.log(`Found ${existingRecipients.length} existing recipients. Skipping recipient creation.`);
    return;
  }
  
  // Insert each recipient
  for (const recipient of recipientData) {
    await db.insert(recipients).values({
      userId: userId,
      name: recipient.name,
      username: recipient.username,
      service: recipient.service
    });
  }
  
  console.log(`Added ${recipientData.length} recipients to the database`);
}

// Run the seeding function
seedDatabase()
  .then(() => {
    console.log("Database seeding completed!");
    process.exit(0);
  })
  .catch(error => {
    console.error("Error seeding database:", error);
    process.exit(1);
  });