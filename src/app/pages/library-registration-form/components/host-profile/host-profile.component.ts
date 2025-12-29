import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, computed, Signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormGroup, FormControl, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { IonProgressBar } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { warningOutline, personCircleOutline, shieldCheckmarkOutline } from 'ionicons/icons';
import { AuthService } from 'src/app/auth/service/auth.service';

import { LibraryRegistrationFormService } from '../../service/library-registration-form.service';

@Component({
  selector: 'app-host-profile',
  templateUrl: './host-profile.component.html',
  styleUrls: ['./host-profile.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, ReactiveFormsModule, IonProgressBar],
})
export class HostProfileComponent implements OnInit {
  private lrfService = inject(LibraryRegistrationFormService);
  private authService = inject(AuthService);
  public hostProfileForm!: FormGroup;

  // --- UI String Variables ---
  public readonly pageTitle = 'Host Profile';
  public readonly subTitle = 'Your profile and contact information';
  public readonly completionWarning = 'This section needs to be completed';
  public readonly sectionDescription =
    'Introduce yourself to potential students. A personal touch builds trust and helps students feel comfortable choosing your library.';
  public readonly privacyNote =
    'Your profile helps students feel confident about choosing your library. Contact masking ensures your privacy while still allowing interested students to reach out.';

  // --- Reactive Signals for Masking ---
  public maskedPhoneNumber!: Signal<string>;
  public maskedEmail!: Signal<string>;

  constructor() {
    addIcons({ warningOutline, personCircleOutline, shieldCheckmarkOutline });
    this.hostProfileForm = this.lrfService.getFormGroup('hostProfile');

    // Pre-fill email from logged-in user and disable editing
    const currentUser = this.authService.getCurrentUser();
    if (currentUser?.email) {
      const emailControl = this.hostProfileForm.get('email');
      if (emailControl) {
        emailControl.setValue(currentUser.email);
        emailControl.disable();
      }
    }

    const phoneSignal = toSignal(this.hostProfileForm.get('phoneNumber')!.valueChanges, {
      initialValue: this.hostProfileForm.get('phoneNumber')!.value,
    });
    const maskPhoneSignal = toSignal(this.hostProfileForm.get('maskPhoneNumber')!.valueChanges, {
      initialValue: this.hostProfileForm.get('maskPhoneNumber')!.value,
    });
    const emailSignal = toSignal(this.hostProfileForm.get('email')!.valueChanges, {
      initialValue: this.hostProfileForm.get('email')!.value,
    });
    const maskEmailSignal = toSignal(this.hostProfileForm.get('maskEmail')!.valueChanges, {
      initialValue: this.hostProfileForm.get('maskEmail')!.value,
    });

    this.maskedPhoneNumber = computed(() => {
      const phone = phoneSignal();
      if (!phone || !maskPhoneSignal()) {
        return phone;
      }
      return phone.length === 10 ? `******${phone.slice(-4)}` : phone;
    });

    this.maskedEmail = computed(() => {
      const email = emailSignal();
      if (!email || !maskEmailSignal()) {
        return email;
      }
      const [user, domain] = email.split('@');
      return domain ? `${user.slice(0, 2)}****@${domain}` : email;
    });
  }

  // ngOnInit can be removed if it's empty
  ngOnInit() {}
  triggerFileInput(fileInput: HTMLInputElement): void {
    fileInput.click();
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      const previewUrl = URL.createObjectURL(file);
      this.hostProfileForm.patchValue({
        profilePhoto: file,
        photoURL: previewUrl,
        profilePhotoProgress: 0,
      });
    }
  }
}
