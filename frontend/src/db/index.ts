import Dexie, { type Table } from "dexie";

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

export interface LocalProfile {
  id: string;
  username: string;
  email: string;
  profilePic?: string; 
  xp?: number;
  level?: number;
  _id?: string; 
}

export class LifeStreamDB extends Dexie {
  moments!: Table<LocalMoment>;
  rules!: Table<LocalRule>;
  profile!: Table<LocalProfile>;

  constructor() {
    super("LifeStreamDB");

    this.version(2).stores({
      moments: "_id, type, timestamp",
      rules: "_id",
      profile: "id",
    });

    this.moments = this.table("moments");
    this.rules = this.table("rules");
    this.profile = this.table("profile");
  }
}

export const db = new LifeStreamDB();
