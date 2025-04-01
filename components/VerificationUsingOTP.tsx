import { icons } from '@/constants';
import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, Image } from 'react-native';
import { useTranslation } from 'react-i18next'; // Import useTranslation

interface VerificationUsingOTPProps {
    onPress: () => void;
    onBack: () => void;
    number: string;
}

const VerificationUsingOTP: React.FC<VerificationUsingOTPProps> = ({
    onPress,
    onBack,
    number,
}) => {
    const { t } = useTranslation(); // Initialize translation hook
    const OTP_LENGTH = 6; // Adjust OTP length as needed
    const [otp, setOtp] = useState(Array(OTP_LENGTH).fill(""));
    const [timeRemaining, setTimeRemaining] = useState(59);
    const [generatedOtp, setGeneratedOtp] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const inputRefs = useRef<(TextInput | null)[]>([]);

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeRemaining((prevTime) => (prevTime > 0 ? prevTime - 1 : 0));
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        const fetchOtp = async () => {
            const randomOtp = Math.floor(100000 + Math.random() * 900000).toString();
            setGeneratedOtp(randomOtp);
            Alert.alert(t("generatedOtp"), randomOtp); // Use translation key
        };
        fetchOtp();
    }, []);

    const handleOtpChange = (index: number, value: string) => {
        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);
        // Move focus to the next input if value is entered
        if (value && index < OTP_LENGTH - 1) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleResendCode = () => {
        // Logic to resend the OTP code
        console.log('Resend code');
        setTimeRemaining(59);
        const randomOtp = Math.floor(100000 + Math.random() * 900000).toString();
        setGeneratedOtp(randomOtp);
        Alert.alert(t("generatedOtp"), randomOtp); // Use translation key
        setErrorMessage('');
    };

    const handleVerify = () => {
        // Logic to verify the OTP code
        const enteredOtp = otp.join('');
        if (enteredOtp === generatedOtp) {
            console.log('OTP verified successfully');
            onPress();
        } else {
            console.log('Invalid OTP');
            setOtp(Array(OTP_LENGTH).fill(""));
            setErrorMessage(t("invalidOtp")); // Use translation key
        }
    };

    const handleKeyPress = (index: number, event: any) => {
        if (event.nativeEvent.key === "Backspace" && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    return (
        <View className="flex-1 justify-center items-center bg-white p-5">
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
                <Text className="text-2xl font-bold mb-2">{t("verifyNumber")}</Text> {/* Use translation key */}
            </View>
            <Text className="text-gray-500 mb-5">{t("enterVerificationCode")}</Text> {/* Use translation key */}
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
            <Text className="text-gray-500 mb-2">
                {t("timeRemaining")}: 00:{timeRemaining < 10 ? `0${timeRemaining}` : timeRemaining} {/* Use translation key */}
            </Text>
            <TouchableOpacity onPress={handleResendCode}>
                <Text className="text-blue-500 font-bold">{t("resendCode")}</Text> {/* Use translation key */}
            </TouchableOpacity>
            {otp.every((digit) => digit) && (
                <TouchableOpacity onPress={handleVerify} className="bg-green-500 rounded-lg p-3 mt-5 w-full">
                    <Text className="text-white text-center font-bold">{t("verify")}</Text> {/* Use translation key */}
                </TouchableOpacity>
            )}
        </View>
    );
};

export default VerificationUsingOTP;