## Revive Egypt – Backend

Node.js + Express + MongoDB (Mongoose) backend for the **Revive Egypt** museum-focused platform.

### Stack
- Node.js
- Express
- MongoDB + Mongoose
- TypeScript
- JWT authentication
- Role-based access control (planned)
- REST API

### Getting Started

1. Install dependencies:

```bash
npm install
```

2. Copy environment variables:

```bash
cp .env.example .env
```

3. Run the development server:

```bash
npm run dev
```

The API will be available at `http://localhost:4000` and a basic health check is exposed at `/health`.

4. (Optional) Seed the database with real Egyptian museums:

```bash
npm run seed
```

This uses the **same** `MONGODB_URI` as your API: it deletes all existing museums and inserts 14 unique ones (Grand Egyptian Museum, Egyptian Museum, NMEC, Museum of Islamic Art, Coptic Museum, etc.), so no duplicates.

**MongoDB Atlas:** Put your Atlas connection string in `.env` as `MONGODB_URI` (e.g. `mongodb+srv://user:pass@cluster.xxx.mongodb.net/revive_egypt`). Then run `npm run seed`. In Atlas, open your **database** (the name after the last `/` in the URI) and the collection **`museums`** (with an **s**)—Mongoose uses the plural name, not "museum".

