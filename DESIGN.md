# Design and data

Reference for the design system, the statistics behind the site, the
methodology, data maintenance, and deployment. For installation and
development, see [README.md](README.md).

## Design system

The page uses a paper ground, dark green text, and a vermilion accent. It
rearranges the wordmark and the raised fist of the 2015 original. Brand assets
`public/brand/logo-1.svg` to `logo-5.svg` and `labor-hand.svg` come from that
work; letters 3 and 4 gained the `viewBox` their source files were missing, and
the paths are unchanged. The typeface is LINE Seed TW, with its license in
`public/fonts/`.

Charts use Chart.js and always ship a data table under the figure. Motion for
React links a card, its cover, its illustration, and its title through a shared
`layoutId` when a story opens and closes. The reading panel supports long-text
scrolling, Escape, a click on the backdrop, a focus trap and focus restore, an
inert background, and a scroll lock. Reduced-motion mode drops the shared
`layoutId` and crossfades instead.

Story cards use three equal columns on the desktop, two below 800px, and one
below 540px. Icons come from Remix Icon.

## Data

Checked on **2026-09-08**. Annual statistics start in **2012** and the last
complete year is **2025**. The site publishes no monthly figures and never
treats a 2026 year-to-date total as a full year. The minimum wage in force is a
separate measure: **NT$29,500 per month and NT$196 per hour from 2026-01-01**,
while the year-end 2025 standard in the historical chart stays NT$28,590 and
NT$190.

| Statistic                              | Source                                                                                                                                                                            | Coverage                                        |
| -------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------- |
| Regular earnings                       | [DGBAS table 5](https://www.dgbas.gov.tw/News.aspx?_CSN=135&n=4437&sms=10980), [key labor economic indicators](https://statdb.mol.gov.tw/html/mon/21010.htm)                      | Mean 2012–2025; median 2020–2025                |
| Working hours                          | [Key labor economic indicators](https://statdb.mol.gov.tw/html/mon/21010.htm), DGBAS table 10                                                                                     | All employees 2012–2025; by industry 2021–2025  |
| Unemployment rate                      | [Monthly bulletin of labor statistics, table 2-5](https://statdb.mol.gov.tw/html/mon/22050.htm)                                                                                   | Annual average 2012–2025                        |
| Minimum wage, CPI annual change        | [Key labor economic indicators](https://statdb.mol.gov.tw/html/mon/21010.htm), [minimum wage announcements](https://www.mol.gov.tw/1607/28162/28166/28180/70460/76761/76833/post) | Annual series 2012–2025; standard in force 2026 |
| Migrant workers                        | [Monthly bulletin of labor statistics, table 12-3](https://statdb.mol.gov.tw/html/mon/212030.htm)                                                                                 | Year-end 2012–2025                              |
| Age structure of registered population | [Ministry of the Interior household statistics, December 2025](https://www.moi.gov.tw/News_Content.aspx?n=9&s=335870&sms=9009)                                                    | End of 2025                                     |
| Births, crude birth rate               | [Department of Household Registration annual downloads](https://www.ris.gov.tw/info-popudata/app/awFastDownload/toMain_panel), "births and crude birth rate" ODS                  | 2012–2025, by registration date                 |

### Files

- `data/raw/` keeps the official source files. `data/sources.json` keeps the
  address, download time, and SHA-256 of each one. A published release can
  contain monthly figures; cleaning extracts complete years only.
- `data/clean.json` is the dataset the application reads, and
  `data/validation.json` records the validation results.
- `public/data/labor.csv` and `labor.json` are the downloads. The `row` and
  `column` fields of the CSV are **1-based** spreadsheet coordinates. A value
  that no source provides leaves its coordinates empty, and the minimum wage
  announcements are HTML, so they carry no invented spreadsheet coordinates.

### Methodology

- Earnings cover all employees on the payroll of industry and services,
  including foreign nationals and part-time employees, with no inflation
  adjustment. Means for 2012 to 2019 come from the official historical
  indicators. The median table of this release reaches back only to 2020;
  earlier medians stay `null` with `not-in-source` and must not be read as zero
  or interpolated. The 2019 survey widened its industry coverage, which matters
  for a long comparison.
- Working hours are the annual average of total monthly hours per person, in
  hours. They are not the sum of the hours of a whole year.
- The annual minimum wage is the year-end standard, and the announcement in
  force sits separately in `currentMinimum`. The CSV separates the two with
  `minimumPolicy` and `effective-date`, so no incomplete year enters the annual
  chart.
- Migrant workers in Taiwan = valid employment permits + expired employment
  permits. The breakdown by nationality covers valid permits only. Each year
  validates that the total matches the subtotals by industry and by
  nationality.
- The birth measure is the **annual crude birth rate (‰)**: births registered
  in the year divided by the mid-year population, times 1,000. It is neither
  the average number of children per woman nor a month annualized. 2025 had
  107,812 births and a rate of 4.62‰. The 2012 registered count is 229,481 and
  must not be mixed with the 234,599 counted by date of occurrence.
- The population distribution is the registered population. It cannot be read
  as a distribution of employment. Percentages come from the raw counts.

## Stories

`data/stories.json` holds **31 records**: 19 from the original work and 12 new
ones. The new records run from 2019 to the 2026 delivery-worker act; the 2018
event was already in the original.

Every record carries a summary, a narrative, its sources, and a check date. An
original record also keeps its full text, its original date, and its image
credit, which the reading panel can expand. `data/stories-original.json` holds
the 19 raw records taken from the CSV of the old site, with only accidental
control characters removed. `public/data/stories.json` is the downloadable set
and stays identical to the editing file.

Corrections cover Haymarket on 1886-05-04, the 22K programme in 2009,
TransAsia Airways on 2016-11-22, and the freeway crash on 2018-04-23, among
others. A date that could not be confirmed drops to a year or a period, and a
disputed claim stays separate from the facts.

The original image credits and addresses stay in the data. Card faces use
issue illustrations generated with GPT Image and are not records of the events.
The 16 illustrations live in `public/illustrations/` with a `-v2.webp` suffix,
and each record selects one through its `illustration` field. They use opaque
watercolour and risograph texture in off-white, brick red, ochre, olive, and
charcoal, and no original reference image served as generation input. The full
prompts are in `data/illustration-prompts.json`. Images load lazily, and the
reading panel shows them at full aspect ratio.

## Data maintenance

```sh
python -m venv .venv
.venv/bin/pip install -r scripts/requirements.txt
npm run data:build
npm test
```

`data:build` is fully offline and reproducible. `data:fetch` downloads the
latest ODS from the earnings listing, the current monthly bulletin of labor
statistics, and the population and employment releases pinned for this
snapshot. Moving to a new release means replacing the population and employment
release URLs, the check date, and the published-value assertions, then checking
the headers and preliminary values before the rebuild. Those assertions exist to
stop a new release from entering the site under the old labels.

The DGBAS attachment host `ws.dgbas.gov.tw` served an incomplete TLS
certificate chain at download time. The fetch script verifies TLS by default;
pass `--allow-incomplete-dgbas-chain` to skip verification for that attachment
host alone, and only to reproduce this problem. The hashes of the raw files
record a version for reproduction. They are not an independent signature of the
source.

```sh
npm run data:fetch -- --allow-incomplete-dgbas-chain
npm run data:build
npm test
```

## Deployment

The site runs on Cloudflare Workers. `wrangler.jsonc` sets the Worker name and
`nodejs_compat`, and `@cloudflare/vite-plugin` runs both development and
preview in workerd. `npm run build` writes the static assets and the
prerendered HTML to `dist/client/` and the Worker to `dist/server/`. Any static
host can serve `dist/client/` on its own.

```sh
npx wrangler login
npm run deploy      # build, then wrangler deploy
npm run cf-typegen  # generate binding types
```

## SEO

`src/lib/seo.ts` holds the title, description, canonical address, and JSON-LD
(`WebSite`, `WebPage`, `Dataset`, `Person`). The `dateModified` of `Dataset`
comes from the check date in `data/clean.json` and `isBasedOn` from the source
list, so both follow a data update. Set `VITE_SITE_URL` to the address of the
deployment.

The share image is `public/og-cover.png` (1200×630). Regenerate it after a
change to the wordmark, the fist, or the tagline:

```sh
npm run build:og
```

Update the `lastmod` of `public/sitemap.xml` together with the check date.
`public/robots.txt` takes effect only when the site sits at the root of a
domain.

## Credits

The 2015 original was produced by Kalan and designed by Peter and Kalan. This
release replaces the expired statistics with new annual data and keeps the
original stories complete. The old code and photographs remain in the Git
history; the old Webpack bundle and the third-party social scripts no longer
load.
