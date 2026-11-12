# SÉLYS Hair & Beauty — Demo Website

A local, interactive demonstration website for a fictional hair salon in Münster. This is a demo, not a production booking system or online shop.

## Run locally

Use a local web server (do not open `index.html` directly):

```bash
python -m http.server 8000
```

Then open `http://localhost:8000` in your browser.

## Pages

- `index.html` — salon homepage with services, team, gallery, Google Reviews-style demo widget, Instagram preview, blog, FAQ, three featured products, booking and contact sections.
- `shop.html` — separate full demo shop with product catalogue, filters, product details, cart and checkout. The homepage links to the shop and featured products can open their detail directly.

## Demo behaviour

- **Booking:** service, eligible team member, opening day, time slot and confirmation. Availability uses the fictional staff schedules and locally saved demo bookings. Demo bookings can be reviewed, cancelled or rescheduled in the browser.
- **Shop:** separate `shop.html` page with fictional hair-care products and digital vouchers, product details, size/value variants, search, category filters, sorting, cart, quantity controls, pickup/delivery selection and checkout. The homepage shows four compact featured products with category badges, a primary Buy action and a separate Details action, plus a link to the full shop. Delivery fees are calculated from physical products only; digital vouchers are marked for demo email delivery.
- **Storage:** demo bookings, cart and demo orders use browser `localStorage`. No booking or shop checkout is transmitted to a salon or payment provider. Contact details and delivery addresses entered during demo booking/checkout are not persisted in the saved demo records.
- **Newsletter:** validates the address in the browser but does not send or store it.
- **WhatsApp preview:** a floating button and hero button open the same scripted demo chat. It is not a real WhatsApp connection and is not an AI assistant.
- **Instagram / social links:** visual Instagram integration preview with demo images; footer links include Instagram, Facebook, TikTok and LinkedIn. No social API is connected.
- **Google Reviews:** Google Maps-style integration preview with sample review cards. It is explicitly marked as demo content and is not connected to a real Google Business Profile.
- **B2B contact form:** this is separate from the local demo booking and uses the configured Web3Forms/hCaptcha flow. It requires a hosted HTTPS deployment and a valid configuration.
- **Payments:** simulated only. No money is collected and no card data should be entered.
- **Gallery:** three items are initially visible; additional hairstyles can be expanded with “Show more”.
- **Languages:** German and English for the homepage and separate shop page. The legal pages remain in German and must be reviewed for a real deployment.

## Demo data and deployment checks

Before publishing a real salon website, replace the fictional salon identity, address, phone, email, services, prices, team, schedules, social profiles, product catalogue, images and structured data. Review the legal pages, privacy disclosures, photo permissions, provider contracts and the actual payment/booking integrations. The demo must not be presented as accepting real appointments, orders or payments.

## External resources

The site loads Tailwind CSS, Google Fonts, Google Maps embed and Pexels-hosted images from external providers. An internet connection is required for these resources. Review consent, privacy and local hosting requirements before production use.

See `STOCK_PHOTO_LICENSES.md` for the demo image register and unresolved provenance items.


## Product catalogue maintenance

The current demo catalogue is defined centrally in `js/site-data.js` (`products` array). Product cards, the home-page featured selection, search, filtering, pagination, variants, cart totals and checkout all read from this one data source. To add or update a product, edit that record rather than changing page markup. Product images are referenced through the `photo()` helper and must be recorded in `STOCK_PHOTO_LICENSES.md`.

The catalogue currently contains 12 demo products and the shop displays six products per page (two pages before filtering). The home page shows four compact featured cards with a primary Buy action and a secondary Details action. Both actions open the selected product in the separate shop page; Buy opens the purchase dialog so the visitor can choose the correct size/value and quantity before adding it to the cart. Details opens the same product detail dialog for browsing.

For a future editable spreadsheet workflow, keep product content in a table (one row per product, with a separate variants table for sizes/prices) and image files in object storage/CDN. A simple export can generate a versioned `products.json` for a static demo. For production and multiple salon tenants, use a database with access controls and a separate image bucket rather than exposing a private spreadsheet directly to browsers.


## Future product table and image storage

The current demo deliberately keeps the product catalogue in one central `products` array in `js/site-data.js`; no external database connection is configured. This keeps the demo deterministic and easy to run locally.

A future editable catalogue can use one row per product with fields such as `id`, `active`, `category`, `name_de`, `name_en`, `description_de`, `description_en`, `badge`, `featured`, `sort_order`, `image_path` and `alt_de` / `alt_en`. Keep sizes or voucher values in a related variants table with `product_id`, `variant_id`, `label_de`, `label_en` and `price`.

Store image files in a file/object-storage service or in the static `img/products/` directory for a small deployment; store only the image path or URL in the product row. Do not store image binaries inside spreadsheet cells or database product rows.

For a small team editing a catalogue, Google Sheets can be the editing table and a controlled export can generate a versioned `products.json` file for the static website. The Google Sheets API supports reading ranges and batch reads. Do not expose a private spreadsheet or service credentials directly in browser code; use a controlled Apps Script/backend endpoint or publish only intentionally public catalogue data.

For a multi-salon SaaS, the stronger long-term option is PostgreSQL (for example, Supabase) for product and variant records, with tenant ownership and Row Level Security; keep image files in Supabase Storage or a dedicated image CDN such as Cloudinary. Supabase documents its database as a full Postgres database with a Table Editor, while Storage keeps media objects outside the database and supports access policies. This is the recommended production direction, not an integration included in this demo.


## Booking demo availability

The calendar covers all salon working days in the next 14 days (Monday–Saturday; Sunday is closed). A small set of clearly demo-only busy slots is generated to make availability realistic; these sample holds are not shown as the visitor's own appointments and do not represent real bookings. New appointments created by the visitor are stored locally in this browser only.

The Journal / ‘Inspiration & Haarpflege’ section has been removed from this demo.
