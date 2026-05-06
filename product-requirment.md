# SHADII.PK — Complete Product Requirements Document
# Matrimonial App for iOS & Android (React Native + Node.js + MongoDB)

---

## PROJECT OVERVIEW

App Name: Shadii.pk
Platform: iOS + Android (React Native), Web (simple landing/marketing site)
Backend: Node.js + Express + MongoDB (deployed on Railway)
Target Market: Pakistani users globally (Pakistan, UK, UAE, etc.)
Core Goal: A serious, safe, premium matrimonial platform — not a dating app.

---

## USER ROLES

1. Guest — can view landing page only
2. Free User — registered, limited features
3. Subscribed User — full access based on plan
4. Verified User — blue tick, CNIC verified
5. Boosted User — profile highlighted for 3 days
6. Admin — full dashboard access

---

## ONBOARDING & SIGNUP

Required fields at signup (no optional fields — all mandatory):
- Gender (Male / Female) — determines profile flow
- Full Name
- Email address (verified via OTP)
- Phone number (Pakistani or international format)
- Age (18 minimum — hard block below 18)
- At least 1 profile photo (face clearly visible)
- Education level (Matric / Inter / Graduate / Masters / PhD / Other)
- Height (in feet/inches with picker)
- Caste / Biradari (text field + common options dropdown)
- Country (dropdown)
- City (conditional on country)
- About Yourself (minimum 50 characters)
- Hobbies (multi-select tags)
- Interests (multi-select tags)

Photo Rules:
- Female photos: BLURRED by default for non-subscribers
- Male photos: visible to all registered users
- Unblur female photos: only after subscribing to any paid plan

---

## MESSAGING SYSTEM

### Free Message Rule
- Every user gets EXACTLY 1 free message to send to any profile
- After that, must purchase a plan to continue messaging
- Free message delivery status:
  - "Delivered" shown immediately
  - "Seen" status shown only after 6 hours (artificial delay)
  - This creates urgency — user thinks the other person read it

### Message Filters / Forbidden Content Detection
- Real-time scan for:
  - Phone numbers (any format: 03xx-xxxxxxx, +92xxxxxxxxxx, 0044xxxxxxxxx)
  - WhatsApp mentions ("whatsapp", "wp", "watsap", "w/p")
  - Social media handles (@username, "instagram", "snapchat", "facebook", "fb", "insta")
  - Email addresses
  - Any attempt to move conversation off-platform

- On Detection:
  - First offense: Warning popup — "Sharing contact info is against our policy"
  - Message is blocked and NOT delivered
  - Second offense within 7 days: Account suspended for 24 hours
  - Third offense: Account flagged for manual admin review
  - All flagged messages logged in admin dashboard

---

## SUBSCRIPTION PLANS

Pricing in PKR:
- Basic Plan: 1,000 PKR / month
  - Unlimited messaging
  - See who viewed your profile
  - Advanced search filters

- Standard Plan: 2,500 PKR / month
  - Everything in Basic
  - See female photos unblurred
  - 5 profile boosts per month
  - Priority in match suggestions

- Premium Plan: 5,000 PKR / month
  - Everything in Standard
  - Verified badge fast-track review
  - Profile featured in Daily Matches
  - Dedicated support

Profile Boost Add-on: 500 PKR / 3 days
- Profile appears at top of search results
- "Boosted" label shown on profile card
- Separate purchase, not included in any plan

---

## PAYMENT INTEGRATION

Methods to support:
- JazzCash (mobile wallet)
- EasyPaisa (mobile wallet)
- Bank card (Visa/Mastercard via Stripe or local gateway)
- HBL, Meezan Bank internet banking (if API available)

Payment flow:
1. User selects plan
2. Chooses payment method
3. Redirected to payment screen or deep link
4. On success: plan activated immediately, receipt emailed
5. On failure: retry option shown, no plan activated
6. All transactions logged in admin dashboard

---

## VERIFICATION SYSTEM (Blue Tick)

User requests verification from profile settings.
Steps:
1. Upload front + back photo of CNIC
2. Take live photo using device camera (liveness check — not a gallery upload)
3. Status set to "Under Review"
4. Admin reviews in dashboard (approve / reject with reason)
5. On approval: Blue tick appears on profile
6. On rejection: User notified with reason, can resubmit

Rules:
- Name on CNIC must match name on profile (admin checks manually)
- Age on CNIC must match age on profile
- Live photo must match CNIC photo (admin judgment)
- CNIC images stored encrypted, not visible to other users

---

## DAILY MATCH ALGORITHM

Every day at 9:00 AM (Pakistan time), generate 3–5 match suggestions per user:

Algorithm factors (weighted):
1. Gender preference match (opposite gender by default) — mandatory
2. Age range overlap (user's preferred range vs other user's age) — high weight
3. Location proximity (same city = highest, same country = medium) — high weight
4. Education compatibility — medium weight
5. Caste/Biradari match (if user specified preference) — medium weight
6. Shared hobbies/interests — lower weight
7. Profile completeness score (complete profiles ranked higher) — lower weight
8. Subscription status (verified + subscribed users ranked higher) — lower weight

Rules:
- Never suggest same profiles two days in a row
- Never suggest blocked or reported users
- Suspended users not shown in suggestions
- Show max 5 suggestions, minimum 3

---

## SEARCH & FILTER SYSTEM

Search filters available:
- Gender
- Age range (slider: 18–70)
- Country
- City
- Education level (multi-select)
- Height range
- Caste/Biradari
- Marital status (Never Married / Divorced / Widowed)
- Sect (Sunni / Shia / Other — optional)
- Verified only (toggle)
- With photo only (toggle)
- Online recently (toggle)

Sort by options:
- Newest profiles
- Last active
- Most compatible (algorithm score)
- Boosted profiles first

---

## PROFILE FEATURES

Profile Card (shown in search/suggestions):
- Profile photo (blurred if female + viewer not subscribed)
- Name + Age + City
- Education
- Verified badge (if applicable)
- Boosted label (if active)
- Compatibility percentage

Full Profile View:
- All signup fields displayed
- Photo gallery (max 5 photos)
- About section
- Hobbies & interests tags
- Last active status
- "Send Message" button
- "Save Profile" / Bookmark button
- "Report" button (three dots menu)
- "Block" option

---

## REPORTING & BLOCKING SYSTEM

### Block
- Blocked user cannot see your profile
- Blocked user cannot message you
- You disappear from their search results
- Block is silent — they are not notified
- You can unblock from settings

### Report
Categories:
- Fake profile / Impersonation
- Inappropriate photos
- Harassment or abusive messages
- Sharing contact information
- Scam or fraud
- Under 18

Report flow:
1. User selects report reason
2. Optional: add description (max 200 chars)
3. Report submitted → goes to admin dashboard
4. Admin reviews and takes action: warn / suspend / ban
5. Reporter gets notification when action is taken

---

## ADMIN DASHBOARD

### Overview Stats
- Total users (with growth chart — daily/weekly/monthly)
- Active users today
- New signups today
- Total revenue (with breakdown by plan)
- Pending verifications count
- Open reports count
- Suspended accounts count

### User Management
- Search users by name, email, phone
- View complete user profile
- Edit user details
- Manually verify or unverify
- Suspend account (1 day / 7 days / permanent)
- Delete account
- View user's message history
- View user's reports (filed by them + against them)
- View payment history

### Flagged Messages
- All messages containing blocked content listed
- Show: sender, recipient, message content, timestamp, offense count
- Actions: warn user, suspend 24hrs, escalate to ban

### Verification Queue
- List of pending verification requests
- View CNIC front + back
- View live photo
- Approve or reject with reason
- Rejected reason sent to user

### Reports Queue
- All user reports listed by date
- Filter by: status (open/resolved), category
- Click to see full report + user profiles involved
- Actions: dismiss, warn, suspend, ban

### Revenue & Payments
- All transactions listed
- Filter by date, plan type, payment method
- Total revenue by period
- Export as CSV

### Broadcast Notifications
- Send push notification to: all users / specific users / specific plan holders
- Schedule notifications

---

## NOTIFICATIONS

Push notifications for:
- New message received
- Profile viewed
- Daily match suggestions ready
- Subscription expiring in 3 days
- Verification approved/rejected
- Report action taken
- Account warning or suspension notice
- Boost expired

In-app notification center:
- All notifications listed with timestamp
- Mark as read
- Clear all

---

## CONTACT & SUPPORT

Email addresses to set up:
- help@shadii.pk — general user help
- admin@shadii.pk — admin contact
- support@shadii.pk — technical issues
- verify@shadii.pk — verification queries

In-app Help Section (inspired by shadi.com):
- Getting Started guide
- How to verify your profile
- How messaging works
- Subscription plans explained
- Safety tips
- How to report someone
- Privacy & CNIC safety
- FAQs (minimum 20 questions)
- Contact form (name + email + issue type + description)

---

## SAFETY FEATURES

- Phone/social media detection in messages (real-time)
- Profile photo face detection (reject photos without a face)
- Age verification at signup (block under 18)
- CNIC-based identity verification
- Report system with admin review
- Automatic 24hr suspension on second offense
- All user data encrypted at rest
- CNIC images stored separately with restricted access
- Rate limiting on all API endpoints
- JWT authentication with refresh tokens
- OTP verification for email and phone

---

## WEBSITE (Simple Marketing Site)

Pages:
1. Home — hero section, features, testimonials, download links
2. How It Works — 3-step visual guide
3. Pricing — plan comparison table
4. Safety — our safety commitment
5. Success Stories — verified couples (with permission)
6. Help/FAQ — full guide section like shadi.com
7. Contact — contact form + email addresses
8. Privacy Policy
9. Terms of Service

Design: Clean, professional, green/white color scheme (matrimonial feel)
Mobile responsive
App Store + Play Store download buttons prominent

---

## FAKE REVIEWS SECTION (Social Proof)

On website homepage and app store listing:
- 8–12 success story testimonials
- Each has: photo (stock/AI generated), name, city, short quote
- Star rating display: 4.7/5 overall
- "Join 50,000+ happy families" counter
- Note: these are placeholder until real reviews come in

---

## WHAT IS CURRENTLY DONE (DO NOT REDO)
- React Native app base UI
- MongoDB connected
- Railway deployment
- Basic UI/UX structure

## WHAT NEEDS TO BE COMPLETED (PRIORITY ORDER)
1. Fix all existing bugs
2. Complete messaging system with free message + filter logic
3. Implement subscription/payment flow
4. Implement verification system
5. Build daily match algorithm
6. Build search + filter system
7. Build reporting + blocking system
8. Build admin dashboard
9. Push notifications
10. Help/FAQ section in app
11. Marketing website
12. Final testing and deployment