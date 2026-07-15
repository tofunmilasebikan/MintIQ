# MintIQ

MintIQ is a financial analytics mobile app that helps you understand spending behavior, track goals, and build healthier financial habits — without bank API integrations or judgmental messaging.

## Problem MintIQ Solves

Most budget apps feel like basic ledgers. MintIQ focuses on **financial behavior and goal tracking**: clean imported data, visualize patterns, forecast spending, and score progress with a transparent MintIQ Score.

## Features

- **Dashboard** — Monthly/weekly totals, daily average, top category, projected spending, MintIQ Score, and charts (category pie, spending over time, weekly trend)
- **Add Expense** — Manual entry with amount, category, date, merchant, and note via center FAB
- **History** — Search, filter by category, delete expenses, CSV import/export
- **Goals** — Savings, reduce-spending, and debt goals with manual + automatic progress tracking
- **Insights** — Rules-based, neutral insights about spending patterns and forecasts
- **CSV Import/Export** — Smart column mapping, data cleaning, auto-categorization, duplicate detection, and import review screen
- **MintIQ Score** — 0–100 score across four dimensions (25 pts each)

## Tech Stack

- React Native with Expo (SDK 56)
- TypeScript
- AsyncStorage for local data (works on web, iOS, and Android)
- React Navigation (bottom tabs + stack)
- `react-native-gifted-charts` for visualizations
- `expo-document-picker` / `expo-sharing` for CSV import/export
- EAS Build config stub for App Store / Play Store deployment

## Screenshots

<!-- Add portfolio screenshots here -->
| Dashboard | Insights | Goals | History |
|-----------|----------|-------|---------|
| _screenshot_ | _screenshot_ | _screenshot_ | _screenshot_ |

## MintIQ Score

Your MintIQ Score (0–100) is made of four equal parts:

| Component | Points | What it measures |
|-----------|--------|------------------|
| **Goal Progress** | 25 | How close you are to active financial goals |
| **Spending Stability** | 25 | Consistency of daily spending (lower variance = higher score) |
| **Savings Behavior** | 25 | Savings transactions and progress toward savings goals |
| **Trend Direction** | 25 | Whether this month's spending pace is higher or lower than last month |

Category balance is **not** the main scoring factor — you may intentionally prioritize different categories each month.

## CSV Import & Cleaning

MintIQ accepts CSV files with varying column names:

| Common columns | Maps to |
|----------------|---------|
| Date / Transaction Date / Posted Date | `date` |
| Amount / Cost / Debit / Credit | `amount` |
| Description / Merchant / Name | `merchant` |
| Category / Type | `category` |
| Notes / Memo | `note` |

**Cleaning logic:**
- Standardizes dates to `YYYY-MM-DD`
- Strips currency symbols and parses amounts
- Infers categories from merchant names (Starbucks → Food, Uber → Transportation, etc.)
- Flags invalid rows for review
- Detects potential duplicates (same amount + merchant + similar date) — **never auto-deletes**

After import, a **Review screen** shows valid/invalid rows, duplicates, and assigned categories before confirming.

## Goal Types

| Type | Progress tracking |
|------|-------------------|
| **Savings** | Manual progress + optional link to Savings category transactions |
| **Reduce Spending** | Automatic from category spending totals vs. limit |
| **Debt Payoff** | Manual progress |

Goals can be **fixed** (until changed) or **monthly** (with carry-over options at month end).

## How to Run Locally

```bash
# Install dependencies
npm install

# Web (recommended for quick preview in browser)
npm run web
# Then open http://localhost:8081

# Or start Expo and press w for web
npm start

# Run on iOS simulator
npm run ios

# Run on Android emulator
npm run android
```

On first launch, MintIQ seeds ~45 days of sample transactions and sample goals so Dashboard, Insights, and Score work immediately.

### EAS Build (stub)

```bash
# Install EAS CLI
npm install -g eas-cli

# Configure project (replace placeholders in app.json)
eas init

# Development build
eas build --profile development --platform ios

# Production build
eas build --profile production --platform ios
```

Update `app.json` placeholders: `extra.eas.projectId`, `owner`, and iOS `bundleIdentifier` before submitting.

## Project Structure

```
src/
├── components/     # Reusable UI (Card, Button, charts wrappers, etc.)
├── screens/        # Dashboard, History, Goals, Insights, Add Expense, Import Review
├── navigation/     # Tab navigator with FAB + root stack
├── database/       # SQLite schema, queries, seed logic
├── utils/          # Analytics, insights, score, CSV, formatting
├── types/          # TypeScript interfaces
├── constants/      # Theme, category colors/icons
├── data/           # Sample seed data generators
└── context/        # App-wide state + DB refresh
```

## Future Improvements

- Bank API integration (Plaid, etc.)
- User authentication and cloud sync
- Multi-currency support
- Push notifications for goal milestones
- Dark mode
- Budget envelopes per category
- ML-based categorization
- Widget support (iOS/Android)
- Recurring expense detection

---

Built with Expo + TypeScript. Designed for iOS-first polish with Android support.
