import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, Optional } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { IonicModule, ModalController } from '@ionic/angular';
import { addIcons } from 'ionicons';
import {
  arrowForward,
  logoFacebook,
  logoGoogle,
  homeOutline,
  arrowBackOutline,
  personOutline,
  peopleOutline,
} from 'ionicons/icons';

import { AuthService } from '../../auth/service/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule],
})
export class LoginPage implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  @Optional() private modalCtrl = inject(ModalController, { optional: true });

  pageTitle = 'Welcome to Ekaant';

  // Form states
  selectedRole: string | null = null;
  email: string = '';
  password: string = '';
  name: string = '';
  isRegisterMode: boolean = false;
  // Controls whether the auth form is visible (after role selection)
  showAuthForm: boolean = false;
  isLoading: boolean = false;

  // Auto-select manager if coming from registration
  autoSelectManager: boolean = false;
  redirectTo: string | null = null;

  constructor() {
    addIcons({
      logoGoogle,
      logoFacebook,
      arrowForward,
      homeOutline,
      arrowBackOutline,
      personOutline,
      peopleOutline,
    });
  }

  ngOnInit() {
    // Check if coming from registration flow using query params
    this.route.queryParams.subscribe((params) => {
      this.autoSelectManager = params['fromRegistration'] === 'true';
      this.redirectTo = params['redirectTo'] || null;

      if (this.autoSelectManager) {
        this.selectedRole = 'manager';
        // Automatically skip role selection and go directly to manager auth form
        this.skipToManagerAuth();
      }
    });
  }
  private skipToManagerAuth() {
    console.log('Skipping to manager auth form');

    // Set a small timeout to ensure the component is fully initialized
    setTimeout(() => {
      // Show the auth form right away
      this.showAuthForm = true;
      // Optionally switch to register mode for this flow
      this.isRegisterMode = true; // keep registration enabled for manager flow
      console.log('Auto-selected manager role and showing auth form');
    }, 100);
  }
  get role(): string | null {
    return this.selectedRole;
  }

  set role(value: string | null) {
    this.selectedRole = value;
  }

  selectRole(role: string) {
    this.selectedRole = role;
  }

  toggleAuthMode() {
    this.isRegisterMode = !this.isRegisterMode;
    this.email = '';
    this.password = '';
    this.name = '';
    if (this.isRegisterMode && this.autoSelectManager) {
      this.selectedRole = 'manager';
    }
  }

  async login() {
    if (!this.selectedRole || !this.email || !this.password) {
      return;
    }

    this.isLoading = true;
    try {
      await this.authService.loginWithEmailAndPassword(this.email, this.password, this.selectedRole);
      await this.handleSuccessfulAuth();
    } catch (error: any) {
      console.error('Login error:', error);
      this.handleAuthError(error);
    } finally {
      this.isLoading = false;
    }
  }

  async register() {
    if (!this.selectedRole || !this.email || !this.password || !this.name) {
      return;
    }

    this.isLoading = true;
    try {
      await this.authService.registerWithEmailAndPassword(this.email, this.password, this.selectedRole, this.name);
      await this.handleSuccessfulAuth();
    } catch (error: any) {
      console.error('Registration error:', error);
      this.handleAuthError(error);
    } finally {
      this.isLoading = false;
    }
  }

  async googleLogin() {
    this.isLoading = true;
    try {
      await this.authService.loginWithGoogle(this.selectedRole || 'student');
      await this.handleSuccessfulAuth();
    } catch (error: any) {
      console.error('Google login error:', error);
      this.handleAuthError(error);
    } finally {
      this.isLoading = false;
    }
  }

  async facebookLogin() {
    this.isLoading = true;
    try {
      await this.authService.loginWithFacebook(this.selectedRole || 'student');
      await this.handleSuccessfulAuth();
    } catch (error: any) {
      console.error('Facebook login error:', error);
      this.handleAuthError(error);
    } finally {
      this.isLoading = false;
    }
  }

  private async handleSuccessfulAuth() {
    if (this.selectedRole) {
      this.router.navigate([`/${this.selectedRole}/dashboard`]);
    } else {
      this.authService.redirectToDashboard(this.selectedRole || undefined);
    }
  }

  private handleAuthError(error: any) {
    // Error handling is now done in AuthService
    console.error('Authentication error:', error);
  }

  backToHome() {
    if (this.modalCtrl) {
      this.modalCtrl.dismiss();
    } else {
      this.router.navigate(['/home']);
    }
  }

  resetRole() {
    this.selectedRole = null;
    if (this.autoSelectManager) {
      this.selectedRole = 'manager';
    }
    // Hide the auth form when role is reset
    this.showAuthForm = false;
  }

  // Called when the Continue button is clicked after selecting a role
  proceedToAuthForm() {
    if (!this.selectedRole) {
      return;
    }
    this.showAuthForm = true;
    // Clear form fields to ensure fresh state
    this.email = '';
    this.password = '';
    this.name = '';
    // If auto-select manager is active, ensure register mode is set as desired
    if (this.autoSelectManager) {
      this.isRegisterMode = true;
    }
  }

  // Helper method to check if we're in a modal
  isModal(): boolean {
    return !!this.modalCtrl;
  }
}
