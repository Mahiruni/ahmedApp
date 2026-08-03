# BILOO Google Maps setup — Addis Ababa and surrounding areas

BILOO uses Google Maps Platform for the taxi and mobility workflow because the
current Ethiopia coverage includes map tiles, geocoding, traffic, driving
routes, and walking routes.

## Google Cloud configuration

Create or select a Google Cloud project with billing enabled, then enable:

1. Maps JavaScript API
2. Places API (New)
3. Routes API

Create a browser API key and set it as:

```bash
NEXT_PUBLIC_BILOO_MAP_PROVIDER=google
NEXT_PUBLIC_BILOO_MAPS_KEY=your_restricted_browser_key
```

Add the same values to the Production, Preview, and Development environments of
the `gulitshop/ahmed-app` Vercel project as appropriate.

## Required key restrictions

Use **Websites / HTTP referrers** as the application restriction. Allow only the
real BILOO origins, for example:

```text
https://your-production-domain.example/*
https://*.vercel.app/*
http://localhost:3000/*
```

After the permanent production domain is active, replace broad preview patterns
with the smallest practical allowlist.

Use **API restrictions** and permit only:

- Maps JavaScript API
- Places API (New)
- Routes API

Never commit the key to GitHub and never reuse a server key in the browser.

## Product behavior

The integration provides:

- Google Place Autocomplete restricted to Ethiopia.
- Search results biased to a 90 km radius around central Addis Ababa.
- Device GPS pickup using high-accuracy browser geolocation.
- Reverse geocoding for the detected pickup point.
- Traffic-aware driving routes using the current Routes library.
- Route polyline, viewport fitting, distance, and ETA.
- Live traffic overlay where Google traffic data is available.
- A safe text-input and map-placeholder fallback when the key is unavailable.

## Production verification

After adding the Vercel environment variable:

1. Redeploy the latest `main` commit.
2. Open the Taxi service.
3. Search for `Bole Medhanialem`, `Mexico Square`, and `Bishoftu`.
4. Tap the GPS button and grant precise location permission.
5. Confirm the map draws the route and shows distance and traffic-aware ETA.
6. Test on both Android Chrome and iPhone Safari.
7. Check Google Cloud usage quotas and configure billing alerts.
