/**
 * Seed museums into the same database the API uses.
 * Uses backend env (MONGODB_URI) and Museum model → collection name is "museums".
 *
 * In MongoDB Atlas: open your database (name is in the connection string after the last /)
 * and look at the collection named "museums" (with an 's'), not "museum".
 */
import 'dotenv/config';
import { connectDatabase } from '../config/database';
import { MuseumModel } from '../modules/museums/museum.model';
import { egyptianMuseums } from './museums.seed';

async function seedMuseums() {
  try {
    await connectDatabase();
    console.log('Connected to MongoDB (same DB as your API).');

    // Remove all existing museums to avoid duplicates
    const deleted = await MuseumModel.deleteMany({});
    console.log(`Deleted ${deleted.deletedCount} existing museum(s).`);

    const inserted = await MuseumModel.insertMany(
      egyptianMuseums.map((m) => ({
        name: m.name,
        description: m.description,
        location: m.location,
        city: m.city,
        imageUrl: m.imageUrl,
        openingHours: m.openingHours ?? '9:00 AM – 5:00 PM',
        isActive: true,
      }))
    );

    console.log(`Inserted ${inserted.length} museums.`);
    console.log('In Atlas: check collection "museums" (with s) in your database.');
    process.exit(0);
  } catch (err) {
    console.error('Seed failed:', err);
    process.exit(1);
  }
}

seedMuseums();
