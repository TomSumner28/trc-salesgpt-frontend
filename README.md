# TRC SalesGPT Frontend
This project contains a small Next.js frontend for the TRC SalesGPT demo.

## Getting started

1. Run `npm install` to install dependencies.
2. Use `npm run dev` to start the development server or `npm run build` to build for production.

## Features

 - **Forecasting tool** – The homepage hosts **The Reward Collection Forecasting Tool**. Select the sales rep, choose multiple regions and tier, and specify online/instore options and cashback rates. Reach for each region auto-fills from publisher data and is halved to reflect realistic campaign performance. When a campaign is new‑customer only, reach is first limited to publishers that support new customers before the 50% reduction. Results include a six-month growth curve with tables showing revenue, total cashback, **net revenue** and sales. Currency is chosen automatically (GBP for UK, USD for US, EUR for EU or whichever region contributes the most sales). The results heading displays the retailer name followed by "6-Month Forecast". The interface loads in light mode by default, with a toggle at the top right to switch to dark mode. A **Download PDF** button saves the forecast without the view controls and includes a note from the chosen sales rep. When both online and in-store are selected, another table splits results by channel and appears in the **View All** display.
- **Publisher manager** – Use the Publishers link to view, add or edit publisher entries that feed the automated reach numbers.
