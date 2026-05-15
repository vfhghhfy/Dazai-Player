import Dexie, { type Table } from 'dexie';
import { Song, Playlist, ListeningStat } from '../types';

export class DazaiDB extends Dexie {
  songs!: Table<Song>;
  playlists!: Table<Playlist>;
  stats!: Table<ListeningStat>;
  favorites!: Table<{ userId: string; songId: number }>;

  constructor() {
    super('DazaiPlayerDB');
    this.version(1).stores({
      songs: '++id, title, artist, album, addedAt, playCount',
      playlists: '++id, name',
      stats: '++id, songId, timestamp',
      favorites: '++id, songId',
    });
  }
}

export const db = new DazaiDB();
