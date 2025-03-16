import { icons } from '@/constants';
import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, Image } from 'react-native';

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
    const [otp, setOtp] = useState(['', '', '', '']);
    const [timeRemaining, setTimeRemaining] = useState(59);
    const [whatsappChecked, setWhatsappChecked] = useState(false);
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
        const randomOtp = Math.floor(1000 + Math.random() * 9000).toString();
        setGeneratedOtp(randomOtp);
        Alert.alert('Generated OTP:', randomOtp);
    }, []);

    const handleOtpChange = (index: number, value: string) => {
        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);
    };

    const handleResendCode = () => {
        // Logic to resend the OTP code
        console.log('Resend code');
        setTimeRemaining(59);
        const randomOtp = Math.floor(1000 + Math.random() * 9000).toString();
        setGeneratedOtp(randomOtp);
        Alert.alert('Generated OTP:', randomOtp);
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
            setOtp(['', '', '', '']);
            setErrorMessage('Invalid OTP. Please try again.');
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
                <Text className="text-2xl font-bold mb-2">Verify Number</Text>
            </View>
            <Text className="text-gray-500 mb-5">Enter verification code sent to</Text>
            <Text className="text-black font-bold mb-5">+91 {number}</Text>
            <View className="flex-row justify-center mb-5">
                {otp.map((digit, index) => (
                    <TextInput
                        key={index}
                        ref={(ref) => (inputRefs.current[index] = ref)}
                        value={digit}
                        onChangeText={(value) => handleOtpChange(index, value)}
                        maxLength={1}
                        keyboardType="numeric"
                        className="w-12 h-12 border border-gray-300 rounded-lg text-center text-2xl mx-1"
                    />
                ))}
            </View>
            {errorMessage ? (
                <Text className="text-red-500 mb-2">{errorMessage}</Text>
            ) : null}
            <Text className="text-gray-500 mb-2">Time remaining: 00:{timeRemaining < 10 ? `0${timeRemaining}` : timeRemaining}</Text>
            <TouchableOpacity onPress={handleResendCode}>
                <Text className="text-blue-500 font-bold">Resend Code</Text>
            </TouchableOpacity>
            {/* <View className="flex-row items-center mt-5">
        <CheckBox
          value={whatsappChecked}
          onValueChange={setWhatsappChecked}
        />
        <Text className="text-gray-500 ml-2">WhatsApp Message</Text>
      </View>
      <Text className="text-gray-500 text-center mt-2">
        I agree to receive important updates via WhatsApp
      </Text> */}
            <TouchableOpacity onPress={handleVerify} className="bg-green-500 rounded-lg p-3 mt-5 w-full">
                <Text className="text-white text-center font-bold">Verify</Text>
            </TouchableOpacity>
        </View>
    );
};

export default VerificationUsingOTP;