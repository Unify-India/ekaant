import { inject, Injectable } from '@angular/core';
import { Firestore, collection, query, where, getDocs, limit } from '@angular/fire/firestore';
import { from, map, Observable } from 'rxjs';
import { IUser } from 'src/app/models/global.interface';

@Injectable({
  providedIn: 'root',
})
export class LibraryService {
  private firestore = inject(Firestore);

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
      collection(this.firestore, 'libraryRegistrationRequests'),
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
    const q = query(collection(this.firestore, 'libraryRegistrationRequests'), where('managerId', '==', userId), limit(1));
    return from(getDocs(q)).pipe(
      map((snapshot) => {
        if (snapshot.empty) {
          return null;
        }
        return snapshot.docs[0].data();
      }),
    );
  }
}
