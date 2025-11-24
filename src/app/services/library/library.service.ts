import { inject, Injectable } from '@angular/core';
import {
  Firestore,
  collection,
  query,
  where,
  getDocs,
  limit,
  addDoc,
  serverTimestamp,
  updateDoc,
  doc,
  setDoc,
  getDoc,
} from '@angular/fire/firestore';
import { from, map, Observable, of, switchMap } from 'rxjs';
import { IUser } from 'src/app/models/global.interface';

import { FirebaseService } from '../firebase/firebase-service';

@Injectable({
  providedIn: 'root',
})
export class LibraryService {
  private firestore = inject(Firestore);
  private firebaseService = inject(FirebaseService);

  constructor() {}

  async hasLibrary(user: IUser): Promise<boolean> {
    // 1. Check for an approved library first
    const approvedQuery = query(collection(this.firestore, 'libraries'), where('managerId', '==', user.uid), limit(1));
    const approvedSnapshot = await getDocs(approvedQuery);

    if (!approvedSnapshot.empty) {
      const libraryData = approvedSnapshot.docs[0].data();
      // Ensure we add a status for the UI logic to work consistently
      localStorage.setItem('library', JSON.stringify({ ...libraryData, registration: 'registered' }));
      return true;
    }

    // 2. If no approved library, check for a registration request
    const pendingQuery = query(
      collection(this.firestore, 'library-registrations'),
      where('managerId', '==', user.uid),
      limit(1),
    );
    const pendingSnapshot = await getDocs(pendingQuery);

    if (!pendingSnapshot.empty) {
      const requestData = pendingSnapshot.docs[0].data();
      // The 'applicationStatus' from the request becomes the 'registration' status
      localStorage.setItem(
        'library',
        JSON.stringify({ ...requestData, registration: requestData['applicationStatus'] }),
      );
      return true;
    }

    // 3. If nothing is found, clear any stale data and return false
    localStorage.removeItem('library');
    return false;
  }

  public getLibraryRegistration(userId: string): Observable<any> {
    console.log('Fetching library registration for user:', userId);
    const q = query(collection(this.firestore, 'library-registrations'), where('ownerId', '==', userId), limit(1));
    return from(getDocs(q)).pipe(
      switchMap((snapshot) => {
        if (snapshot.empty) {
          return of(null);
        }
        const registrationDoc = snapshot.docs[0];
        const registrationData = { id: registrationDoc.id, ...registrationDoc.data() };
        const imagesColRef = collection(this.firestore, 'library-registrations', registrationDoc.id, 'libraryImages');
        return from(getDocs(imagesColRef)).pipe(
          map((imagesSnapshot) => {
            const libraryPhotos = imagesSnapshot.docs.map((doc) => {
              const data = doc.data();
              return { previewUrl: data['imageURL'] };
            });
            const transformedData = {
              ...registrationData,
              libraryImages: {
                libraryPhotos: libraryPhotos,
              },
            };
            return transformedData;
          }),
        );
      }),
    );
  }

  public getLibraryRegistrationById(id: string): Observable<any> {
    const docRef = doc(this.firestore, 'library-registrations', id);
    return from(getDoc(docRef)).pipe(
      map((snapshot) => {
        if (snapshot.exists()) {
          return { id: snapshot.id, ...snapshot.data() };
        } else {
          return null;
        }
      }),
    );
  }

  public getPendingLibraries(): Observable<any[]> {
    const q = query(collection(this.firestore, 'library-registrations'), where('applicationStatus', '==', 'pending'));
    return from(getDocs(q)).pipe(
      map((snapshot) => {
        if (snapshot.empty) {
          return [];
        }
        return snapshot.docs.map((doc) => {
          const data = doc.data();
          const addressParts = [
            data.basicInformation?.addressLine1,
            data.basicInformation?.addressLine2,
            data.basicInformation?.city,
            data.basicInformation?.state,
            data.basicInformation?.zipCode,
          ].filter(Boolean); // Filter out any undefined/null parts

          return {
            id: doc.id,
            libraryName: data.basicInformation?.libraryName,
            libraryManager: data.hostProfile?.fullName,
            address: addressParts.join(', '),
            totalSeats: data.seatManagement?.totalSeats,
            applicationStatus: data.applicationStatus,
            // Include other top-level fields if necessary for display
            // ...data,
          };
        });
      }),
    );
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

  public async updateLibrary(docId: string, data: any, isApproved = false): Promise<void> {
    const collectionName = isApproved ? 'libraries' : 'library-registrations';
    const ref = doc(this.firestore, collectionName, docId);
    return await updateDoc(ref, data);
  }

  async addLibraryImage(
    libraryId: string,
    file: File,
    isApproved = false,
    metadata: { caption?: string; order?: number } = {},
    onProgress?: (percent: number) => void,
  ) {
    const collectionName = isApproved ? 'libraries' : 'library-registrations';
    const path = `${collectionName}/${libraryId}/${Date.now()}_${file.name}`;
    const url = await this.firebaseService.uploadFile(path, file, onProgress);

    const imagesCol = collection(this.firestore, collectionName, libraryId, 'libraryImages');
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
    isApproved = false,
    metadata: { description?: string } = {},
    onProgress?: (percent: number) => void,
  ) {
    const collectionName = isApproved ? 'libraries' : 'library-registrations';
    const path = `${collectionName}/${libraryId}/requirements/${Date.now()}_${file.name}`;
    const url = await this.firebaseService.uploadFile(path, file, onProgress);

    const reqCol = collection(this.firestore, collectionName, libraryId, 'requirements');
    const reqDoc = doc(reqCol);
    await setDoc(reqDoc, {
      fileURL: url,
      description: metadata.description || null,
      uploadedAt: serverTimestamp(),
    });
    return { id: reqDoc.id, url };
  }
}
