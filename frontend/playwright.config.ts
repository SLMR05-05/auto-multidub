import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  workers: 1,
  timeout: 90_000,
  expect: { timeout: 15_000 },
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: 'http://localhost:13000',
    viewport: { width: 1440, height: 1000 },
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  webServer: [
    {
      command: 'mvn spring-boot:run -Dspring-boot.run.useTestClasspath=true -Dspring-boot.run.profiles=e2e',
      cwd: '..',
      url: 'http://localhost:18080/api/v1/languages',
      timeout: 180_000,
      reuseExistingServer: false,
      // The developer .env imports must not point E2E at the real MySQL database.
      env: {
        DB_URL: 'jdbc:h2:mem:poi_browser;MODE=MySQL;DB_CLOSE_DELAY=-1;DATABASE_TO_LOWER=TRUE',
        DB_USERNAME: 'sa',
        DB_PASSWORD: '',
        SERVER_PORT: '18080',
        SPRING_DATASOURCE_DRIVER_CLASS_NAME: 'org.h2.Driver',
        SPRING_JPA_HIBERNATE_DDL_AUTO: 'create-drop',
        SPRING_JPA_PROPERTIES_HIBERNATE_DIALECT: 'org.hibernate.dialect.H2Dialect',
        ADMIN_EMAIL: 'admin@e2e.local',
        ADMIN_PASSWORD: 'E2eTest123!',
        ADMIN_FULL_NAME: 'Browser Test Admin',
        CORS_ALLOWED_ORIGINS: 'http://localhost:13000',
        APP_QR_BASE_URL: 'http://localhost:18080/q/',
        AUDIO_DIRECTORY: './target/e2e-storage/audio',
        IMAGE_DIRECTORY: './target/e2e-storage/images',
        PACKAGE_DIRECTORY: './target/e2e-storage/packages',
        APP_OFFLINE_PACKAGES_BUILD_DELAY_MS: '500',
      },
    },
    {
      command: 'npm run dev -- --port 13000',
      url: 'http://localhost:13000/cms/login',
      env: { NEXT_PUBLIC_API_ORIGIN: 'http://localhost:18080', NEXT_DIST_DIR: '.next-e2e' },
      timeout: 180_000,
      reuseExistingServer: false,
    },
  ],
});
