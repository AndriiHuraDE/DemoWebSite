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
- **Shop:** separate `shop.html` page with fictional hair-care products and digital vouchers, product details, size/value variants, search, category filters, sorting, cart, quantity controls, pickup/delivery selection and checkout. The homepage shows three featured products and links to the full shop. Delivery fees are calculated from physical products only; digital vouchers are marked for demo email delivery.
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
