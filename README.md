# TRC SalesGPT Frontend

This project contains a small Next.js frontend for the TRC SalesGPT demo.

## Getting started

1. Run `npm install` to install dependencies.
2. Use `npm run dev` to start the development server or `npm run build` to build for production.

### Environment variables

Create a `.env` file with these values so the app can load publisher data and
store forecasts in Supabase:

```
NEXT_PUBLIC_SUPABASE_URL=https://hwglmudfkjctsdnyutsp.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh3Z2xtdWRma2pjdHNkbnl1dHNwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI1OTcxNjAsImV4cCI6MjA2ODE3MzE2MH0.PGZv31POduuwyzbAR9G3pPjWRyBydn6t8Zo0Gi-Htdo
```
If these variables are missing the publishers list will be empty and forecasts
cannot be saved.

## Features

 - **Forecasting tool** – The homepage hosts **The Reward Collection Forecasting Tool**. Select the sales rep, choose multiple regions and tier, pick a starting month, and enter cashback rates. Tick **In-store Offer** if the campaign includes stores. Reach for each region auto-fills from publisher data and is halved to reflect realistic campaign performance. When a campaign is new‑customer only, reach is first limited to publishers that support new customers before the 50% reduction. The summary table lists the total publisher reach and the adjusted 50% figure used for calculations. Results include a six-month growth curve with tables showing revenue, total cashback, **net revenue** and sales, and the month headers reflect the chosen start month. Currency is chosen automatically (GBP for UK, USD for US, EUR for EU or whichever region contributes the most sales). The results heading displays the retailer name followed by "6-Month Forecast". The interface loads in light mode by default, with a toggle at the top right to switch to dark mode. A **Download PDF** button saves the forecast without the view controls and includes a note from the chosen sales rep. When an in-store offer is provided, another table splits results by channel and appears in the **View All** display.
- Adjust month-by-month totals using sliders beneath each month header. Moving a slider up or down redistributes spend across the remaining months so the six-month total stays the same.
- High level metrics include a fixed **28% increase in basket spend** row alongside orders, revenue, cashback, net revenue and ROAS. The campaign metrics also list the cashback percentage used (or separate existing and new rates if tactical).
- TRC revenue for new and existing customers appears in the month-by-month table so you can see revenue each month. These rows are hidden when exporting to PDF.
- **Publishers page** – The Publishers link shows reach, new‑customer capability and region data loaded from Supabase. The list is read‑only and feeds the automated reach numbers. Ensure your Supabase project includes a table named `publishers` (or `publisher`, sometimes `Publishers`) with columns `Network_Publishers`, `Sub_Publishers`, `Status`, `Regions`, `Reach` and `New_Customers`. `Reach` values can include commas and are converted to numbers automatically. Region names such as "USA" or "Europe" are recognised and normalised to `US` and `EU` automatically.
- **Publisher forecasts** – Use the Publisher Forecasts page to enter real transaction count and revenue figures from partners. Tick **In-store Offer** to provide separate in‑store counts and revenue. Cashback is entered as a percentage so totals are calculated automatically. Results include AOV and ROAS and can cover a 3‑ or 6‑month period in any currency. The results dropdown lets you view totals by offer type or by channel, and the high level metrics list the cashback amounts **and the rates** for existing and new customers.
- **Saved forecasts** – After calculating results you can save the current forecast. Entries are stored in Supabase so the team can return later to review, delete or download them again. The Saved Forecasts page includes a search box for quickly filtering the list.
