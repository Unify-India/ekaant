import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle,
  IonItem,
  IonInput,
  IonButton,
  IonText,
  IonIcon,
  IonSpinner,
  IonButtons,
  IonBackButton,
} from '@ionic/angular/standalone';
import { AuthService } from '../service/auth.service';
import { addIcons } from 'ionicons';
import { mailOutline, arrowBackOutline } from 'ionicons/icons';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.page.html',
  styleUrls: ['./reset-password.page.scss'],
  standalone: true,
  imports: [
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonCard,
    IonCardContent,
    IonCardHeader,
    IonCardTitle,
    IonCardSubtitle,
    IonItem,
    IonInput,
    IonButton,
    IonText,
    IonIcon,
    IonSpinner,
    RouterLink,
    IonButtons,
    IonBackButton,
  ],
})
export class ResetPasswordPage implements OnInit {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  resetForm: FormGroup;
  isSubmitting = false;

  constructor() {
    addIcons({ mailOutline, arrowBackOutline });
    this.resetForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
    });
  }

  ngOnInit() {}

  async onSubmit() {
    if (this.resetForm.invalid) {
      this.resetForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    const email = this.resetForm.get('email')?.value;

    try {
      await this.authService.resetPassword(email);
      // Optional: Navigate back to login after a delay
      setTimeout(() => {
        this.router.navigate(['/login']);
      }, 3000);
    } catch (error) {
      // Error is handled in AuthService (toast)
    } finally {
      this.isSubmitting = false;
    }
  }
}