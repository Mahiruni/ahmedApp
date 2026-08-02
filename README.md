# BILOO Super App

A responsive multi-service MVP for Ethiopian mobility and commerce. The application combines food delivery, taxi booking, supermarket shopping, construction materials, and car parts in one interface.

## Included workspaces

- Customer ordering, cart, checkout, taxi booking, GPS fallback, notifications, and order tracking
- Driver availability, job acceptance, route state, completion, earnings, and demand view
- Vendor order progression, store availability, and inventory alerts
- Admin performance metrics, incident management, and operations controls
- PostgreSQL production schema draft and architecture documentation

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`. The full application is available at both `/` and `/biloo`.

## Production integrations

The MVP uses local browser persistence and simulated tracking. Configure the environment placeholders in `.env.example` before connecting authentication, PostgreSQL/Supabase, payment processing, maps, dispatch, and push notifications.
