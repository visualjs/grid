/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  preset: 'ts-jest',
  moduleNameMapper: {
    ".*\\.(css|less|scss)$": "identity-obj-proxy",
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  moduleFileExtensions: [
    "js",
    "jsx",
    "ts",
    "tsx"
  ],
  transform: {
    "^.+\\.tsx?$": "esbuild-jest"
  }
};
