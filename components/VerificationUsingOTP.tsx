import { constants, icons } from '@/constants';
import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, Image, ActivityIndicator } from 'react-native';
import { useTranslation } from 'react-i18next'; // Import useTranslation
import { fetchAPI } from '@/lib/fetch';
import { generateOTP } from '@/lib/utils';

interface VerificationUsingOTPProps {
    onPress: (enterdOTP: string) => void;
    onBack: () => void;
    optFor: string;
    number: string;
}

const VerificationUsingOTP: React.FC<VerificationUsingOTPProps> = ({
    onPress,
    onBack,
    optFor,
    number,
}) => {
    const { t } = useTranslation(); // Initialize translation hook
    const OTP_LENGTH = 6; // Adjust OTP length as needed
    const [otp, setOtp] = useState(Array(OTP_LENGTH).fill(""));
    const [timeRemaining, setTimeRemaining] = useState(59);
    const [errorMessage, setErrorMessage] = useState("");
    const inputRefs = useRef<(TextInput | null)[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeRemaining((prevTime) => (prevTime > 0 ? prevTime - 1 : 0));
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const handleOtpChange = (index: number, value: string) => {
        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);
        // Move focus to the next input if value is entered
        if (value && index < OTP_LENGTH - 1) {
            inputRefs.current[index + 1]?.focus();
        }

        // Hide the keyboard when all OTP digits are entered
        if (index === OTP_LENGTH - 1 && value) {
            inputRefs.current[index]?.blur();
        }
    };

    const handleResendCode = async () => {
        setLoading(true);
        const otpGenerated = await generateOTP(t, number, optFor, "resend");
        if (otpGenerated) {
            setTimeRemaining(59);
            setErrorMessage('');
            inputRefs.current[0]?.focus();
        }
        setLoading(false);
    };

    const handleVerify = () => {
        const enteredOtp = otp.join('');
        if (enteredOtp.length < OTP_LENGTH) {
            setErrorMessage(t("invalidOtp"));
        }
        onPress(enteredOtp);
    };

    const handleKeyPress = (index: number, event: any) => {
        if (event.nativeEvent.key === "Backspace" && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    return (
        <View className="flex-1 justify-center items-center bg-white p-5">
            {loading ? (
                <View className="flex-1 justify-center mt-[60%] items-center">
                    <ActivityIndicator size="large" color="#00ff00" />
                    <Text className="mt-2 text-xl">{t("loading")}</Text>
                </View>
            ) : (
                <>
                    <View className="flex-row w-full items-center justify-center mb-5">
                        <TouchableOpacity
                            onPress={onBack}
                            className="absolute left-0 top-0 p-5 mt-[-12px]"
                        >
                            <Image
                                source={icons.backArrow}
                                resizeMode="contain"
                                className={`w-6 h-6`}
                            />
                        </TouchableOpacity>
                        <Text className="text-2xl font-bold mb-2">{t("verifyNumber")}</Text>
                    </View>
                    <Text className="text-gray-500 mb-5">{t("enterVerificationCode")}</Text>
                    <Text className="text-black font-bold mb-5">+91 {number}</Text>
                    <View className="flex-row justify-center mb-5">
                        {otp.map((digit, index) => (
                            <TextInput
                                key={index}
                                ref={(ref) => (inputRefs.current[index] = ref)}
                                value={digit}
                                onChangeText={(value) => handleOtpChange(index, value)}
                                onKeyPress={(event) => handleKeyPress(index, event)}
                                maxLength={1}
                                keyboardType="numeric"
                                className="w-12 h-12 border border-gray-300 rounded-lg text-center text-2xl mx-1"
                            />
                        ))}
                    </View>
                    {errorMessage ? (
                        <Text className="text-red-500 mb-2">{errorMessage}</Text>
                    ) : null}
                    {timeRemaining > 0 && (
                        <Text className="text-gray-500 mb-2">
                            {t("timeRemaining")}: 00:{timeRemaining < 10 ? `0${timeRemaining}` : timeRemaining}
                        </Text>
                    )}
                    {timeRemaining === 0 && (
                        <TouchableOpacity onPress={handleResendCode}>
                            <Text className="text-blue-500 font-bold">{t("resendCode")}</Text>
                        </TouchableOpacity>
                    )}
                    {otp.every((digit) => digit) && (
                        <TouchableOpacity onPress={handleVerify} className="bg-green-500 rounded-lg p-3 mt-5 w-full">
                            <Text className="text-white text-center font-bold">{t("verify")}</Text>
                        </TouchableOpacity>
                    )}
                </>
            )}
        </View>
    );
};

export default VerificationUsingOTP;