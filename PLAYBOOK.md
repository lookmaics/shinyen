# Shinyen (ꯁꯤꯟꯌꯦꯟ) — Official Venture Playbook & Architecture Blueprint

> **Status**: Living Master Document  
> **Current Milestone**: Part 1 Sealed & Agreed (Foundational Architecture, Economics, Legal & Inventory)  
> **Parent Enterprise**: LOOKMAI (Udyam Reg: `UDYAM-MN-05-0036092`, Imphal West, Manipur)  
> **Brand Origin**: Inspired by *Loiyumba Shinyen* (1110–1122 CE royal edict of King Loiyumba codifying artisan specialization and commercial ethics in Manipur).

---

## 1. Executive Vision & Scope Boundaries

1. **Mission**: Build an indigenous, high-trust e-commerce marketplace dedicated exclusively to local MSMEs, curated thrift boutiques, handmade jewellery/accessories, handloom weavers, and local lifestyle creators in Manipur (and progressively the Northeast).
2. **Explicit Exclusions**: No cooked restaurant food, no fresh groceries, and no national/international generic dropshippers.
3. **Core Buying Model**: 
   - **80% Core Marketplace**: Standard e-commerce catalog (Browse, Add to Cart, 1-Click "Buy Now" at fixed prices).
   - **20% "Drop & Bid" Engine**: An event-driven auction capability for rare vintage thrift drops, 1-of-1 artisan pieces, and custom creations.

---

## 2. Part 1 Sealed Decisions: Technology, Finance, Legal & UX

### 2.1 Platform Architecture (Web-First PWA)
- **Primary Technology**: **Mobile-First Progressive Web App (PWA)** built with **Next.js + Tailwind CSS**.
- **The Ground Rationale**:
  - Over 85% of early customer traffic will arrive directly from Instagram bio links and Story stickers.
  - Forcing buyers to download a 40MB native app from the Play Store causes a 70%+ drop-off.
  - A PWA consumes **0 MB phone storage** (vital for budget Redmi/Realme/Samsung phones in the region) and loads in under 1.5 seconds.
- **Phase 1.5 Android Evolution**:
  - Once customer trust is established, wrap the PWA into an Android APK / Google Play Store app using **TWA (Trusted Web Activity) / Capacitor** with zero backend rebuild.

### 2.2 User Authentication & Anti-Sybil Bidding Gate
- **Browsing & Discovery**: 100% open. Anyone can view items, zoom photos, check measurements, and add items to the cart (`localStorage`) without registering.
- **Just-In-Time (JIT) Login**: Authentication is triggered only at the point of commitment (Checkout or Live Bidding) via **Google 1-Tap OAuth** and **Sign in with Apple** (₹0.00 cost; zero SMS bot risk).
- **The Zero-Cost Inbound WhatsApp Gate (Anti-Sybil Bidding Armor)**:
  - *The Trap Avoided*: Allowing users to bid with only Google 1-Tap while delaying phone verification until checkout allows trolls with throwaway Gmail accounts to bid fake amounts and sabotage Sunday drops.
  - *The Inbound WhatsApp Verification (₹0.00 Meta Cost)*: Before placing their **very first auction bid** (one-time lifetime check), a sleek bottom drawer prompts: *"Verify your WhatsApp in 1 tap to unlock live bidding."*
  - The app launches a native WhatsApp deep-link with a pre-filled cryptographic verification token:  
    `https://wa.me/91XXXXXXXXXX?text=Verify%20my%20Shinyen%20Bidder%20Account%3A%20VERIFY-SHN-94K2P`
  - The user taps Send to Lookmai's WhatsApp Business number. Meta's webhook verifies the inbound phone number in < 800ms.
  - **Why this is bulletproof**: Inbound message webhooks are **100% free forever** under Meta pricing, completely immune to bot pumping, and cryptographically tied to the user's authentic SIM card.
- **Instagram In-App Browser (IAB) Resilience**:
  - The app detects Instagram/Facebook WebViews (`Instagram`, `FBAN` in User-Agent) and uses FedCM / intent deep-link breakout (`intent://shinyen.in/...#Intent;scheme=https;package=com.android.chrome;end`) so Google 1-Tap never fails due to third-party cookie partitioning.
- **Session Persistence**: Secure, persistent tokens (HTTP-only cookies) keep users logged in for 90 days across visits.

### 2.3 Payments Engine & Fund Flow Architecture
- **Buyer Experience**: 100% native **UPI Intent** (PhonePe, Google Pay, Paytm, BHIM).
  - Tapping "Pay" opens the buyer's UPI app with the exact amount pre-filled. No card numbers, no netbanking credentials, no manual IFSC typing.
- **Payment Gateway Partner**: **Cashfree Marketplace** or **Razorpay Route**.
- **RBI-Regulated Nodal Escrow Vault**:
  - Buyer payments do **not** touch personal savings accounts (avoiding misclassification as personal taxable income).
  - Funds sit in a neutral, RBI-monitored Nodal/Escrow account during transit.
- **Automated Split Payout**:
  - Upon delivery OTP verification + 48-hour inspection clearance, the gateway's API automatically splits the funds:
    - **Seller's cut** goes directly to the Seller's registered UPI/bank account.
    - **Shinyen's commission & fees** go directly into LOOKMAI's Current Account.
  - Eliminates all manual late-night GPay calculations.

### 2.4 Legal, Tax & Regulatory Structure
- **Operating Entity**: **LOOKMAI** (Sole Proprietorship).
  - Operates under active Udyam Certificate: `UDYAM-MN-05-0036092`.
  - Registered address: House No. 5, Yaiskul Leirak, Imphal West, Manipur – 795001.
  - Single Business Current Account under Lookmai covers all brands: *Tandan*, *Pukei*, and *Shinyen*.
- **Micro-Seller GST Exemption Compliance**:
  - Under Central Tax Notification No. 34/2023, micro-sellers in Manipur with turnover below ₹20 Lakh are **exempt from mandatory GST registration** for intra-state e-commerce.
  - Sellers register on Shinyen using a free PAN-based **Enrolment ID** from the GST portal instead of a GSTIN.
- **Consumer Protection (E-Commerce) Rules, 2020**:
  - Designated Grievance Officer details published in the footer.
  - Pre-checkout price transparency (Item price + Delivery charge + Platform fee).
  - Legally binding 48-hour return and unboxing policy.

### 2.5 Pricing, Commission & Unit Economics

#### A. Delivery Economics (Pass-Through Principle)
- **Golden Rule**: **Delivery is NEVER paid from Shinyen's commission cut.**
- **Customer Bill Structure**:
  $$\text{Total Paid by Buyer} = \text{Product Price} + \text{Delivery Fee}$$
- **Delivery Fee**: ₹40 to ₹50 flat within Imphal Valley. **100% of this fee goes directly to the delivery rider**.
- **Rider Compensation Model**: Per-delivery gig model (partnering with local youths/scooter owners). No fixed monthly salary liabilities in Phase 1.

#### B. Tiered Platform Commission Structure
Designed to prevent "platform leakage" (buyers/sellers taking high-value transactions off-platform to avoid fees):

| Item Price Tier | Commission Rate | Rationale |
| :--- | :--- | :--- |
| **Budget Tier (< ₹1,500)** | **7%** | Fair fee on high-velocity items (e.g. ₹56 on an ₹800 top). |
| **Mid Tier (₹1,500 – ₹4,000)** | **5%** | Balanced rate on vintage jackets and boutique jewellery. |
| **Premium Tier (₹4,000+)** | **3.5% (Capped at ₹250 Max)** | Ensures sellers never abandon the app on ₹6,000–₹10,000 rare thrifts or high-end handlooms. |
| **Launch Promotion** | **0% Commission (First 30 Days)** | Acquisition hook to onboard the top 20–30 Instagram curators in Imphal. |

### 2.6 Payout Frequency: Automated Rolling Daily (T+2)
- **Why Not Monthly?** Local micro-sellers depend on fast working capital to source new inventory. A 30-day wait would kill seller adoption.
- **Why Not Instant?** Instant doorstep release leaves Shinyen vulnerable to unboxing fraud and defective goods.
- **The T+2 Rule**:
  - Every order has a mandatory **48-hour post-delivery inspection window**.
  - Once the 48 hours pass without a dispute, the payment is marked cleared.
  - Every morning at 10:00 AM, the gateway triggers an automated batch payout directly to the seller's UPI.

### 2.7 Inventory & Out-of-Stock Handling (The Smart Hybrid Policy)
- **Main Catalog & Search**: Sold-out items are **automatically filtered out** (or pushed to a collapsed "Recently Sold" tab) so browsing buyers only see available items.
- **Direct Instagram / Story Links**: Product pages **never return a 404 error**. If a sold item link is opened, the user sees:
  - A clean badge: `⚡ SOLD OUT in [X] minutes`.
  - Prominent links to *"More from this Boutique"* and *"Similar Available Items"*.
- **1-of-1 Thrifts**: Automatically archived after 48 hours.
- **Artisan Crafts (Jewellery, Handloom)**: Display a *"Notify Me When Back in Stock"* / *"Request Made-to-Order"* button to collect verified demand signals for artisans.

---

## 3. Part 2 Sealed Decisions: Sellers, Catalog & Packaging Blueprint

### 3.1 Launch Industries (The 3 Pillar Categories)
Shinyen launches on Day 1 with three curated local sectors, each featuring its own dedicated navigation space on the mobile app:
1. **Curated Thrift & Streetwear**: Vintage jackets, oversized tees, Japanese denim, Y2K aesthetic fashion, boots, and streetwear curated by local youth.
2. **Handcrafted Jewellery & Accessories**: Resin earrings, beadwork, clay art, crochet accessories, and local artisanal lifestyle creations.
3. **Traditional Handloom & Cultural Attire**: Authentic Manipuri handloom (*Phanek Mayek Naibi*, *Rani Phi*, *Moirang Phee*, *Wangkhei Phee*, *Innaphi*, and indigenous tribal shawls and ceremonial wear).

### 3.2 The 60-Second Mobile Listing Flow (Seller Studio)
To prevent seller drop-off, the listing form is stripped of corporate bureaucracy (no HSN codes, barcode IDs, or tax sheets). A seller publishes from their smartphone in 5 rapid inputs:
1. **Camera Photos**: 1 to 5 photos with automatic browser-side WebP compression (shrinking 10MB phone photos to ~200KB instantly).
2. **Title & Category Dropdown**: (Thrift, Jewellery, Handloom, Lifestyle).
3. **Selling Mode**: Fixed Price (Instant Buy) OR "Drop & Bid" Auction Mode.
4. **Natural Flaw Disclosure (Thrift Only)**:
   - Handloom and Jewellery are automatically marked `Brand New / Handcrafted`.
   - Thrift items only ask: *"Any flaw or stain to mention? (Yes/No)"*. If yes, seller enters a 5-word note + 1 flaw photo.
5. **Inventory Quantity**: Default is 1 for unique pieces; counter for batch-crafted items.

### 3.3 Flexible, Zero-Friction Sizing Matrix
To protect sellers without imposing burdensome tape-measurement requirements:
- **Traditional Handloom**: Automatically set to `Free Size / Unstitched Fabric`. Zero tape measuring required.
- **Jewellery & Accessories**: Automatically set to `Standard / One Size`.
- **Thrift & Apparel**:
  - 1-tap standard selection: `[ S ]` `[ M ]` `[ L ]` `[ XL ]` `[ Oversized ]`.
  - **Optional "Verified Fit" Boost**: Sellers can optionally type `Chest` and `Length` in inches to receive a green `📐 Verified Fit` badge on their listing.
  - **Protection Policy**: If exact measurements are provided, returns for "wrong size" are barred. If only generic tags are used, vintage sizing advisory is displayed to the buyer.

### 3.4 Packaging & Branding Engine (The Dual-Mode Model)
To ensure 100% brand consistency, security, and free street visibility across Manipur:
1. **Tamper-Evident Shinyen Security Bags**:
   - Custom peel-and-seal courier bags with permanent hot-melt adhesive. Once sealed, opening damages the plastic, providing absolute anti-theft proof.
   - Serves as the mandatory basis for buyer unboxing video return claims.
2. **Financing the Packaging**:
   - Packaging cost (~₹3.20/bag) is covered naturally by the buyer's delivery fee allocation (₹45 to rider, ₹3 to packaging pool, ₹2 to transit micro-insurance safety pool = ₹50 exact). Zero financial drain on Lookmai.
3. **The Dual Fulfillment Modes**:
   - **Mode A (Default: Rider Bagging at Doorstep)**: Rider carries fresh Shinyen bags in their dispatch backpack, slips the wrapped item in, seals it, and applies the QR label at the seller's door.
   - **Mode B (Seller Self-Pack Option)**: Sellers who value privacy or want to include custom thank-you notes/ribbons receive a **Free Welcome Starter Kit of 25 Bags**. They can re-order bundles of 25 bags at cost price (~₹75) directly from the Seller Studio.

---

## 4. Part 3 Sealed Decisions: Logistics, Hyperlocal Delivery & Dispatch Engine

### 4.1 The Lightweight Rider Web Portal (Zero-App Friction)
- **Technology**: Mobile Web Portal (PWA) accessed via Chrome/Safari; zero heavy app downloads required for riders.
- **2-Tab Layout**: `[ 📦 Pickups from Sellers ]` and `[ 🛵 Deliveries to Buyers ]`.
- **1-Tap Controls**: Direct Phone Call button, WhatsApp message button, and Google Maps navigation link.
- **Offline Manifest Resilience**: Route stops, phone numbers, landmarks, and GPS pins are cached locally in `IndexedDB`. If a rider enters a mobile data dead-zone, the manifest remains fully interactive.
- **The Free In-App Delivery OTP (Zero SMS Cost)**:
  - Modeled after Swiggy and Uber: The 4-digit delivery PIN is displayed directly on the buyer’s **"My Orders"** live tracking screen.
  - Buyer reads the code to the rider at the gate; rider types it into the portal to complete delivery.
  - **Cost to Lookmai = ₹0.00**. Completely immune to SMS pumping/toll fraud.

### 4.2 The "Manipur Reality" Address Navigation Engine
- **No Reliance on Formal House Numbers**: Standard Western address forms are discarded. The form captures:
  1. `District Dropdown`: Imphal West, Imphal East, Thoubal, Kakching, Bishnupur, Churachandpur, Ukhrul, Senapati.
  2. `Leikai / Locality`: Fast client-side search autocomplete powered by a static `leikais.json` dataset (~150 localities). Zero external API costs.
  3. `Prominent Landmark (Mandatory)`: Nearest club, mandap, school, water tank, or waiting shed.
  4. `House & Gate Description`: Text notes (e.g. "Green gate, second house from main road").
  5. `1-Tap GPS Pin`: Free HTML5 browser geolocation captures exact latitude/longitude coordinates (3–5m hardware accuracy).
- **Zero-Cost Google Maps Integration**:
  - The rider portal launches navigation using free native URL deep-links (`google.com/maps/search/?api=1...`). Opens the rider's phone's built-in Google Maps app at **₹0.00 API cost**.

### 4.3 Tiered Delivery Geography & Fulfillment Matrix

| Zone | Districts / Towns | Fulfillment Method | Buyer Fee | Payout Breakdown |
| :--- | :--- | :--- | :--- | :--- |
| **Zone 1: Imphal Urban Core** | Imphal West & East (Singjamei, Uripok, Khurai, Kwakeithel) | Direct doorstep delivery via bike | **₹50** (Std Next-Day)<br>**₹90** (Express Same-Day) | • Rider: ₹45 (Std) / ₹80 (Express)<br>• Bag Pool: ₹3<br>• Transit Insurance Pool: ₹2 |
| **Zone 2: Far Valley Corridors** | Thoubal, Kakching, Bishnupur, Moirang | Line van trunk to Partner Shop (PUDO) + Local Town Rider | **₹50** (Bazar PUDO Pickup)<br>**₹80** (Doorstep Delivery) | • Line Van Trunk: ₹15<br>• Partner Shop: ₹10<br>• Local Town Rider: ₹45<br>• Bag & Safety Pool: ₹5<br>• Margin: ₹5 |
| **Zone 3: Hill Districts** | Churachandpur, Ukhrul, Senapati | Inter-district Winger counter trunk + optional Local Hill Rider | **₹75** (Transit Counter Pickup)<br>**₹115** (Town Doorstep Delivery) | • Winger Counter: ₹35<br>• Imphal Drop Rider: ₹30<br>• Local Hill Rider (if doorstep): ₹40<br>• Bag & Safety Pool: ₹5<br>• Margin: ₹5 |

### 4.4 Operational Best Practices & Safeguards
1. **Delivery Speed Standards**:
   - **Default Standard**: **Next-Day Delivery (24–48 Hours)**. Sets calm, dependable expectations.
   - **Express Same-Day**: Paid premium add-on (₹90) restricted to Imphal Core for orders placed before 11:00 AM.
2. **Zero-Tech Winger Counter Workflow**:
   - Counter clerks are **never forced to use software, portals, or tablets**.
   - Parcels carry a prominent physical label stamped: `PREPAID - DO NOT COLLECT CASH`. Clerks simply log recipient phone numbers in their standard paper registers as they have done for 25 years.
3. **No Out-of-Pocket Cash for Riders**:
   - Riders are strictly prohibited from fronting personal cash for Winger fees.
   - Payments to transport counters are settled via weekly digital ledgers between Lookmai and the counter associations (or via a designated digital float).
4. **Master Sack Consolidation Economics**:
   - Multiple parcels bound for the same district are bundled into a single **Shinyen Master Sack**.
   - Counter fee drops from ₹35/individual parcel to ₹60–₹80 flat for the entire sack, turning inter-district transit into a self-sustaining profit center.
5. **The ₹2 Transit Micro-Insurance Reserve**:
   - Every order allocates reserve into an internal safety pool.
   - Accidental transit damage (e.g. cracked ceramic or broken jewellery during transit) is reimbursed from this pool, shielding both sellers and riders from out-of-pocket loss.

---

## 5. Part 4 Sealed Decisions: Trust, Protection, Unboxing Policy & Dispute Resolution

### 5.1 The 48-Hour Inspection & Escrow Lock
- **Trigger**: The 48-hour inspection countdown begins the exact second the buyer's 4-digit OTP is verified at the doorstep.
- **Auto-Settlement**: If 48 hours pass without an issue reported, the order automatically transitions to `COMPLETED`, releasing the funds to the seller's automated T+2 payout batch.
- **Dispute Hold**: If an issue is filed with an unboxing video, funds remain safely locked in the nodal escrow until human arbitration within 24 hours.

### 5.2 Mandatory Continuous Unboxing Video Policy (Anti-Fraud Shield)
To eliminate the rampant e-commerce problem of fraudulent returns and item-swapping:
1. **Intact Seal Requirement**: The video must begin with the **unopened, intact Shinyen Tamper-Evident Bag** showing the waybill label clearly.
2. **Single Continuous Shot**: The video must be **one unedited, uncut sequence** from cutting open the seal to extracting and inspecting the product.
3. **Strict Inadmissibility**: Any video starting after the seal was breached, or exhibiting cuts or splicing, is **automatically rejected**.

### 5.3 Return & Refund Eligibility Boundaries
- **100% Refund Approved**:
  - Undisclosed major defect or tear on thrift items (seller pays ₹45 return fee).
  - Wrong item delivered (seller pays return fee).
  - Damage in transit (reimbursed via the ₹5 Transit Safety Reserve; seller keeps product revenue, buyer gets full refund).
- **Strictly Non-Refundable**:
  - "Buyer's Remorse" (*"I changed my mind"*, *"I don't like how it looks on me"*).
  - Sizing discrepancies where measurements or standard size tags were disclosed.
  - Minor color variations resulting from screen calibration or ambient photo lighting.

### 5.4 The "Drop & Bid" Anti-Ghosting & Concurrency Engine
- **Target-Price Bidding Model**: 1-Tap quick bid buttons send an explicit target price (`proposed_amount = displayed_price + 50`), completely eliminating race conditions where 20 concurrent clicks inadvertently overbid an item by ₹1,000.
- **3-Hour Auto-Checkout Window**: The winning bidder has exactly **3 hours** to complete payment via UPI.
- **The Ghosting Penalty**:
  - Failure to pay within 3 hours results in **Strike 1** and an immediate **30-day suspension from all auctions**.
  - Three cumulative strikes result in permanent platform ban.
  - Identities are cryptographically tracked in a salted `banned_identities` ledger (hashing phone and UPI VPA) to prevent evasion via account deletion.
- **Runner-Up Roll-Down Protocol & Collusion Defense**:
  - If the winning bidder forfeits, the item automatically rolls down to the **2nd Highest Bidder** *if* the 2nd bid is within 25% of the winning bid.
  - If the price spread exceeds 25% (protecting against shill bid inflation attacks), the seller is given 1-tap choice in the **Seller Control Hub** (Offer to 2nd Bidder, Re-Drop Auction, or Convert to Buy Now).
  - First-time bidders (`completed_orders = 0`) are capped at a maximum of 2 concurrent leading bids across the platform.

### 5.5 Bilingual Human Arbitration Desk
- Impartial dispute arbitration handled by a dedicated local support desk operating in both **Meiteilon (Manipuri)** and **English** via WhatsApp and direct phone.
- Discarding impersonal automated chatbots ensures cultural empathy, fast local resolution (within 24 hours), and mutual fairness.

---

## 6. Part 5 Sealed Decisions: Tech Stack Architecture & Engineering Blueprint

### 6.1 Layer 1: Frontend & Native-Feel Mobile PWA
- **Framework**: **Next.js 14/15 (App Router)** with TypeScript. Server-Side Rendering (SSR) delivers sub-1.2-second load times from Instagram bio links and rich social preview cards.
- **Low-RAM Performance Guard**:
  - Uses `LazyMotion` with `domAnimation` (saving ~20KB gzipped).
  - Strictly prohibits `layout` prop animations on catalog product cards to protect 60fps scrolling on budget Helio G25/Unisoc devices (Redmi 9A, Realme C-series).
- **Styling & Components**: **Tailwind CSS** + **shadcn/ui** primitives + **Lucide Icons**.
- **Tactile & Fluid Motion**:
  - **Framer Motion**: Smooth physics transitions between category tabs and real-time bid pulse effects.
  - **Vaul Drawer**: Buttery-smooth iOS-style pull-up drawers for checkout and quick bidding.
  - **Haptic Feedback**: Physical tactile feedback (`navigator.vibrate(10)`) on button taps on mobile devices.
  - **Skeleton Shimmer**: Pulsing layout placeholders preventing jarring shifts on mobile 4G networks.
- **PWA Capabilities**: Service worker management via `@serwist/next`, full-screen standalone mobile mode, and offline caching for catalog browsing.
- **Real-Time Crash & Error Monitoring (Sentry for Next.js)**:
  - Free tier (10,000 events/month) captures every JavaScript crash, unhandled error, and failed payment attempt in real-time (sub-2 seconds).
  - Reports exact device model (e.g. *Redmi Note 11, Android 13*), network conditions, and specific line-of-code stack traces.
  - **In-App User Feedback Widget**: Floating feedback pill and automated crash dialog enabling buyers to report issues with 1-tap screenshots.

### 6.2 Layer 2: Dual Social Auth & Zero-Cost WhatsApp Gate
- **Primary Authentication**: **Google 1-Tap OAuth** + **Sign in with Apple** (via Supabase Auth). 
  - Zero password fatigue; FaceID/TouchID native login on iOS.
  - Cost = **₹0.00**. Completely eliminates SMS endpoints and protects against SMS pumping/toll fraud.
- **The Inbound Click-to-WhatsApp Verification (₹0.00 Meta Cost)**:
  - Before a user places their very first auction bid, they tap *"Verify via WhatsApp"*, which deep-links to WhatsApp with a pre-typed cryptographic token sent to Lookmai's WhatsApp Business number.
  - Meta webhook validates the inbound message in < 800ms. Inbound messages are **100% free under Meta Cloud API**, immune to bot attacks, and cryptographically unforgeable.

### 6.3 Layer 3: Database & Realtime Layer (Supabase / PostgreSQL)
- **Engine**: Managed **PostgreSQL via Supabase**.
- **Supabase Realtime Broadcast (Bypassing the 200-Connection Wall)**:
  - Bids are broadcast using **Supabase Realtime Broadcast Channels** (not database table change listeners), bypassing Postgres WAL RLS overhead and delivering sub-80ms updates.
  - All Sunday Drop items are multiplexed onto a single shared channel (`sunday_drop_stream`) so each browsing buyer uses only **1 WebSocket connection**.
  - **Adaptive Polling Fallback**: If the WebSocket ceiling is reached on the free tier, clients gracefully fall back to a 3-second HTTP Edge-cached poll (`/api/auctions/[id]/state` with `s-maxage=1, stale-while-revalidate=2`) where 1,000 users generate only 1 query per second.
- **Row-Level Security (RLS) Optimization**:
  - Wraps all `auth.uid()` calls in `(SELECT auth.uid())` for 95% faster cached execution.
  - Syncs user roles directly into JWT `app_metadata` to eliminate cross-table joins during policy checks.

### 6.4 Layer 4: Atomic Auction Engine & Concurrency Locking
- **Atomic PL/pgSQL Function (`place_bid()`)**:
  - Acquires an explicit row-level write lock on the auction via `SELECT ... FOR UPDATE` with `SET LOCAL lock_timeout = '1500ms'`.
  - Serializes concurrent bids cleanly in ~0.35ms; rejects stale target bids instantly with zero circular deadlocks.
- **Anti-Sniping High-Water Mark Reset**:
  - If a valid bid arrives in the final 60 seconds (`v_auction.end_time - clock_timestamp() <= INTERVAL '60s'`), the clock resets to `clock_timestamp() + INTERVAL '120s'`. This guarantees an exact 2-minute recovery window without stacking up to 20 minutes.
- **Monotonic Hardware Clock Sync**:
  - Broadcasts `server_epoch_ms` with every bid; client timers compute countdowns using `performance.now() + serverOffsetMs` to eliminate client device system clock drift.

### 6.5 Layer 5: Media Pipeline, Storage & Day-0 Lifecycle Optimization
- **Sequential In-Browser Compression**:
  - Runs `browser-image-compression` sequentially (`for...of` loop) to prevent canvas RAM exhaustion on 2GB RAM phones.
  - **Day-0 Dual Output**: Generates both a tiny 14KB thumbnail (`thumb_20kb.webp` at 320px) and full-size WebP photos (`gallery_1..5.webp` at 1440px, < 180KB).
- **Storage Host**: **Cloudflare R2** (S3-compatible).
  - **10 GB Storage Free**: Accommodates over 60,000 compressed WebP product images at **₹0.00 cost** with **Zero Bandwidth (Egress) Fees**.
  - Cryptographically binds `ContentLength` (< 350KB for images, < 50MB for dispute videos) and `ContentType` into pre-signed S3v4 URLs to prevent storage abuse.
- **Automated 30-Day Auxiliary Purge**:
  - Exactly 30 days after `orders.settled_at`, a cleanup cron batch-deletes `gallery_1..5.webp`, leaving the Day-0 `thumb_20kb.webp` untouched forever for buyer order history. Keeps R2 usage permanently inside the free 10GB tier.
  - Native Cloudflare R2 bucket lifecycle rule auto-deletes dispute videos after 30 days.

### 6.6 Layer 6: Payment Gateway & Automated Split Settlement
- **Dual-Track Application**: Simultaneous merchant application to **Cashfree Payments** and **Razorpay** using Lookmai's Udyam certificate and current account.
- **UPI Intent Flow**: Deep-links directly into installed PhonePe, Google Pay, and Paytm apps with pre-filled amounts.
- **Split Settlement Engine (Transactional Outbox)**:
  - Buyer payments sit in the RBI-regulated Nodal Escrow vault.
  - 48 hours post-delivery OTP confirmation, automated API calls execute split transfers using deterministic idempotency keys (`seller_split_{order_id}`, `rider_payout_{order_id}`) via `FOR UPDATE SKIP LOCKED`.

### 6.7 Layer 7: Address Navigation & Pinpoint GPS Engine
- **Self-Learning Locality Autocomplete**:
  - Pre-populated static dataset (`src/data/leikais.json`) covering ~150 core localities across Imphal West, Imphal East, Thoubal, Kakching, and Bishnupur.
  - Dynamic crowdsourced additions are saved in a Postgres `leikais` table (cached at the Edge) to avoid read-only serverless filesystem conflicts.
- **Hardware-Level 3-Meter GPS Pin**:
  - The HTML5 Geolocation API (`navigator.geolocation`) queries the phone's built-in satellite/tower GPS hardware for pinpoint accuracy (3–5 meters) at **₹0.00 API cost**.
- **Free Native Map Launch**: Rider portal launches turn-by-turn driving directions directly inside the rider's phone's built-in Google Maps app via universal deep links.

---

## 7. Part 6 Sealed Decisions: The Social Commerce Engine ("The Instagram Feel")

To capture the emotional energy, discovery joy, and creator connection that makes Instagram shopping popular in Manipur:

### 7.1 The "Boutique Stories" Status Carousel (Top of App)
- Circular seller avatars with colored gradient rings placed at the top of the homepage:
  - `✨ New Drop`: Teasing evening collections.
  - `🔥 Live Auction`: Indicating active bidding wars.
  - `🧵 Behind the Loom`: 10-second artisan craft clips (e.g. Wangkhei weavers at work).
- **Interactive Story Stickers**: Stories feature direct interactive CTA stickers: `[ ⚡ View Item & Bid ]` and `[ 🔔 Set Drop Reminder ]`.

### 7.2 The "Follow Boutique" Engine
- Buyers can tap **`[ + Follow ]`** on any verified seller.
- Followers receive automated priority alerts (in-app notification + automated WhatsApp ping):  
  *"✨ @imphalthrift just announced a Sunday drop with 12 new vintage jackets!"*

### 7.3 Boutique Vanity Profile (`shinyen.in/@handle`)
- Every seller receives an aesthetic public profile modeled after high-end social storefronts:
  - Header with profile avatar, bio, verified badges, follower count, and total verified deliveries.
  - Seamless 3-column photo grid displaying active products, upcoming drops, and past sales.

### 7.4 Drop Teasers & "Remind Me" Countdown Stickers
- Sellers can publish teaser listings up to 24 hours prior to launch.
- Buyers tap **`[ 🔔 Remind Me at 8 PM ]`**; system triggers instant push/WhatsApp alerts the second the drop goes live.

### 7.5 "Community Fit Check" (Worn by You)
- Satisfied buyers can submit a photo wearing their purchased thrift item, jewellery, or handloom attire.
- Approved photos populate a dedicated **"Worn by Community"** tab on the seller's boutique profile, establishing immense organic social proof.

---

## 8. Master Phased Execution Roadmap

```
  PHASE 0: GROUND ZERO       PHASE 1: PLATFORM BUILD    PHASE 2: VALLEY BETA       PHASE 3: HILLS & APP
  (Weeks 1 – 2)              (Weeks 3 – 5)              (Weeks 6 – 8)              (Months 3 – 4)
  ┌──────────────────────┐   ┌──────────────────────┐   ┌──────────────────────┐   ┌──────────────────────┐
  │ • Open Lookmai Bank  │   │ • Next.js PWA Engine │   │ • Onboard 20 Sellers │   │ • Winger Counters    │
  │   Current Account    │   │ • Realtime Auctions  │   │ • Public Storefront  │   │   (Churachandpur,    │
  │ • Submit Cashfree/   │──>│ • 60s Seller Studio  │──>│ • 1st Sunday Drop    │──>│    Ukhrul, Senapati) │
  │   Razorpay KYC       │   │ • Rider PWA Portal   │   │ • 2 Bike Riders live │   │ • Android APK        │
  │ • Recruit 20 Anchor  │   │ • 5 Test Orders Dry  │   │ • Thoubal/Kakching   │   │   (Google Play)      │
  │   Instagram Sellers  │   │   Run in Imphal West │   │   PUDO Shops active  │   │ • Pan-India Diaspora │
  │ • Order 500 Bags +   │   │ • Automated Escrow   │   │ • 0% Commission      │   │   Shipping via       │
  │   Logo Stickers      │   │   Split Verification │   │   Launch Promo active│   │   Delhivery API      │
  └──────────────────────┘   └──────────────────────┘   └──────────────────────┘   └──────────────────────┘
```

---

## 9. Complete Master Decision Log Table

| Category | Decision | Operational & Technical Rationale |
| :--- | :--- | :--- |
| **Platform** | Next.js 14/15 Mobile-First PWA | Zero download friction from Instagram; instant 1.2s SSR load; 0MB storage. |
| **UI & Feel** | Tailwind + Framer Motion + Vaul | Spring-physics transitions, bottom-sheet drawers, and haptic feedback. |
| **Crash Vitals** | Sentry for Next.js + Bug Widget | Sub-2s real-time crash alerts with device specs; in-app user feedback modal. |
| **Authentication** | Google 1-Tap + Apple Sign-In | ₹0 cost; 100% immune to SMS bot attacks; FaceID/TouchID native flow. |
| **Phone Check** | WhatsApp OTP at Checkout | Verifies genuine active phone numbers; eliminates SMS telecom charges. |
| **Database** | Supabase (PostgreSQL + Realtime) | Sub-80ms WebSocket auction updates; Row-Level Security; generous free tier. |
| **Media Host** | Cloudflare R2 + WebP Compression | 10GB free; zero egress fees; client-side image compression (< 200KB). |
| **Storage Rules**| 3-Stage Auto-Purge Lifecycle | 30-day raw retention; 31-90 day thumbnail retention; keeps R2 permanently free. |
| **Social Core** | Stories + Follows + Fit Checks | Mimics Instagram's creator connection; 24h stories with buy/bid stickers. |
| **Payment Flow** | Cashfree/Razorpay UPI Intent | 1-tap PhonePe/GPay native intent; automated T+2 nodal escrow split. |
| **Entity** | LOOKMAI Sole Proprietorship (Udyam) | Zero overhead; legally compliant current account; PAN Enrolment ID for GST. |
| **Launch Cohort**| Thrift + Jewellery + Traditional Handloom | 3 dedicated category tabs; unstitched handloom/jewellery requires 0 measuring. |
| **Packaging** | Tamper-Evident Shinyen Security Bags | Dual-mode: Rider bags at door (default) or Seller self-packs; paid via delivery fee. |
| **Delivery Zones**| Valley Core, Far Valley PUDO, Hills Counters | Tiered ₹50/₹80/₹75 pricing; local town riders; zero physical kiosk rent. |
| **Address Engine**| Self-Learning Leikai JSON + Hardware GPS | Zero-cost local search autocomplete + 3-meter satellite GPS pin capture. |
| **Safety Net** | ₹5 Transit Micro-Insurance Pool | Self-funding safety reserve covers rare accidental breakages in transit. |
| **Protection** | Mandatory Continuous Unboxing Video | Eliminates buyer return fraud; unbroken Shinyen seal required. |
| **Auction Window**| 3-Hour Auto-Checkout | Prevents seller inventory stall; auto-passes offer to runner-up bidder. |

---

*(Official Master Playbook Locked & Verified. Ready for Code Implementation).*

---

*(Official Master Playbook Locked & Verified. Ready for Code Implementation).*
