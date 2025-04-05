module.exports = {
    preset: "jest-expo",
    setupFilesAfterEnv: ["@testing-library/jest-native/extend-expect"],
    transformIgnorePatterns: [
      "node_modules/(?!(expo|expo-modules-core|react-native|@react-native|@expo)/)"
    ],
  };
  