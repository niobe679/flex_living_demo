const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');
const dotenv = require("dotenv");
dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

const DATA_DIR = path.join(__dirname, '..', 'data');
const HOSTAWAY_MOCK = path.join(DATA_DIR, 'hostaway-mock.json');
const REVIEWS_DB = path.join(DATA_DIR, 'reviews.db.json');


function slugify(text = '') {
  return text.toString().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

function normalizeHostawayArray(arr = []) {
  return arr.map(r => {
    const categories = (r.reviewCategory || []).map(c => ({ category: c.category, rating: c.rating }));
    let rating = r.rating;
    if (rating == null) {
      const vals = categories.map(c => c.rating).filter(v => typeof v === 'number');
      rating = vals.length ? Math.round(vals.reduce((a,b)=>a+b,0)/vals.length) : null;
    }
    const submittedAt = r.submittedAt ? new Date(r.submittedAt).toISOString() : new Date().toISOString();
    const listingId = slugify(r.listingName || 'unknown-listing');

    return {
      id: r.id,
      type: r.type || null,
      status: r.status || null,
      rating,
      publicReview: r.publicReview || '',
      categories,
      submittedAt,
      guestName: r.guestName || '',
      listingName: r.listingName || 'Unknown',
      listingId,
      channel: 'hostaway',
      approved: false
    };
  });
}

async function ensureDB() {
  try {
    // if db exists, return it
    const dbRaw = await fs.readFile(REVIEWS_DB, 'utf8');
    return JSON.parse(dbRaw);
  } catch (e) {
    // build db from mock if not present
    const raw = await fs.readFile(HOSTAWAY_MOCK, 'utf8');
    const parsed = JSON.parse(raw);
    const norm = normalizeHostawayArray(parsed.result || []);
    await fs.writeFile(REVIEWS_DB, JSON.stringify(norm, null, 2));
    return norm;
  }
}

async function saveDB(reviews) {
  await fs.writeFile(REVIEWS_DB, JSON.stringify(reviews, null, 2));
}

/**
 * GET /api/reviews/hostaway
 * Returns normalized reviews (this route will be tested)
 */
app.get('/api/reviews/hostaway', async (req, res) => {
  try {
    const reviews = await ensureDB();
    // return sorted newest first
    reviews.sort((a,b) => new Date(b.submittedAt) - new Date(a.submittedAt));
    res.json({ status: 'ok', data: reviews });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: 'error', message: 'Failed to load reviews' });
  }
});

/**
 * POST /api/reviews/approve
 * Body { id: <number>, approved: true|false }
 */
app.post('/api/reviews/approve', async (req, res) => {
  const { id, approved } = req.body;
  if (typeof id === 'undefined') return res.status(400).json({ status: 'error', message: 'id required' });
  try {
    const reviews = await ensureDB();
    const idx = reviews.findIndex(r => r.id === id);
    if (idx === -1) return res.status(404).json({ status: 'error', message: 'review not found' });
    reviews[idx].approved = !!approved;
    await saveDB(reviews);
    res.json({ status: 'ok', data: reviews[idx] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: 'error', message: 'Failed to update review' });
  }
});

/**
 * GET /api/reviews/approved?listingId=slug
 */
app.get('/api/reviews/approved', async (req, res) => {
  const { listingId } = req.query;
  try {
    const reviews = await ensureDB();
    const filtered = reviews.filter(r => r.approved && (!listingId || r.listingId === listingId));
    res.json({ status: 'ok', data: filtered });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: 'error', message: 'Failed to load approved reviews' });
  }
});
app.get("/api/reviews/live", async (req, res) => {
    console.log("Fetching live reviews from Flex API...", process.env.FLEX_ACCOUNT_ID, process.env.FLEX_API_KEY);
  try {
    const response = await fetch(
      `https://api.flexliving.com/v1/accounts/${process.env.FLEX_ACCOUNT_ID}/reviews`,
      {
        headers: {
          Authorization: `Bearer ${process.env.FLEX_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const data = await response.text();
    console.log("Received live reviews:", data);
    res.json({ status: "ok", data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: "error", message: "Failed to fetch reviews" });
  }
});
// Optional: list of listings for filters
app.get('/api/listings', async (req, res) => {
  try {
    const reviews = await ensureDB();
    const unique = [...new Map(reviews.map(r => [r.listingId, r])).values()];
    res.json({ status: 'ok', data: unique.map(r => ({ listingId: r.listingId, listingName: r.listingName })) });
  } catch (err) {
    res.status(500).json({ status: 'error' });
  }
});
// Get a specific listing by ID
app.get('/api/listing', async (req, res) => {
  try {
    //const { id } = req.params;
    const { listingId } = req.query;
    const reviews = await ensureDB();
    console.log('Fetching listing for ID:', listingId);
    // find reviews belonging to this listing
    const listingReviews = reviews.filter(r => r.listingId === listingId);

    if (listingReviews.length === 0) {
      return res.status(404).json({ status: 'not_found', message: 'Listing not found' });
    }

    // derive listing details from reviews
    const sample = listingReviews[0];
    const listing = {
      listingId: sample.listingId,
      listingName: sample.listingName,
      totalReviews: listingReviews.length,
      avgRating:
        listingReviews.reduce((sum, r) => sum + (r.rating || 0), 0) /
        (listingReviews.filter(r => r.rating != null).length || 1),
      // optional: add amenities, location, etc. if stored in reviews
    };

    res.json({ status: 'ok', data: listing });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: 'error', message: 'Server error' });
  }
});


const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Backend running on port:${PORT}`));