module.exports = {
  testMatch: ["**/tests/*.spec.ts", "**/**/*.unit.ts"],
  transform: {
    "^.+\\.(ts)$": "ts-jest",
  },
  coveragePathIgnorePatterns: ["/node_modules/", "/tests/"],
};
