import { inject, Injectable } from '@angular/core';
import { Auth, user } from '@angular/fire/auth';
import { Firestore, doc, getDoc, collection, collectionData } from '@angular/fire/firestore';
import { from, map, Observable, switchMap } from 'rxjs';
import { AuthService } from 'src/app/auth/service/auth.service';
import { IUser } from 'src/app/models/global.interface';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private auth = inject(Auth);
  private firestore = inject(Firestore);
  private authService = inject(AuthService);

  constructor() {}

  getCurrentUserProfile(): Observable<IUser | null> {
    return user(this.auth).pipe(
      switchMap((firebaseUser) => {
        if (firebaseUser) {
          const userDocRef = doc(this.firestore, `users/${firebaseUser.uid}`);
          return from(getDoc(userDocRef)).pipe(
            map((docSnapshot) => {
              if (docSnapshot.exists()) {
                return { uid: firebaseUser.uid, ...docSnapshot.data() } as IUser;
              } else {
                return null;
              }
            }),
          );
        } else {
          return new Observable<null>((observer) => {
            observer.next(null);
            observer.complete();
          });
        }
      }),
    );
  }

  getAllUsers(): Observable<IUser[]> {
    const usersCollection = collection(this.firestore, 'users');
    return collectionData(usersCollection, { idField: 'uid' }) as Observable<IUser[]>;
  }
}
