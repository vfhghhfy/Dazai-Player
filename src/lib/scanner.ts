import * as mm from 'music-metadata-browser';
import { db } from './db';
import { Song } from '../types';

export async function processFile(file: File): Promise<Song | null> {
  try {
    const metadata = await mm.parseBlob(file);
    const { common, format } = metadata;

    let cover: string | undefined;
    if (common.picture && common.picture.length > 0) {
      const pic = common.picture[0];
      const blob = new Blob([pic.data], { type: pic.format });
      cover = URL.createObjectURL(blob);
    }

    return {
      title: common.title || file.name.replace(/\.[^/.]+$/, ""),
      artist: common.artist || 'Unknown Artist',
      album: common.album || 'Unknown Album',
      duration: format.duration || 0,
      url: URL.createObjectURL(file), // Note: This URL expires on refresh
      format: format.container || file.type.split('/')[1] || 'mp3',
      addedAt: Date.now(),
      playCount: 0,
      cover,
    };
  } catch (error) {
    console.error('Error parsing metadata for', file.name, error);
    return null;
  }
}

export async function addSongsToLibrary(files: File[]) {
  const songsToAdd: Song[] = [];
  for (const file of files) {
    if (file.type.startsWith('audio/') || file.name.match(/\.(mp3|flac|wav|m4a|ogg)$/i)) {
      const song = await processFile(file);
      if (song) {
        songsToAdd.push(song);
      }
    }
  }
  
  if (songsToAdd.length > 0) {
    await db.songs.bulkAdd(songsToAdd);
  }
}

export async function scanDirectory(directoryHandle: FileSystemDirectoryHandle) {
  const songsToAdd: Song[] = [];
  
  async function recursiveScan(handle: FileSystemDirectoryHandle) {
    for await (const entry of handle.values()) {
      if (entry.kind === 'file') {
        const file = await entry.getFile();
        if (file.type.startsWith('audio/') || file.name.match(/\.(mp3|flac|wav|m4a|ogg)$/i)) {
          const song = await processFile(file);
          if (song) {
            songsToAdd.push(song);
          }
        }
      } else if (entry.kind === 'directory') {
        await recursiveScan(entry);
      }
    }
  }

  await recursiveScan(directoryHandle);

  if (songsToAdd.length > 0) {
    await db.songs.bulkAdd(songsToAdd);
  }
}
