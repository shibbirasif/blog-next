import { migrationRunner } from '../lib/migrations';

export async function runMigrationsOnStartup() {
  if (process.env.NODE_ENV === 'development') {
    try {
      console.log('🔄 Running database migrations...');
      await migrationRunner.runAllMigrations();
      console.log('✅ All migrations completed successfully');
    } catch (error) {
      console.error('❌ Migration failed:', error);
      // Don't crash the app, just log the error
    }
  }
}

// Auto-run migrations when this module is imported in development
if (process.env.NODE_ENV === 'development') {
  runMigrationsOnStartup();
}
