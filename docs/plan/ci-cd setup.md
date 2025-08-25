The Firebase client config (`apiKey`, `authDomain`, `projectId`, etc.) **is not a secret**.

Here’s why:

* That `apiKey` is more of an **identifier** than a secret. Anyone can see it in your app bundle or the browser’s DevTools anyway.
* Firebase protects access via **Firestore/Storage Security Rules** + Firebase Auth, not by hiding the key.
* Only the **Admin SDK service account JSON** is a true secret — and since you’re not using it, you’re safe.

So you **can** safely commit your `environment.ts` and `environment.prod.ts` configs to GitHub. Many open-source Firebase projects do exactly that.

---

### 🔄 Using GitHub Actions for Deployment

If you want to avoid hardcoding those values in your repo and instead inject them at build time (a cleaner approach for open source), here’s how you can do it:

#### 1. Store Firebase config in GitHub Secrets

In your repo:
**Settings → Secrets and variables → Actions → New repository secret**

Example:

```
FIREBASE_API_KEY=your_api_key
FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_STORAGE_BUCKET=your_project.appspot.com
FIREBASE_MESSAGING_SENDER_ID=your_sender_id
FIREBASE_APP_ID=your_app_id
```

---

#### 2. Modify GitHub Actions Workflow

Create (or edit) `.github/workflows/deploy.yml`:

```yaml
name: Build and Deploy Ionic Angular App

on:
  push:
    branches:
      - main

jobs:
  build:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm ci

      - name: Generate environment.prod.ts
        run: |
          echo "export const environment = {
            production: true,
            firebase: {
              apiKey: '${{ secrets.FIREBASE_API_KEY }}',
              authDomain: '${{ secrets.FIREBASE_AUTH_DOMAIN }}',
              projectId: '${{ secrets.FIREBASE_PROJECT_ID }}',
              storageBucket: '${{ secrets.FIREBASE_STORAGE_BUCKET }}',
              messagingSenderId: '${{ secrets.FIREBASE_MESSAGING_SENDER_ID }}',
              appId: '${{ secrets.FIREBASE_APP_ID }}'
            }
          };" > src/environments/environment.prod.ts

      - name: Build Ionic Angular
        run: npm run build -- --configuration production

      # Example: deploy to Firebase Hosting
      - name: Deploy to Firebase
        uses: FirebaseExtended/action-hosting-deploy@v0
        with:
          repoToken: '${{ secrets.GITHUB_TOKEN }}'
          firebaseServiceAccount: '${{ secrets.FIREBASE_SERVICE_ACCOUNT }}'
          channelId: live
```

---

#### 3. Security Trade-off

* If you commit the Firebase config directly: ✅ totally safe, but public.
* If you inject via GitHub Actions: ✅ keeps your repo clean, but technically still public after deployment (because the built app exposes it).

Either way, **the real protection is your Firebase Security Rules**.