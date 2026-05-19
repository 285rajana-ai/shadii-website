# Shadii.pk — Professional Production Launch Guide

> **App Status: Ready to Build** — All code bugs fixed. Complete this checklist before submitting to Play Store.

---

## ✅ Code Fixes Done (This Session)

| File | What Was Fixed |
|------|---------------|
| `mobile/src/screens/main/ProfileDetailScreen.jsx` | Added missing `Clipboard` + `Modal` imports — would crash when copying phone number |
| `mobile/src/screens/main/DiscoverScreen.jsx` | Female photos now properly blurred with lock icon |
| `mobile/src/screens/main/HomeScreen.jsx` | Match cards blur female photos for free users |
| `mobile/app.json` | Added expo-notifications plugin, Android permissions, googleServicesFile |
| `mobile/android/app/build.gradle` | Release signing now uses EAS injected keystore (not debug) |
| `mobile/google-services.json` | Placeholder created — **you must replace with real one** |
| `backend/src/config/cloudinary.js` | Fixed `url` vs `originalUrl` return value bug |
| `backend/src/routes/profile.routes.js` | Photo upload now uses Cloudinary (real URLs + blur), not base64 |

All 3 apps build clean:
- `website/` → ✅ Next.js static build OK
- `admin/` → ✅ Vite build OK
- `backend/` → ✅ Railway deployment OK

---

## 🔴 STEP 1 — Required Before Building (Do These First)

### 1.1 Firebase Setup (Free) — for Push Notifications

1. Go to **https://console.firebase.google.com**
2. Click **"Add project"** → name it `shadii-pk`
3. In project → **Project Settings → General → Your apps → Add app → Android**
4. Package name: `pk.shadii.app` — Register app
5. **Download `google-services.json`**
6. Replace `mobile/google-services.json` with the downloaded file
7. Back in Firebase → **Project Settings → Service Accounts → Generate New Private Key**
8. Download the JSON file (keep it safe — never commit to git)
9. Run this command to encode it for Railway:
   ```bash
   base64 -i service-account.json | tr -d '\n'
   ```
10. Copy the output — you'll paste it as `FIREBASE_SERVICE_ACCOUNT` in Railway

### 1.2 Cloudinary Setup (Free) — for Profile Photo Storage

1. Go to **https://cloudinary.com** → Sign up free
2. Dashboard → copy your **Cloud Name**, **API Key**, **API Secret**
3. Add to Railway env vars (see Step 2)

### 1.3 Email (SMTP) Setup — for OTP Emails

**Option A: Resend (Recommended — Free 3,000 emails/month)**
1. Go to **https://resend.com** → Sign up
2. Add domain: `shadii.pk` → follow DNS instructions
3. Create API Key → use with SMTP settings:
   - `SMTP_HOST=smtp.resend.com`
   - `SMTP_PORT=465`
   - `SMTP_USER=resend`
   - `SMTP_PASS=re_xxxxxxxxxxxx` (your API key)

**Option B: Gmail App Password (Quick start)**
1. Your Gmail → Settings → Security → 2-Step Verification → App Passwords
2. Generate password for "Mail"
   - `SMTP_HOST=smtp.gmail.com`
   - `SMTP_PORT=465`
   - `SMTP_USER=no-reply@shadii.pk` (or your gmail)
   - `SMTP_PASS=xxxx xxxx xxxx xxxx` (16-char app password)

---

## 🔴 STEP 2 — Update Railway Environment Variables

Go to **https://railway.app** → your project → **Variables tab**.

Add/update these:

```
# Already set (verify these are correct):
JWT_SECRET=<random 64-char string>
MONGO_USERNAME=<your atlas username>
MONGO_PASSWORD=<your atlas password>
MONGO_DB=shadii
JWT_EXPIRES_IN=15m
REFRESH_TOKEN_DAYS=30

# NEW — Add these:
SMTP_HOST=smtp.resend.com
SMTP_PORT=465
SMTP_USER=resend
SMTP_PASS=re_xxxxxxxxxxxxxxxx

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=123456789012345
CLOUDINARY_API_SECRET=xxxxxxxxxxxxxxxxxxxxxxxxxxxx

FIREBASE_SERVICE_ACCOUNT=<base64 string from step 1.1>

# Payment — EasyPaisa + Bank Transfer (manual receipt flow)
EASYPAISA_MOBILE_NUMBER=03001234567      # Your EasyPaisa mobile number
BANK_TRANSFER_ACCOUNT_TITLE=Shadii.pk
BANK_TRANSFER_ACCOUNT_NUMBER=PK00XXXX0000000000000000  # Bank account number
BANK_TRANSFER_IBAN=PK00XXXX0000000000000000
BANK_TRANSFER_BANK_NAME=Meezan Bank      # or whichever bank you use
PAYMENT_SUPPORT_EMAIL=support@shadii.pk
```

> After saving, Railway auto-redeploys. Check `/api/health` returns `{"status":"ok"}`.

---

## 🔴 STEP 3 — EAS Build Setup (One Time)

```bash
# Install EAS CLI globally
npm install -g eas-cli

# Login to Expo account (create free at expo.dev)
eas login

# From the mobile/ directory:
cd mobile

# Configure project (first time only)
eas build:configure
```

---

## 🔴 STEP 4 — Generate Keystore & Build AAB for Play Store

```bash
cd mobile

# This generates a keystore, signs the AAB, and builds it for Play Store
# EAS handles keystore creation automatically — say YES when prompted
eas build --platform android --profile production
```

**What happens:**
- EAS creates a keystore and stores it securely on Expo's servers
- Builds a signed `.aab` file (required by Play Store)
- Takes ~10–20 minutes
- Download link appears when done

> **IMPORTANT:** After your first build, EAS saves the keystore. All future builds use the same keystore. Never lose access to your Expo account.

---

## 🔴 STEP 5 — Google Play Console Setup ($25 one-time)

1. Go to **https://play.google.com/console**
2. Pay the **$25 one-time registration fee** (~PKR 7,000)
3. Create a new app:
   - App name: **Shadii.pk**
   - Default language: **English**
   - App or Game: **App**
   - Free or Paid: **Free**

4. Complete the store listing:
   - **Short description** (80 chars): `Pakistan's most trusted matrimonial app. Verified profiles, smart daily matches.`
   - **Full description** (4000 chars): See Section 7 below
   - **App icon**: 512×512 PNG (use `make_icon.py` to generate)
   - **Feature graphic**: 1024×500 PNG (header banner for Play Store)
   - **Screenshots**: Min 2 phone screenshots (1080×1920 or 1440×2560)
   - **Category**: Lifestyle → Dating
   - **Contact email**: `support@shadii.pk`
   - **Privacy policy URL**: `https://shadii.pk/privacy`

5. **Content rating**: Fill questionnaire → get rating (likely PEGI 12 or 16)

6. **Data safety section** — fill honestly:
   - Collects: Name, Email, Photos, Location (city), Device ID
   - Shared: No
   - Encrypted: Yes
   - Users can delete: Yes (link: `https://shadii.pk/delete-account`)

7. Upload your `.aab` file to **Production** track → Review

8. Google reviews typically take **3–7 days** for new apps.

---

## 🔴 STEP 6 — Website Deployment (Vercel — Free)

```bash
# Install Vercel CLI (or use vercel.com dashboard)
npm install -g vercel

cd website
vercel --prod
```

**Or use the dashboard:**
1. Go to **https://vercel.com** → Import Git Repository
2. Select your repo → Framework: Next.js → Deploy
3. Add custom domain: `shadii.pk` → add DNS records as shown

---

## 💰 Complete Cost Breakdown

### One-Time Costs

| Item | Cost (USD) | Cost (PKR) | Where |
|------|-----------|------------|-------|
| Google Play Console Developer Account | $25 | ~PKR 7,000 | play.google.com/console |
| Apple Developer Program (iOS later) | $99/year | ~PKR 28,000 | developer.apple.com |
| **Total one-time (Android only)** | **$25** | **~PKR 7,000** | |

### Monthly Running Costs

| Service | Free Tier | Paid Plan | What It Does |
|---------|-----------|-----------|--------------|
| **Railway** (Backend) | 500 hrs/month | $5/month Hobby | Node.js server — already running |
| **MongoDB Atlas** | M0 free (512MB) | $57/month M10 | Database |
| **Cloudinary** | 25GB storage free | $89/month+ | Profile photo storage |
| **Vercel** (Website) | Free forever | $20/month Pro | Next.js website |
| **Resend** (Email) | 3,000/month free | $20/month | OTP + transactional emails |
| **Firebase** (FCM) | Free forever | Free | Push notifications |
| **EAS Build** | 30 builds/month free | $29/month | App builds |

### **Recommended Launch Budget**

**Phase 1 — Launch (0–500 users): ~$30/month (~PKR 8,400)**
- Railway Hobby: $5/month
- MongoDB M0: FREE
- Cloudinary: FREE (25GB)
- Vercel: FREE
- Resend: FREE
- Firebase: FREE
- **Total monthly: $5 + $25 one-time = ~PKR 1,400/month + PKR 7,000 registration**

**Phase 2 — Growth (500–5,000 users): ~$100/month (~PKR 28,000)**
- Railway Pro: $20/month (more resources)
- MongoDB M10: $57/month (dedicated cluster, backups)
- Cloudinary Starter: included in Hobby or $0 (25GB still free)
- **Total monthly: ~$77/month**

**Phase 3 — Scale (5,000+ users): ~$300/month (~PKR 84,000)**
- Railway Team: $100/month
- MongoDB M30: $200/month
- Cloudinary Plus: $89/month
- **Total monthly: ~$389/month** — but you'll have thousands of paying subscribers by then

---

## 📱 Play Store Listing Copy (Full Description)

```
Shadii.pk — Pakistan's Most Trusted Matrimonial Platform

Find your life partner the right way. Shadii.pk is built for serious,
marriage-minded Pakistanis who value privacy, family values, and genuine
connections.

✅ VERIFIED PROFILES
Every user undergoes CNIC and live selfie verification. Know that who
you're talking to is real.

🔒 PRIVACY FIRST
Female photos are blurred by default — shared only when both parties
feel comfortable. Your personal contact information is never exposed
in chat.

💡 SMART DAILY MATCHES
Receive 3–5 curated match suggestions every morning based on your
preferences: age, city, education, cast, and family values.

💬 SAFE MESSAGING
Our AI-powered chat filter automatically blocks attempts to share
phone numbers, WhatsApp, or social media in early conversations —
protecting both sides.

💳 FLEXIBLE PLANS
- Free: Browse profiles, send one message per conversation
- Basic (PKR 1,000/month): Unlimited messaging
- Standard (PKR 2,500/3 months): See who viewed you, unlock photos
- Premium (PKR 5,000/6 months): Priority placement + profile boost

🌟 FOR FAMILIES TOO
Design supports individual browsing that can seamlessly involve
family members when you're ready.

Available in Urdu and English. Proudly made in Pakistan.

Contact: support@shadii.pk
Privacy Policy: https://shadii.pk/privacy
Terms of Service: https://shadii.pk/terms
```

---

## 📸 Screenshots Needed for Play Store

You need minimum **2 screenshots** (ideally 5). Capture from the app:
1. **Onboarding screen** (the gradient slides)
2. **Discover/Browse screen** (profile grid)
3. **Profile detail screen** (full profile view)
4. **Daily matches on Home screen**
5. **Chat screen**

To take screenshots → run `eas build --profile preview` → install the APK on a real device → take screenshots.

---

## 🚦 Final Pre-Launch Checklist

- [ ] `mobile/google-services.json` replaced with real Firebase file
- [ ] Railway env vars updated (Cloudinary, SMTP, Firebase)
- [ ] `eas build --platform android --profile production` run successfully
- [ ] Play Store developer account created ($25 paid)
- [ ] Store listing filled (description, screenshots, icon)
- [ ] Privacy policy live at `https://shadii.pk/privacy` ✅ (already done)
- [ ] Terms of Service live at `https://shadii.pk/terms` ✅ (already done)
- [ ] Delete account page live at `https://shadii.pk/delete-account` ✅ (already done)
- [ ] Content rating questionnaire completed
- [ ] Data safety section filled
- [ ] AAB uploaded to Production track
- [ ] Submit for review

---

## 🔧 Admin Panel

Access your admin dashboard at the deployed admin URL.
Default admin user must be created manually in MongoDB:

```js
// Run this once in MongoDB Atlas → Collections → users
db.users.updateOne(
  { email: "your-admin@email.com" },
  { $set: { isAdmin: true } }
)
```

Admin can then:
- Verify/reject CNIC verification requests
- Review payment proof for contact unlocks
- Manage reports and suspend users
- View subscriber dashboard

---

## 📞 Support Contacts to Set Up

These emails are referenced throughout the app. Set up forwarding or mailboxes:
- `support@shadii.pk` — general user support
- `help@shadii.pk` — help center queries
- `admin@shadii.pk` — admin communications
- `abuse@shadii.pk` — abuse/safety reports

Use **Zoho Mail free** (up to 5 users) or **Google Workspace** ($6/user/month) for professional email.
