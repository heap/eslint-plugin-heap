module.exports = {
  globals: {
    'ts-jest': {
      diagnostics: false,
      isolatedModules: true,
    },
  },
  testEnvironment: 'node',
  transform: {
    '^.+\\.(d.ts|ts|tsx)?$': 'ts-jest',
  },
};
