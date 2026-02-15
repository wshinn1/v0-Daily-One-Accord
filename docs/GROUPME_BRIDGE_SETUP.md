# Slack ↔ GroupMe Bridge Setup Guide

This guide will walk you through setting up the Slack ↔ GroupMe bridge so your church members can communicate across both platforms seamlessly.

## Overview

The bridge allows messages to sync between Slack channels and GroupMe groups in real-time. People using Slack can communicate with people using GroupMe as if they're in the same conversation.

---

## Prerequisites

✅ **Before you start, make sure you have:**
- Slack workspace already connected to your church tenant
- Admin access to your church's GroupMe groups
- A GroupMe account

---

## Step 1: Get Your GroupMe Access Token

### 1.1 Log into GroupMe Developer Portal

1. Go to https://dev.groupme.com/
2. Click **"Sign In"** in the top right
3. Log in with your GroupMe account

### 1.2 Get Your Access Token

1. After logging in, you'll see your **Access Token** at the top of the page
2. It looks like: `a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6`
3. **Copy this token** - you'll need it in the next step

⚠️ **Important:** Keep this token secure! It gives access to your GroupMe account.

---

## Step 2: Connect GroupMe to Your Church Tenant

### 2.1 Navigate to Messaging Settings

1. Log into your church dashboard
2. Go to **Settings** → **Messaging** (or navigate to `/dashboard/messaging`)
3. You'll see two sections: **Slack** and **GroupMe**

### 2.2 Add GroupMe Access Token

1. In the **GroupMe Setup** section, paste your access token
2. Click **"Save Access Token"**
3. Wait for confirmation: "GroupMe connected successfully!"

### 2.3 Verify Connection

1. After saving, you should see:
   - ✅ **Status:** Connected
   - Your GroupMe groups will load automatically
   - A list of available groups you're a member of

---

## Step 3: Create a Message Bridge

### 3.1 Open Bridge Manager

1. Scroll down to the **"Message Bridges"** section
2. Click **"Create New Bridge"**
3. A dialog will open

### 3.2 Configure Your Bridge

**Fill out the bridge settings:**

1. **Bridge Name** (required)
   - Example: "Sunday Announcements Bridge"
   - This is just for your reference

2. **Select Slack Channel** (required)
   - Choose from your connected Slack channels
   - Example: `#announcements`

3. **Select GroupMe Group** (required)
   - Choose from your GroupMe groups
   - Example: "Church Announcements"

4. **Sync Direction** (required)
   - **Two-way (Bidirectional)**: Messages sync both directions ← →
   - **Slack to GroupMe only**: Messages only go Slack → GroupMe
   - **GroupMe to Slack only**: Messages only go GroupMe → Slack
   
   💡 **Recommended:** Start with "Two-way" for full communication

5. **Status**
   - ✅ **Active**: Bridge is running, messages sync immediately
   - ⏸️ **Paused**: Bridge is disabled, no messages sync

### 3.3 Create the Bridge

1. Click **"Create Bridge"**
2. Wait for confirmation: "Bridge created successfully!"
3. The bridge will appear in your list of active bridges

---

## Step 4: Test Your Bridge

### 4.1 Send a Test Message from Slack

1. Open your Slack workspace
2. Go to the channel you bridged (e.g., `#announcements`)
3. Send a test message: "Testing bridge - can you see this in GroupMe?"
4. Check your GroupMe group - you should see:
   \`\`\`
   [Slack] Your Name: Testing bridge - can you see this in GroupMe?
   \`\`\`

### 4.2 Send a Test Message from GroupMe

1. Open your GroupMe app
2. Go to the group you bridged
3. Send a test message: "Testing from GroupMe!"
4. Check your Slack channel - you should see:
   \`\`\`
   [GroupMe] Your Name: Testing from GroupMe!
   \`\`\`

### 4.3 Verify Two-Way Communication

✅ **Success indicators:**
- Messages appear within 1-3 seconds
- User names are preserved
- Platform tags show where messages came from
- No duplicate messages

---

## Step 5: Manage Your Bridges

### View All Bridges

In the **Message Bridges** section, you'll see all your active bridges:

\`\`\`
Bridge Name: Sunday Announcements Bridge
├── Slack: #announcements
├── GroupMe: Church Announcements
├── Direction: Two-way
└── Status: Active
\`\`\`

### Edit a Bridge

1. Click the **Edit** button (pencil icon) on any bridge
2. Modify settings (name, direction, status)
3. Click **"Save Changes"**

### Pause a Bridge

1. Click **Edit** on the bridge
2. Change **Status** to "Paused"
3. Click **"Save Changes"**
4. Messages will stop syncing immediately

### Delete a Bridge

1. Click the **Delete** button (trash icon) on any bridge
2. Confirm deletion
3. The bridge will be removed permanently

---

## Common Use Cases

### Use Case 1: Church-Wide Announcements

**Setup:**
- Bridge: Slack `#announcements` ↔ GroupMe "Church Announcements"
- Direction: Two-way
- Result: Pastor posts once, everyone sees it

### Use Case 2: Youth Group + Leadership

**Setup:**
- Bridge: Slack `#youth-leadership` ↔ GroupMe "Youth Group"
- Direction: Two-way
- Result: Youth leaders on Slack can communicate with students on GroupMe

### Use Case 3: Prayer Requests

**Setup:**
- Bridge: Slack `#prayer-requests` ↔ GroupMe "Prayer Chain"
- Direction: Two-way
- Result: Prayer requests reach everyone regardless of platform

### Use Case 4: Staff → Members (One-Way)

**Setup:**
- Bridge: Slack `#staff-announcements` ↔ GroupMe "Church Updates"
- Direction: Slack to GroupMe only
- Result: Staff can broadcast to members, but members can't reply back to staff channel

---

## Troubleshooting

### Messages Not Appearing

**Problem:** Messages sent in Slack don't appear in GroupMe (or vice versa)

**Solutions:**
1. Check bridge status - make sure it's **Active**, not Paused
2. Verify sync direction - make sure it's set to allow messages in that direction
3. Check GroupMe access token - it may have expired
4. Refresh the page and try again
5. Check the bridge logs in your dashboard

### Duplicate Messages

**Problem:** Messages appear twice in the same platform

**Solutions:**
1. Make sure you only have ONE bridge between the same Slack channel and GroupMe group
2. Delete any duplicate bridges
3. The system has loop prevention, but multiple bridges can cause duplicates

### Access Token Invalid

**Problem:** "Invalid access token" error when connecting GroupMe

**Solutions:**
1. Go back to https://dev.groupme.com/ and get a fresh token
2. Make sure you copied the entire token (no spaces or extra characters)
3. Try logging out and back into GroupMe, then get a new token

### GroupMe Groups Not Loading

**Problem:** No groups appear after connecting GroupMe

**Solutions:**
1. Make sure you're a member of at least one GroupMe group
2. Refresh the page
3. Try disconnecting and reconnecting GroupMe
4. Check that your access token has the correct permissions

### Messages Delayed

**Problem:** Messages take a long time to sync (more than 10 seconds)

**Solutions:**
1. This is usually due to API rate limits
2. If you have many bridges, messages may queue up
3. Check your internet connection
4. Contact support if delays persist

---

## Best Practices

### 1. Start Small
- Create 1-2 bridges initially
- Test thoroughly before adding more
- Get feedback from your church members

### 2. Clear Communication
- Tell your church members about the bridge
- Explain that messages sync between platforms
- Show them the `[Slack]` and `[GroupMe]` tags

### 3. Choose the Right Direction
- **Two-way**: For collaborative discussions
- **One-way**: For announcements where you don't want replies

### 4. Monitor Your Bridges
- Check bridge status regularly
- Review message logs
- Pause bridges that aren't being used

### 5. Respect Platform Limits
- GroupMe has rate limits (avoid spamming)
- Don't create too many bridges at once
- Be mindful of message volume

---

## Security & Privacy

### Access Token Security
- Never share your GroupMe access token
- Store it securely in your dashboard
- Regenerate it if compromised

### Message Privacy
- All bridged messages are visible on both platforms
- Don't bridge private/sensitive channels
- Inform members that messages are being synced

### Data Storage
- Messages are relayed in real-time
- We don't store message content
- Only bridge configurations are saved

---

## FAQ

**Q: Can I bridge multiple Slack channels to one GroupMe group?**
A: Yes! You can create multiple bridges. Each Slack channel can bridge to the same GroupMe group.

**Q: Can I bridge one Slack channel to multiple GroupMe groups?**
A: Yes! Create separate bridges for each GroupMe group.

**Q: Do I need to install anything on Slack or GroupMe?**
A: No! The bridge works through webhooks and APIs. No installations needed.

**Q: What happens if I delete a bridge?**
A: Messages stop syncing immediately. Past messages remain in both platforms.

**Q: Can I see message history from before the bridge was created?**
A: No. The bridge only syncs new messages sent after it's activated.

**Q: Does the bridge work with images and files?**
A: Currently, only text messages are supported. Image/file support can be added.

**Q: Can I customize the `[Slack]` and `[GroupMe]` tags?**
A: Not yet, but this feature can be added if needed.

**Q: What if someone leaves one of the platforms?**
A: They'll only see messages on the platform they're still a member of.

---

## Need Help?

If you encounter issues not covered in this guide:

1. Check the troubleshooting section above
2. Review your bridge configuration
3. Contact support with:
   - Bridge name
   - Error message (if any)
   - Steps to reproduce the issue

---

## Summary Checklist

✅ **Setup Complete When:**
- [ ] GroupMe access token added and verified
- [ ] At least one bridge created
- [ ] Test messages sent from both platforms
- [ ] Messages appearing correctly with platform tags
- [ ] Church members informed about the bridge

**Congratulations!** Your Slack ↔ GroupMe bridge is now active. Your church can now communicate seamlessly across both platforms! 🎉
