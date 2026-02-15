# GroupMe Bridge Quick Start Guide

**Goal:** Connect your church's existing GroupMe groups with Slack so messages sync between both platforms.

**Time Required:** 5-10 minutes

---

## What You'll Need

- Your church's existing GroupMe account login
- Admin access to your church tenant dashboard
- Slack already connected (you should have this)

---

## Step 1: Get Your GroupMe Access Token

**Who does this:** The person who manages your church's GroupMe groups (usually pastor or church admin)

1. Open your web browser and go to: **https://dev.groupme.com/**

2. Click **"Sign In"** in the top right

3. Log in with your church's GroupMe account
   - Use the same login you use on your phone
   - This is the account that owns your church groups

4. After logging in, click **"Access Token"** in the top right corner

5. You'll see a long code that looks like this:
   \`\`\`
   abc123def456ghi789jkl012mno345pqr678
   \`\`\`

6. Click **"Copy"** or select all and copy it

7. **Keep this window open** - you'll need it in the next step

---

## Step 2: Add Token to Your Church Dashboard

1. Open a new browser tab

2. Go to your church tenant dashboard

3. Click **"Messaging"** in the left sidebar menu

4. Find the **"GroupMe Setup"** section at the top

5. Paste your access token into the box

6. Click **"Save Token"**

7. Wait a few seconds - the system will load your GroupMe groups

---

## Step 3: Select Your Groups

After saving the token, you'll see a list of all your GroupMe groups:

**Example:**
\`\`\`
✓ Church Announcements (150 members)
✓ Youth Ministry (45 members)  
✓ Prayer Chain (80 members)
✗ Pastor's Personal Group (5 members)
\`\`\`

**Check the boxes** next to the groups you want to use with the bridge.

**Tip:** Don't select personal or private groups - only church-wide groups.

Click **"Save Selected Groups"**

---

## Step 4: Create Your First Bridge

Now you'll connect a Slack channel to a GroupMe group:

1. Scroll down to **"Message Bridges"** section

2. Click the **"Create New Bridge"** button

3. Fill out the form:

   **Bridge Name:** Give it a simple name
   - Example: "Sunday Announcements"
   
   **Slack Channel:** Pick from the dropdown
   - Example: #announcements
   
   **GroupMe Group:** Pick from the dropdown  
   - Example: Church Announcements
   
   **Sync Direction:** Choose **"Two-way (Bidirectional)"**
   - This means messages go both ways

4. Click **"Create Bridge"**

---

## Step 5: Test It

1. Find your new bridge in the list

2. Click the **"Test Bridge"** button

3. Check both platforms:
   - Open Slack and look at your channel
   - Open GroupMe and look at your group
   - You should see a test message in both places

**If you see the test message in both places: Success! ✓**

---

## Step 6: Activate the Bridge

1. Find the toggle switch next to your bridge

2. Switch it to **"Active"** (it will turn green)

3. Done! Messages now sync automatically

---

## What Happens Now?

**When someone posts in Slack:**
- Message appears in GroupMe within 2-3 seconds
- Shows as: `[Slack] John: Hello everyone!`

**When someone posts in GroupMe:**
- Message appears in Slack within 2-3 seconds  
- Shows as: `[GroupMe] Sarah: See you Sunday!`

**Everyone can talk to everyone**, regardless of which app they use!

---

## Creating More Bridges

Want to bridge more channels? Repeat Step 4 for each one:

**Example Setup:**
\`\`\`
Bridge 1: "Announcements"
├── Slack: #announcements
└── GroupMe: Church Announcements

Bridge 2: "Youth Group"  
├── Slack: #youth
└── GroupMe: Youth Ministry

Bridge 3: "Prayer Requests"
├── Slack: #prayer  
└── GroupMe: Prayer Chain
\`\`\`

---

## Troubleshooting

**Problem: "Invalid token" error**
- Go back to dev.groupme.com and copy the token again
- Make sure you copied the entire token (no spaces)

**Problem: "No groups found"**
- Make sure you're logged into the GroupMe account that owns the groups
- The account must be the owner/creator of the groups

**Problem: Messages not syncing**
- Check that the bridge is toggled to "Active" (green)
- Click "Test Bridge" to diagnose the issue
- Make sure both Slack and GroupMe are still connected

**Problem: Test message doesn't appear**
- Wait 10-15 seconds (sometimes there's a delay)
- Check your internet connection
- Try disconnecting and reconnecting the token

---

## Need Help?

**Common Questions:**

**Q: Do I need to create a new GroupMe account?**  
A: No! Use your church's existing GroupMe account.

**Q: Will this change anything for our GroupMe members?**  
A: No. They'll just start seeing messages from Slack users too.

**Q: Can I turn off a bridge later?**  
A: Yes. Just toggle it to "Inactive" anytime.

**Q: How much does GroupMe cost?**  
A: GroupMe is 100% free. No paid plans needed.

**Q: What if I lose my access token?**  
A: Go back to dev.groupme.com and generate a new one.

---

## Quick Reference

**Get Token:** https://dev.groupme.com/ → Sign In → Access Token  
**Add Token:** Dashboard → Messaging → GroupMe Setup  
**Create Bridge:** Dashboard → Messaging → Create New Bridge  
**Test Bridge:** Click "Test Bridge" button  
**Activate:** Toggle switch to "Active"

---

**That's it! Your Slack and GroupMe are now connected. 🎉**
