import { Injectable } from '@angular/core';
import { Firestore } from '@angular/fire/firestore';
import { connectFirestoreEmulator } from '@angular/fire/firestore';
import { Storage, ref as storageRef, uploadBytesResumable, getDownloadURL } from '@angular/fire/storage';
import { FirebaseError } from 'firebase/app';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class FirebaseService {
  constructor(
    private firestore: Firestore,
    private storage: Storage,
  ) {}

  // Ensure we connect to local Firestore emulator when running in dev
  private connectEmulatorIfNeeded() {
    try {
      if (environment.useEmulators && environment.emulatorUrls?.firestore) {
        const url = new URL(environment.emulatorUrls.firestore);
        const host = url.hostname;
        const port = Number(url.port) || environment.ports?.firestore || 9100;
        connectFirestoreEmulator(this.firestore, host, port);
        // console.log('FirebaseService: connected Firestore to emulator at', host + ':' + port);
      }
    } catch (e) {
      // ignore emulator connection errors
    }
  }

  // Call emulator connection eagerly
  init() {
    this.connectEmulatorIfNeeded();
  }

  async uploadFile(path: string, file: File, onProgress?: (percent: number) => void): Promise<string> {
    const ref = storageRef(this.storage, path);

    return new Promise((resolve, reject) => {
      const uploadTask = uploadBytesResumable(ref, file);

      uploadTask.on(
        'state_changed',
        (snapshot) => {
          if (onProgress) {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            onProgress(Math.round(progress));
          }
        },
        (error: FirebaseError) => {
          reject(error);
        },
        async () => {
          try {
            const url = await getDownloadURL(uploadTask.snapshot.ref);
            resolve(url);
          } catch (e) {
            reject(e);
          }
        },
      );
    });
  }
}
