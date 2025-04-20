/**
 * Script to promote a user to admin status
 * 
 * Usage: npm run make-admin -- username
 */

import { db } from "../db";
import { users } from "../../shared/schema";
import { eq } from "drizzle-orm";

async function makeAdmin(username: string) {
  try {
    // Find the user
    const [user] = await db.select().from(users).where(eq(users.username, username));
    
    if (!user) {
      console.error(`User '${username}' not found.`);
      process.exit(1);
    }
    
    console.log(`Found user: ${user.username} (ID: ${user.id})`);
    
    // Update the user's admin status
    const [updatedUser] = await db
      .update(users)
      .set({ isAdmin: true })
      .where(eq(users.id, user.id))
      .returning();
    
    console.log(`✅ Success! User '${updatedUser.username}' is now an admin.`);
    
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

// Get username from command line argument
const username = process.argv[2];

if (!username) {
  console.error('Please provide a username.');
  console.error('Usage: npm run make-admin -- username');
  process.exit(1);
}

makeAdmin(username);