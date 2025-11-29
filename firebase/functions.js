const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();
const db = admin.firestore();
const storage = admin.storage();

// Create a Cast (Post)
exports.createCast = functions.https.onCall(async (data, context) => {
  if (!context.auth) throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  const { text, mediaUrl, mediaType } = data;
  const cast = {
    userId: context.auth.uid,
    text: text || '',
    mediaUrl: mediaUrl || '',
    mediaType: mediaType || '',
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  };
  const ref = await db.collection('casts').add(cast);
  return { id: ref.id, ...cast };
});

// Splash (Like) a Cast
exports.splashCast = functions.https.onCall(async (data, context) => {
  if (!context.auth) throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  const { castId } = data;
  const splash = {
    castId,
    userId: context.auth.uid,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  };
  // Prevent duplicate splashes
  const existing = await db.collection('splashes')
    .where('castId', '==', castId)
    .where('userId', '==', context.auth.uid)
    .get();
  if (!existing.empty) throw new functions.https.HttpsError('already-exists', 'Already splashed');
  const ref = await db.collection('splashes').add(splash);
  return { id: ref.id, ...splash };
});

// Echo (Comment) on a Cast
exports.echoCast = functions.https.onCall(async (data, context) => {
  if (!context.auth) throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  const { castId, text } = data;
  const echo = {
    castId,
    userId: context.auth.uid,
    text,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  };
  const ref = await db.collection('echoes').add(echo);
  return { id: ref.id, ...echo };
});

// Media upload is handled client-side via Firebase Storage SDK.
// You can add triggers here if you want to process media after upload.
