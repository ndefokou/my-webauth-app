/** @type {import('ts-jest').JestConfigWithTsJest} */

export default {
    preset: "ts-jest",
    testEnvironment: "node", 
    moduleDirectories: ["node_modules", "src"],
    resolver: "jest-ts-webcompat-resolver",
    setupFilesAfterEnv: ["<rootDir>/jest_config/jest.setup.js"],
    collectCoverage: true,
    collectCoverageFrom: ["./src/**"],
    coverageThreshold: {
      global: {
        lines: 90,
      },
    },
    coveragePathIgnorePatterns: ["/node_modules/", "<rootDir>/src/authenticators.ts"],
  };
  