# Chunker Service Setup Notes

1) Firebase custom claims (roles)

If you want user tokens to include a `role` claim (e.g., `teacher`, `student`, `admin`) set custom claims on a user with the Firebase Admin SDK (server-side):

Node example:

```js
// initialize admin SDK with service account
const admin = require('firebase-admin');
admin.initializeApp({ credential: admin.credential.applicationDefault() });

// set custom claim
await admin.auth().setCustomUserClaims(uid, { role: 'teacher' });
```

After setting the custom claim, newly minted ID tokens will include the claim. Clients should re-authenticate to get the updated token.

2) Using Workload Identity (recommended for production instead of X-API-Key)

- On GCP, use Workload Identity or Cloud Run service accounts to allow other GCP services to call the chunker without a static API key.
- In that setup the caller obtains an identity token (OIDC) and the chunker verifies the token's audience and issuer.
- For now the service supports `X-API-Key` for prototypes; replace this with platform IAM in deployment.
