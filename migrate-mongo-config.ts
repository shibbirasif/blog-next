import { config } from 'dotenv';

config({ path: '.env.local' });

export default {
  uri: process.env.MONGODB_URI,
  collection: 'migrations',
  migrationsPath: './src/migrations',
  autosync: false
};
