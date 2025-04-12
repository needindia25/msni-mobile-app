import { Tabs } from "expo-router";
import { Image, ImageSourcePropType, View, Text } from "react-native";
import { icons } from "@/constants";
import { useTranslation } from "react-i18next"; // Import useTranslation


const TabIcon = ({
    source,
    focused,
    label,
}: {
    source: ImageSourcePropType;
    focused: boolean;
    label: string;
}) => (
    <View className="flex items-center">
        <Image
            source={source}
            resizeMode="contain"
            className={`w-6 h-6 ${focused ? "tint-blue-500" : "tint-gray-400"}`}
        />
        <Text
            className={`text-xs ${focused ? "text-blue-500" : "text-gray-400"}`}
            style={{ textAlign: 'center', width: '100%' }}
        >
            {label}
        </Text>
    </View>
);

export default function Layout() {
    const { t } = useTranslation(); // Initialize translation hook

    return (
        <Tabs
            screenOptions={{
                tabBarActiveTintColor: "blue",
                tabBarInactiveTintColor: "gray",
                tabBarShowLabel: false,
                tabBarStyle: {
                    backgroundColor: "#ffffff",
                    borderTopWidth: 1,
                    borderTopColor: "#e0e0e0",
                    height: 60,
                    paddingBottom: 5,
                    paddingTop: 5,
                },
            }}
        >
            <Tabs.Screen
                name="home"
                options={{
                    title: t("home"), // Use translation key
                    headerShown: false,
                    tabBarIcon: ({ focused }) => (
                        <TabIcon source={focused ? icons.homeActive : icons.home} focused={focused} label={t("home")} />
                    ),
                }}
            />
            <Tabs.Screen
                name="services"
                options={{
                    title: t("services"), // Use translation key
                    headerShown: false,
                    tabBarIcon: ({ focused }) => (
                        <TabIcon source={focused ? icons.requestActive : icons.request} focused={focused} label={t("services")} />
                    ),
                }}
            />
            <Tabs.Screen
                name="profile"
                options={{
                    title: t("profile"), // Use translation key
                    headerShown: false,
                    tabBarIcon: ({ focused }) => (
                        <TabIcon source={focused ? icons.profileActive : icons.profile} focused={focused} label={t("profile")} />
                    ),
                }}
            />
            <Tabs.Screen
                name="support"
                options={{
                    title: t("support"), // Use translation key
                    headerShown: false,
                    tabBarIcon: ({ focused }) => (
                        <TabIcon source={focused ? icons.supportActive : icons.support} focused={focused} label={t("support")} />
                    ),
                }}
                
            />
        </Tabs>
    );
}