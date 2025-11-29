# Aqualink Firebase Backend Setup

## Prerequisites
- Node.js and npm installed
- Firebase CLI installed (`npm install -g firebase-tools`)
- Logged in to Firebase CLI (`firebase login`)
- Your Firebase project initialized (`firebase use --add`)

## Setup Steps

1. Open a terminal and navigate to the `firebase` directory:
   ```sh
   cd firebase
   ```
2. Install dependencies:
   ```sh
   npm install
   ```
3. Deploy Firestore indexes, rules, and Cloud Functions:
   ```sh
   npm run deploy
   ```

This will deploy:
- Firestore indexes (firestore.indexes.json)
- Firestore security rules (firestore.rules)
- Cloud Functions (functions.js)

## Notes
- Make sure your `google-services.json` is in your React Native app's `android/app/` directory.
- Media uploads (images/videos) are handled client-side using Firebase Storage SDK.
- Cloud Functions are callable from your app using Firebase Functions SDK.
