import React, { useEffect, useState } from "react";
import { View, Text, FlatList, ActivityIndicator, Alert, TouchableOpacity } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { fetchAPI } from "@/lib/fetch";
import { constants } from "@/constants";
import { useTranslation } from "react-i18next";
import { useRouter } from "expo-router";

const TransactionsPage: React.FC = () => {
    const { t } = useTranslation();
    const router = useRouter();
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTransactions = async () => {
            try {
                const tokenString = await AsyncStorage.getItem("token");
                if (!tokenString) {
                    Alert.alert(t("sessionExpired"), t("pleaseLoginAgain"), [
                        {
                            text: t("ok"),
                            onPress: () => {
                                router.replace("/(auth)/sign-in");
                            },
                        },
                    ]);
                    return;
                }

                const response = await fetchAPI(`${constants.API_URL}/user/transactions/`, t, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${tokenString}`,
                    },
                });
                if (response === null || response === undefined) {
                    return;
                }
                console.log(response);
                setTransactions(response || []);
            } catch (error) {
                console.error("Error fetching transactions:", error);
                Alert.alert(t("error"), t("failedToFetchTransactions"));
            } finally {
                setLoading(false);
            }
        };
        fetchTransactions();
    }, []);

    if (loading) {
        return (
            <View className="flex-1 justify-center items-center bg-white">
                <ActivityIndicator size="large" color="#10b981" />
                <Text className="text-gray-600 mt-3">{t("loadingTransactions")}</Text>
            </View>
        );
    }

    if (transactions.length === 0) {
        return (
            <View className="flex-1 justify-center items-center bg-white">
                <Text className="text-gray-600 text-lg">{t("noTransactionsFound")}</Text>
            </View>
        );
    }

    return (
        <View className="flex-1 bg-gray-100">
            <View className="bg-green-500 py-4 px-5">
                <Text className="text-white text-2xl font-bold">{t("paymentTransactions")}</Text>
            </View>
            <FlatList
                data={transactions}
                keyExtractor={(item: any, index: number) => index.toString()}
                contentContainerStyle={{ padding: 10 }}
                renderItem={({ item }) => (
                    <View className="bg-white rounded-lg shadow-md p-4 mb-4">
                        <Text className="text-lg font-bold text-gray-800">
                            {t("planName")}: {item.title}
                        </Text>
                        <Text className="text-gray-600 mt-1">
                            {t("transactionCode")}: {item.transaction_code}
                        </Text>
                        <Text className="text-gray-600 mt-1">
                            {t("status")}:{" "}
                            <Text
                                className={`font-bold ${item.statusCode === "0000"
                                        ? "text-green-600"
                                        : item.status === "FAILED" || item.status === "Unknown"
                                            ? "text-red-600"
                                            : "text-yellow-600"
                                    }`}
                            >
                                {item.statusCode === "0000"
                                    ? t("success")
                                    : item.status === "Unknown"
                                        ? t("unknown")
                                        : t("failed")}
                            </Text>
                        </Text>
                        {item.status === "SUCCESS" && (
                            <>
                                <Text className="text-gray-600 mt-1">
                                    {t("amount")}: ₹{item.paidAmount || "N/A"}
                                </Text>
                                <Text className="text-gray-600 mt-1">
                                    {t("date")}:{" "}
                                    {item.transDate
                                        ? new Date(item.transDate).toLocaleDateString()
                                        : t("notAvailable")}
                                </Text>
                            </>
                        )}
                    </View>
                )}
            />
            <TouchableOpacity
                className="absolute bottom-5 right-5 bg-green-500 p-4 rounded-full shadow-lg"
                onPress={() => router.back()}
            >
                <Text className="text-white font-bold">{t("back")}</Text>
            </TouchableOpacity>
        </View>
    );
};

export default TransactionsPage;