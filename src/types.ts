/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Song {
  id?: number;
  title: string;
  artist: string;
  album: string;
  duration: number; // in seconds
  url: string; // Object URL or File path
  folderPath?: string;
  cover?: string; // base64 or object URL
  format: string;
  addedAt: number;
  playCount: number;
}

export interface Playlist {
  id?: number;
  name: string;
  songIds: number[];
  createdAt: number;
}

export interface ListeningStat {
  id?: number;
  songId: number;
  timestamp: number;
  durationPlayed: number;
}
