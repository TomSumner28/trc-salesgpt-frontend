# TRC SalesGPT Frontend

This is a small Next.js app that lets the sales team quickly estimate results for a cashback campaign. Forecasts can be saved to a Supabase backend so they can be revisited later.

## Getting started

1. Run `npm install` to install dependencies.
2. Start the development server with `npm run dev`.

## Forecasting GPT

Open the site and enter:

- **Retailer Name**
- **Tier** (1–3)
- **Average Order Value**
- **Regions** where the campaign will run (UK, US, EU)
- **% Cashback** offered

The tool sums the reach for the selected regions and applies a conversion rate based on the tier:

```
1 → 0.1%
2 → 0.05%
3 → 0.025%
```

Expected orders, revenue, total cashback and ROAS are displayed along with the appropriate currency symbol. After generating a forecast you can save it. Visit the **Saved Forecasts** page to view or delete previous entries.
