import React, { useState, useImperativeHandle, forwardRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, Button } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import InputField from './InputField';

const generateCaptcha = () => {
    const chars = 'ABCDEFGHIJKLMNPQRSTUVWXYZabcdefghijklmnpqrstuvwxyz123456789';
    let captcha = '';
    for (let i = 0; i < 6; i++) {
        captcha += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return captcha;
};

export interface SimpleCaptchaProps {
    handleVerify: () => void;
}

const SimpleCaptcha = forwardRef<SimpleCaptchaProps, { onVerify: (isVerified: boolean) => void }>(({ onVerify }, ref) => {
    const [captcha, setCaptcha] = useState(generateCaptcha());
    const [input, setInput] = useState('');

    const handleVerify = () => {
        if (input === captcha) {
            onVerify(true);
        } else {
            onVerify(false);
            setCaptcha(generateCaptcha());
        }
    };

    const handleRefresh = () => {
        setCaptcha(generateCaptcha());
        setInput('');
    };

    useImperativeHandle(ref, () => ({
        handleVerify,
    }));

    return (
        <View>
            <View className="items-center">
                <View className="flex-row items-center bg-gray-200 p-4 rounded-md mb-2">
                    <Text className="text-2xl font-bold">{captcha}</Text>
                    <TouchableOpacity onPress={handleRefresh} className="ml-2">
                        <Ionicons name="refresh" size={24} color="black" />
                    </TouchableOpacity>
                </View>
            </View>
            <InputField
                placeholder="Enter above Captcha"
                value={input}
                onChangeText={setInput}
            />
            <View className="flex-row justify-center w-4/5">
                <Button title="Verify" onPress={handleVerify} />
            </View>
        </View>
    );
});

export default SimpleCaptcha;