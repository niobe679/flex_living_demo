# Flex Living Reviews Dashboard – Executive Summary

This project is a full-stack Reviews Dashboard built as part of the Flex Living assessment.  

**Highlights:**
- **Tech Stack**: React (Vite) + Material UI + Ant Design for frontend, Express/Node.js for backend, Recharts for analytics.
- **Core Features**:
  - Per-property performance cards (avg rating, review count, approved count).
  - Filters by property, rating, category, date range; sorting by rating/date.
  - Approval workflow to control which reviews appear publicly.
  - Property detail page replicating Flex Living layout, including carousel & thumbnails.
- **API Integration**:
  - Hostaway Reviews API via sandbox (Account ID + API key).
  - Fallback to mock review data if sandbox unavailable.
  - REST endpoints for listings, reviews, approvals, and approved-only feeds.
- **Exploration**: Researched Google Reviews integration (via Places API). Found feasible only if Flex Living owns property Google listings.

**Deployment**:
- Frontend deployed on **Vercel**.
- Backend deployed on **Railway** (alternative: Render/Heroku).  
- Demo links included below.

**AI Tools Used**:
- This project was supported with **OpenAI’s ChatGPT (GPT-5)** for code scaffolding, debugging, and documentation drafting.  `



Flex Living Reviews Dashboard – Documentation
1. Tech Stack Used

Frontend

React (with Vite) → SPA framework for speed and modular UI

Material UI (MUI) + Ant Design (AntD) → hybrid design system for professional admin look (MUI for tables, cards, filters; AntD for layout, sidebar, and carousel)

Recharts → charts for rating trends and category breakdowns

Backend

Node.js / Express → lightweight API layer

node-fetch → fetch reviews from APIs or serve mock JSON

dotenv → environment variable management for API keys

Other

Postman → API testing

Git → version control

2. Key Design & Logic Decisions

Backend-first integration:
All external API calls (Hostaway, Google) are routed through the backend to keep API keys secure and avoid exposing secrets in React.

Mock data fallback:
Since sandbox Hostaway API can be unreliable, backend falls back to mock review JSON if live fetch fails. Ensures dashboard always works.

Filtering & sorting:
Filters include property, rating, category, and date range. Sorting supports newest/oldest and rating order. This helps managers spot trends and recurring issues quickly.

Review approval workflow:
Checkbox toggle in the dashboard allows managers to select which reviews are visible on the public property page.

Per-property performance:
Each property shows summary stats (average rating, total reviews, approved reviews), with drill-down into rating trends and categories.

Professional UI:

Admin layout with AntD’s Layout, Sider, Header.

Cards and charts styled with MUI for readability.

Carousel + thumbnails for property display page to replicate Flex Living’s website style.

3. API Behaviors

Backend Endpoints Implemented

GET /api/reviews/hostaway

Tries sandbox Hostaway API with accountId + apiKey.

Falls back to mock review data if the API call fails.

POST /api/reviews/approve

Toggles review approval state (stored locally).

GET /api/listings

Returns unique listing IDs + names (derived from reviews).

GET /api/listings/:id

Returns per-listing performance (total reviews, average rating).

GET /api/reviews/approved?listingId=X

Returns approved reviews for property detail page.

Sandbox Hostaway API

Endpoint: https://sandbox.api.hostaway.com/v1/reviews

Requires both Account ID and API Key.

Behavior: returns paginated reviews.

In case of failure, fallback = mock review dataset.

4. Google Reviews Findings

Explored Feasibility:
Google Reviews can be accessed via the Google Places API using a place_id.

Limitations:

Requires billing-enabled Google Cloud account.

Only works if property has a valid Place ID in Google Maps.

API exposes limited reviews (not full history) unless you own/manage the listing.

Implementation:
Prototype backend route (/api/google-reviews/:placeId) written, but not fully integrated due to the above constraints.

Conclusion:
Google Reviews are technically feasible but impractical for a production-level integration unless Flex Living owns the properties’ Google Business listings.