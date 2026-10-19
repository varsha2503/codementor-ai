/** @type {import('jest').Config} */
const sharedMapper = {
  "^@codementor/shared$": "<rootDir>/packages/shared/src/index.ts",
  "^(\\.{1,2}/.*)\\.js$": "$1",
};

const tsJestEsm = {
  useESM: true,
  tsconfig: {
    module: "ESNext",
    moduleResolution: "Bundler",
    target: "ES2022",
    jsx: "react-jsx",
    esModuleInterop: true,
    strict: true,
    skipLibCheck: true,
    noUncheckedIndexedAccess: true,
  },
};

/** @type {import('jest').Config} */
module.exports = {
  projects: [
    {
      displayName: "shared",
      testEnvironment: "node",
      rootDir: ".",
      testMatch: ["<rootDir>/packages/shared/src/**/*.test.ts"],
      moduleNameMapper: sharedMapper,
      extensionsToTreatAsEsm: [".ts"],
      transform: {
        "^.+\\.tsx?$": ["ts-jest", { ...tsJestEsm, tsconfig: "<rootDir>/packages/shared/tsconfig.json" }],
      },
    },
    {
      displayName: "api",
      testEnvironment: "node",
      rootDir: ".",
      setupFiles: ["<rootDir>/jest.setup.api.cjs", "<rootDir>/apps/api/src/test/registerMocks.ts"],
      testMatch: ["<rootDir>/apps/api/src/**/*.test.ts"],
      moduleNameMapper: sharedMapper,
      extensionsToTreatAsEsm: [".ts"],
      transform: {
        "^.+\\.tsx?$": [
          "ts-jest",
          {
            ...tsJestEsm,
            tsconfig: "<rootDir>/apps/api/tsconfig.json",
            diagnostics: false,
          },
        ],
      },
    },
    {
      displayName: "web",
      testEnvironment: "jsdom",
      rootDir: ".",
      setupFilesAfterEnv: ["<rootDir>/jest.setup.web.cjs"],
      testMatch: ["<rootDir>/apps/web/src/**/*.test.{ts,tsx}"],
      moduleNameMapper: sharedMapper,
      extensionsToTreatAsEsm: [".ts", ".tsx"],
      transform: {
        "^.+\\.tsx?$": [
          "ts-jest",
          {
            ...tsJestEsm,
            tsconfig: "<rootDir>/apps/web/tsconfig.json",
            diagnostics: false,
          },
        ],
      },
    },
    {
      displayName: "worker",
      testEnvironment: "node",
      rootDir: ".",
      testMatch: [
        "<rootDir>/workers/judge/src/**/*.test.ts",
        "<rootDir>/workers/judge/tests/**/*.test.ts",
      ],
      moduleNameMapper: sharedMapper,
      extensionsToTreatAsEsm: [".ts"],
      transform: {
        "^.+\\.tsx?$": ["ts-jest", { ...tsJestEsm, tsconfig: "<rootDir>/workers/judge/tsconfig.json" }],
      },
    },
  ],
};
