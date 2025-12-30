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
import { ILibrary, ILibraryRegistrationRequest, ILibraryState, Library } from 'src/app/models/library.interface';

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

  getLibraryRegistration(userId: string): Observable<ILibrary | null> {
    const q = query(collection(this.firestore, 'library-registrations'), where('ownerId', '==', userId), limit(1));
    return from(getDocs(q)).pipe(
      map((snapshot) => {
        if (snapshot.empty) {
          return null;
        }
        const docRef = snapshot.docs[0];
        return this.getFullLibraryData(docRef, 'library-registrations');
      }),
    );
  }

  getApprovedLibrary(userId: string): Observable<ILibrary | null> {
    const q = query(collection(this.firestore, 'libraries'), where('managerIds', 'array-contains', userId), limit(1));
    return from(getDocs(q)).pipe(
      map((snapshot) => {
        if (snapshot.empty) {
          return null;
        }
        const docRef = snapshot.docs[0];
        return this.getFullLibraryData(docRef, 'libraries');
      }),
    );
  }

  private getFullLibraryData(docSnapshot: any, collectionName: string): ILibrary {
    const libraryData = { id: docSnapshot.id, ...docSnapshot.data() };

    const libraryId = docSnapshot.id;
    // Sort libraryImages by order if they exist
    if (libraryData.libraryImages && Array.isArray(libraryData.libraryImages)) {
      libraryData.libraryImages.sort((a: any, b: any) => (a.order ?? 0) - (b.order ?? 0));
    }
    const fullData = {
      ...libraryData,
    };
    console.log('[LibraryService] Merged full library data:', libraryData);
    return fullData as ILibrary;
  }

  public getLibraryRegistrationById(id: string): Observable<any> {
    const docRef = doc(this.firestore, 'library-registrations', id);
    return from(getDoc(docRef)).pipe(
      map((snapshot) => {
        if (snapshot.exists()) {
          return this.getFullLibraryData(snapshot, 'library-registrations');
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
          const data = doc.data() as ILibraryRegistrationRequest;
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
            totalSeats: data?.totalSeats,
            applicationStatus: data.applicationStatus,
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
            totalSeats: data?.totalSeats,
            applicationStatus: data.status, // Map 'status' to 'applicationStatus' for UI consistency
          };
        });
      }),
    );
  }

  public getLibraryById(libraryId: string): Observable<any> {
    const libraryDocRef = doc(this.firestore, `libraries/${libraryId}`);

    return from(getDoc(libraryDocRef)).pipe(
      map((librarySnapshot) => {
        if (!librarySnapshot.exists()) {
          return null;
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

          const totalSeats = data?.totalSeats ?? 0;
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
    const docRef = doc(this.firestore, collectionName, libraryId);

    // Fetch current document to get existing images if needed,
    // but here we are essentially replacing the list with what's in the form.
    // However, we need to preserve URLs for existing images that weren't changed.

    const finalImages: any[] = [];

    // Process each image in the array
    for (let idx = 0; idx < currentImages.length; idx++) {
      const img = currentImages[idx];
      let imageURL = img.previewUrl;
      let uploadedAt = new Date().toISOString(); // Default for new, will try to keep existing if available?
      // Ideally we should have the original object to keep metadata like uploadedAt/uploadedBy.
      // But the form only gives us the subset.

      if (img.file) {
        // It's a new file upload
        const path = `${collectionName}/${libraryId}/${Date.now()}_${img.file.name}`;
        const progressCallback = onProgress ? (pct: number) => onProgress(idx, pct) : undefined;
        imageURL = await this.firebaseService.uploadFile(path, img.file, progressCallback);
      }

      finalImages.push({
        imageURL: imageURL,
        caption: img.caption || '',
        order: idx, // Assign order based on array index
        uploadedAt: uploadedAt, // Simplification: we might lose original uploadedAt if we don't pass it back from form.
        // If strict metadata preservation is needed, we'd need to pass the full object through the form.
        // For now, this meets the requirement of syncing the list.
        uploadedBy: 'user', // Placeholder, ideally get from auth context or pass in.
      });
    }

    // Update the document with the new array
    await updateDoc(docRef, {
      libraryImages: finalImages,
    });
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
}
