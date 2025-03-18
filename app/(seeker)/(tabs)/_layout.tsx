import { Tabs } from "expo-router";
import { Image, ImageSourcePropType, View, Text } from "react-native";
import { icons } from "@/constants";

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
                    title: "Home",
                    headerShown: false,
                    tabBarIcon: ({ focused }) => (
                        <TabIcon source={focused ? icons.homeActive : icons.home} focused={focused} label="Home" />
                    ),
                }}
            />
            <Tabs.Screen
                name="requests"
                options={{
                    title: "Requests",
                    headerShown: false,
                    tabBarIcon: ({ focused }) => (
                        <TabIcon source={focused ? icons.requestActive : icons.request} focused={focused} label="Requests" />
                    ),
                }}
            />
            <Tabs.Screen
                name="profile"
                options={{
                    title: "Profile",
                    headerShown: false,
                    tabBarIcon: ({ focused }) => (
                        <TabIcon source={focused ? icons.profileActive : icons.profile} focused={focused} label="Profile" />
                    ),
                }}
            />
            <Tabs.Screen
                name="support"
                options={{
                    title: "Support",
                    headerShown: false,
                    tabBarIcon: ({ focused }) => (
                        <TabIcon source={focused ? icons.supportActive : icons.support} focused={focused} label="Support" />
                    ),
                }}
            />
        </Tabs>
    );
}