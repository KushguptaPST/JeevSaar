module.exports = {
  preset: '@react-native/jest-preset',
  setupFiles: ['./jest.setup.js'],
  transformIgnorePatterns: [
    'node_modules/(?!(jest-)?react-native|@react-native|@react-navigation|lucide-react-native)',
  ],
  testMatch: ['**/__tests__/**/*.test.[jt]s?(x)'],
};
