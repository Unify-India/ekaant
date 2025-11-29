import { inject, Injectable } from '@angular/core';
import { Auth, user } from '@angular/fire/auth';
import { Firestore, doc, getDoc, collection } from '@angular/fire/firestore';
import { from, map, Observable, switchMap } from 'rxjs';
import { IUser } from 'src/app/models/global.interface';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private auth = inject(Auth);
  private firestore = inject(Firestore);

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
}
