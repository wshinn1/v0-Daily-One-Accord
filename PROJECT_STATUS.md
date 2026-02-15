# Daily One Accord - Project Status

**Last Updated:** January 20, 2025  
**Status:** Deployment blocked by Vercel infrastructure outages

---

## Current Deployment Status

**Issue:** Vercel deployment failing with "An unexpected error happened when running this build"
- Build completes successfully (all pages compile without errors)
- Failure occurs during "Deploying outputs..." phase
- This is a Vercel infrastructure issue, not a code problem
- Code is safely stored in GitHub repository: `v0-one-accord`

**Action Required:** Wait for Vercel platform to stabilize, then redeploy

---

## Completed Features (Ready to Deploy)

### Slack Integration
- Fixed `/attendance` command - now working in Slack
- Service role client for unauthenticated Slack requests
- Bot configuration saved to both `slack_workspaces` and `slack_bot_configs` tables
- Removed dates from event dropdown in attendance form
- Form submission successfully saves to database
- Added notification sound when new messages arrive in embedded Slack chat

### Visitor Management
- Enhanced kanban board with color-coded columns:
  - Blue for "New Visitor"
  - Amber for "First Contact" and "Follow-up Scheduled"
  - Emerald for "Engaged"
  - Default for "Member"
- Copy-to-clipboard buttons for email and phone numbers
- Improved drag-and-drop with visual feedback and smooth transitions
- Quick-assign functionality to assign visitors to team members directly from cards
- Optional assignment field (not required)

### Attendance Tracking
- New category-based attendance spreadsheet view
- Rows = Events/Dates, Columns = Categories (Adults, Children, Visitors, etc.)
- Editable cells with inline editing
- Moved previous member-based spreadsheet to "Individual Tracking" tab
- Data from Slack `/attendance` submissions now displays in Spreadsheet tab

### User Management
- Fixed pending invitations filter to exclude users who are already members
- Users no longer appear in "Pending Invitations" after creating their account

### Pricing & Subscription System
- Created embeddable pricing page at `/pricing`
- Three subscription tiers with Stripe integration:
  - **Starter:** $49/month + $49 setup fee
  - **Growth:** $99/month + $99 setup fee
  - **Enterprise:** $199/month + $199 setup fee
- Stripe checkout flow with automatic subscription creation
- Post-payment church setup flow:
  - Church name input
  - Auto-generated church code (6-character alphanumeric)
  - Admin account creation
  - Automatic redirect to dashboard after setup

---

## Pending Tasks

### High Priority

1. **Deploy to Production**
   - Wait for Vercel platform to stabilize
   - Verify deployment completes successfully
   - Test all new features on live site

2. **Test Pricing & Checkout Flow**
   - Verify Stripe checkout works when embedded on WordPress
   - Test subscription creation and payment processing
   - Confirm church setup flow after payment
   - Verify auto-generated church codes are created correctly

3. **WordPress Embedding**
   - Provide embed code for pricing page
   - Test embedded pricing page on WordPress site
   - Ensure checkout flow works from embedded page

### Medium Priority

4. **Attendance Spreadsheet Enhancements**
   - Test editing functionality on live site
   - Verify data saves correctly to `attendance_by_category` table
   - Add export functionality (CSV/Excel) if needed

5. **Visitor Kanban Improvements**
   - Test quick-assign functionality on live site
   - Verify color-coded columns display correctly
   - Test copy-to-clipboard buttons

6. **Church Code Management**
   - Add ability to edit church code in dashboard settings
   - Add validation to prevent duplicate codes
   - Display church code prominently in settings

### Low Priority

7. **Pricing Page Customization**
   - Add admin interface to edit pricing page styling
   - Allow customization of colors, fonts, and layout
   - Add ability to show/hide features for each tier

8. **Documentation**
   - Create user guide for Slack attendance tracking
   - Document pricing page embedding process
   - Create admin guide for managing subscriptions

9. **Additional Features**
   - Add comparison table showing Daily One Accord vs competitors
   - Add testimonials section to pricing page
   - Add FAQ section for common questions

### Future Enhancements (Deferred)

10. **Social Media Scheduling System**
    - Postponed to focus on core features
    - Would include: post composer, calendar view, multi-platform support
    - Estimated effort: 6-10 hours for MVP (Facebook/Instagram)
    - Consider using existing tools (Later.com, Buffer) in the interim

11. **Tithe & Giving System**
    - Postponed to focus on core features first
    - Estimated effort: 15-20 hours for complete system
    
    **Requirements:**
    - Churches connect their own Stripe accounts (Stripe Connect)
    - Money goes directly to each church
    
    **Giving Options:**
    - One-time donations
    - Recurring tithes (weekly, monthly, yearly)
    - Custom giving categories per church (General Fund, Missions, Building Fund, etc.)
    - Payment for event/class registration
    
    **Donor Experience:**
    - Public giving page (anyone can access)
    - Member-only giving option (must be logged in)
    - Guest checkout option
    - Save payment methods for recurring giving
    
    **Features:**
    - Donor profiles with giving history
    - Tax receipts (annual statements)
    - Admin dashboard to track donations
    - Email confirmations
    - Pledge campaigns
    
    **Embeddable:**
    - Generate embed code for WordPress/websites
    - Customizable styling
    - Works on any site
    
    **Phased Approach:**
    - Phase 1: Core Giving (4-5 hours) - Stripe Connect, categories, one-time donations, admin dashboard
    - Phase 2: Recurring & Donors (3-4 hours) - Recurring donations, donor profiles, giving history
    - Phase 3: Advanced Features (4-5 hours) - Tax receipts, pledge campaigns, event/class payment
    - Phase 4: Embeddable Widget (3-4 hours) - Embed code generator, customizable styling

---

## Known Issues

1. **Vercel Deployment Failures**
   - Status: Ongoing platform issue
   - Impact: Cannot deploy latest changes
   - Workaround: Wait for platform to stabilize
   - Reference: https://www.vercel-status.com/

2. **Supabase Regional Outages**
   - Status: Resolved (as of earlier today)
   - Impact: Database connectivity issues
   - Resolution: Service restored

---

## Next Steps When Resuming

1. Check Vercel status page: https://www.vercel-status.com/
2. If stable, push latest changes to GitHub (if not already done)
3. Verify deployment completes successfully
4. Test all new features on live site:
   - Slack `/attendance` command and form submission
   - Visitor kanban board enhancements
   - Attendance spreadsheet view
   - Pricing page and checkout flow
   - Chat notification sound
5. Provide WordPress embed code for pricing page
6. Continue with pending tasks from checklist above

---

## Technical Notes

### Database Schema Changes
- No new migrations needed
- All features use existing tables
- `visitors.assigned_to` field already exists
- `attendance_by_category` table already exists

### Environment Variables
- All Stripe keys are configured in Vercel
- Supabase credentials are configured
- No new environment variables needed

### GitHub Repository
- Repository: `v0-one-accord`
- Branch: `main`
- All code is committed and pushed
- Vercel auto-deploys from GitHub

---

## Contact & Support

- Vercel Support: https://vercel.com/help
- Vercel Status: https://www.vercel-status.com/
- Project Dashboard: https://v0.app/chat/projects/ObhEG42ztN9
