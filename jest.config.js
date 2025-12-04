// jest.config.js
module.exports = {
  // Configuración existente de Create React App
  ...require('react-scripts/config/jest.config')(),

  // Reportes para Jenkins
  reporters: [
    'default',
    ['jest-junit', {
      outputDirectory: 'test-results',
      outputName: 'junit.xml',
      suiteName: 'Pokédex PWA Tests'
    }]
  ],

  // Cobertura
  collectCoverageFrom: [
    'src/**/*.{js,jsx}',
    '!src/index.js',
    '!src/reportWebVitals.js',
    '!src/setupTests.js'
  ],

  coverageReporters: [
    'text',
    'lcov',
    'cobertura'
  ],

  // Umbrales de cobertura
  coverageThreshold: {
    global: {
      branches: 50,
      functions: 50,
      lines: 50,
      statements: 50
    }
  }
};