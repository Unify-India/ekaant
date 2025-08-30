import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';
import { AuthService } from '../service/auth.service';
import { logoGoogle } from 'ionicons/icons';
import { addIcons } from 'ionicons';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule],
})
export class LoginPage implements OnInit {
  pageTitle = 'Welcome to Abhyas';
  icons = { logoGoogle };

  selectedRole: string | null = null;
  email: string = '';
  password: string = '';
  isRegisterMode: boolean = false; // new flag to toggle between login and registration

  constructor(
    private authService: AuthService,
    private router: Router,
  ) {
    addIcons(this.icons);
  }

  async loginWithGoogle() {
    try {
      // await this.authService.loginWithGoogle();
      // Redirect based on user role (you'll need to implement this logic in AuthService)
      this.router.navigate(['/dashboard']);
    } catch (error) {
      console.error('Error logging in with Google:', error);
      // Handle login error (e.g., display an error message)
    }
  }

  selectRole(role: string) {
    this.selectedRole = role;
  }

  async loginOrRegisterWithEmail() {
    if (!this.selectedRole) return;
    try {
      if (this.isRegisterMode) {
        // Registration flow with role passed
        await this.authService.registerWithEmailAndPassword(this.email, this.password, this.selectedRole);
        // Do not clear form here; navigation is handled in the service
      } else {
        // Login flow
        await this.authService.loginWithEmailAndPassword(this.email, this.password, this.selectedRole);
        this.cancelLogin();
      }
    } catch (error) {
      console.error('Auth error:', error);
    }
  }

  toggleAuthMode() {
    this.isRegisterMode = !this.isRegisterMode;
    if (this.isRegisterMode) {
      // For registration, default role is 'Student'
      this.selectedRole = 'Student';
    } else {
      this.selectedRole = null;
    }
  }

  cancelLogin() {
    this.selectedRole = null;
    this.email = '';
    this.password = '';
    this.isRegisterMode = false;
  }

  ngOnInit() {}
}
