import { Link, router } from "expo-router";
import { useState, useEffect, useRef } from "react";
import { Alert, ActivityIndicator, Image, ScrollView, Text, View, TextInput } from "react-native";
import { ReactNativeModal } from "react-native-modal";
import { Dropdown } from 'react-native-element-dropdown';

import CustomButton from "@/components/CustomButton";
import InputField from "@/components/InputField";
import { constants, icons, images } from "@/constants";
import CustomRadioGroup from "@/components/CustomRadioGroup";
import { fetchAPI } from "@/lib/fetch";
import VerificationUsingOTP from "@/components/VerificationUsingOTP";

const SignUp = () => {
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showVerificationModal, setVerificationModal] = useState(false);
  const [loading, setLoading] = useState(true);

  const nameInputRef = useRef<TextInput | null>(null);
  const phoneInputRef = useRef<TextInput | null>(null);

  const [form, setForm] = useState<{
    name: string;
    phone: string;
    password: string;
    userType: string;
    state: number | null;
    district: number | null;
  }>({
    name: "",
    phone: "",
    password: "",
    userType: "1", // Default user type
    state: null,
    district: null,
  });

  const validateForm = () => {
    console.log("Form data:", form);
    if (!form.name) {
      Alert.alert("Error", "Name is required");
      return false;
    }
    if (!form.phone) {
      Alert.alert("Error", "Phone number is required");
      return false;
    }
    if (!/^\d{10}$/.test(form.phone)) {
      Alert.alert("Error", "Phone number must be 10 digits");
      return false;
    }
    if (!form.state) {
      Alert.alert("Error", "State is required");
      return false;
    }
    if (!form.district) {
      Alert.alert("Error", "District is required");
      return false;
    }
    return true;
  };

  const onVerficationPress = async () => {
    if (!validateForm()) {
      return;
    }
    setVerificationModal(true);
  };

  const onSignUpPress = async () => {
    setLoading(true);
    setVerificationModal(false);
    try {
      const response = await fetch(`${constants.API_URL}/auth/register/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: form.phone,
          password: constants.DEFAULT_PASSWORD,
          full_name: form.name,
          user_type: form.userType,
          state: form.state,
          district: form.district,
        }),
      });
      console.log(response)

      if (response.ok) {
        setShowSuccessModal(true);
      } else {
        const errorData = await response.json();
        Alert.alert("Error", errorData.error || "Mobile number is already registered, try Sign In.");
      }
    } catch (err) {
      Alert.alert("Error", "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const [states, setStates] = useState<{ id: number; name: string; code: string }[]>([]);
  const [districts, setDistricts] = useState<{ id: number; name: string }[]>([]);

  useEffect(() => {
    const fetchStates = async () => {
      try {
        const response = await fetchAPI(`${constants.API_URL}/master/states`); // Replace with your API endpoint
        setStates(response);
      } catch (error) {
        console.error('Error fetching states:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStates();
  }, []);

  useEffect(() => {
    // Fetch districts when a state is selected
    const fetchDistricts = async () => {
      if (form.state) {
        try {
          const response = await fetchAPI(
            `${constants.API_URL}/master/state/${form.state}/districts`
          );
          setDistricts(response);
        } catch (error) {
          console.error('Error fetching districts:', error);
        } finally {
          setLoading(false);
        }
      }
    };
    fetchDistricts();
  }, [form.state]);

  const stateOptions = states?.map(state => ({
    label: state.name,
    value: state.id
  })) || [];

  const districtOptions = districts?.map(district => ({
    label: district.name,
    value: district.id
  })) || [];

  return (
    <ScrollView className="flex-1 bg-white">
      <View className="flex-1 bg-white">
        <View className="w-full justify-center items-center mt-10">
          <Image source={images.HorizontalLogo} className="z-0 w-[250px] h-[100px]" />
        </View>
        {loading ? (
          <View className="flex-1 justify-center mt-[60%] items-center">
            <ActivityIndicator size="large" color="#00ff00" />
            <Text className="mt-2 text-xl">Loading...</Text>
          </View>
        ) : (
          <>
            {
              showVerificationModal ? (
                <VerificationUsingOTP
                  onPress={onSignUpPress}
                  onBack={() => setVerificationModal(false)}
                  number={form.phone} />
              ) :
                (
                  <>
                    <View className="relative w-full h-[65px]">
                      <Text className="text-2xl text-black font-JakartaSemiBold absolute bottom-5 left-5">
                        Welcome !
                      </Text>
                      <Text className="text-1xl text-black font-JakartaSemiBold absolute bottom-0 left-5">
                        Create your account to get started
                      </Text>
                    </View>
                    <View className="p-5">
                      <InputField
                        label="Name"
                        placeholder="Enter name"
                        icon={icons.person}
                        value={form.name}
                        onChangeText={(value) => setForm({ ...form, name: value })}
                        inputRef={nameInputRef}
                      />
                      <InputField
                        label="Mobile Number (without +91)"
                        placeholder="Enter Mobile Number"
                        icon={icons.phone}
                        keyboardType="phone-pad"
                        textContentType="none"
                        value={form.phone}
                        onChangeText={(value) => setForm({ ...form, phone: value })}
                        inputRef={phoneInputRef}
                      />
                      {/* <InputField
                label="Password"
                placeholder="Enter password"
                icon={icons.lock}
                secureTextEntry={true}
                textContentType="password"
                value={form.password}
                onChangeText={(value) => setForm({ ...form, password: value })}
              /> */}
                      <View>
                        <Text className="text-lg mb-2">User Type</Text>
                        <CustomRadioGroup
                          options={[
                            { label: "Seeker", value: "1" },
                            { label: "Provider", value: "2" },
                            { label: "Both", value: "3" },
                          ]}
                          selectedValue={form.userType}
                          onValueChange={(value: string) => setForm({ ...form, userType: value })}
                        />
                      </View>
                      <View className="mt-4">
                        <Text className="text-lg mb-2">State</Text>
                        <Dropdown
                          data={stateOptions}
                          labelField="label"
                          valueField="value"
                          placeholder="Select a state"
                          value={form.state}
                          onChange={(item) => {
                            console.log("Selected state:", item);
                            setForm({ ...form, state: item.value, district: null });
                          }}
                          style={{
                            padding: 10,
                            borderColor: 'gray',
                            borderWidth: 1,
                            borderRadius: 5,
                          }}
                        />
                      </View>
                      <View className="mt-4">
                        <Text className="text-lg mb-2">District</Text>
                        <Dropdown
                          data={districtOptions}
                          labelField="label"
                          valueField="value"
                          placeholder="Select a district"
                          value={form.district}
                          onChange={(item) => {
                            console.log("Selected district:", item);
                            setForm({ ...form, district: item.value });
                          }}
                          style={{
                            padding: 10,
                            borderColor: 'gray',
                            borderWidth: 1,
                            borderRadius: 5,
                          }}
                          disable={!form.state}
                        />
                      </View>
                      {/* <View className="mt-4">
                <Text className="text-lg mb-2">CAPTCHA</Text>
                <SimpleCaptcha
                  onVerify={(isVerified) => setCaptchaVerified(isVerified)}
                />
              </View> */}
                      <CustomButton
                        title="Sign Up"
                        onPress={onVerficationPress}
                        className="mt-6"
                      />
                      <Link
                        href="/sign-in"
                        className="text-lg text-center text-general-200 mt-10"
                      >
                        Already have an account?{" "}
                        <Text className="text-blue-500">Sign In</Text>
                      </Link>
                    </View>
                    <ReactNativeModal isVisible={showSuccessModal}>
                      <View className="bg-white px-7 py-9 rounded-2xl min-h-[300px]">
                        <Image
                          source={images.check}
                          className="w-[110px] h-[110px] mx-auto my-5"
                        />
                        <Text className="text-3xl font-JakartaBold text-center">
                          Registration Successful
                        </Text>
                        <Text className="text-base text-gray-400 font-Jakarta text-center mt-2">
                          You have successfully created an account.
                        </Text>
                        <CustomButton
                          title="Login to continue..."
                          onPress={() => {
                            setShowSuccessModal(false);
                            router.push(`/(auth)/sign-in`)
                          }}
                          className="mt-5"
                        />
                      </View>
                    </ReactNativeModal>
                  </>
                )
            }

          </>
        )}
      </View>
    </ScrollView>
  );
};

export default SignUp;