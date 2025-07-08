# TRC SalesGPT Frontend

This project uses Next.js to present a simple dashboard. It includes a sidebar with links for a team section, knowledge base, retailer forecasting tool and a quick response helper. A **Connect Outlook** button in the header demonstrates how you might start an OAuth flow to Microsoft.

The dashboard currently shows placeholder email metrics. In a real deployment you would call the Microsoft Graph API to fetch emails and compute metrics such as how many emails each person has sent and the average response time.

## Development

Install dependencies and run the development server:

```bash
npm install
npm run dev
```
