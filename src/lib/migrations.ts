import { dbConnect } from '../lib/db';
import Tag from '../models/Tag';

interface MigrationRecord {
  _id?: string;
  name: string;
  executedAt: Date;
}

const MIGRATION_COLLECTION = 'migrations';

class MigrationRunner {
  private async getMigrationCollection(db: any) {
    return db.collection(MIGRATION_COLLECTION);
  }

  private async hasBeenExecuted(db: any, migrationName: string): Promise<boolean> {
    const collection = await this.getMigrationCollection(db);
    const record = await collection.findOne({ name: migrationName });
    return !!record;
  }

  private async markAsExecuted(db: any, migrationName: string): Promise<void> {
    const collection = await this.getMigrationCollection(db);
    await collection.insertOne({
      name: migrationName,
      executedAt: new Date()
    });
  }

  async runSeedTags(): Promise<void> {
    try {
      const mongoose = await dbConnect();
      const db = mongoose.connection.db;

      const migrationName = 'seed-predefined-tags';

      if (await this.hasBeenExecuted(db, migrationName)) {
        console.log('✅ Predefined tags migration already executed');
        return;
      }

      console.log('🔄 Running predefined tags seeding...');

      // Check if tags already exist
      const existingTagsCount = await Tag.countDocuments();

      if (existingTagsCount === 0) {
        const predefinedTags = await import('./predefinedTags');
        await Tag.insertMany(predefinedTags.default);
        console.log(`✅ Seeded ${predefinedTags.default.length} predefined tags`);
      } else {
        console.log(`ℹ️ Found ${existingTagsCount} existing tags, skipping seeding`);
      }

      await this.markAsExecuted(db, migrationName);

    } catch (error) {
      console.error('❌ Error running tags migration:', error);
      throw error;
    }
  }

  async runAllMigrations(): Promise<void> {
    await this.runSeedTags();
  }
}

export const migrationRunner = new MigrationRunner();
