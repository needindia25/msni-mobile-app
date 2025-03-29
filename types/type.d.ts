import { TextInputProps, TouchableOpacityProps } from "react-native";

type Listing = {
  id: number;
  title: string;
  location: string;
  rating: string;
  price: string;
  requests: number;
  favorites: number;
  image: string;
  status: boolean;
};

interface UserInfo {
  user_type_id: number;
  has_subscription: boolean;
  full_name: string;
  email: string;
  code: string;
  options: object;
  user_id: number;
}

interface Subscription {
  id: number;
  title: string;
  amount: number;
  period: number;
  credits: number;
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
  initialLocation?: string;
  containerStyle?: string;
  textInputBackgroundColor?: string;
  handlePress: ({
    latitude,
    longitude,
    address,
    address_components,
  }: {
    latitude: number;
    longitude: number;
    address: string;
    address_components: Array;
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
    address_components,
  }: {
    latitude: number;
    longitude: number;
    address: string;
    address_components: Array;
  }) => void;
  setDestinationLocation: ({
    latitude,
    longitude,
    address,
    address_components,
  }: {
    latitude: number;
    longitude: number;
    address: string;
    address_components: Array;
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
