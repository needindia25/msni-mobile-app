import arrowDown from "@/assets/icons/arrow-down.png";
import arrowUp from "@/assets/icons/arrow-up.png";
import backArrow from "@/assets/icons/back-arrow.png";
import chat from "@/assets/icons/chat.png";
import checkmark from "@/assets/icons/check.png";
import close from "@/assets/icons/close.png";
import dollar from "@/assets/icons/dollar.png";
import email from "@/assets/icons/email.png";
import phone from "@/assets/icons/phone.png";
import eyecross from "@/assets/icons/eyecross.png";
import google from "@/assets/icons/google.png";
import home from "@/assets/icons/home.png";
import homeActive from "@/assets/icons/home-active.png";
import list from "@/assets/icons/list.png";
import lock from "@/assets/icons/lock.png";
import map from "@/assets/icons/map.png";
import marker from "@/assets/icons/marker.png";
import out from "@/assets/icons/out.png";
import person from "@/assets/icons/person.png";
import pin from "@/assets/icons/pin.png";
import point from "@/assets/icons/point.png";
import profile from "@/assets/icons/profile.png";
import profileActive from "@/assets/icons/profile-active.png";
import request from "@/assets/icons/req.png";
import requestActive from "@/assets/icons/req-active.png";
import support from "@/assets/icons/support.png";
import supportActive from "@/assets/icons/support-active.png";
import search from "@/assets/icons/search.png";
import selectedMarker from "@/assets/icons/selected-marker.png";
import star from "@/assets/icons/star.png";
import target from "@/assets/icons/target.png";
import to from "@/assets/icons/to.png";
import radioChecked from "@/assets/icons/radio_checked.png";
import radioUnchecked from "@/assets/icons/radio_unchecked.png";
import check from "@/assets/images/check.png";
import getStarted from "@/assets/images/get-started.png";
import message from "@/assets/images/message.png";
import noResult from "@/assets/images/no-result.png";
// import niOnBoarding1 from "@/assets/images/ni-on-boarding1.png";
// import niOnBoarding2 from "@/assets/images/ni-on-boarding2.png";
import niOnBoarding3 from "@/assets/images/ni-on-boarding5.png";
import niOnBoarding4 from "@/assets/images/ni-on-boarding4.png";
import niOnBoarding5 from "@/assets/images/ni-on-boarding5.png";
import VerticalLogo from "@/assets/images/vertical-logo.png";
import HorizontalLogo from "@/assets/images/horizontal-logo.png";
import adaptiveIcon from "@/assets/images/adaptive-icon.png";

export const images = {
  // niOnBoarding1,
  // niOnBoarding2,
  niOnBoarding3,
  niOnBoarding4,
  niOnBoarding5,
  getStarted,
  VerticalLogo,
  HorizontalLogo,
  adaptiveIcon,
  check,
  noResult,
  message,
};

export const icons = {
  arrowDown,
  arrowUp,
  backArrow,
  chat,
  checkmark,
  close,
  dollar,
  email,
  phone,
  eyecross,
  google,
  home,
  homeActive,
  list,
  lock,
  map,
  marker,
  out,
  person,
  pin,
  point,
  profile,
  profileActive,
  request,
  requestActive,
  support,
  supportActive,
  search,
  selectedMarker,
  star,
  target,
  to,
  radioChecked,
  radioUnchecked,
};

export const envConstants = {
  UAT: {
    DEFAULT_LAT: 24.787674373711102,
    DEFAULT_LONG: 84.99152133511204,
    BASE_URL: "https://msniassets.rarsolutions.com",
    API_URL: "https://msniapi.rarsolutions.com",
    DEFAULT_PASSWORD: "MSNI@2025",
    EXPO_PUBLIC_PLACES_API_KEY: "AIzaSyBhSmc340OCHOV1eHAWfH7KqVsMBvFO4mE",
  },
  PROD: {
    DEFAULT_LAT: 24.787674373711102,
    DEFAULT_LONG: 84.99152133511204,
    BASE_URL: "https://assets.multisolutionofneedindia.com",
    API_URL: "https://api.multisolutionofneedindia.com",
    DEFAULT_PASSWORD: "MSNI@2025",
    EXPO_PUBLIC_PLACES_API_KEY: "AIzaSyBhSmc340OCHOV1eHAWfH7KqVsMBvFO4mE",
  },
};

// Use this to select the environment:
export const ENV = "UAT";
// export const ENV = "PROD";

export const constants = envConstants[ENV];
