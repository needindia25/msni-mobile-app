# NativeWind Example

Style your universal React app with Tailwind CSS classes. [NativeWind](https://www.nativewind.dev/) enables Tailwind CSS use in React Native apps.

<p>
  <!-- iOS -->
  <img alt="Supports Expo iOS" longdesc="Supports Expo iOS" src="https://img.shields.io/badge/iOS-4630EB.svg?style=flat-square&logo=APPLE&labelColor=999999&logoColor=fff" />
  <!-- Android -->
  <img alt="Supports Expo Android" longdesc="Supports Expo Android" src="https://img.shields.io/badge/Android-4630EB.svg?style=flat-square&logo=ANDROID&labelColor=A4C639&logoColor=fff" />
  <!-- Web -->
  <img alt="Supports Expo Web" longdesc="Supports Expo Web" src="https://img.shields.io/badge/web-4630EB.svg?style=flat-square&logo=GOOGLE-CHROME&labelColor=4285F4&logoColor=fff" />
</p>

## 🚀 How to use

<!-- Setup instructions -->

- Install with `yarn` or `npm install`.
- Run `yarn start` or `npm run start` to try it out.

## 📝 Notes

<!-- Link to related Expo or library docs -->

- This example replicates the [NativeWind Expo Router setup instructions](https://www.nativewind.dev/getting-started/expo-router) for NativeWind v4.

---
---
---
# React Native app to the Google Play Store

To deploy a **React Native app to the Google Play Store**, you'll go through a few key steps. Here's a full breakdown:

---

## ✅ Prerequisites

- Your app should be **production-ready** and tested on a real Android device.
- You need:
  - A **Google Play Developer Account** ($25 one-time fee) → [Sign up here](https://play.google.com/console/)
  - A **React Native project built with `react-native` CLI** (not Expo, unless you're using EAS Build with Expo — let me know if that's your case).

---

## 🔐 Step 1: Generate a Signed APK or AAB (Android App Bundle)

Google now recommends **AAB** over APK.

### 1.1 Generate a Keystore

```bash
keytool -genkeypair -v -keystore need-india-release-key.keystore -alias need-india-key-alias \
  -keyalg RSA -keysize 2048 -validity 10000
```

- Save `need-india-release-key.keystore` in `android/app/`
- Use a strong password.

### 1.2 Configure Gradle

In `android/gradle.properties`:

```properties
MYAPP_UPLOAD_STORE_FILE=need-india-release-key.keystore
MYAPP_UPLOAD_KEY_ALIAS=need-india-key-alias
MYAPP_UPLOAD_STORE_PASSWORD=your-store-password
MYAPP_UPLOAD_KEY_PASSWORD=your-key-password
```

In `android/app/build.gradle`, add this inside `android { signingConfigs { release { ... } }}`:

```gradle
signingConfigs {
    release {
        storeFile file(MYAPP_UPLOAD_STORE_FILE)
        storePassword MYAPP_UPLOAD_STORE_PASSWORD
        keyAlias MYAPP_UPLOAD_KEY_ALIAS
        keyPassword MYAPP_UPLOAD_KEY_PASSWORD
    }
}
```

Then make sure your `buildTypes.release` uses that config:

```gradle
buildTypes {
    release {
        signingConfig signingConfigs.release
        shrinkResources true
        minifyEnabled true
        proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
    }
}
```

---

## 🏗️ Step 2: Build the App Bundle

```bash
cd android
./gradlew bundleRelease
```

- Output: `android/app/build/outputs/bundle/release/app-release.aab`

---

## 🚀 Step 3: Upload to Google Play Console

1. Go to [Play Console](https://play.google.com/console/)
2. Click **Create App**
3. Fill in:
   - App name
   - Default language
   - App or Game
   - Free or Paid
   - Confirm policies
4. In **Release > Production > Create Release**:
   - Upload your `.aab` file
   - Add release notes
5. Complete **App Content**, **Store Listing**, **Pricing**, and **Testing**
6. Click **Review and Publish**

---

## 📸 Step 4: Prepare Store Assets

You'll need:
- App icon (512x512)
- Feature graphic (1024x500)
- Screenshots (phone, tablet, etc.)
- Short and full app description

---

## 🕒 Step 5: Wait for Review

- It usually takes a few hours to a couple of days.

---
---
---
# GitHub Actions CI/CD pipeline

Great! Let's set up a **GitHub Actions CI/CD pipeline** for your **React Native** app to:

1. **Build the Android App Bundle (.aab)**
2. **Sign it**
3. **Deploy it to the Play Store (optional)**

---

## ✅ Prerequisites

Make sure:

- You're **not using Expo** (or using it with `eas build`)
- Your keystore and signing info are ready
- You have a **service account JSON** from Google Play Console for uploading builds (for automated deploy)

---

## 📁 1. Directory Setup

Put the following into your React Native repo:

- `.github/workflows/android-release.yml`
- Your `release.keystore` (keep it secret — encrypt it)
- `service-account.json` for Play Store (encrypt this too)

We’ll encrypt both using GitHub secrets.

---

## 🔐 2. Add GitHub Secrets

In your GitHub repo, go to **Settings > Secrets and variables > Actions > New repository secret** and add:

| Name                         | Value                           |
|------------------------------|----------------------------------|
| `KEYSTORE_BASE64`           | base64 of `release.keystore`     |
| `KEYSTORE_PASSWORD`         | your keystore password           |
| `KEY_ALIAS`                 | your key alias                   |
| `KEY_PASSWORD`              | your key password                |
| `SERVICE_ACCOUNT_JSON`      | base64 of `service-account.json` |

To get base64 on linux:

```bash
base64 -w 0 android/app/release.keystore
base64 -w 0 service-account.json
```

To get base64 on window (PowerShell):

```bash
[Convert]::ToBase64String([IO.File]::ReadAllBytes("C:\android\app\release.keystore")) > release-keystore.txt
```

---

## ⚙️ 3. GitHub Actions Workflow (`android-release.yml`)

```yaml
name: Android Release

on:
  push:
    tags:
      - 'v*'  # Triggers only on version tags like v1.0.0

jobs:
  build:
    name: Build Android AAB
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v3

      - name: Set up JDK
        uses: actions/setup-java@v3
        with:
          distribution: 'temurin'
          java-version: 17

      - name: Decode keystore
        run: |
          echo "${{ secrets.KEYSTORE_BASE64 }}" | base64 -d > android/app/release.keystore

      - name: Set up Gradle cache
        uses: gradle/gradle-build-action@v2

      - name: Build AAB
        run: |
          cd android
          ./gradlew bundleRelease \
            -PMYAPP_UPLOAD_STORE_FILE=release.keystore \
            -PMYAPP_UPLOAD_KEY_ALIAS=${{ secrets.KEY_ALIAS }} \
            -PMYAPP_UPLOAD_STORE_PASSWORD=${{ secrets.KEYSTORE_PASSWORD }} \
            -PMYAPP_UPLOAD_KEY_PASSWORD=${{ secrets.KEY_PASSWORD }}

      - name: Upload AAB artifact
        uses: actions/upload-artifact@v3
        with:
          name: app-release.aab
          path: android/app/build/outputs/bundle/release/app-release.aab

  deploy:
    name: Deploy to Play Store
    needs: build
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v3

      - name: Download AAB
        uses: actions/download-artifact@v3
        with:
          name: app-release.aab
          path: .

      - name: Decode service account json
        run: |
          echo "${{ secrets.SERVICE_ACCOUNT_JSON }}" | base64 -d > service-account.json

      - name: Deploy to Play Store
        uses: r0adkll/upload-google-play@v1
        with:
          serviceAccountJson: service-account.json
          packageName: com.yourcompany.yourapp
          releaseFiles: app-release.aab
          track: production
          status: completed
```

---

## 🚀 Deployment Flow

1. Push a Git tag like `v1.0.0`:
   ```bash
   git tag v1.0.0
   git push origin v1.0.0
   ```
2. GitHub Actions will:
   - Build the `.aab`
   - Sign it
   - Upload it to the Play Store

---

To get the `service-account.json` file for deploying your React Native app to the **Google Play Store** via GitHub Actions (or any CI/CD), follow these steps carefully:

---

## 🛠️ Step-by-Step: Get `service-account.json` from Google Play Console

### ✅ 1. Go to Google Play Console  
👉 [https://play.google.com/console](https://play.google.com/console)

---

### ✅ 2. Select Your App  
Click on the app you want to upload builds for.

---

### ✅ 3. Go to **"Setup" > "API access"**  
Left sidebar → scroll down to **"Setup"** → choose **"API access"**.

---

### ✅ 4. Link to a Google Cloud Project  
If not already linked:
- Click **"Create new project"** or **"Link existing"**.
- Follow the prompts.
- Once linked, you'll see the project name and ID.

---

### ✅ 5. Create a **Service Account**

Click **"Create new service account"** (Google Play will guide you to the **Google Cloud Console**):

#### In Google Cloud Console:
1. Click **“Create Service Account”**
2. Give it a name like: `play-deploy`
3. Click **Create and Continue**
4. Grant this role:
   - Role: `Service Account User` (you may also add `Viewer`)
5. Click **Done**

---

### ✅ 6. Grant Access to Play Console

Back in Google Play Console:
- You'll see the new service account.
- Click **"Grant Access"**
- Choose **Role: Release Manager** (or a custom role that includes *Upload to production*)
- Click **Invite User**

---

### ✅ 7. Generate JSON Key

1. Go back to **Google Cloud Console** → IAM & Admin → **Service Accounts**
2. Click the email of the service account
3. Go to the **"Keys"** tab
4. Click **"Add Key" > "Create new key"**
5. Choose **JSON** → click **Create**

🎉 This will download the `service-account.json` file to your system.

---

## 🔐 Example Contents of `service-account.json`

You’ll get something like:

```json
{
  "type": "service_account",
  "project_id": "your-project-id",
  "private_key_id": "abcd1234abcd1234abcd1234",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
  "client_email": "play-deploy@your-project-id.iam.gserviceaccount.com",
  "client_id": "12345678901234567890",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  ...
}
```

---

## 🧪 Optional: Test Upload Locally

You can try using the `r0adkll/upload-google-play` GitHub Action locally via Node.js or fastlane if you want to test before CI/CD.

---
