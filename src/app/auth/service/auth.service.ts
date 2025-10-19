import { inject, Injectable } from '@angular/core';
import {
  Auth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  FacebookAuthProvider,
  UserCredential,
  user,
  authState,
} from '@angular/fire/auth';
import { connectAuthEmulator } from '@angular/fire/auth';
import { Firestore, doc, setDoc, getDoc, updateDoc, collection, query, where, getDocs } from '@angular/fire/firestore';
import { Router } from '@angular/router';
import { BehaviorSubject, map, Observable } from 'rxjs';
import { ToasterService } from 'src/app/services/toaster/toaster.service';
import { environment } from 'src/environments/environment';

export interface AppUser {
  createdAt: Date;
  email: string;
  id: string;
  name?: string;
  profileCompleted?: boolean;
  role: string;
  subscriptionExpiry?: Date;
  verified: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private router = inject(Router);
  private toaster = inject(ToasterService);
  private auth = inject(Auth);
  private firestore = inject(Firestore);

  private currentUser: AppUser | null = null;
  private authStatusListener = new BehaviorSubject<AppUser | null>(null);
  private authState$ = authState(this.auth);

  constructor() {
    this.loadUserFromSession();
    // Connect Auth emulator per-service if configured (keeps main.ts unchanged)
    try {
      if (environment.useEmulators && environment.emulatorUrls?.auth) {
        connectAuthEmulator(this.auth, environment.emulatorUrls.auth, { disableWarnings: true });
        console.log('AuthService: connected to Auth emulator at', environment.emulatorUrls.auth);
      }
    } catch (e) {
      console.warn('AuthService: failed to connect to Auth emulator', e);
    }

    this.setupAuthStateListener();
  }

  private setupAuthStateListener() {
    this.authState$.subscribe(async (firebaseUser) => {
      if (firebaseUser) {
        // Firebase user is authenticated, get our app user data
        await this.loadUserFromFirestore(firebaseUser.uid);
      } else {
        // User signed out
        this.currentUser = null;
        sessionStorage.removeItem('currentUser');
        this.authStatusListener.next(null);
      }
    });
  }

  private async loadUserFromFirestore(uid: string) {
    try {
      const userDoc = await getDoc(doc(this.firestore, 'users', uid));
      if (userDoc.exists()) {
        const userData = userDoc.data() as AppUser;
        this.currentUser = {
          ...userData,
          id: uid,
        };
        sessionStorage.setItem('currentUser', JSON.stringify(this.currentUser));
        this.authStatusListener.next(this.currentUser);
      } else {
        // User document doesn't exist in Firestore
        await this.auth.signOut();
        this.toaster.showToast('User data not found. Please contact support.', 'danger');
      }
    } catch (error) {
      console.error('Error loading user from Firestore:', error);
      this.toaster.showToast('Error loading user data.', 'danger');
    }
  }

  private loadUserFromSession() {
    const user = sessionStorage.getItem('currentUser');
    if (user) {
      this.currentUser = JSON.parse(user);
      this.authStatusListener.next(this.currentUser);
    }
  }

  getCurrentUser(): AppUser | null {
    return this.currentUser;
  }

  isLoggedIn(): boolean {
    return !!this.currentUser;
  }

  isStudent(): boolean {
    return this.currentUser?.role === 'student';
  }

  isAdmin(): boolean {
    return this.currentUser?.role === 'admin';
  }

  isManager(): boolean {
    return this.currentUser?.role === 'manager';
  }

  isVerified(): boolean {
    return this.currentUser?.verified === true;
  }

  getAuthStatusListener(): Observable<AppUser | null> {
    return this.authStatusListener.asObservable();
  }

  getAuthState(): Observable<any> {
    return this.authState$;
  }

  private async saveUserData(
    uid: string,
    email: string,
    role: string,
    name: string,
    verified: boolean = false,
  ): Promise<void> {
    const userData: AppUser = {
      id: uid,
      email,
      role,
      name,
      verified,
      createdAt: new Date(),
      subscriptionExpiry: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
      profileCompleted: false,
    };

    await setDoc(doc(this.firestore, 'users', uid), userData);
  }

  private async checkAdminExists(): Promise<boolean> {
    const usersRef = collection(this.firestore, 'users');
    const adminQuery = query(usersRef, where('role', '==', 'admin'), where('verified', '==', true));
    const querySnapshot = await getDocs(adminQuery);
    return !querySnapshot.empty;
  }

  async registerWithEmailAndPassword(email: string, password: string, role: string, name: string): Promise<void> {
    try {
      const userCredential = await createUserWithEmailAndPassword(this.auth, email, password);
      const uid = userCredential.user.uid;
      // By default, follow production rules. When running against the Firebase emulator
      // we simplify the flow for developers and auto-verify / auto-login accounts so
      // manager/admin flows can be tested without requiring admin approval.
      const isEmulator = !!environment?.useEmulators;

      let verified = false;
      let autoLogin = false;

      if (isEmulator) {
        // In emulator mode, mark user as verified and allow auto-login for all roles
        verified = true;
        autoLogin = true;
      } else {
        // Production behavior: enforce verification rules based on role
        if (role === 'student') {
          verified = true;
          autoLogin = true;
        } else if (role === 'manager') {
          verified = false; // Requires admin approval
          autoLogin = false;
        } else if (role === 'admin') {
          const adminExists = await this.checkAdminExists();
          verified = !adminExists;
          autoLogin = !adminExists;
        }
      }

      // Save user data to Firestore
      await this.saveUserData(uid, email, role, name, verified);

      if (autoLogin) {
        this.toaster.showToast('Registration successful!', 'success');
        // Auth state listener will handle the rest (and in emulator the user is active)
      } else {
        if (role === 'admin') {
          this.toaster.showToast('Registration successful! Your admin account is pending approval.', 'success');
        } else {
          this.toaster.showToast('Registration successful! Your account is pending admin approval.', 'success');
        }
        // Only sign out and redirect when not auto-logging in (production pending flows)
        await this.auth.signOut();
        this.router.navigate(['/login']);
      }
    } catch (error: any) {
      console.error('Firebase registration error:', error);
      this.handleAuthError(error, 'registration');
      throw error;
    }
  }

  async loginWithEmailAndPassword(email: string, password: string, selectedRole: string): Promise<void> {
    try {
      const userCredential = await signInWithEmailAndPassword(this.auth, email, password);
      const uid = userCredential.user.uid;
      // Verify user role in Firestore
      const userDoc = await getDoc(doc(this.firestore, 'users', uid));
      if (!userDoc.exists()) {
        await this.auth.signOut();
        this.toaster.showToast('Account not found. Please register first.', 'danger');
        return;
      }
      const userData = userDoc.data() as AppUser;
      this.currentUser = userData;

      // Check role match
      if (userData.role !== selectedRole) {
        await this.auth.signOut();
        this.toaster.showToast('Invalid role selection for this account.', 'danger');
        return;
      }

      // Check if account is verified
      if (!userData.verified) {
        await this.auth.signOut();
        this.toaster.showToast('Your account is pending approval. Please wait for admin verification.', 'warning');
        return;
      }

      this.toaster.showToast('Login successful!', 'success');
      this.redirectToDashboard(selectedRole);
    } catch (error: any) {
      console.error('Firebase login error:', error);
      this.handleAuthError(error, 'login');
      throw error;
    }
  }

  async loginWithGoogle(role: string): Promise<void> {
    try {
      const provider = new GoogleAuthProvider();
      provider.addScope('email');
      provider.addScope('profile');

      const userCredential = await signInWithPopup(this.auth, provider);
      await this.handleSocialLogin(userCredential, role, 'Google');
    } catch (error: any) {
      console.error('Google login error:', error);
      this.handleAuthError(error, 'social');
      throw error;
    }
  }

  async loginWithFacebook(role: string): Promise<void> {
    try {
      const provider = new FacebookAuthProvider();
      provider.addScope('email');

      const userCredential = await signInWithPopup(this.auth, provider);
      await this.handleSocialLogin(userCredential, role, 'Facebook');
    } catch (error: any) {
      console.error('Facebook login error:', error);
      this.handleAuthError(error, 'social');
      throw error;
    }
  }

  private async handleSocialLogin(userCredential: UserCredential, role: string, provider: string): Promise<void> {
    const user = userCredential.user;
    const uid = user.uid;

    // Check if user exists in Firestore
    const userDoc = await getDoc(doc(this.firestore, 'users', uid));

    if (userDoc.exists()) {
      // Existing user - verify role and status
      const userData = userDoc.data() as AppUser;

      if (userData.role !== role) {
        await this.auth.signOut();
        this.toaster.showToast(
          `This ${provider} account is already registered as a ${userData.role}. Please select the correct role.`,
          'danger',
        );
        return;
      }

      if (!userData.verified) {
        await this.auth.signOut();
        this.toaster.showToast('Your account is pending approval. Please wait for admin verification.', 'warning');
        return;
      }

      this.toaster.showToast(`${provider} login successful!`, 'success');
    } else {
      // New user - create account with selected role
      let verified = false;

      if (role === 'student') {
        verified = true;
      } else if (role === 'manager') {
        verified = false; // Requires admin approval
      } else if (role === 'admin') {
        const adminExists = await this.checkAdminExists();
        verified = !adminExists;
      }

      await this.saveUserData(uid, user.email!, role, user.displayName || 'User', verified);

      if (verified) {
        this.toaster.showToast(`${provider} registration successful!`, 'success');
      } else {
        this.toaster.showToast(`${provider} registration successful! Your account is pending approval.`, 'success');
        await this.auth.signOut();
        this.router.navigate(['/login']);
      }
    }
  }

  async logout(): Promise<void> {
    try {
      await this.auth.signOut();
      this.currentUser = null;
      sessionStorage.removeItem('currentUser');
      this.authStatusListener.next(null);
      this.toaster.showToast('Logged out successfully!', 'success');
      this.router.navigate(['/admin-login']);
    } catch (error) {
      console.error('Logout error:', error);
      this.toaster.showToast('Error during logout.', 'danger');
    }
  }

  async updateUserProfile(updates: Partial<AppUser>): Promise<void> {
    if (!this.currentUser) {
      throw new Error('No user logged in');
    }

    try {
      const userRef = doc(this.firestore, 'users', this.currentUser.id);
      await updateDoc(userRef, {
        ...updates,
        updatedAt: new Date(),
      });

      // Update local user data
      this.currentUser = { ...this.currentUser, ...updates };
      sessionStorage.setItem('currentUser', JSON.stringify(this.currentUser));
      this.authStatusListener.next(this.currentUser);

      this.toaster.showToast('Profile updated successfully!', 'success');
    } catch (error) {
      console.error('Error updating user profile:', error);
      this.toaster.showToast('Error updating profile.', 'danger');
      throw error;
    }
  }

  async resendVerificationEmail(): Promise<void> {
    // Implementation for email verification
    this.toaster.showToast('Verification email sent!', 'success');
  }

  async resetPassword(email: string): Promise<void> {
    // Implementation for password reset
    this.toaster.showToast('Password reset email sent!', 'success');
  }

  hasValidSubscription(): boolean {
    if (!this.currentUser?.subscriptionExpiry) return false;
    return new Date(this.currentUser.subscriptionExpiry) > new Date();
  }

  isProfileCompleted(): boolean {
    return this.currentUser?.profileCompleted === true;
  }

  redirectToDashboard(role?: string): void {
    const userRole = role || this.currentUser?.role;
    switch (userRole) {
      case 'admin':
        this.router.navigate(['/admin/dashboard']);
        break;
      case 'manager':
        this.router.navigate(['/manager/dashboard']);
        break;
      case 'student':
        this.router.navigate(['/student/dashboard']);
        break;
      default:
        this.router.navigate(['/dashboard']);
        break;
    }
  }

  private handleAuthError(error: any, context: 'login' | 'registration' | 'social'): void {
    const errorMessages: { [key: string]: string } = {
      // Common errors
      'auth/invalid-email': 'Invalid email address format.',
      'auth/user-disabled': 'This account has been disabled.',
      'auth/operation-not-allowed': 'This operation is not allowed.',

      // Login specific
      'auth/user-not-found': 'No account found with this email.',
      'auth/wrong-password': 'Incorrect password.',
      'auth/invalid-credential': 'Invalid login credentials.',

      // Registration specific
      'auth/email-already-in-use': 'This email is already registered.',
      'auth/weak-password': 'Password should be at least 6 characters.',

      // Social login specific
      'auth/popup-closed-by-user': 'Login popup was closed.',
      'auth/popup-blocked': 'Login popup was blocked by your browser.',
      'auth/cancelled-popup-request': 'Login popup was cancelled.',
      'auth/account-exists-with-different-credential':
        'An account already exists with the same email but different sign-in method.',
    };

    const message =
      errorMessages[error.code] ||
      (context === 'login'
        ? 'Login failed. Please try again.'
        : context === 'registration'
          ? 'Registration failed. Please try again.'
          : 'Authentication failed. Please try again.');

    this.toaster.showToast(message, 'danger');
  }

  // Utility method to check if user can access a route
  canAccess(requiredRole: string): boolean {
    if (!this.currentUser) return false;
    if (this.currentUser.role === 'admin') return true; // Admin has access to everything
    return this.currentUser.role === requiredRole;
  }

  // Get user role as observable
  getUserRole(): Observable<string | null> {
    return this.authStatusListener.pipe(map((user) => user?.role || null));
  }
}
