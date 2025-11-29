// Firestore structure and index definitions for Aqualink
// Cast = Post, Splash = Like, Echo = Comment

// Firestore Collections:
// casts: { id, userId, text, mediaUrl, mediaType, createdAt }
// splashes: { id, castId, userId, createdAt }
// echoes: { id, castId, userId, text, createdAt }

// Storage:
// /casts/{castId}/media

// Firestore Indexes (to be added in firestore.indexes.json):
// 1. casts: order by createdAt
// 2. splashes: composite index on castId+userId
// 3. echoes: composite index on castId+createdAt

// Next: Implement Cloud Functions for posting, liking, commenting, and media upload triggers.
