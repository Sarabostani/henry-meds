import { FastifyPluginAsync } from "fastify";
import fp from "fastify-plugin";
import sqlite3 from "sqlite3";
import { open, Database } from "sqlite";

export type Schedule = {
  id: string;
  provider_id: string;
  booked_by: string;
  booked_at: string;
  date: string;
  time_slot: string;
  confirmed: boolean;
};

declare module "fastify" {
  interface FastifyInstance {
    db: Database;
  }
}

const dbPlugin: FastifyPluginAsync = async (fastify, opts) => {
  const db = await open({
    filename: ":memory:",
    driver: sqlite3.Database,
  });
  fastify.decorate("db", db);

  fastify.addHook("onReady", async () => {
    await fastify.db.exec(`CREATE TABLE IF NOT EXISTS provider_schedule (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          provider_id INTEGER NOT NULL,
          booked_by INTEGER,
          booked_at TEXT,
          date TEXT NOT NULL,
          time_slot TEXT NOT NULL,
          confirmed BOOLEAN NOT NULL CHECK (confirmed IN (0, 1)),
          UNIQUE(provider_id, date, time_slot)
        );`);

    await fastify.db.exec(`CREATE TABLE IF NOT EXISTS providers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        title TEXT NOT NULL
        )`);

    await fastify.db.exec(`CREATE TABLE IF NOT EXISTS clients (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL
        )`);

    await fastify.db.exec(`
        INSERT INTO providers (name, title) VALUES ('Alice Smith', 'Dentist');
        INSERT INTO providers (name, title) VALUES ('Bob Johnson', 'Therapist');
        INSERT INTO providers (name, title) VALUES ('Carol White', 'Surgeon');`);

    await fastify.db.exec(`
        INSERT INTO clients (name) VALUES ('John Doe');
        INSERT INTO clients (name) VALUES ('Jane Roe');
        INSERT INTO clients (name) VALUES ('Jim Beam');
        `);
  });

  fastify.addHook("onClose", (instance, done) => {
    db.close();
    done();
  });
};

export default fp(dbPlugin);
