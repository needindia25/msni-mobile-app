import { Link, router } from "expo-router";
import { useState, useEffect, useRef } from "react";
import { Alert, ActivityIndicator, Image, ScrollView, Text, View, TextInput, Linking, TouchableOpacity } from "react-native";
import { ReactNativeModal } from "react-native-modal";
import { Dropdown } from "react-native-element-dropdown";

import CustomButton from "@/components/CustomButton";
import InputField from "@/components/InputField";
import { constants, icons, images } from "@/constants";
import CustomRadioGroup from "@/components/CustomRadioGroup";
import { fetchAPI } from "@/lib/fetch";
import VerificationUsingOTP from "@/components/VerificationUsingOTP";
import { useTranslation } from "react-i18next"; // Import useTranslation

const SignUp = () => {
  const { t } = useTranslation(); // Initialize translation hook
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showVerificationModal, setVerificationModal] = useState(false);
  const [invaidOTP, setInvalidOTP] = useState(false);
  const [loading, setLoading] = useState(true);
  const [agreedToTerms, setAgreedToTerms] = useState(false); // State to track if the user has agreed to terms and conditions
  
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
    if (!form.name) {
      Alert.alert(t("error"), t("nameRequired"),
        [
          {
            text: t("ok"),
          },
        ]
      ); // Use translation key
      return false;
    }
    if (!form.phone) {
      Alert.alert(t("error"), t("phoneRequired"),
        [
          {
            text: t("ok"),
          },
        ]
      ); // Use translation key
      return false;
    }
    if (!/^\d{10}$/.test(form.phone)) {
      Alert.alert(t("error"), t("phoneInvalid"),
        [
          {
            text: t("ok"),
          },
        ]
      ); // Use translation key
      return false;
    }
    if (!form.state) {
      Alert.alert(t("error"), t("stateRequired"),
        [
          {
            text: t("ok"),
          },
        ]
      ); // Use translation key
      return false;
    }
    if (!form.district) {
      Alert.alert(t("error"), t("districtRequired"),
        [
          {
            text: t("ok"),
          },
        ]
      ); // Use translation key
      return false;
    }
    return true;
  };

  const onVerficationPress = async () => {
    if (!validateForm()) {
      return;
    }
    if (!agreedToTerms) {
      Alert.alert(t("error"), t("agreeToTermsRequired"), [
        {
          text: t("ok"),
        },
      ]);
      return;
    }
    setVerificationModal(true);
  };

  const onSignUpPress = async (enterdOTP: any) => {
    setLoading(true);
    setVerificationModal(false);
    try {
      const response = await fetch(`${constants.API_URL}/otp/verify/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: form.phone,
          password: constants.DEFAULT_PASSWORD,
          full_name: form.name,
          user_type: form.userType,
          state: form.state,
          district: form.district,
          otp: enterdOTP,
          otp_for: "signup",
        }),
      });
      if (response.status === 401) {
        Alert.alert(t("error"), t("somethingWentWrong"), [
          {
            text: "OK",
          },
        ]);
        return;
      }
      console.log("Response:", response); // Log the response object
      if (response.ok) {
        const response_json = await response.json();
        if (response_json.hasOwnProperty("error")) {
          Alert.alert(t("error"), t(response_json["error"]), [
            {
              text: t("ok"),
              onPress: () => {
                setInvalidOTP(true);
                setVerificationModal(true);
                setLoading(false);
              },
            },
          ]);
          return;
        } else if (response_json.hasOwnProperty("warning")) {
          Alert.alert(t("warning"), t(response_json["warning"]), [
            {
              text: t("ok"),
              onPress: () => {
                setInvalidOTP(true);
                setVerificationModal(true);
                setLoading(false);
              },
            },
          ]);
          return;
        } else {
          setShowSuccessModal(true);
          setLoading(false);
        }
      } else {
        Alert.alert(t("error"), t("somethingWentWrong"), [
          {
            text: "OK",
          },
        ]);
        return;
      }
    } catch (err) {
      Alert.alert(t("error"), t("errorOccurred"),
        [
          {
            text: t("ok"),
          },
        ]
      );
      setLoading(false);      
    }
  };

  const [states, setStates] = useState<{ id: number; name: string; code: string }[]>([]);
  const [districts, setDistricts] = useState<{ id: number; name: string }[]>([]);

  useEffect(() => {
    const fetchStates = async () => {
      try {
        const response = await fetchAPI(`${constants.API_URL}/master/states`, t);
        if (response) {
          setStates(response);
        }
      } catch (error) {
        Alert.alert(t("error"), t("errorFetchingState"),
          [
            {
              text: t("ok"),
            },
          ]
        );
      } finally {
        setLoading(false);
      }
    };
    fetchStates();
  }, []);

  useEffect(() => {
    const fetchDistricts = async () => {
      if (form.state) {
        try {
          const response = await fetchAPI(
            `${constants.API_URL}/master/state/${form.state}/districts`, t
          );
          if (response) {
            setDistricts(response);
          }
        } catch (error) {
          Alert.alert(t("error"), t("errorFetchingDistrict"),
            [
              {
                text: t("ok"),
              },
            ]
          );
          setLoading(false);
          return;
        } finally {
          setLoading(false);
        }
      }
    };
    fetchDistricts();
  }, [form.state]);

  const stateOptions = states?.map((state) => ({
    label: state.name,
    value: state.id,
  })) || [];

  const districtOptions = districts?.map((district) => ({
    label: district.name,
    value: district.id,
  })) || [];

  const handleMobile = async (value: any) => {
    value = value.trim();
    setForm((prev) => ({
      ...prev,
      "phone": value,
    }));
    if (value.length === 10) {
      try {
        const response = await fetchAPI(
          `${constants.API_URL}/check_user/`, t,
          {
            method: "POST",
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(
              {
                "username": value
              }
            )
          }
        );
        console.log(response)
        if (response === null || response === undefined) {
          return;
        }
        let success = true;
        if (response.hasOwnProperty("success")) {
          success = response["success"];
        }
        if (!success) {
          Alert.alert(t("error"), t(response["message"]),
            [
              {
                text: t("ok"),
              },
            ]
          );
          return
        }
      } catch (error) {
        Alert.alert(t("error"), t("invalidOrRegisteredMobile"),
          [
            {
              text: t("ok"),
            },
          ]
        );
      }
    }
  }

  return (
    <ScrollView className="flex-1 bg-white">
      <View className="flex-1 bg-white">
        <View className="w-full justify-center items-center mt-10">
          <Image source={images.HorizontalLogo} className="z-0 w-[250px] h-[100px]" />
        </View>
        {loading ? (
          <View className="flex-1 justify-center mt-[60%] items-center">
            <ActivityIndicator size="large" color="#00ff00" />
            <Text className="mt-2 text-xl">{t("loading")}</Text>
          </View>
        ) : (
          <>
            {showVerificationModal ? (
              <VerificationUsingOTP
                onPress={(enterdOTP) => { onSignUpPress(enterdOTP); }}
                onBack={() => setVerificationModal(false)}
                optFor="sign-up"
                invaidOTP={invaidOTP}
                number={form.phone}
              />
            ) : (
              <>
                <View className="relative w-full h-[65px]">
                  <Text className="text-2xl text-black font-JakartaSemiBold absolute bottom-5 left-5">
                    {t("welcome")}
                  </Text>
                  <Text className="text-1xl text-black font-JakartaSemiBold absolute bottom-0 left-5">
                    {t("createAccountToGetStarted")}
                  </Text>
                </View>
                <View className="p-5">
                  <InputField
                    label={t("nameLabel")} // Use translation key
                    placeholder={t("namePlaceholder")} // Use translation key
                    icon={icons.person}
                    value={form.name}
                    onChangeText={(value) => setForm({ ...form, name: value })}
                    inputRef={nameInputRef}
                  />
                  <InputField
                    label={t("phoneLabel")} // Use translation key
                    placeholder={t("phonePlaceholder")} // Use translation key
                    icon={icons.phone}
                    keyboardType="phone-pad"
                    textContentType="none"
                    value={form.phone}
                    onChangeText={(value) => handleMobile(value)}
                    inputRef={phoneInputRef}
                  />
                  <View>
                    <Text className="text-lg mb-2">{t("userTypeLabel")}</Text>
                    <CustomRadioGroup
                      options={[
                        { label: t("seeker"), value: "1" }, // Use translation key
                        { label: t("provider"), value: "2" }, // Use translation key
                        { label: t("both"), value: "3" }, // Use translation key
                      ]}
                      selectedValue={form.userType}
                      onValueChange={(value: string) => setForm({ ...form, userType: value })}
                    />
                  </View>
                  <View className="mt-4">
                    <Text className="text-lg mb-2">{t("stateLabel")}</Text>
                    <Dropdown
                      data={stateOptions}
                      labelField="label"
                      valueField="value"
                      placeholder={t("selectStatePlaceholder")} // Use translation key
                      value={form.state}
                      onChange={(item) => {
                        setForm({ ...form, state: item.value, district: null });
                      }}
                      style={{
                        padding: 10,
                        borderColor: "gray",
                        borderWidth: 1,
                        borderRadius: 5,
                      }}
                    />
                  </View>
                  <View className="mt-4">
                    <Text className="text-lg mb-2">{t("districtLabel")}</Text>
                    <Dropdown
                      data={districtOptions}
                      labelField="label"
                      valueField="value"
                      placeholder={t("selectDistrictPlaceholder")} // Use translation key
                      value={form.district}
                      onChange={(item) => {
                        setForm({ ...form, district: item.value });
                      }}
                      style={{
                        padding: 10,
                        borderColor: "gray",
                        borderWidth: 1,
                        borderRadius: 5,
                      }}
                      disable={!form.state}
                    />
                  </View>
                  <View className="mt-4">
                    <Text className="text-lg mb-2">{t("termsAndPolicyAgreement")}</Text> {/* Add label for the checkbox */}
                    <View className="flex-row items-center">
                      <TouchableOpacity
                        onPress={() => setAgreedToTerms(!agreedToTerms)}
                        className="mr-2"
                      >
                        <View
                          className={`w-6 h-6 border-2 rounded-md ${agreedToTerms ? "bg-blue-500 border-blue-500" : "border-gray-400"
                            } flex items-center justify-center`}
                        >
                          {agreedToTerms && (
                            <Text className="text-white text-center font-bold">✓</Text>
                          )}
                        </View>
                      </TouchableOpacity>
                      <Text className="text-gray-600">
                        {t("iAgreeTo")}{" "}
                        <Text
                          className="text-blue-500 underline"
                          onPress={() => {
                            const url = "https://www.multisolutionofneedindia.com/terms-condition";
                            Linking.canOpenURL(url).then((supported) => {
                              if (supported) {
                                Linking.openURL(url);
                              } else {
                                Alert.alert(t("error"), t("unableToOpenLink"));
                              }
                            });
                          }}
                        >
                          {t("termsAndConditions")}
                        </Text>{" "}
                        {t("and")}{" "}
                        <Text
                          className="text-blue-500 underline"
                          onPress={() => {
                            const url = "https://www.multisolutionofneedindia.com/privacy-policy";
                            Linking.canOpenURL(url).then((supported) => {
                              if (supported) {
                                Linking.openURL(url);
                              } else {
                                Alert.alert(t("error"), t("unableToOpenLink"));
                              }
                            });
                          }}
                        >
                          {t("privacyPolicy")}
                        </Text>
                      </Text>
                    </View>
                  </View>
                  <CustomButton
                    title={t("signUp")} // Use translation key
                    onPress={onVerficationPress}
                    className="mt-6"
                  />
                  <Link
                    href="/sign-in"
                    className="text-lg text-center text-general-200 mt-10"
                  >
                    {t("alreadyHaveAccount")}{" "}
                    <Text className="text-blue-500">{t("signIn")}</Text>
                  </Link>
                </View>
                <ReactNativeModal isVisible={showSuccessModal}>
                  <View className="bg-white px-7 py-9 rounded-2xl min-h-[300px]">
                    <Image
                      source={images.check}
                      className="w-[110px] h-[110px] mx-auto my-5"
                    />
                    <Text className="text-3xl font-JakartaBold text-center">
                      {t("registrationSuccessful")}
                    </Text>
                    <Text className="text-base text-gray-400 font-Jakarta text-center mt-2">
                      {t("registrationMessage")}
                    </Text>
                    <CustomButton
                      title={t("loginToContinue")} // Use translation key
                      onPress={() => {
                        setShowSuccessModal(false);
                        router.push(`/(auth)/sign-in`);
                      }}
                      className="mt-5"
                    />
                  </View>
                </ReactNativeModal>
              </>
            )}
          </>
        )}
      </View>
    </ScrollView>
  );
};

export default SignUp;