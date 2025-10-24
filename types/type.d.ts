import { TextInputProps, TouchableOpacityProps } from "react-native";

type Listing = {
  id: number;
  title: string;
  location: string;
  rating: string;
  price: string;
  requests: number;
  favorites: number;
  images: string[];
  status: boolean;
};

interface UserInfo {
  user_type_id: number;
  plan_id: number;
  has_subscription: boolean;
  full_name: string;
  email: string;
  username: string;
  code: string;
  options: object;
  user_id: number;
  is_both_access: boolean;
}

export interface OtherRoom {
  type: string;
  rent: number;
}

interface Subscription {
  id: number;
  title: string;
  amount: number;
  period: number;
  credits: number;
  descriptions: string;
  isPremium: boolean;
  used?: number;
  expired_on?: string;
}

interface Plan {
  id: number;
  subscription_id: number;
  title: string;
  amount: number;
  period: number;
  credits: number;
  descriptions: string;
  isPremium: boolean;
  used?: number;
  expired_on?: string;
}

declare interface Driver {
  id: number;
  first_name: string;
  last_name: string;
  profile_image_url: string;
  car_image_url: string;
  car_seats: number;
  rating: number;
}

declare interface MarkerData {
  latitude: number;
  longitude: number;
  id: number;
  title: string;
  profile_image_url: string;
  car_image_url: string;
  car_seats: number;
  rating: number;
  first_name: string;
  last_name: string;
  time?: number;
  price?: string;
}

declare interface MapProps {
  destinationLatitude?: number;
  destinationLongitude?: number;
  onDriverTimesCalculated?: (driversWithTimes: MarkerData[]) => void;
  selectedDriver?: number | null;
  onMapReady?: () => void;
}

declare interface Ride {
  origin_address: string;
  destination_address: string;
  origin_latitude: number;
  origin_longitude: number;
  destination_latitude: number;
  destination_longitude: number;
  ride_time: number;
  fare_price: number;
  payment_status: string;
  driver_id: number;
  user_id: string;
  created_at: string;
  driver: {
    first_name: string;
    last_name: string;
    car_seats: number;
  };
}

declare interface ButtonProps extends TouchableOpacityProps {
  title: string;
  bgVariant?: "primary" | "secondary" | "danger" | "outline" | "success";
  textVariant?: "primary" | "default" | "secondary" | "danger" | "success";
  IconLeft?: React.ComponentType<any>;
  IconRight?: React.ComponentType<any>;
  className?: string;
}

declare interface GoogleInputProps {
  icon?: string;
  isDirectionEnabled?: boolean;
  initialLocation?: { latitude: number; longitude: number, address: string, draggable: boolean };
  containerStyle?: string;
  textInputBackgroundColor?: string;
  handlePress?: ({
    latitude,
    longitude,
    address,
  }: {
    latitude: number;
    longitude: number;
    address: string;
  }) => void;
}

declare interface InputFieldProps extends TextInputProps {
  label?: string;
  icon?: any;
  secureTextEntry?: boolean;
  labelStyle?: string;
  containerStyle?: string;
  inputStyle?: string;
  iconStyle?: string;
  className?: string;
  inputRef?: React.RefObject<TextInput>;
}

declare interface PaymentProps {
  fullName: string;
  email: string;
  amount: number;
  subscriptionId: number;
}

declare interface DropdownProps {
  label: string;
  value: string | number;
}

declare interface LocationStore {
  userLatitude: number | null;
  userLongitude: number | null;
  userAddress: string | null;
  destinationLatitude: number | null;
  destinationLongitude: number | null;
  destinationAddress: string | null;
  setUserLocation: ({
    latitude,
    longitude,
    address,
  }: {
    latitude: number;
    longitude: number;
    address: string;
  }) => void;
  setDestinationLocation: ({
    latitude,
    longitude,
    address,
  }: {
    latitude: number;
    longitude: number;
    address: string;
  }) => void;
}

declare interface DriverStore {
  drivers: MarkerData[];
  selectedDriver: number | null;
  setSelectedDriver: (driverId: number) => void;
  setDrivers: (drivers: MarkerData[]) => void;
  clearSelectedDriver: () => void;
}

declare interface DriverCardProps {
  item: MarkerData;
  selected: number;
  setSelected: () => void;
}


export interface AppFormData {
  propertyFor: string;
  title: string;
  propertyType: string;
  description: string;
  latitude: number;
  longitude: number;
  address: string;
  location: string;
  state: number;
  stateName: string;
  district: number;
  districtName: string;
  city: string;
  zip: string;
  housingType: string[];
  bhkType: string;
  familyPreference: string;
  foodPreference: string;
  roomType: string;
  commercialType: string;
  rent: string;
  advance: string;
  rentNegotiable: string;
  areaInSize: number;
  widthProperty: number;
  lengthProperty: number;
  floorNumber: number;
  numberOfBedRooms: number;
  numberOfBalconies: number;
  numberOfBathRooms: string[];
  ageOfProperty: number;
  furnishing: string;
  parking: string;
  basicAmenities: string[];
  additionalAmenities: string[];
  sourceOfWater: string[];
  images: string[];
  video: string[];
  date_updated: string;
  date_created: string;
  owner_name: string;
  owner_contact: string;
  contactPersonNumber: string;
  contactPersonName: string;
  status: boolean;
  projectMap: string[];
  otherRoomAvailable: OtherRoom[];
  isOtherRoomAvailable: boolean;
  distanceForMainRoad: number;
  widthOfTheRoadInFrontOfAProperty: number;
  municipleBillYear: string;
  tehsilBillYear: string;
  propertyListedBy: string;
}