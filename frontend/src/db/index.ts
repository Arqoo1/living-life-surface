import Dexie, { type Table } from "dexie";

// 1. Define types
export interface LocalMoment {
  _id: string;
  type: string;
  content: string;
  track: string[];
  timestamp: string;
}

export interface LocalRule {
  _id: string;
  content: string;
  updatedAt: string;
}

// 2. Define the Database class
export class LifeStreamDB extends Dexie {
  //define so TypeScript knows they exist on the class
  moments!: Table<LocalMoment>;
  rules!: Table<LocalRule>;

  constructor() {
    // Pass the database name to the base Dexie class
    super("LifeStreamDB");

    // 3. Define the Schema
    this.version(1).stores({
      moments: "_id, type, timestamp",
      rules: "_id",
    });

    // Explicitly link the table properties to the stores
    this.moments = this.table("moments");
    this.rules = this.table("rules");
  }
}

export const db = new LifeStreamDB();
