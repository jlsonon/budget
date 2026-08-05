# 🍡 MOCHI MONEY — MASTER PROMPT
## Complete Product Blueprint for AI Coding Assistants

---

## HOW TO USE THIS DOCUMENT

This is the single source of truth for building Mochi Money. Feed this entire document (or relevant sections) to any AI coding assistant. Treat it as a product specification, not a suggestion list.

**When trade-offs are necessary, prioritize:**
1. Correctness
2. Security
3. Accessibility
4. Performance
5. User experience
6. Visual polish

---

## PART 1: PRODUCT VISION

### What Is Mochi Money?

Mochi Money is a premium personal finance web application that combines:
- Budget tracking
- Expense & income management
- Debt tracking with payoff calculations
- Savings goals with milestone tracking
- Subscription management
- AI-powered financial coaching
- Gamification with achievements and streaks
- Beautiful, customizable themes
- A cute mascot (Mochi Cat) that celebrates progress

### Target Users

- **Primary:** Individuals managing personal finances
- **Secondary:** Couples, families, friends sharing budgets
- **Tertiary:** Small business owners tracking simple finances
- **Geography:** Global, with Philippines as initial market (₱ Peso default)
- **Languages:** English + Filipino (expandable)

### Platform

- **Primary:** Progressive Web App (PWA)
- **Installable:** Android + iPhone (via PWA)
- **Offline:** Full offline-first with cloud sync
- **Notifications:** Push notifications for bills, debts, goals, reminders

### Core Principles

1. **Clarity over complexity** — Numbers should make sense
2. **Encouragement over judgment** — Never shame users
3. **Privacy first** — Users own their data
4. **Delight without distraction** — Cute but functional
5. **Premium feel** — Every screen app-store worthy

---

## PART 2: ARCHITECTURE

### Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 18+ with TypeScript |
| Build Tool | Vite |
| Routing | React Router v6 |
| State | Zustand (client state) + React Query (server state) |
| Backend | Firebase (Auth, Firestore, Storage, Cloud Functions) |
| Styling | Tailwind CSS v4 + CSS custom properties for theming |
| Animations | Framer Motion |
| Charts | Recharts or Chart.js |
| Icons | Lucide Icons (consistent stroke width) |
| Forms | React Hook Form + Zod validation |
| PWA | Vite PWA plugin |
| Testing | Vitest + React Testing Library |
| Linting | ESLint + Prettier |

### Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # Primitives (Button, Card, Input, Dialog)
│   ├── layout/         # Layout components (Sidebar, Header, Nav)
│   ├── mascot/         # Mochi Cat components
│   └── charts/         # Chart components
├── pages/              # Route-level components
│   ├── dashboard/
│   ├── transactions/
│   ├── budgets/
│   ├── savings/
│   ├── debts/
│   ├── subscriptions/
│   ├── calendar/
│   ├── reports/
│   ├── settings/
│   └── auth/
├── hooks/              # Custom React hooks
├── lib/                # Utilities, helpers, constants
├── store/              # Zustand stores
├── services/           # Firebase service layer
│   ├── auth.ts
│   ├── transactions.ts
│   ├── budgets.ts
│   ├── savings.ts
│   ├── debts.ts
│   └── sync.ts
├── types/              # TypeScript type definitions
├── themes/             # Theme definitions and tokens
├── animations/         # Animation presets
├── sounds/             # Sound effects
├── assets/             # Images, illustrations, mascots
└── app.tsx             # Root component
```

### Firebase Structure

```
users/
  {userId}/
    profile/
    settings/
    preferences/
    financialHealth/
    achievements/
    streaks/

transactions/
  {userId}/
    {transactionId}/
      amount, category, merchant, date, type, tags, notes, receipt, location, recurring, installment

budgets/
  {userId}/
    {budgetId}/
      category, limit, period, startDate, endDate, recurring, notifications

savings/
  {userId}/
    {goalId}/
      name, targetAmount, currentAmount, deadline, icon, milestones, notes, contributions[]

debts/
  {userId}/
    {debtId}/
      lender, balance, interest, dueDate, minimumPayment, schedule[], payments[], attachments[], notes

subscriptions/
  {userId}/
    {subId}/
      name, amount, frequency, nextBilling, category, status, cancelReminder

calendar/
  {userId}/
    {eventId}/
      type, date, amount, relatedId

missions/
  {userId}/
    {missionId}/
      type, date, status, reward

notifications/
  {userId}/
    {notifId}/
      type, message, read, date, deepLink
```

### Firestore Security Rules

- Every collection scoped to `request.auth.uid`
- No public read/write
- Validation on all writes
- Rate limiting on Cloud Functions
- File uploads restricted to authenticated users

---

## PART 3: DESIGN SYSTEM

### Design Tokens

```css
/* Spacing — 4px base grid */
--space-1: 4px;
--space-2: 8px;
--space-3: 12px;
--space-4: 16px;
--space-5: 24px;
--space-6: 32px;
--space-7: 48px;
--space-8: 64px;

/* Typography */
--font-family: 'Inter', system-ui, sans-serif;
--font-xs: 11px;
--font-sm: 13px;
--font-base: 15px;
--font-lg: 18px;
--font-xl: 22px;
--font-2xl: 28px;
--font-3xl: 36px;
--font-weight-regular: 400;
--font-weight-medium: 500;
--font-weight-semibold: 600;
--font-weight-bold: 700;

/* Border Radius */
--radius-sm: 8px;
--radius-md: 12px;
--radius-lg: 16px;
--radius-xl: 20px;
--radius-full: 9999px;

/* Shadows */
--shadow-sm: 0 1px 2px rgba(0,0,0,0.05);
--shadow-md: 0 4px 6px rgba(0,0,0,0.07);
--shadow-lg: 0 10px 15px rgba(0,0,0,0.1);
--shadow-xl: 0 20px 25px rgba(0,0,0,0.12);

/* Transitions */
--transition-fast: 150ms cubic-bezier(0.4, 0, 0.2, 1);
--transition-base: 250ms cubic-bezier(0.4, 0, 0.2, 1);
--transition-slow: 350ms cubic-bezier(0.4, 0, 0.2, 1);
--transition-spring: 400ms cubic-bezier(0.34, 1.56, 0.64, 1);
```

### Color System (Theme-Aware)

Each theme defines its own palette. Default theme example:

```css
/* Light Mode — Default */
--color-bg: #FAFAFA;
--color-surface: #FFFFFF;
--color-surface-elevated: #FFFFFF;
--color-primary: #F9A8D4;    /* Soft pink */
--color-primary-hover: #F472B6;
--color-secondary: #A78BFA;  /* Soft purple */
--color-success: #34D399;
--color-warning: #FBBF24;
--color-error: #F87171;
--color-text: #1F2937;
--color-text-secondary: #6B7280;
--color-text-muted: #9CA3AF;
--color-border: #E5E7EB;

/* Dark Mode */
--color-bg: #0F172A;
--color-surface: #1E293B;
--color-surface-elevated: #334155;
--color-primary: #EC4899;
--color-primary-hover: #DB2777;
--color-text: #F9FAFB;
--color-text-secondary: #94A3B8;
--color-text-muted: #64748B;
--color-border: #334155;
```

### Theme Engine

Themes extend beyond colors. Each theme may customize:
- Color tokens (backgrounds, surfaces, accents)
- Background patterns or gradients
- Icon accent colors
- Mascot outfit/assets
- Loading screen style
- Decorative elements (particles, shapes)

**Example themes:**
Sakura, Strawberry, Matcha, Peach, Ocean, Moonlight, Cloud, Cat Café, Cozy Café, Halloween, Christmas, Spring, Winter, Night Sky

**Theme switching:**
- Preview before applying
- Smooth transition animation
- Persist in settings + cloud
- Maintain contrast and accessibility

### Component Library Standards

Every component must:
- Use design tokens (no hardcoded values)
- Support theme switching
- Have hover, active, focus, disabled states
- Be keyboard accessible
- Have proper ARIA attributes
- Support reduced motion
- Include loading state where applicable

**Core components to build:**
- Button (primary, secondary, ghost, danger, icon)
- Card (default, elevated, outlined, interactive)
- Input (text, number, date, select, textarea)
- Dialog / Modal
- Bottom Sheet (mobile)
- Toast / Snackbar
- Badge / Chip
- Avatar
- Progress Bar / Ring
- Skeleton
- Empty State
- Error State
- Success State
- Mascot (animated, contextual)
- Chart wrappers

---

## PART 4: COMPLETE UI/UX SPECIFICATION

### GLOBAL PAGE RULES

Every page MUST include:
- ✅ Beautiful page transition
- ✅ Skeleton loading state
- ✅ Empty state (with illustration, friendly text, action)
- ✅ Error state (with retry, blameless message)
- ✅ Success state (with celebration where appropriate)
- ✅ Mobile layout
- ✅ Tablet layout
- ✅ Desktop layout
- ✅ Full accessibility
- ✅ Smooth animations
- ✅ Theme compatibility
- ✅ Search (if applicable)
- ✅ Filters (if applicable)
- ✅ Keyboard shortcuts (desktop)

### SPLASH SCREEN

**Purpose:** Immediately establish branding

**Layout:**
- Centered Mochi Cat illustration
- Animated "Mochi Money" logo
- Soft gradient background
- Subtle loading animation
- Cute greeting: "Preparing your cozy financial space..."

**Animation:**
- Subtle floating mascot
- Soft fade-in
- Gentle particles
- Duration: 1-2 seconds max

### WELCOME / ONBOARDING SCREEN

**Illustration:** Large Mochi character

**Headline:** "Welcome to Mochi Money"

**Subtitle:** "Managing money has never't been this cozy."

**Buttons:**
- Get Started
- Login

**Steps (progressive, never overwhelming):**
1. Basic Information
2. Choose Theme
3. Choose PIN
4. Income (optional)
5. Goals (optional)
6. Notifications preference
7. → Dashboard

**Progress indicator always visible during onboarding.**

### LOGIN PAGE

- Minimal, beautiful, large spacing
- Methods: Google, Apple, Email & Password
- Forgot Password link
- Remember Me checkbox
- Biometric ready (future)
- Animated mascot beside form
- Password visibility toggle
- Live validation
- No redirect until authenticated

### DASHBOARD

**This is the BEST screen in the app. No clutter.**

**Visual hierarchy:**
1. Greeting header
2. Financial Health Score
3. Quick Action cards
4. Monthly overview chart
5. Recent transactions
6. Today's mission
7. Achievement preview
8. Calendar preview

**Dashboard Header:**
- Greeting: "Good Morning! 🌸"
- Current date
- Mascot reacting to data
- Notification bell
- Profile avatar

**Greeting examples:**
- "Good Morning! Mochi is happy to see you!"
- "You saved ₱320 yesterday!"
- "Great job staying on budget!"

**Quick Action Cards:**
- ➕ Add Expense
- 💰 Add Income
- 🏦 Savings Contribution
- 💳 Debt Payment
- 🧾 Receipt Scan
- 🎯 Goal Contribution

**Financial Health Card:**
- Large circular score (0-100)
- Color: Green / Yellow / Orange / Red
- Explain WHY the score is what it is
- Show improvements from last period
- Suggested next steps

**Monthly Overview:**
- Animated chart (income, expenses, savings, debt, budget)
- Swipe months on mobile
- Arrow navigation on desktop

**Recent Transactions:**
- Last 5-10 transactions
- Each row: Icon, title, date, amount, category
- Animation on new insert
- Tap to view full details

**Today's Mission:**
- Cute mission card
- Examples: "Save ₱20 today", "Log one expense", "Review subscriptions"
- Reward preview (badge progress, mascot reaction)

**Achievement Card:**
- Show newest unlock
- Sparkle animation
- Tap to open collection

**Calendar Preview:**
- Upcoming: Bills, Subscriptions, Debt payments, Savings goals, Birthdays
- Tap opens full Calendar

### TRANSACTIONS PAGE

**Header:**
- Search bar
- Filter by category, date range, type, tags
- Sort by date, amount, category
- Quick Add button

**Transaction Card:**
- Category icon
- Merchant / Title
- Date & Time
- Amount (color-coded: green income, red expense)
- Payment method badge
- Receipt indicator
- Tags

**Swipe actions (mobile):**
- Left: Delete (with confirmation + undo)
- Right: Edit / Duplicate / Mark favorite

**Transaction Details (modal/page):**
- All fields editable
- Timeline of related events
- Notes section
- Receipt image
- Attachments
- History of edits
- Related Goal / Budget / Subscription links

**Add Transaction:**
- Multi-step optional flow OR one-page quick mode
- Fields: Amount, Category, Merchant, Payment method, Date, Time, Receipt upload, Tags, Notes, Location, Recurring toggle, Installment toggle
- Preview before save

### RECEIPT SCANNER

- Camera opens directly
- Auto-detect: Amount, Merchant, Date, Category
- Confidence score shown
- Allow manual edits
- Save to transaction

### BUDGET PAGE

**Budget Cards (one per category):**
- Icon + Category name
- Spent / Remaining
- Progress bar
- Forecast (will I go over?)
- Trend arrow
- AI suggestion

**Create Budget (wizard):**
1. Choose category
2. Set amount
3. Choose period (weekly, monthly, custom)
4. Set recurring
5. Set notifications
6. Preview
7. Save

### SAVINGS PAGE

**Hero section:** Total Saved amount (large, celebratory)

**Goals Grid:**
- Active goals
- Completed goals (with celebration badge)
- Upcoming milestones

**Goal Card:**
- Large image or icon
- Progress ring
- Target amount
- Current amount
- Remaining
- Days left
- Estimated completion date
- Celebration animation when reached

**Goal Details:**
- Contribution timeline
- Photos (optional, e.g., house, car)
- Notes
- Milestones achieved
- AI suggestions for faster progress
- Share toggle (optional)

### DEBT PAGE

**Professional, not scary.**

**Summary cards:**
- Total Debt
- Monthly Payments due
- Total Interest
- Debt-Free Date (projected)

**Debt Card:**
- Lender name
- Current balance
- Interest rate
- Due date
- Minimum payment
- Progress bar
- Color coding (red = urgent, green = manageable)

**Debt Details:**
- Full payment history
- Payment schedule
- Attachments (loan documents)
- Notes
- Interest chart
- Snowball payoff suggestion
- Avalanche payoff suggestion
- Interest saved comparison

### SUBSCRIPTIONS PAGE

- Grid view of all subscriptions
- Monthly total cost (prominent)
- Annual total cost
- Next renewal date
- Cancel reminder toggle
- Usage rating (1-5 stars)
- Color indicators (green = good value, yellow = questionable, red = cancel)

### CALENDAR PAGE

**Views:**
- Month (default)
- Week
- Agenda
- Day

**Events:**
- Income (green)
- Bills (orange)
- Debt payments (red)
- Savings contributions (blue)
- Subscriptions (purple)
- Goals milestones (pink)

**Interaction:**
- Tap event → open details
- Swipe between months
- Add event from calendar

### REPORTS PAGE

**Cards, never overwhelming:**

- Cash Flow (income vs expenses over time)
- Income breakdown (sources)
- Expense breakdown (categories, merchants)
- Savings rate trend
- Debt reduction trend
- Subscription costs over time
- Net worth chart
- Financial Health Score trend
- Wishlist / Goals progress

**Filters:**
- Date range
- Categories
- Comparison (month-over-month, year-over-year)

### PROFILE PAGE

- Avatar (customizable)
- Name
- Current theme
- Achievements showcase
- Personal statistics
- Quick links: Settings, Backup, Support, Privacy

### SETTINGS PAGE

**Organized sections:**
- General (language, currency, timezone)
- Appearance (theme, dark mode, animations, sounds)
- Security (PIN, biometric, auto-lock)
- Notifications (toggle by type)
- Accessibility (text size, reduced motion, high contrast)
- Sounds (toggle individual sounds)
- Cloud Sync (status, last sync, manual sync)
- Data (export, import, delete account)
- About (version, privacy policy, terms)
- Support (help center, feedback, contact)

### SEARCH

- Global search across all data
- Instant results
- Recent searches
- Suggested searches
- Search by: transaction, category, merchant, goal, debt, subscription

### NOTIFICATIONS

**Grouped by:**
- Today
- Yesterday
- Earlier this week
- Older

**Swipe actions:**
- Read
- Delete
- Mute this type

**Deep links to relevant pages.**

### HELP CENTER

- Search bar
- Categories: Getting Started, Budgets, Savings, Debts, Subscriptions, Themes, Troubleshooting
- FAQ sections
- Tips and tricks
- Contact / Feedback form

### EMPTY STATES

**Never truly empty. Always include:**
1. Cute illustration
2. Friendly text
3. Primary action button
4. Helpful tip

**Example:**
> "No expenses yet! Let's record your first purchase together."
> [Add Expense] button

### SUCCESS STATES

**Celebrate:**
- Goal completed → Confetti + mascot dance
- Debt paid → Trophy + mascot cheering
- Savings reached → Sparkles + progress
- Budget achieved → Star badge + mascot happy
- Streak reached → Fire + mascot excited

**With:**
- Animation (Framer Motion)
- Optional sound
- Mascot reaction
- Confetti (optional toggle)

### ERROR STATES

**Never blame users.**

**Instead of "Failed." use:**
> "We couldn't save that right now. Mochi will keep trying."

**Always provide:**
- Retry button
- Explanation in plain language
- Alternative action if available

### BOTTOM NAVIGATION (MOBILE)

**Maximum 5 primary items:**
1. 🏠 Home
2. 💸 Transactions
3. ➕ Quick Add (center, prominent)
4. 📊 Budget
5. 👤 Profile

**Additional modules** (Savings, Debt, Calendar, Reports) accessible from Home dashboard, contextual shortcuts, or a "More" section.

### DESKTOP LAYOUT

- Left navigation rail (collapsible)
- Resizable widgets on dashboard
- Keyboard shortcuts throughout
- Hover states on all interactive elements
- Drag & Drop for organizing
- Multiple panels visible simultaneously
- Large, detailed charts
- No wasted whitespace

### TABLET LAYOUT

- Balanced two-column experience
- Side panels where appropriate
- Larger cards
- Touch-friendly spacing
- Optimized for both landscape and portrait

### RESPONSIVE BREAKPOINTS

| Breakpoint | Target |
|-----------|--------|
| 320px | Small phones |
| 360px | Standard phones |
| 375px | iPhone standard |
| 390px | Modern iPhones |
| 414px | Large phones |
| 768px | Small tablets (portrait) |
| 820px | iPads |
| 1024px | Large tablets / small laptops |
| 1280px | Laptops |
| 1440px | Desktop monitors |
| 1920px | Large monitors |

**Audit criteria:** No clipped content, no overflow, no horizontal scrolling, no tiny touch targets (minimum 44x44px).

---

## PART 5: ADVANCED SYSTEMS

### AI FINANCIAL COACH

**Role:** Supportive financial companion — NOT a financial advisor.

**Capabilities:**
- Analyze spending categories and trends
- Identify recurring patterns
- Detect unusually high expenses
- Highlight potentially unused subscriptions
- Estimate monthly cash flow from history
- Suggest realistic category budgets
- Recommend savings goals
- Explain reports in plain English or Tagalog
- Encourage progress

**Tone rules:**
✅ DO: "You've been consistent with your food budget this week."
✅ DO: "Your transportation expenses are slightly higher than last month. Consider checking cheaper options."
❌ DON'T: "You wasted money."
❌ DON'T: "You're irresponsible."
❌ DON'T: "You're failing."

### DAILY INSIGHTS

One short insight per day:
- Spending trend
- Budget reminder
- Savings milestone
- Debt progress
- Subscription reminder
- General encouragement

### WEEKLY & MONTHLY SUMMARIES

Include:
- Income total
- Expenses total
- Savings total
- Debt payments
- Budget performance
- Largest expense categories
- Subscription costs
- Goal progress
- Financial Health Score trend

Present visually with plain-language explanations.

### FINANCIAL HEALTH SCORE

**Score: 0-100** based on:
- Savings rate (20%)
- Budget adherence (25%)
- Debt-to-income ratio (15%)
- Bill payment consistency (15%)
- Emergency fund progress (15%)
- Subscription burden (10%)

**Display:**
- Current score with color
- Historical trend line
- Main positive/negative contributors
- Specific suggested improvements
- Transparent explanation of calculation

### GAMIFICATION

**Implement:**
- Daily missions
- Weekly challenges
- Monthly financial challenges
- Daily streaks
- Achievement badges
- Progress tracking

**Design principle:** Encourage consistency, not addiction. Missing a day should not erase long-term effort. Include grace mechanics.

### ACHIEVEMENTS

**Examples:**
- First expense logged
- First savings goal created
- 7-day streak
- 30-day streak
- Budget completed for a month
- Emergency fund started
- Debt milestone reached
- Subscription cleanup
- Wishlist fulfilled

**Each achievement includes:**
- Name
- Description
- Unique icon
- Progress indicator (if multi-step)
- Unlock animation
- Collection view

### DAILY MISSIONS

**Examples:**
- Log one expense
- Review today's spending
- Save any amount
- Categorize a transaction
- Check upcoming bills
- Review subscriptions

**Rewards:** Symbolic (badges, progress, mascot reactions) — never financial.

### STREAKS

**Track:**
- Daily check-ins
- Expense logging
- Savings contributions
- Budget reviews
- Goal updates

**Grace mechanics:**
- 2-3 grace days per month
- Streak freeze items (earnable through achievements)
- Encouraging messages on missed days

### SOUND SETTINGS

**Optional sound effects for:**
- Button interactions
- Goal completion
- Achievement unlocks
- Savings contributions
- Notifications

**Controls:**
- Master volume toggle
- Individual sound toggles
- Independent of system volume
- Off by default

---

## PART 6: MONETIZATION • PRIVACY • DEPLOYMENT

### MONETIZATION

**Model:** One-time premium purchase
- No advertisements
- No loot boxes
- No pay-to-win mechanics
- Generous free experience

**Premium unlocks (examples):**
- Unlimited themes
- Advanced AI insights
- Custom mascot outfits
- Extended reports
- Priority support

**Premium should unlock value, not remove frustration.**

### DATA PRIVACY

**Principles:**
- Users own their data
- No public financial information
- Sharing only through explicit invitations
- Clear privacy controls
- Account deletion with confirmation + export
- No selling data to third parties
- Encryption in transit and at rest

### BACKUP & SYNC

**Using Firebase:**
- Automatic sync when online
- Offline-first behavior (local cache)
- Conflict resolution (last-write-wins with merge)
- Manual refresh button
- Last sync timestamp visible

**If sync fails:**
- Clear communication of issue
- Safe retry with exponential backoff
- No data loss

### PERFORMANCE STANDARDS

**Targets:**
- First Contentful Paint: < 1.5s
- Largest Contentful Paint: < 2.5s
- Time to Interactive: < 3.5s
- Cumulative Layout Shift: < 0.1
- Total Blocking Time: < 200ms
- Smooth animations: 60fps
- Firestore queries: < 500ms
- Bundle size: < 200KB gzipped initial

**Optimization strategies:**
- Route-based code splitting
- Lazy-loaded heavy components
- Optimized images (WebP, AVIF)
- Efficient Firestore queries (compound indexes)
- Virtualized lists for large datasets
- Debounced search inputs
- Memoized computations

### ACCESSIBILITY

**Target:** WCAG 2.2 AA

**Support:**
- Full keyboard navigation
- Screen reader labels (aria-label, aria-describedby)
- Visible focus indicators
- Reduced motion support (prefers-reduced-motion)
- High contrast mode
- Adjustable text size
- Semantic HTML throughout
- Color not as sole indicator
- Touch targets minimum 44x44px

---

## PART 7: QUALITY ASSURANCE

### PRE-RELEASE CHECKLIST

**User Experience:**
- [ ] Consistent branding across all screens
- [ ] Clear, intuitive navigation
- [ ] Responsive on all target breakpoints
- [ ] Smooth, purposeful animations
- [ ] Helpful empty states
- [ ] Friendly, actionable error messages

**Functionality:**
- [ ] All buttons functional (no dead buttons)
- [ ] All forms validated with helpful messages
- [ ] No broken links or routes
- [ ] Offline mode tested and working
- [ ] Cloud sync verified
- [ ] Notifications tested

**Security:**
- [ ] Authentication flows verified
- [ ] Firestore security rules enforced
- [ ] PIN functionality working
- [ ] File uploads validated
- [ ] Input sanitization complete
- [ ] No secrets in client code

**Performance:**
- [ ] No unnecessary re-renders (React DevTools)
- [ ] Optimized bundle size
- [ ] Efficient Firestore queries (check indexes)
- [ ] Lighthouse scores in target ranges
- [ ] No memory leaks

**Accessibility:**
- [ ] Full keyboard navigation
- [ ] Screen reader compatibility
- [ ] Contrast ratios meet WCAG AA
- [ ] Reduced motion support verified
- [ ] Focus management in modals/dialogs

**Cross-Platform Testing:**
- [ ] Small phones (320px)
- [ ] Large phones (414px)
- [ ] Tablets portrait + landscape
- [ ] Laptops (1280px)
- [ ] Desktop monitors (1440px+)
- [ ] Chrome, Firefox, Safari, Edge

### DEPLOYMENT CHECKLIST

- [ ] Production Firebase project configured
- [ ] Environment variables secured (not in repo)
- [ ] Firestore composite indexes deployed
- [ ] Firestore security rules deployed
- [ ] Storage security rules deployed
- [ ] Cloud Functions deployed
- [ ] PWA manifest verified
- [ ] Service worker tested (offline, update flow)
- [ ] Push notifications tested
- [ ] Backup and restore tested
- [ ] Export/import tested
- [ ] Error monitoring enabled (Sentry or similar)
- [ ] Analytics verified (privacy-conscious)
- [ ] Accessibility audit completed
- [ ] Performance audit completed

---

## PART 8: FINAL ACCEPTANCE CRITERIA

Mochi Money is **launch-ready** only when:

1. ✅ Every planned feature is fully implemented
2. ✅ No placeholder pages or inactive controls
3. ✅ Core user journeys tested successfully
4. ✅ Performance standards met
5. ✅ Accessibility standards met
6. ✅ Security standards met
7. ✅ Responsive across supported devices
8. ✅ Offline mode and sync reliable
9. ✅ Branding consistent throughout
10. ✅ Documentation complete

**Product Mission:** Mochi Money should become a daily financial companion that helps people build healthier money habits through thoughtful design, encouragement, and practical tools. Users should leave every session feeling more informed, more confident, and more motivated than when they opened the app.

---

## PART 9: 500-POINT PRODUCT AUDIT

### SCORING METHOD

Score each category 0-10. Provide findings, risks, recommendations, priority, and estimated effort.

**Categories:**
1. Branding Audit
2. Design System Audit
3. Color Audit
4. Typography Audit
5. Icon Audit
6. Spacing Audit
7. Animation Audit
8. Responsive Audit
9. Mobile Audit
10. Tablet Audit
11. Desktop Audit
12. Accessibility Audit
13. Performance Audit
14. Firebase Audit
15. Security Audit
16. Database Audit
17. AI Audit
18. Dashboard Audit
19. Transactions Audit
20. Budget Audit
21. Savings Audit
22. Debt Audit
23. Subscriptions Audit
24. Reports Audit
25. Theme Engine Audit
26. Gamification Audit
27. Notification Audit
28. Monetization Audit
29. Error Handling Audit

**Anything below 9.5/10 requires improvement.**

### FINAL VERDICT FORMAT

**Executive Summary:**
- Overall readiness
- Strengths
- Top product qualities

**High Priority Issues:**
- Must fix before launch

**Medium Priority Improvements:**
- Should improve soon

**Low Priority Enhancements:**
- Nice-to-have polish

**Overall Score:**
- Percentage readiness

**Recommendation:**
- ❌ Not Ready
- ⚠️ Ready After Fixes
- ✅ Production Ready

---

## PART 10: LIFE TIMELINE FEATURE

A chronological timeline showing the user's financial journey:

**Milestones:**
- 🌱 First expense recorded
- 💰 First ₱1,000 saved
- 🎯 First goal completed
- 💳 First debt fully paid
- 🔥 Longest streak
- 🏆 Biggest monthly savings
- 📈 Financial Health milestones
- 🎉 Wishlist fulfilled

**Presentation:**
- Beautiful vertical timeline
- Mochi celebrating each milestone
- Tap to view details
- Shareable (optional)
- Emotionally engaging, reinforces progress

---

## IMPLEMENTATION ORDER

Recommended build sequence:

**Phase 1 — Foundation**
1. Project setup, auth, basic navigation
2. Design system (tokens, components, themes)
3. Dashboard skeleton
4. Transaction CRUD

**Phase 2 — Core Finance**
5. Budget creation and tracking
6. Savings goals
7. Debt tracking
8. Subscription management

**Phase 3 — Intelligence**
9. Calendar
10. Reports and charts
11. Financial Health Score
12. AI insights

**Phase 4 — Delight**
13. Gamification (missions, achievements, streaks)
14. Mascot integration
15. Theme engine
16. Sound effects

**Phase 5 — Polish**
17. PWA (offline, sync, notifications)
18. Accessibility
19. Performance optimization
20. Life Timeline

**Phase 6 — Launch**
21. Full QA audit
22. Security review
23. Cross-platform testing
24. Deployment

---

## NOTES FOR AI CODING ASSISTANTS

1. **Do not use placeholder content.** If data isn't available, show proper loading → empty → error states.
2. **Do not skip responsive design.** Every screen must work on mobile, tablet, and desktop.
3. **Do not hardcode colors.** Use CSS custom properties and theme tokens.
4. **Do not ignore accessibility.** Every interactive element needs keyboard support, focus management, and screen reader labels.
5. **Do not create generic UI.** Every component should feel cohesive and branded.
6. **Validate all user input.** Client-side (Zod) and server-side (Firestore rules).
7. **Optimize for real-world use.** Users may have 1000+ transactions. Virtualize lists.
8. **Offline-first.** The app should work without internet and sync when reconnected.
9. **Never shame the user.** Error messages should be helpful, not accusatory.
10. **Ship quality, not features.** A smaller, polished app beats a large, unfinished one.

---

*END OF MASTER PROMPT*

This document is the complete product specification for Mochi Money. Use it as the single source of truth when building, reviewing, or iterating on the application.
