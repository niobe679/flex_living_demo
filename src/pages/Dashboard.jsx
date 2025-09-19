import React, { useEffect, useState } from "react";
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Checkbox,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Stack,
} from "@mui/material";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar, Legend } from "recharts";

export default function Dashboard() {
  const [reviews, setReviews] = useState([]);
  const [listings, setListings] = useState([]);
  const [filters, setFilters] = useState({
    listingId: "",
    minRating: "",
    category: "",
    startDate: "",
    endDate: "",
    sort: "newest",
  });
  const [loading, setLoading] = useState(true);
  const baseUrl = process.env.REACT_APP_API_URL;

  async function load() {
    setLoading(true);
    const res = await fetch(`${baseUrl}/api/reviews/hostaway`);
    const json = await res.json();
    setReviews(json.data || []);
    const listRes = await fetch(`${baseUrl}/api/listings`);
    const listJson = await listRes.json();
    setListings(listJson.data || []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function toggleApprove(review) {
    await fetch(`${baseUrl}/api/reviews/approve`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: review.id, approved: !review.approved }),
    });
    await load();
  }

  const filtered = reviews
    .filter((r) => {
      if (filters.listingId && r.listingId !== filters.listingId) return false;
      if (filters.minRating && (r.rating === null || r.rating < Number(filters.minRating))) return false;
      if (filters.category && !r.categories.some((c) => c.category.includes(filters.category))) return false;
      if (filters.startDate && new Date(r.submittedAt) < new Date(filters.startDate)) return false;
      if (filters.endDate && new Date(r.submittedAt) > new Date(filters.endDate)) return false;
      return true;
    })
    .sort((a, b) => {
      if (filters.sort === "highest") return (b.rating || 0) - (a.rating || 0);
      if (filters.sort === "lowest") return (a.rating || 0) - (b.rating || 0);
      if (filters.sort === "oldest") return new Date(a.submittedAt) - new Date(b.submittedAt);
      return new Date(b.submittedAt) - new Date(a.submittedAt);
    });

  const grouped = reviews.reduce((acc, r) => {
    acc[r.listingId] = acc[r.listingId] || { name: r.listingName, reviews: [] };
    acc[r.listingId].reviews.push(r);
    return acc;
  }, {});

  const ratingOverTime = filtered.map((r) => ({
    date: new Date(r.submittedAt).toLocaleDateString(),
    rating: r.rating,
  }));

  const categoryCounts = filtered.reduce((acc, r) => {
    (r.categories || []).forEach((c) => {
      acc[c.category] = (acc[c.category] || 0) + 1;
    });
    return acc;
  }, {});
  const categoryData = Object.entries(categoryCounts).map(([cat, count]) => ({ category: cat, count }));

  return (
    <Box>
      {/* Summary Cards */}
      <Grid container spacing={3} mb={4}>
        {Object.values(grouped).map((g) => {
          const avg =
            g.reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / g.reviews.length || 0;
          const approvedCount = g.reviews.filter((r) => r.approved).length;
          return (
            <Grid item xs={12} sm={6} md={4} key={g.name}>
              <Card elevation={2}>
                <CardContent>
                  <Typography variant="h6">{g.name}</Typography>
                  <Typography variant="body2">⭐ Avg Rating: {avg.toFixed(1)}</Typography>
                  <Typography variant="body2">📝 Reviews: {g.reviews.length}</Typography>
                  <Typography variant="body2">✅ Approved: {approvedCount}</Typography>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 4 }} elevation={1}>
        <Typography variant="subtitle1" mb={2}>Filters</Typography>
        <Stack direction="row" spacing={2} flexWrap="wrap">
          <FormControl size="small" sx={{ minWidth: 160 }}>
            <InputLabel>Property</InputLabel>
            <Select
              value={filters.listingId}
              label="Property"
              onChange={(e) => setFilters({ ...filters, listingId: e.target.value })}
            >
              <MenuItem value="">All</MenuItem>
              {listings.map((l) => (
                <MenuItem key={l.listingId} value={l.listingId}>{l.listingName}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 160 }}>
            <InputLabel>Sort</InputLabel>
            <Select
              value={filters.sort}
              label="Sort"
              onChange={(e) => setFilters({ ...filters, sort: e.target.value })}
            >
              <MenuItem value="newest">Newest</MenuItem>
              <MenuItem value="oldest">Oldest</MenuItem>
              <MenuItem value="highest">Highest Rating</MenuItem>
              <MenuItem value="lowest">Lowest Rating</MenuItem>
            </Select>
          </FormControl>
          <TextField size="small" type="number" label="Min Rating" value={filters.minRating}
            onChange={(e) => setFilters({ ...filters, minRating: e.target.value })} />
          <TextField size="small" label="Category" value={filters.category}
            onChange={(e) => setFilters({ ...filters, category: e.target.value })} />
          <TextField size="small" type="date" label="Start Date" InputLabelProps={{ shrink: true }}
            value={filters.startDate} onChange={(e) => setFilters({ ...filters, startDate: e.target.value })} />
          <TextField size="small" type="date" label="End Date" InputLabelProps={{ shrink: true }}
            value={filters.endDate} onChange={(e) => setFilters({ ...filters, endDate: e.target.value })} />
        </Stack>
      </Paper>

      {/* Reviews Table */}
      {loading ? (
        <CircularProgress />
      ) : (
        <TableContainer component={Paper} sx={{ mb: 4 }} elevation={1}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Approve</TableCell>
                <TableCell>Property</TableCell>
                <TableCell>Guest</TableCell>
                <TableCell>Rating</TableCell>
                <TableCell>Review</TableCell>
                <TableCell>Date</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.map((r) => (
                <TableRow key={r.id} hover>
                  <TableCell>
                    <Checkbox checked={!!r.approved} onChange={() => toggleApprove(r)} />
                  </TableCell>
                  <TableCell onClick={() => window.open(`/property/${r.listingId}`, "_blank") } style={{ cursor: 'pointer' }}>{r.listingName}</TableCell>
                  <TableCell>{r.guestName}</TableCell>
                  <TableCell>{r.rating ?? "—"}</TableCell>
                  <TableCell>{r.publicReview}</TableCell>
                  <TableCell>{new Date(r.submittedAt).toLocaleDateString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Charts */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }} elevation={1}>
            <Typography variant="subtitle1" mb={2}>Ratings Over Time</Typography>
            <LineChart width={450} height={300} data={ratingOverTime}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="rating" stroke="#1976d2" />
            </LineChart>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }} elevation={1}>
            <Typography variant="subtitle1" mb={2}>Review Categories</Typography>
            <BarChart width={450} height={300} data={categoryData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="category" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="#1976d2" />
            </BarChart>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
