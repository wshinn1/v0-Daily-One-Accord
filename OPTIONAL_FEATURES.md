# Optional Features & Integrations

This document outlines optional features that can be enabled in the future. These features are currently disabled to avoid requiring additional environment variables during development.

---

## 1. Automated User Sync (Cron Jobs)

**Status:** Disabled  
**File:** `app/api/cron/sync-users/route.ts`

### What It Does
Automatically syncs users from the `users` table to the `church_members` table on a scheduled basis. This ensures that all users are properly represented in the church members system without manual intervention.

### When You Need It
- You have a large number of users signing up regularly
- You want to ensure data consistency between users and church members
- You need automated background tasks to run periodically

### Setup Instructions

1. **Generate a secure secret:**
   \`\`\`bash
   openssl rand -base64 32
   \`\`\`

2. **Add to environment variables:**
   \`\`\`
   CRON_SECRET=your-generated-secret-here
   \`\`\`

3. **Uncomment the code in `app/api/cron/sync-users/route.ts`**
   - Remove the comment block wrapping the main implementation
   - Remove the placeholder GET handler

4. **Set up Vercel Cron:**
   - Go to your Vercel project settings
   - Navigate to "Cron Jobs"
   - Add a new cron job:
     - **Path:** `/api/cron/sync-users`
     - **Schedule:** `0 2 * * *` (runs daily at 2 AM)
     - **Headers:** `Authorization: Bearer YOUR_CRON_SECRET`

### Cost Considerations
- **Free tier:** 100 invocations/day on Vercel Hobby plan
- **Pro plan:** More generous limits included
- **Compute time:** Counts toward your deployment's execution time

### Testing
\`\`\`bash
curl -X GET https://your-domain.com/api/cron/sync-users \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
\`\`\`

---

## 2. Zapier Integration (Webhooks)

**Status:** Disabled  
**File:** `app/api/webhooks/zapier/new-user/route.ts`

### What It Does
Sends new user data to Zapier when someone signs up, allowing you to automate workflows like:
- Adding new users to Google Sheets
- Sending welcome emails via Mailchimp
- Creating Slack notifications
- Updating CRM systems
- Triggering custom workflows

### When You Need It
- You want to connect your church data to external services
- You need to automate multi-step workflows
- You want to sync data with marketing or communication tools

### Setup Instructions

1. **Generate a secure webhook secret:**
   \`\`\`bash
   openssl rand -base64 32
   \`\`\`

2. **Add to environment variables:**
   \`\`\`
   ZAPIER_WEBHOOK_SECRET=your-generated-secret-here
   \`\`\`

3. **Uncomment the code in `app/api/webhooks/zapier/new-user/route.ts`**
   - Remove the comment block wrapping the main implementation
   - Remove the placeholder GET/POST handlers

4. **Set up Zapier:**
   - Create a Zapier account (free or paid)
   - Create a new Zap with "Webhooks by Zapier" as the trigger
   - Choose "Catch Hook"
   - Use the webhook URL: `https://your-domain.com/api/webhooks/zapier/new-user`
   - Add the Authorization header: `Bearer YOUR_WEBHOOK_SECRET`

5. **Trigger the webhook from your signup flow:**
   \`\`\`typescript
   // After user creation
   await fetch('/api/webhooks/zapier/new-user', {
     method: 'POST',
     headers: {
       'Content-Type': 'application/json',
       'Authorization': `Bearer ${process.env.ZAPIER_WEBHOOK_SECRET}`
     },
     body: JSON.stringify({ userId: newUser.id })
   })
   \`\`\`

### Cost Considerations
- **Zapier Free:** 100 tasks/month
- **Zapier Starter:** $19.99/month for 750 tasks
- **Zapier Professional:** $49/month for 2,000 tasks
- **Note:** Each webhook call = 1 task

### Testing
\`\`\`bash
curl -X POST https://your-domain.com/api/webhooks/zapier/new-user \
  -H "Authorization: Bearer YOUR_WEBHOOK_SECRET" \
  -H "Content-Type: application/json" \
  -d '{"userId": "test-user-id"}'
\`\`\`

---

## Future Integration Ideas

### 3. Email Marketing Integration
- Mailchimp, SendGrid, or Resend for bulk emails
- Automated welcome sequences
- Newsletter management

### 4. SMS Notifications (Beyond Telnyx)
- Twilio for additional SMS capabilities
- Two-way SMS conversations
- Automated reminders

### 5. Payment Processing Enhancements
- Recurring giving/subscriptions
- Text-to-give
- Kiosk giving stations

### 6. Calendar Integrations
- Google Calendar sync
- Outlook Calendar sync
- iCal feeds for events

### 7. Video Streaming
- YouTube Live integration
- Vimeo integration
- Custom streaming solutions

### 8. Social Media Auto-posting
- Buffer.com integration (mentioned in roadmap)
- Post events/announcements automatically
- Schedule social media content

---

## Enabling Features Checklist

When you're ready to enable a feature:

- [ ] Review the setup instructions above
- [ ] Generate secure secrets/API keys
- [ ] Add environment variables to Vercel
- [ ] Uncomment the relevant code files
- [ ] Test the integration in development
- [ ] Deploy to production
- [ ] Monitor usage and costs
- [ ] Document any custom configurations

---

## Questions?

If you need help enabling any of these features, refer to:
- Vercel Cron documentation: https://vercel.com/docs/cron-jobs
- Zapier Webhooks documentation: https://zapier.com/apps/webhook/integrations
- Your project's main README.md for general setup
