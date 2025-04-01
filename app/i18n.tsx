import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import en from './locales/en';
import hi from './locales/hi';

const resources = {
  en,
  hi,
};

const getSavedLanguage = async () => {
  try {
    const savedLanguage = await AsyncStorage.getItem('language');
    return savedLanguage || 'en'; // Default to English if no language is saved
  } catch (error) {
    console.error('Error loading saved language:', error);
    return 'en';
  }
};

getSavedLanguage().then((language) => {
  i18n.use(initReactI18next).init({
    resources,
    lng: language, // Set the saved language
    fallbackLng: 'en', // Fallback language
    interpolation: {
      escapeValue: false, // React already escapes values
    },
  });
});

export default i18n;