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
keytool -genkeypair -v -keystore my-release-key.keystore -alias my-key-alias \
  -keyalg RSA -keysize 2048 -validity 10000
```

- Save `my-release-key.keystore` in `android/app/`
- Use a strong password.

### 1.2 Configure Gradle

In `android/gradle.properties`:

```properties
MYAPP_UPLOAD_STORE_FILE=my-release-key.keystore
MYAPP_UPLOAD_KEY_ALIAS=my-key-alias
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

Would you like instructions for **Expo-based builds (using EAS)** instead? Or do you need help preparing icons/screenshots/descriptions too?
