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
import { from, map, Observable, of, switchMap, forkJoin } from 'rxjs';
import { IUser } from 'src/app/models/global.interface';
import { ILibrary, ILibraryState, Library } from 'src/app/models/library.interface';

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

  getLibraryRegistration(userId: string): Observable<any> {
    const q = query(collection(this.firestore, 'library-registrations'), where('ownerId', '==', userId), limit(1));
    return from(getDocs(q)).pipe(
      switchMap((snapshot) => {
        if (snapshot.empty) {
          return of(null);
        }
        const docRef = snapshot.docs[0];
        return this.getFullLibraryData(docRef, 'library-registrations');
      }),
    );
  }

  getApprovedLibrary(userId: string): Observable<any> {
    const q = query(collection(this.firestore, 'libraries'), where('managerIds', 'array-contains', userId), limit(1));
    return from(getDocs(q)).pipe(
      switchMap((snapshot) => {
        if (snapshot.empty) {
          return of(null);
        }
        const docRef = snapshot.docs[0];
        return this.getFullLibraryData(docRef, 'libraries');
      }),
    );
  }

  private getFullLibraryData(docSnapshot: any, collectionName: string): Observable<any> {
    const libraryData = { id: docSnapshot.id, ...docSnapshot.data() };
    const libraryId = docSnapshot.id;

    const imagesColRef = collection(this.firestore, collectionName, libraryId, 'libraryImages');
    const plansColRef = collection(this.firestore, collectionName, libraryId, 'pricingPlans');
    // const reqsColRef = collection(this.firestore, collectionName, libraryId, 'requirements');

    const images$ = from(getDocs(imagesColRef)).pipe(
      map((sn) => sn.docs.map((d) => ({ id: d.id, previewUrl: d.data()['imageURL'], ...d.data() }))),
    );
    const plans$ = from(getDocs(plansColRef)).pipe(map((sn) => sn.docs.map((d) => ({ id: d.id, ...d.data() }))));
    // const reqs$ = from(getDocs(reqsColRef)).pipe(map((sn) => sn.docs.map((d) => ({ id: d.id, ...d.data() }))));

    return forkJoin({
      images: images$,
      plans: plans$,
      // reqs: reqs$,
    }).pipe(
      map(({ images, plans }) => {
        const fullData = {
          ...libraryData,
          libraryImages: { libraryPhotos: images },
          pricingPlans: plans,
        };
        console.log('[LibraryService] Merged full library data:', fullData);
        return fullData;
      }),
    );
  }

  public getLibraryRegistrationById(id: string): Observable<any> {
    const docRef = doc(this.firestore, 'library-registrations', id);
    return from(getDoc(docRef)).pipe(
      switchMap((snapshot) => {
        if (snapshot.exists()) {
          return this.getFullLibraryData(snapshot, 'library-registrations');
        } else {
          return of(null);
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
          const data = doc.data() as ILibrary;
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
          const data = doc.data() as ILibrary;
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

  public getLibraryById(libraryId: string): Observable<any> {
    const libraryDocRef = doc(this.firestore, `libraries/${libraryId}`);

    return from(getDoc(libraryDocRef)).pipe(
      switchMap((librarySnapshot) => {
        if (!librarySnapshot.exists()) {
          return of(null);
        }
        return this.getFullLibraryData(librarySnapshot, 'libraries');
      }),
    );
  }

  public getLibrariesForCardView(): Observable<Library[]> {
    const q = query(collection(this.firestore, 'libraries'), where('status', '==', 'approved'));
    return from(getDocs(q)).pipe(
      map((snapshot) => {
        if (snapshot.empty) {
          return [];
        }
        return snapshot.docs.map((doc) => {
          const data = doc.data() as ILibrary;
          const address = [
            data.basicInformation?.addressLine1,
            data.basicInformation?.city,
            data.basicInformation?.state,
          ]
            .filter(Boolean)
            .join(', ');

          const totalSeats = data.seatManagement?.totalSeats ?? 0;
          const occupiedSeats = 0;

          return {
            id: doc.id,
            name: data.basicInformation?.libraryName,
            address: address,
            occupiedSeats: occupiedSeats,
            totalSeats: totalSeats,
            type: data.basicInformation?.genderCategory,
            // TODO: Add a proper placeholder image
            photoURL: data.libraryImages?.[0]?.imageURL || null,
          } as Library;
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

  async submitLibraryApplication(applicationData: any): Promise<string> {
    try {
      const docRef = await addDoc(collection(this.firestore, 'studentLibraryApplications'), {
        ...applicationData,
        createdAt: serverTimestamp(),
      });
      return docRef.id;
    } catch (error) {
      console.error('Error submitting library application:', error);
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

  public async updateApprovedLibrary(docId: string, data: any): Promise<void> {
    const ref = doc(this.firestore, 'libraries', docId);
    return await updateDoc(ref, {
      ...data,
      updatedAt: serverTimestamp(),
    });
  }

  async syncLibraryImages(
    libraryId: string,
    currentImages: { file?: File; previewUrl: string; order?: number; caption?: string }[],
    isApproved: boolean,
    onProgress?: (idx: number, percent: number) => void,
  ): Promise<void> {
    const collectionName = isApproved ? 'libraries' : 'library-registrations';
    const imagesColRef = collection(this.firestore, collectionName, libraryId, 'libraryImages');
    const existingSnapshot = await getDocs(imagesColRef);
    const existingDocs = existingSnapshot.docs.map((d) => ({ id: d.id, ...d.data() }));

    const batch = writeBatch(this.firestore);

    // 1. Identify Deletions
    // Delete any existing doc whose imageURL is NOT in the currentImages list
    // (We match by URL because that's what we persist in the form)
    const currentUrls = new Set(currentImages.map((img) => img.previewUrl));
    existingDocs.forEach((exDoc: any) => {
      if (!currentUrls.has(exDoc.imageURL)) {
        batch.delete(doc(imagesColRef, exDoc.id));
      }
    });

    // 2. Identify Updates (Order/Caption) for existing images
    currentImages.forEach((img, idx) => {
      // Find matching existing doc
      const match = existingDocs.find((ex: any) => ex.imageURL === img.previewUrl);
      if (match) {
        // It's an existing image, update metadata if needed
        const ref = doc(imagesColRef, match.id);
        batch.update(ref, {
          order: idx, // Update order based on array position
          caption: img.caption || null,
        });
      }
    });

    // Commit deletions and metadata updates
    await batch.commit();

    // 3. Handle New Uploads (Sequential because they are async storage ops)
    // New images have a 'file' property
    for (let idx = 0; idx < currentImages.length; idx++) {
      const img = currentImages[idx];
      if (img.file) {
        // pass a callback that knows which index it is
        const progressCallback = onProgress ? (pct: number) => onProgress(idx, pct) : undefined;
        await this.addLibraryImage(
          libraryId,
          img.file,
          isApproved,
          { order: idx, caption: img.caption },
          progressCallback,
        );
      }
    }
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

  async syncRequirements(
    libraryId: string,
    currentReqs: any[],
    isApproved: boolean,
    onProgress?: (idx: number, percent: number) => void,
  ): Promise<void> {
    const collectionName = isApproved ? 'libraries' : 'library-registrations';
    const reqsColRef = collection(this.firestore, collectionName, libraryId, 'requirements');
    const existingSnapshot = await getDocs(reqsColRef);
    const existingDocs = existingSnapshot.docs.map((d) => ({ id: d.id, ...d.data() }));

    const batch = writeBatch(this.firestore);

    // 1. Identify Deletions
    const currentUrls = new Set(currentReqs.map((r) => r.fileURL).filter(Boolean));
    existingDocs.forEach((exDoc: any) => {
      if (!currentUrls.has(exDoc.fileURL)) {
        batch.delete(doc(reqsColRef, exDoc.id));
      }
    });

    // 2. Identify Updates
    currentReqs.forEach((req) => {
      const match = existingDocs.find((ex: any) => ex.fileURL === req.fileURL);
      if (match) {
        const ref = doc(reqsColRef, match.id);
        batch.update(ref, {
          description: req.description || null,
        });
      }
    });

    await batch.commit();

    // 3. Handle New Uploads
    for (let idx = 0; idx < currentReqs.length; idx++) {
      const req = currentReqs[idx];
      if (req.sampleFile) {
        const progressCallback = onProgress ? (pct: number) => onProgress(idx, pct) : undefined;
        await this.addRequirementDocument(
          libraryId,
          req.sampleFile,
          isApproved,
          { description: req.description },
          progressCallback,
        );
      }
    }
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

  async savePricingPlans(libraryId: string, plans: any[], isApproved: boolean): Promise<void> {
    const collectionName = isApproved ? 'libraries' : 'library-registrations';
    const subColRef = collection(this.firestore, collectionName, libraryId, 'pricingPlans');

    // Delete existing plans (safe update strategy for overwrite)
    const existingDocs = await getDocs(subColRef);
    const batch = writeBatch(this.firestore);
    existingDocs.forEach((doc) => batch.delete(doc.ref));

    // Add new plans
    plans.forEach((plan) => {
      const newDocRef = doc(subColRef);
      batch.set(newDocRef, plan);
    });

    await batch.commit();
  }
}
