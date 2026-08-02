# BILOO MVP Foundation

BILOO is a multi-service platform for taxi booking, food delivery, supermarket shopping, construction-material ordering, and car-parts ordering.

This implementation establishes a functional front-end product foundation inside the existing `MahirG/biloo_group` Next.js application. It intentionally separates working experience logic from integrations that require production credentials, regulated payment setup, operational policies, and backend infrastructure.

## Implemented in this phase

### Customer experience

- Five service verticals: food, taxi, supermarket, construction, and car parts.
- Search and service-specific product discovery.
- Single-service cart rules to prevent invalid mixed-fulfillment orders.
- Quantity management and order totals.
- Checkout with wallet, online-payment, and cash-on-delivery choices.
- Taxi pickup, destination, ride-class selection, and fare estimate.
- Browser GPS permission flow with a safe saved-address fallback.
- New order creation, notifications, and live-tracking simulation.
- Local persistence for cart, role, selected service, orders, notifications, vendor queues, and incidents.

### Driver experience

- Online and offline availability.
- Nearby taxi and delivery jobs.
- Job acceptance and active-job navigation state.
- Completion workflow with earnings and completed-job updates.
- Demand heat-map experience.

### Vendor experience

- Store open and closed state.
- Live order queue.
- Order progression: New → Accepted → Preparing → Ready → Dispatched.
- Sales, order, acceptance, and preparation summaries.
- Low-stock inventory attention queue.

### Admin experience

- Gross order value, order volume, driver supply, and incident metrics.
- Service-volume comparison across all five verticals.
- Operational incident queue with resolution actions.
- Campaign and reporting action surfaces.

### Platform foundation

- Responsive desktop and mobile layouts.
- Route-specific metadata for `/biloo`.
- Health endpoint at `/api/biloo/health`.
- Strict TypeScript component structure.
- Accessible labels, buttons, drawers, and modal controls.

## Current data behavior

The experience is interactive and stateful, but it currently persists to browser `localStorage`. This is appropriate for validating workflows and visual behavior before connecting irreversible production systems.

It does **not** yet create real charges, dispatch real drivers, send push notifications, or store orders in a shared cloud database.

## Production architecture

### Applications

1. **Customer mobile app** — Flutter or React Native for Android and iOS.
2. **Driver/delivery mobile app** — background location, navigation, job dispatch, and proof of delivery.
3. **Vendor app** — mobile-first order and inventory operations.
4. **Admin dashboard** — Next.js web application with role-based access.
5. **Public and support web surfaces** — onboarding, policies, help center, and vendor acquisition.

The current Next.js implementation is the shared product prototype and web/PWA foundation. It can remain the admin and web customer experience while native mobile clients are added against the same API.

### Backend modules

- Identity and role management.
- Customer profiles and saved addresses.
- Vendor, branch, catalog, inventory, and pricing.
- Cart, order, order-item, and fulfillment state machines.
- Driver onboarding, documents, vehicles, availability, and assignment.
- Taxi quotes, trips, fare rules, and cancellation rules.
- Location ingestion, live driver position, and tracking subscriptions.
- Payment intents, wallet ledger, refunds, reconciliation, and webhooks.
- Notifications and communication preferences.
- Promotions, referral codes, commissions, and payouts.
- Support tickets, disputes, incidents, and audit logs.

### Core order state machine

`draft → quoted → payment_pending → confirmed → vendor_accepted → preparing → ready_for_pickup → driver_assigned → picked_up → in_transit → delivered`

Terminal states:

- `cancelled_by_customer`
- `cancelled_by_vendor`
- `cancelled_by_driver`
- `failed`
- `refunded`

Taxi trips use a related state machine:

`quote_requested → quoted → requested → driver_assigned → driver_arriving → driver_waiting → in_trip → completed`

### Security requirements

- Authorization must be enforced by the backend, not by visible UI roles.
- Customer, vendor, driver, support, finance, and admin permissions must be distinct.
- Payment secret keys and webhook secrets must never enter browser bundles.
- Every payment webhook must be authenticated, idempotent, and reconciled.
- Driver location must be retained only for a documented operational period.
- Sensitive profile and document access must be audited.
- Vendor and driver approval must be separated from self-entered profile metadata.
- Rate limiting, device/session controls, fraud signals, and abuse monitoring are required before public launch.

## Integration boundaries

### Maps and GPS

Production requires a selected map provider for:

- Address autocomplete and geocoding.
- Route calculation and ETA.
- Driver navigation.
- Service zones and geofencing.
- Live location display.
- Distance-based delivery and taxi pricing.

The browser geolocation flow in the current build validates permission and fallback behavior; it is not a replacement for a production tracking service.

### Online payments

The checkout user experience is implemented, but real payment processing requires:

- A selected payment provider and merchant account.
- Server-side payment-intent creation.
- Signed webhook verification.
- Idempotent order confirmation.
- Refund, cancellation, timeout, and reconciliation handling.
- A double-entry wallet ledger if BILOO Wallet is enabled.

### Notifications

Production notifications should support:

- Push notifications for Android and iOS.
- In-app notification history.
- SMS fallback for critical events.
- Notification preferences and quiet-hour rules.
- Template localization.

## Next engineering milestone

1. Confirm the launch city, service zones, pricing rules, commissions, and payment provider.
2. Provision the production database and authentication project.
3. Implement the shared API and role-based authorization.
4. Replace local persistence with authenticated server data.
5. Connect map search, routing, geofencing, and live driver location.
6. Connect payment intents and verified webhooks.
7. Add vendor and driver onboarding/document verification.
8. Run security, performance, operational, and store-release testing.
