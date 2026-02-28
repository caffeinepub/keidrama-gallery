# KeiDrama Gallery

## Current State
New project. No existing code.

## Requested Changes (Diff)

### Add
- User authentication: each user logs in and gets their own personal gallery
- Personal drama gallery: users can upload videos and photos of K-dramas they have watched
- For each drama entry: title, uploaded media (photos/videos), star rating (1-5), "what I liked" text, "what I didn't like" text
- Gallery view: grid of drama cards showing cover image/video thumbnail, title, rating, and quick like/dislike summary
- Detail view: full drama page with all media, rating, and liked/disliked notes
- On first app load: prompt users for permission to create their personal gallery (authorization gate)
- Users can only view and manage their own gallery (not other users')
- Edit and delete drama entries

### Modify
- Nothing (new project)

### Remove
- Nothing (new project)

## Implementation Plan
1. Backend:
   - User authorization (each user has their own data namespace)
   - Drama entry data model: id, owner, title, mediaFiles (blob references), rating (1-5), liked (text), disliked (text), createdAt
   - CRUD operations: createDrama, getDramas (own), getDrama, updateDrama, deleteDrama
   - Blob storage integration for uploading photos and videos

2. Frontend:
   - Auth gate: on load, prompt user to log in / create their gallery
   - Home/Gallery page: grid of drama cards (cover, title, stars, liked/disliked snippet)
   - Add Drama page: form with title, media upload (photos/videos), star rating selector, liked/disliked text areas
   - Drama Detail page: full media carousel/viewer, full rating and notes
   - Edit Drama page: pre-filled form to update existing entry
   - Delete confirmation dialog
