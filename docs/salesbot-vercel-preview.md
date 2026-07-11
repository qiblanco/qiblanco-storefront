# QiBlanco Storefront Preview with Salesbot

This branch is a preview-only integration of the new Salesbot into the real
QiBlanco Hydrogen storefront. It must not be deployed to Shopify Oxygen or used
to modify the live storefront without separate approval.

## Architecture

```text
Vercel: current Hydrogen storefront preview
  -> embeds /widget/embed from the Salesbot origin
  -> widget UI and chat API stay on the Salesbot origin
  -> production target for the Salesbot origin is Christians Hetzner server
```

The existing Gorgias widget and tracking scripts remain disabled on preview
hosts unless `PUBLIC_ENABLE_TRACKING_IN_PREVIEW=true` is set deliberately.

## Local verification

1. Start the Salesbot on `http://localhost:3001`.
2. Copy `.env.salesbot-preview.example` to `.env` and fill only approved local
   Storefront API values. Never commit `.env`.
3. Keep `PUBLIC_SALESBOT_WIDGET_ORIGIN` set to `http://localhost:3001`.
4. Run `npm install`, then `npm run dev -- --port 3002`.
5. Open `http://localhost:3002` and verify homepage plus product pages on
   desktop and mobile.

Without approved Storefront API values Hydrogen can fall back to mock data;
that is sufficient for a build check, not for visual acceptance.

## Vercel preparation

Link this worktree to the existing `qiblanco-storefront-preview` Vercel project.
Set the Storefront variables from the approved Preview environment and set:

```text
PUBLIC_ENABLE_TRACKING_IN_PREVIEW=false
PUBLIC_SALESBOT_WIDGET_ENABLED=true
PUBLIC_SALESBOT_WIDGET_ORIGIN=https://<salesbot-domain>
PUBLIC_SALESBOT_WIDGET_TENANT_ID=tenant_qiblanco
PUBLIC_SALESBOT_WIDGET_PROJECT_ID=project_qiblanco_sales
PUBLIC_SALESBOT_WIDGET_PLACEMENT=right
PUBLIC_SALESBOT_WIDGET_INITIAL_OPEN=false
```

Do not point the preview to the obsolete
`qiblanco-salesbot-demo.vercel.app` backend. The public Salesbot URL must use the
final tested release with persistent storage, preferably on Hetzner.

## Acceptance criteria

- The preview uses the current Hydrogen storefront code and real preview data.
- Existing Gorgias is absent; the new Salesbot is the only chat launcher.
- Homepage and QiOne, QiBracelet, QiHome and Cacao product routes render.
- Product questions send the current page URL and product handle to the bot.
- Widget opens, sends, scrolls and closes correctly at 390 px and desktop width.
- Product links in answers point to `https://qiblanco.com`, not the preview.
- Response headers contain `X-Robots-Tag: noindex, nofollow`.

## Current external blocker

The storefront preview can render without OpenAI credit, but chat generation and
the final automated quality gates require funded provider access. Do not call a
preview customer-ready until the provider balance is restored and the complete
Salesbot gate suite has passed.
