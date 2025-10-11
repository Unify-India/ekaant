import { Injectable, isDevMode } from '@angular/core';
import {
  Storage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
  listAll,
  getMetadata,
} from '@angular/fire/storage';
import { connectStorageEmulator } from 'firebase/storage';

@Injectable({
  providedIn: 'root',
})
export class StorageService {
  constructor(private storage: Storage) {
    if (isDevMode()) {
      connectStorageEmulator(this.storage, '127.0.0.1', 9199);
      console.log('Storage connected to emulator.');
    }
  }

  async uploadFile(path: string, file: File, onProgress?: (progress: number) => void): Promise<string> {
    const storageRef = ref(this.storage, `${path}/${file.name}`);
    const uploadTask = uploadBytesResumable(storageRef, file);

    return new Promise((resolve, reject) => {
      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          if (onProgress) {
            onProgress(progress);
          }
        },
        (error) => {
          console.error('Upload failed:', error);
          reject(error);
        },
        async () => {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          resolve(downloadURL);
        },
      );
    });
  }

  async deleteFile(fileUrl: string): Promise<void> {
    const fileRef = ref(this.storage, fileUrl);
    return deleteObject(fileRef);
  }

  async listFiles(path: string): Promise<string[]> {
    const folderRef = ref(this.storage, path);
    const result = await listAll(folderRef);
    const urlPromises = result.items.map((imageRef) => getDownloadURL(imageRef));
    return Promise.all(urlPromises);
  }

  async getFileMetadata(fileUrl: string): Promise<any> {
    const fileRef = ref(this.storage, fileUrl);
    return getMetadata(fileRef);
  }
}
