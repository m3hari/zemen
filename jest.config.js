module.exports = {
  testMatch: ["**/tests/*.spec.js", "**/**/*.unit.ts"],
  transform: {
    "^.+\\.(ts)$": "ts-jest",
  },
  coveragePathIgnorePatterns: ["/node_modules/", "/tests/"],
};
