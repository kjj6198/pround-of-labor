# 勞工大代誌 · Taiwan Labor Data

[English](README.md) | [繁體中文](README.zh-TW.md)

## What it is

An interactive site in Traditional Chinese for exploring Taiwan's public labor
statistics from 2012 to 2025. It shows wages, working hours, unemployment, the
minimum wage against consumer prices, migrant workers by industry and
nationality, the age structure of the registered population, and births. It
also collects 31 records of labor history, from Haymarket in 1886 to the 2026
delivery-worker act. Charts include data tables, and records are available as
CSV or JSON.

The site uses statistics from the Directorate-General of Budget, Accounting and
Statistics, the Ministry of Labor, and the Ministry of the Interior. Annual
series stop at the last complete year, and the minimum wage in force is a
separate measure from the annual series; these statistics do not adjust wages
for inflation.

Built with TanStack Start, React, and Vite+, and deployed to Cloudflare
Workers. See [DESIGN.md](DESIGN.md) for
design decisions, data sources, methodology, data maintenance, and deployment
instructions.

## Getting Started

Install Node.js 22.12 or later, then run these commands from the project
directory:

```sh
npm ci
npm run dev
```

Open the URL printed in the terminal. The default port is 3001; the server
selects another free port if it is occupied.

The verified dataset is included in the repository. Running the site requires
no external API, credentials, Python installation, or database server.

To build and preview the production application locally:

```sh
npm run build
npm run preview
```

## Contributing

Open an issue to report a bug or propose a change. For code changes, create a
branch, make your changes, and run the checks before opening a pull request:

```sh
npm run check
npm test
npm run build
```

Include a description of the change and how you verified it. Add screenshots
for visual changes. Keep chart data tables, keyboard navigation, and
reduced-motion support working when changing the interface. `npm run
test:browser` drives the real application and covers these paths at 375, 768,
and 1440 pixels.
