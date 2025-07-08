# TRC Forecasting GPT (Enhanced UI + Visuals)

This version of Forecasting GPT includes advanced logic, visuals, and formatting for a more intuitive and impactful forecasting experience tailored for The Reward Collection team.

## 🔧 Features

- ⚙️ Manual input of reach and conversion rate by region
- 📊 Multi-region selection for flexible targeting
- 💰 Currency formatting:
  - GBP (£) for non-US campaigns
  - USD ($) for US-only campaigns
- 📈 Visual forecast table with monthly breakdowns
- 📉 Dynamic graphs showing:
  - Revenue growth
  - Cashback cost
  - ROAS trend

## 🧠 Forecast Logic

- **Sales Forecast = Reach x Conversion Rate**
- **Revenue = Sales x AOV**
- **Cashback Cost = Revenue x Cashback%**
- **ROAS = Revenue / Cashback Cost**

## 🗓 Forecast Range

- Forecasts are calculated month-over-month for 6 months.
- Total campaign metrics are displayed at the end.

## 🚀 How to Deploy

1. Upload this folder to GitHub.
2. Connect it to Vercel.
3. Vercel will automatically detect and deploy the Next.js app.