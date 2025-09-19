// import React, { useEffect, useState } from "react";
// import { useParams, Link } from "react-router-dom";
// import { Box, Typography, Card, CardContent, Paper, Button } from "@mui/material";

// export default function PropertyPage() {
//   const { listingId } = useParams();
//   const [reviews, setReviews] = useState([]);

//   useEffect(() => {
//     async function load() {
//       const res = await fetch(`http://localhost:4000/api/reviews/approved?listingId=${listingId}`);
//       const json = await res.json();
//       setReviews(json.data || []);
//     }
//     load();
//   }, [listingId]);

//   return (
//     <Box>
//       <Button component={Link} to="/" variant="outlined" sx={{ mb: 2 }}>
//         ← Back to Dashboard
//       </Button>
//       <Typography variant="h4" gutterBottom>
//         Property Reviews
//       </Typography>
//       {reviews.length === 0 ? (
//         <Paper sx={{ p: 3, mt: 2 }}>No approved reviews yet.</Paper>
//       ) : (
//         reviews.map((r) => (
//           <Card key={r.id} sx={{ mb: 2 }} elevation={2}>
//             <CardContent>
//               <Typography variant="subtitle1">{r.guestName}</Typography>
//               <Typography variant="body2" color="text.secondary">
//                 {new Date(r.submittedAt).toLocaleDateString()} • ⭐ {r.rating ?? "—"}
//               </Typography>
//               <Typography variant="body1" sx={{ mt: 1 }}>
//                 {r.publicReview}
//               </Typography>
//             </CardContent>
//           </Card>
//         ))
//       )}
//     </Box>
//   );
// }

//NB: better
// import React, { useEffect, useState } from "react";
// import { useParams, Link } from "react-router-dom";
// import { Box, Typography, Card, CardContent, Button } from "@mui/material";

// export default function PropertyPage() {
//   const { listingId } = useParams();
//   const [reviews, setReviews] = useState([]);

//   useEffect(() => {
//     async function load() {
//       const res = await fetch(`http://localhost:4000/api/reviews/approved?listingId=${listingId}`);
//       const json = await res.json();
//       setReviews(json.data || []);
//     }
//     load();
//   }, [listingId]);

//   return (
//     <Box>
//       <Button component={Link} to="/" variant="outlined" sx={{ mb: 2 }}>← Back</Button>
//       <Typography variant="h4" gutterBottom>Property Reviews</Typography>
//       {reviews.length === 0 ? (
//         <Typography>No approved reviews yet.</Typography>
//       ) : (
//         reviews.map((r) => (
//           <Card key={r.id} sx={{ mb: 2 }} elevation={2}>
//             <CardContent>
//               <Typography variant="subtitle1">{r.guestName}</Typography>
//               <Typography variant="body2" color="text.secondary">
//                 {new Date(r.submittedAt).toLocaleDateString()} • ⭐ {r.rating ?? "—"}
//               </Typography>
//               <Typography variant="body1" sx={{ mt: 1 }}>{r.publicReview}</Typography>
//             </CardContent>
//           </Card>
//         ))
//       )}
//     </Box>
//   );
// }

//NB: simpler
// src/pages/PropertyPage.jsx
import React, { useState, useEffect } from "react";
import { Box, Typography, Grid, Divider, Paper, Avatar, Rating } from "@mui/material";
import { Carousel } from "antd";
import axios from "axios";
import { useParams, Link } from "react-router-dom";

const PropertyPage = ({ propertyId }) => {
  const [property, setProperty] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const { listingId } = useParams();
  const placeholderImg =
  "https://via.placeholder.com/1200x500.png?text=No+Image+Available";

const images = Array.isArray(property?.images) && property.images.length > 0
  ? property.images
  : [placeholderImg];
  useEffect(() => {
    const fetchPropertyData = async () => {
      try {
        setLoading(true);
        // Fetch property details
        const propertyJson = await fetch(`http://localhost:4000/api/listings?listingId=${listingId}`)
        const propertyRes = await propertyJson.json();
        setProperty(propertyRes.data);
        console.log(">> ",propertyRes.data);
        // Fetch reviews for this property
        const reviewsJson = await fetch(`http://localhost:4000/api/reviews/approved?listingId=${listingId}`);
        const reviewsRes = await reviewsJson.json();
        console.log("pp ",reviewsRes.data);
        setReviews(reviewsRes.data || []);
      } catch (error) {
        console.error("Failed to fetch property data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPropertyData();
  }, [propertyId]);

  if (loading) return <Typography>Loading...</Typography>;
  if (!property) return <Typography>Property not found.</Typography>;

  return (
    <Box sx={{ p: 4, maxWidth: "1200px", margin: "0 auto" }}>
      {/* Property Title */}
      <Typography variant="h4" fontWeight="bold" mb={2}>
        {property.listingName}
      </Typography>

      {/* Carousel */}
      <Carousel autoplay>
        {images.map((img, index) => (
          <Box key={index}>
            <img
              src={typeof img === "string" ? img : img?.url || placeholderImg}
              alt={`property-${index}`}
              style={{
                width: "30%",
                height: "70px",
                objectFit: "cover",
                borderRadius: 8,
              }}
            />
          </Box>
        ))}
      </Carousel>

      {/* Property Details */}
      <Grid container spacing={3} mt={2}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Property Details
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Typography><strong>Name:</strong> {property.listingName}</Typography>
            {/* <Typography><strong>Price:</strong> ${property.price}</Typography>
            <Typography><strong>Location:</strong> {property.location}</Typography>
            <Typography><strong>Description:</strong> {property.description}</Typography> */}
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Quick Info
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Typography><strong>Bedrooms:</strong> {property.bedrooms}</Typography>
            <Typography><strong>Bathrooms:</strong> {property.bathrooms}</Typography>
            <Typography><strong>Area:</strong> {property.area} sqft</Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Reviews Section */}
      <Box mt={5}>
        <Typography variant="h5" fontWeight="bold" mb={2}>
          Reviews ({reviews.length})
        </Typography>
        <Divider sx={{ mb: 2 }} />

        <Grid container spacing={3}>
          {reviews.map((review) => (
            <Grid item xs={12} md={6} key={review.id}>
              <Paper sx={{ p: 2 }}>
                <Box display="flex" alignItems="center" mb={1}>
                  <Avatar src={review.avatar} alt={review.name} sx={{ mr: 2 }} />
                  <Box>
                    <Typography fontWeight="bold">{review.name}</Typography>
                    <Rating value={review.rating} readOnly size="small" />
                  </Box>
                </Box>
                <Typography>{review.comment}</Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Box>
  );
};

export default PropertyPage;
