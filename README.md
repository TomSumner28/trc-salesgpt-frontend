# TRC Forecasting GPT (Vercel-Compatible – Dark Mode Edition)

This is a visually enhanced forecasting tool for The Reward Collection's sales team. It allows forecasting of ROAS and campaign performance across multiple regions over a 6-month period.

## 🔧 Features

- ⚙️ Manual input of reach and conversion rate by region
- 📊 Multi-region selection for flexible targeting
- 💰 Calculates:
  - Expected sales
  - Expected revenue
  - Cashback cost
  - ROAS
  - 6-month MoM forecasts
- 🌙 Futuristic dark mode UI in TRC branding

## 🚀 How to Deploy

1. Upload this repo as a ZIP to GitHub.
2. Connect it to Vercel.
3. Vercel auto-detects Next.js and deploys the app.

## 🧠 Forecast Logic

- **Sales Forecast = Reach x Conversion Rate**
- **Revenue = Sales x AOV**
- **Cashback Cost = Revenue x Cashback%**
- **ROAS = Revenue / Cashback Cost**

Forecast is calculated monthly for 6 months and totals are summarized.

Enjoy!