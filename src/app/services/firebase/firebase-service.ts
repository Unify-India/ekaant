import { Injectable } from '@angular/core';
import { Firestore, collection, doc, setDoc, updateDoc, addDoc, serverTimestamp } from '@angular/fire/firestore';
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
        console.log('FirebaseService: connected Firestore to emulator at', host + ':' + port);
      }
    } catch (e) {
      // ignore emulator connection errors
    }
  }

  // Call emulator connection eagerly
  init() {
    this.connectEmulatorIfNeeded();
  }

  async addLibrary(libraryData: any): Promise<string> {
    try {
      const docRef = await addDoc(collection(this.firestore, 'library-registrations'), {
        ...libraryData,
        createdAt: serverTimestamp(),
      });
      return docRef.id;
    } catch (error) {
      console.error('Error adding library:', error);
      throw error;
    }
  }

  async uploadFile(
    libraryId: string,
    file: File,
    fileName?: string,
    onProgress?: (percent: number) => void,
  ): Promise<string> {
    const name = fileName || `${Date.now()}_${file.name}`;
    const ref = storageRef(this.storage, `library-registrations/${libraryId}/${name}`);

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

  async updateLibrary(libraryId: string, data: any): Promise<void> {
    const ref = doc(this.firestore, 'libraries', libraryId);
    await updateDoc(ref, data);
  }

  async addLibraryImage(
    libraryId: string,
    file: File,
    metadata: { caption?: string; order?: number } = {},
    onProgress?: (percent: number) => void,
  ) {
    const fileName = `${Date.now()}_${file.name}`;
    const url = await this.uploadFile(libraryId, file, fileName, onProgress);

    const imagesCol = collection(this.firestore, 'libraries', libraryId, 'libraryImages');
    const imageDoc = doc(imagesCol);
    await setDoc(imageDoc, {
      imageURL: url,
      caption: metadata.caption || null,
      order: metadata.order ?? null,
      uploadedAt: serverTimestamp(),
    });
    return { id: imageDoc.id, url };
  }

  async addRequirementDocument(
    libraryId: string,
    file: File,
    metadata: { description?: string } = {},
    onProgress?: (percent: number) => void,
  ) {
    const fileName = `requirement_${Date.now()}_${file.name}`;
    const url = await this.uploadFile(libraryId, file, fileName, onProgress);
    const reqCol = collection(this.firestore, 'libraries', libraryId, 'requirements');
    const reqDoc = doc(reqCol);
    await setDoc(reqDoc, {
      fileURL: url,
      description: metadata.description || null,
      uploadedAt: serverTimestamp(),
    });
    return { id: reqDoc.id, url };
  }
}
