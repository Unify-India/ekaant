import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Router } from '@angular/router';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { getDatabase, ref, set, get } from 'firebase/database';
import { ToasterService } from 'src/app/services/toaster/toaster.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private currentUser: { id: string; role: string; subscriptionExpiry: Date } | null = null;
  private authStatusListener = new BehaviorSubject<{ id: string; role: string } | null>(null);

  constructor(
    private router: Router,
    private toaster: ToasterService,
  ) {
    this.loadUserFromSession();
  }

  private loadUserFromSession() {
    const user = sessionStorage.getItem('currentUser');
    if (user) {
      this.currentUser = JSON.parse(user);
      this.authStatusListener.next(this.currentUser);
    }
  }

  getCurrentUser() {
    return this.currentUser;
  }

  isLoggedIn(): boolean {
    return !!this.currentUser;
  }

  private getUserDataPath(role: string): string {
    if (role === 'Student' || role === 'Admin') {
      return `users/${role.toLowerCase()}`;
    } else if (role === 'Teacher') {
      return 'pending/teachers';
    } else if (role === 'School') {
      return 'pending/schools';
    } else {
      return 'users/user';
    }
  }

  private async saveUserData(uid: string, email: string, role: string, verified: boolean) {
    const database = getDatabase();
    const path = this.getUserDataPath(role);
    await set(ref(database, `${path}/${uid}`), {
      uid,
      email,
      role,
      verified,
      createdAt: new Date().toISOString(),
    });
  }

  async registerWithEmailAndPassword(email: string, password: string, role: string) {
    try {
      const userCredential = await createUserWithEmailAndPassword(getAuth(), email, password);
      const uid = userCredential.user.uid;
      // For teacher and school, set verified to false. For Admin, decide based on existing admins.
      const db = getDatabase();
      let verified = true;
      let autoLogin = false;
      if (role === 'Teacher' || role === 'School') {
        verified = false;
      } else if (role === 'Admin') {
        // Check if any admin exists
        const adminSnapshot = await get(ref(db, 'users/admin'));
        // If no admin exists, auto-approve; otherwise, require approval
        if (adminSnapshot.exists() && Object.keys(adminSnapshot.val()).length > 0) {
          verified = false;
        } else {
          verified = true;
          autoLogin = true;
        }
      } else if (role === 'Student') {
        autoLogin = true;
      }

      // Save user data to RTDB at a path based on role
      await this.saveUserData(uid, email, role, verified);

      if (autoLogin) {
        // Auto login for Student or first Admin
        this.currentUser = {
          id: uid,
          role: role,
          subscriptionExpiry: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
        };
        sessionStorage.setItem('currentUser', JSON.stringify(this.currentUser));
        this.authStatusListener.next(this.currentUser);
        this.toaster.showToast('Registration successful!', 'success');
        this.redirectToDashboard(role);
      } else {
        // For Teacher, School, or Admin (when already exists), do not auto login. They require admin approval.
        if (role === 'Admin') {
          this.toaster.showToast('Registration successful! Your admin account is pending approval.', 'success');
        } else {
          this.toaster.showToast('Registration successful! Your account is pending admin approval.', 'success');
        }
        this.currentUser = null;
        sessionStorage.removeItem('currentUser');
        this.authStatusListener.next(null);
        this.router.navigate(['/login']);
      }
    } catch (error: any) {
      console.error('Firebase registration error:', error);
      if (error.code === 'auth/email-already-in-use') {
        this.toaster.showToast('Email is already in use.', 'danger');
      } else if (error.code === 'auth/weak-password') {
        this.toaster.showToast('Password is too weak.', 'danger');
      } else {
        this.toaster.showToast('Registration failed. Please try again.', 'danger');
      }
      throw error;
    }
  }

  async loginWithEmailAndPassword(email: string, password: string, selectedRole: string) {
    try {
      const userCredential = await signInWithEmailAndPassword(getAuth(), email, password);
      const uid = userCredential.user.uid;
      // Determine the expected RTDB path based on the selected role
      let expectedPath: string;
      if (selectedRole === 'Student') {
        expectedPath = `users/student/${uid}`;
      } else if (selectedRole === 'Admin') {
        expectedPath = `users/admin/${uid}`;
      } else if (selectedRole === 'Teacher') {
        expectedPath = `users/teachers/${uid}`;
      } else if (selectedRole === 'School') {
        expectedPath = `users/schools/${uid}`;
      } else {
        expectedPath = `users/user/${uid}`;
      }
      const db = getDatabase();
      const snapshot = await get(ref(db, expectedPath));
      if (!snapshot.exists()) {
        this.toaster.showToast('Wrong credentials. Please verify details.', 'danger');
        return; // Do not proceed
      }
      const userData = snapshot.val();
      if (userData.role !== selectedRole) {
        this.toaster.showToast('Wrong credentials. Please verify details.', 'danger');
        return; // Role mismatch, do not login
      }
      // If everything is valid, proceed with login
      this.currentUser = {
        id: uid,
        role: selectedRole,
        subscriptionExpiry: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
      };
      sessionStorage.setItem('currentUser', JSON.stringify(this.currentUser));
      this.authStatusListener.next(this.currentUser);
      this.toaster.showToast('Login successful!', 'success');
      this.redirectToDashboard(selectedRole);
    } catch (error: any) {
      console.error('Firebase login error:', error);
      if (error.code === 'auth/wrong-password') {
        this.toaster.showToast('Incorrect password. Please try again.', 'danger');
      } else if (error.code === 'auth/user-not-found') {
        this.toaster.showToast('No user found with this email.', 'danger');
      } else {
        this.toaster.showToast('Login failed. Please try again.', 'danger');
      }
      throw error;
    }
  }

  login(role: string) {
    this.currentUser = {
      id: '1',
      role,
      subscriptionExpiry: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
    };
    sessionStorage.setItem('currentUser', JSON.stringify(this.currentUser));
    this.authStatusListener.next(this.currentUser);
    this.redirectToDashboard(role);
  }

  logout() {
    this.currentUser = null;
    sessionStorage.removeItem('currentUser');
    this.authStatusListener.next(null);
    this.router.navigate(['/login']);
  }

  getAuthStatusListener() {
    return this.authStatusListener.asObservable();
  }

  private redirectToDashboard(role: string) {
    switch (role) {
      case 'Admin':
        this.router.navigate(['/admin/dashboard']);
        break;
      case 'Teacher':
        this.router.navigate(['/teacher/dashboard']);
        break;
      case 'Student':
        this.router.navigate(['/student/dashboard']);
        break;
      case 'School':
        this.router.navigate(['/school/profile']);
        break;
      default:
        this.router.navigate(['/dashboard']);
        break;
    }
  }

  hasValidSubscription(_userId: string): boolean {
    const user = this.getCurrentUser();
    if (!user) return false;

    const now = new Date();
    return user.subscriptionExpiry && new Date(user.subscriptionExpiry) > now;
  }

  isExamInProgress(): boolean {
    return false;
  }
}
