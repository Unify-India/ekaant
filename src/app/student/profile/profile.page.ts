import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { IonProgressBar, IonText } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { personCircle, personOutline, cloudUploadOutline, saveOutline, personCircleOutline } from 'ionicons/icons';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/auth/service/auth.service';
import { IUser } from 'src/app/models/global.interface';
import { BaseUiComponents } from 'src/app/shared/core/micro-components/base-ui.module';
import { FormEssentials } from 'src/app/shared/core/micro-components/form-essentials.module';
import { UiEssentials } from 'src/app/shared/core/micro-components/ui-essentials.module';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
  standalone: true,
  imports: [BaseUiComponents, FormEssentials, UiEssentials, IonProgressBar, IonText],
})
export class ProfilePage implements OnInit, OnDestroy {
  public selectedFacility = 'ac';
  pageTitle = 'Profile';
  user: IUser | null = null;
  profileForm: FormGroup;
  private userSubscription: Subscription | undefined;
  profileCompletion = 0;

  private authService = inject(AuthService);
  private fb = inject(FormBuilder);

  constructor() {
    addIcons({ personCircleOutline, personOutline, cloudUploadOutline, saveOutline, personCircle });
    this.profileForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phoneNumber: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
      fullAddress: [''],
      idNumber: [''],
      bookingPreference: ['ac'],
      preferredStartTime: [''],
      preferredEndTime: [''],
    });
  }

  ngOnInit() {
    this.userSubscription = this.authService.getAuthStatusListener().subscribe(async (user) => {
      this.user = user;
      if (this.user) {
        this.profileForm.patchValue(this.user);
        this.calculateProfileCompletion();
        this.profileForm.valueChanges.subscribe(() => this.calculateProfileCompletion());
      }
    });
  }

  ngOnDestroy() {
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
  }

  calculateProfileCompletion() {
    const formValues = this.profileForm.value;
    const totalFields = Object.keys(formValues).length;
    let completedFields = 0;
    for (const key in formValues) {
      if (formValues[key]) {
        completedFields++;
      }
    }
    this.profileCompletion = Math.round((completedFields / totalFields) * 100);
  }

  async saveProfile() {
    if (!this.user) return;
    if (this.profileForm.valid) {
      this.calculateProfileCompletion();
      const updatedUser = {
        ...this.profileForm.value,
        profileCompletion: this.profileCompletion,
        profileCompleted: this.profileCompletion === 100,
      };
      await this.authService.updateUserProfile(updatedUser);
    }
  }

  onFileSelected(event: any) {
    // TODO: Implement file upload logic
    console.log(event.target.files[0]);
  }
}
