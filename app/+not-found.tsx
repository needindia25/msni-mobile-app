import { Link, Stack } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { useTranslation } from "react-i18next"; // Import useTranslation

export default function NotFoundScreen() {
  const { t } = useTranslation(); // Initialize translation hook

  return (
    <>
      <Stack.Screen options={{ title: t("notFoundTitle") }} />
      <View style={styles.container}>
        <Text>{t("notFoundMessage")}</Text>
        <Link href="/" style={styles.link}>
          <Text>{t("goToHome")}</Text>
        </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  link: {
    marginTop: 15,
    paddingVertical: 15,
  },
});