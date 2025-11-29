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
  collectionData,
  orderBy,
  deleteDoc,
  writeBatch,
} from '@angular/fire/firestore';
import { from, map, Observable, of, switchMap } from 'rxjs';
import { IUser } from 'src/app/models/global.interface';
import { IFirestoreLibrary, ILibraryState } from 'src/app/models/library.interface';

import { FirebaseService } from '../firebase/firebase-service';

@Injectable({
  providedIn: 'root',
})
export class LibraryService {
  private firestore = inject(Firestore);
  private firebaseService = inject(FirebaseService);

  constructor() {}

  async getManagerLibraryState(user: IUser): Promise<ILibraryState | null> {
    // 1. Check for an approved library first
    const approvedQuery = query(
      collection(this.firestore, 'libraries'),
      where('managerIds', 'array-contains', user.uid),
      limit(1),
    );
    const approvedSnapshot = await getDocs(approvedQuery);

    if (!approvedSnapshot.empty) {
      const libraryData = approvedSnapshot.docs[0].data();
      // Synthesize applicationStatus for consistency, as 'libraries' collection has 'status'
      return { ...libraryData, applicationStatus: 'approved' } as ILibraryState;
    }

    // 2. If no approved library, check for a registration request
    const pendingQuery = query(
      collection(this.firestore, 'library-registrations'),
      where('managerIds', 'array-contains', user.uid),
      limit(1),
    );
    const pendingSnapshot = await getDocs(pendingQuery);

    if (!pendingSnapshot.empty) {
      const requestData = pendingSnapshot.docs[0].data();
      // This document already has the 'applicationStatus' field
      return requestData as ILibraryState;
    }

    // 3. If nothing is found, return null;
    return null;
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

  public getApprovedLibrary(userId: string): Observable<any> {
    console.log('Fetching approved library for user:', userId);
    const q = query(collection(this.firestore, 'libraries'), where('managerIds', 'array-contains', userId), limit(1));
    return from(getDocs(q)).pipe(
      switchMap((snapshot) => {
        if (snapshot.empty) {
          return of(null);
        }
        const libraryDoc = snapshot.docs[0];
        const libraryData = { id: libraryDoc.id, ...libraryDoc.data() };
        const imagesColRef = collection(this.firestore, 'libraries', libraryDoc.id, 'libraryImages');
        return from(getDocs(imagesColRef)).pipe(
          map((imagesSnapshot) => {
            const libraryPhotos = imagesSnapshot.docs.map((doc) => {
              const data = doc.data();
              return { previewUrl: data['imageURL'] };
            });
            const transformedData = {
              ...libraryData,
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
          const data = doc.data() as IFirestoreLibrary;
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
            applicationStatus: data.status,
            // Include other top-level fields if necessary for display
            // ...data,
          };
        });
      }),
    );
  }

  public getApprovedLibraries(): Observable<any[]> {
    const q = query(collection(this.firestore, 'libraries'), where('status', '==', 'approved'));
    return from(getDocs(q)).pipe(
      map((snapshot) => {
        if (snapshot.empty) {
          return [];
        }
        return snapshot.docs.map((doc) => {
          const data = doc.data() as IFirestoreLibrary;
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
            applicationStatus: data.status, // Map 'status' to 'applicationStatus' for UI consistency
          };
        });
      }),
    );
  }

  public getLibrariesForCardView(): Observable<any[]> {
    const q = query(collection(this.firestore, 'libraries'), where('status', '==', 'approved'));
    return from(getDocs(q)).pipe(
      map((snapshot) => {
        if (snapshot.empty) {
          return [];
        }
        return snapshot.docs.map((doc) => {
          const data = doc.data() as IFirestoreLibrary;
          const address = [
            data.basicInformation?.addressLine1,
            data.basicInformation?.city,
            data.basicInformation?.state,
          ]
            .filter(Boolean)
            .join(', ');

          const totalSeats = data.seatManagement?.totalSeats ?? 0;
          const availableSeats = data.realtimeStats?.availableSeats ?? 0;

          return {
            id: doc.id,
            name: data.basicInformation?.libraryName,
            address: address,
            availableSeats: availableSeats,
            totalSeats: totalSeats,
            isFull: availableSeats === 0,
            type: data.basicInformation?.genderCategory,
            // TODO: Add a proper placeholder image
            photoURL: data.libraryImages?.libraryPhotos?.[0]?.previewUrl || null,
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

  public async updateLibraryRegistration(docId: string, data: any): Promise<void> {
    const ref = doc(this.firestore, 'library-registrations', docId);
    return await updateDoc(ref, {
      ...data,
      updatedAt: serverTimestamp(),
    });
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

  public getComments(registrationId: string): Observable<any[]> {
    const commentsRef = collection(this.firestore, 'library-registrations', registrationId, 'comments');
    const q = query(commentsRef, orderBy('timestamp', 'asc'));
    return collectionData(q, { idField: 'id' });
  }

  public addComment(registrationId: string, comment: any): Promise<any> {
    const commentsRef = collection(this.firestore, 'library-registrations', registrationId, 'comments');
    return addDoc(commentsRef, {
      ...comment,
      timestamp: serverTimestamp(),
    });
  }
}
