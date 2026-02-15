# Social Media Scheduling Setup Guide

## Overview

Daily One Accord now includes social media scheduling capabilities via Buffer integration. This allows churches to schedule and publish posts to Facebook, Instagram, and other platforms directly from the dashboard.

## Pricing Structure

### Included Plans
- **Growth Plan ($89/month)**: Social media scheduling included
- **Enterprise Plan ($199/month)**: Social media scheduling included

### Add-On Option
- **Starter Plan**: Can add social media scheduling for $14/month

## Setup Instructions

### 1. Run the Stripe Pricing Script

First, create the new Stripe prices:

\`\`\`bash
bun run scripts/create-social-media-pricing.ts
\`\`\`

This will:
- Create a new $89/month price for the Growth plan
- Create a new Social Media Add-On product with $14/month price
- Output the new price IDs

### 2. Update Stripe Config

Copy the price IDs from the script output and update `lib/stripe/config.ts`:

\`\`\`typescript
export const STRIPE_PRICE_IDS = {
  growth: "price_NEW_GROWTH_PRICE_ID", // Replace with actual ID
  socialMediaAddon: "price_NEW_ADDON_PRICE_ID", // Replace with actual ID
  // ... rest of config
}
\`\`\`

### 3. Buffer Integration Setup

To enable Buffer integration:

1. Create a Buffer developer account at https://buffer.com/developers
2. Register your application
3. Add Buffer OAuth credentials to environment variables:
   - `BUFFER_CLIENT_ID`
   - `BUFFER_CLIENT_SECRET`
   - `BUFFER_REDIRECT_URI`

### 4. Database Schema

Add social media scheduling tables:

\`\`\`sql
-- Buffer connections
CREATE TABLE buffer_connections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  church_tenant_id UUID REFERENCES church_tenants(id) ON DELETE CASCADE,
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  profiles JSONB, -- Array of connected social profiles
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Scheduled posts
CREATE TABLE scheduled_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  church_tenant_id UUID REFERENCES church_tenants(id) ON DELETE CASCADE,
  buffer_post_id TEXT,
  content TEXT NOT NULL,
  media_urls TEXT[],
  scheduled_time TIMESTAMPTZ NOT NULL,
  status TEXT DEFAULT 'scheduled', -- scheduled, published, failed
  platforms TEXT[], -- facebook, instagram, twitter, etc.
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Post analytics
CREATE TABLE post_analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID REFERENCES scheduled_posts(id) ON DELETE CASCADE,
  likes INTEGER DEFAULT 0,
  comments INTEGER DEFAULT 0,
  shares INTEGER DEFAULT 0,
  reach INTEGER DEFAULT 0,
  synced_at TIMESTAMPTZ DEFAULT NOW()
);
\`\`\`

### 5. Feature Access Control

The system automatically checks plan access:

\`\`\`typescript
// Check if tenant has social media access
const hasSocialMedia = 
  tenant.plan === 'growth' || 
  tenant.plan === 'enterprise' ||
  tenant.addons?.includes('socialMedia')
\`\`\`

## Features

### For Churches
- Schedule posts to Facebook & Instagram
- Calendar view of scheduled content
- Post history and analytics
- Media library integration
- Multi-account support

### For Admins
- Track which tenants have social media access
- Monitor usage and engagement
- Manage Buffer API integration

## Next Steps

1. Run the pricing script
2. Update Stripe config with new price IDs
3. Set up Buffer developer account
4. Add database tables
5. Build the social media dashboard UI
6. Implement Buffer OAuth flow
7. Create post composer and calendar views

## Support

For questions or issues, contact the development team.
