import { Dimensions, StyleSheet } from "react-native";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

export function getHomeMetrics() {
  return {
    screenWidth,
    screenHeight,
    isSmallDevice: screenWidth < 360,
  };
}

export function createHomeStyles() {
  return StyleSheet.create({
    backgroundImage: {
      flex: 1,
      width: "100%",
      height: "100%",
    },
    container: {
      flex: 1,
      backgroundColor: "transparent",
    },
  });
}
