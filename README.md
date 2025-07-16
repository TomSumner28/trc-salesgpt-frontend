# TRC SalesGPT Frontend

This project contains a small Next.js frontend for the TRC SalesGPT demo.

## Getting started

1. Run `npm install` to install dependencies.
2. Use `npm run dev` to start the development server or `npm run build` to build for production.

## Features

- **Forecasting tool** – The homepage hosts **The Reward Collection Forecasting Tool**. Select the sales rep, choose multiple regions and tier, pick a starting month, and enter cashback rates. Tick **In-store Offer** if the campaign includes stores. Reach for each region auto-fills from publisher data and is halved to reflect realistic campaign performance. When a campaign is new‑customer only, reach is first limited to publishers that support new customers before the 50% reduction. Results include a six-month growth curve with tables showing revenue, total cashback, **net revenue** and sales, and the month headers reflect the chosen start month. Currency is chosen automatically (GBP for UK, USD for US, EUR for EU or whichever region contributes the most sales). The results heading displays the retailer name followed by "6-Month Forecast". The interface loads in light mode by default, with a toggle at the top right to switch to dark mode. A **Download PDF** button saves the forecast without the view controls and includes a note from the chosen sales rep. When an in-store offer is provided, another table splits results by channel and appears in the **View All** display.
- Adjust month-by-month totals using sliders beneath each month header. Moving a slider up or down redistributes spend across the remaining months so the six-month total stays the same.
- High level metrics include a fixed **28% increase in basket spend** row alongside orders, revenue, cashback, net revenue and ROAS. The campaign metrics also list the cashback percentage used (or separate existing and new rates if tactical).
- **Publisher manager** – Use the Publishers link to view, add or edit publisher entries that feed the automated reach numbers.
- **Publisher forecasts** – Use the Publisher Forecasts page to enter real transaction count and revenue figures from partners. Tick **In-store Offer** to provide separate in‑store counts and revenue. Cashback is entered as a percentage so totals are calculated automatically. Results include AOV and ROAS and can cover a 3‑ or 6‑month period in any currency. The results dropdown lets you view totals by offer type or by channel, and the high level metrics list the cashback amounts **and the rates** for existing and new customers.
 - **Saved forecasts** – After calculating results you can save the current forecast locally in your browser. Visit the Saved Forecasts page from the top bar to reopen or delete previous entries.
