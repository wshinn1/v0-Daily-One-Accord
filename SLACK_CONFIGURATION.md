# Slack App Configuration Guide

This guide provides the correct endpoint URLs and step-by-step instructions for configuring your Slack app to work with One Accord.

## Required Endpoint URLs

All endpoints should use your production domain: `https://dailyoneaccord.com`

### 1. Slash Commands

Configure the `/attendance` command:

**Command:** `/attendance`  
**Request URL:** `https://dailyoneaccord.com/api/slack/commands`  
**Short Description:** Record attendance for church services  
**Usage Hint:** `[member name or partial name]`

### 2. Interactivity & Shortcuts

**Request URL:** `https://dailyoneaccord.com/api/slack/interactions`

This handles all interactive components like:
- Button clicks
- Modal submissions
- Select menu interactions
- Attendance form submissions

### 3. Event Subscriptions (Optional)

**Request URL:** `https://dailyoneaccord.com/api/slack/events`

Enable if you want to receive workspace events like:
- Messages
- App mentions
- Member joins/leaves

## Step-by-Step Configuration

### Updating Slash Commands

1. Go to https://api.slack.com/apps
2. Select your One Accord app
3. Navigate to **Features** → **Slash Commands** in the left sidebar
4. Click on the `/attendance` command
5. Update the **Request URL** to: `https://dailyoneaccord.com/api/slack/commands`
6. Click **Save**

### Updating Interactivity

1. In your Slack app settings, navigate to **Features** → **Interactivity & Shortcuts**
2. Make sure **Interactivity** is turned **On**
3. Update the **Request URL** to: `https://dailyoneaccord.com/api/slack/interactions`
4. Click **Save Changes**

### Updating Event Subscriptions (if enabled)

1. Navigate to **Features** → **Event Subscriptions**
2. Turn on **Enable Events** if needed
3. Update the **Request URL** to: `https://dailyoneaccord.com/api/slack/events`
4. Wait for the URL to be verified (you'll see a green checkmark)
5. Click **Save Changes**

### Reinstalling the App

After updating URLs, you may need to reinstall the app to your workspace:

1. Navigate to **Settings** → **Install App**
2. Click **Reinstall to Workspace**
3. Review the permissions and click **Allow**

## Testing the Configuration

### Test the `/attendance` Command

1. Open any Slack channel where the bot is installed
2. Type `/attendance` and press Enter
3. You should see an attendance form modal appear
4. If you see "dispatch_unknown_error", the Request URL is incorrect

### Test Interactive Components

1. After opening the attendance form, try:
   - Searching for a member name
   - Selecting a member from the dropdown
   - Submitting the form
2. All interactions should work smoothly without errors

## Troubleshooting

### "dispatch_unknown_error"

**Cause:** Slack cannot reach your Request URL  
**Solution:** 
- Verify the URL is exactly `https://dailyoneaccord.com/api/slack/commands`
- Ensure your app is deployed and the endpoint is accessible
- Check that there are no typos in the URL

### "Timeout" or "Operation Timed Out"

**Cause:** The endpoint is taking longer than 3 seconds to respond  
**Solution:**
- Check your server logs for slow database queries
- Ensure your Supabase connection is healthy
- Verify environment variables are set correctly

### "Invalid Token" or Authentication Errors

**Cause:** Slack signing secret or bot token mismatch  
**Solution:**
- Verify `SLACK_SIGNING_SECRET` environment variable matches your app's signing secret
- Verify `SLACK_BOT_TOKEN` environment variable matches your bot token
- Both can be found in your Slack app settings under **Basic Information** and **OAuth & Permissions**

## Environment Variables Required

Make sure these are set in your Vercel project:

\`\`\`
SLACK_BOT_TOKEN=xoxb-your-bot-token
SLACK_SIGNING_SECRET=your-signing-secret
\`\`\`

You can find these values in your Slack app settings:
- **Bot Token:** Settings → Install App → Bot User OAuth Token
- **Signing Secret:** Settings → Basic Information → App Credentials → Signing Secret

## Additional Resources

- [Slack API Documentation](https://api.slack.com/docs)
- [Slash Commands Guide](https://api.slack.com/interactivity/slash-commands)
- [Interactive Components Guide](https://api.slack.com/interactivity/handling)
