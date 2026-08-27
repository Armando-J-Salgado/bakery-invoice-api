import { getTestDatabaseConfig } from './helpers/test-db.helper';

// Global test setup for all tests
beforeAll(async () => {
  // Initialize test database with SQLite memory
  global.testDbConfig = getTestDatabaseConfig();
});

// Reset database state before each test suite
beforeEach(async () => {
  // Clear all tables to ensure test isolation
  // This will be implemented in the test helper
});

// Cleanup after all tests
afterAll(async () => {
  // Close database connections
  if (global.testApp) {
    await global.testApp.close();
  }
});

// Increase timeout for all tests
jest.setTimeout(30000);

// Mock console.error to reduce noise in tests
const originalConsoleError = console.error;
console.error = (...args) => {
  // Only log actual errors, not warnings
  if (args[0] instanceof Error || args.some(arg => arg?.message?.includes('Error'))) {
    originalConsoleError.apply(console, args);
  }
};
