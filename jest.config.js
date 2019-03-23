module.exports = {
    globals: {
      NODE_ENV: 'test'
    },
    roots: [
      '<rootDir>/src'
    ],
    transform: {
      '^.+\\.tsx?$': 'ts-jest'
    },
    testRegex: '(/__tests__/.*|(\\.|/)(test|spec))\\.tsx?$',
    moduleFileExtensions: [
      'ts',
      'tsx',
      'js',
      'jsx',
      'json',
      'node'
    ],
    collectCoverage: true,
    collectCoverageFrom: [
      '**/*.{ts,tsx,js,jsx,json,node}',
      '!**/node_modules/**',
      '!**/typings/**',
      '!**/integration/**'
    ],
    // coverageThreshold: {
    //   global: {
    //     branches: 80,
    //     functions: 80,
    //     lines: 80,
    //     statements: -10
    //   }
    // }
  };
