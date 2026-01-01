import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { Firestore, collection, doc, setDoc } from '@angular/fire/firestore';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonButtons,
  IonBackButton,
  IonGrid,
  IonRow,
  IonCol,
  IonCard,
  IonCardContent,
  IonLabel,
  IonInput,
  IonSelect,
  IonSelectOption,
  IonCheckbox,
  IonButton,
  IonIcon,
  IonSpinner,
} from '@ionic/angular/standalone';
import { AlertController } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { saveOutline } from 'ionicons/icons';
import { AuthService } from 'src/app/auth/service/auth.service';
import { UserRole, UserStatus } from 'src/app/models/enums';
import { ILibrary, IPricingPlan } from 'src/app/models/library.interface';
import { User } from 'src/app/models/user';
import { LibraryService } from 'src/app/services/library/library.service';
import { ToasterService } from 'src/app/services/toaster/toaster.service';

@Component({
  selector: 'app-onboard-user',
  templateUrl: './onboard-user.page.html',
  styleUrls: ['./onboard-user.page.scss'],
  standalone: true,
  imports: [
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonButtons,
    IonBackButton,
    IonGrid,
    IonRow,
    IonCol,
    IonCard,
    IonCardContent,
    IonLabel,
    IonInput,
    IonSelect,
    IonSelectOption,
    IonCheckbox,
    IonButton,
    IonIcon,
    IonSpinner,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
  ],
})
export class OnboardUserPage implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private firestore = inject(Firestore);
  private authService = inject(AuthService);
  private libraryService = inject(LibraryService);
  private toaster = inject(ToasterService);
  private alertController = inject(AlertController);

  onboardForm: FormGroup;
  isSubmitting = false;
  pricingPlans: IPricingPlan[] = [];

  constructor() {
    addIcons({ saveOutline });

    this.onboardForm = this.fb.group({
      // Personal Details
      fullName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phoneNumber: ['', Validators.required],
      address: ['', Validators.required],
      idCardNumber: ['', Validators.required],
      acPreference: [false],

      // Enrollment & Payment Details
      selectedPlan: [null, Validators.required], // Store the entire plan object or ID
      billingCycle: ['monthly', Validators.required],
      amount: ['', [Validators.required, Validators.min(0)]],
      paymentDate: [new Date().toISOString(), Validators.required],
      startDate: [new Date().toISOString(), Validators.required],
      // preferred study hours
      startTime: [''],
      endTime: [''],
    });
  }

  ngOnInit() {
    this.loadPricingPlans();
  }

  loadPricingPlans() {
    const currentUser = this.authService.getCurrentUser();
    const libraryId = currentUser?.primaryLibraryId;

    if (libraryId) {
      const managedLibrariesStr = localStorage.getItem('managedLibraries');
      if (managedLibrariesStr) {
        try {
          const libraries: ILibrary[] = JSON.parse(managedLibrariesStr);
          const currentLib = libraries.find((l) => l.id === libraryId);
          if (currentLib && currentLib.pricingPlans) {
            this.pricingPlans = currentLib.pricingPlans;
          }
        } catch (e) {
          console.error('Error parsing managed libraries', e);
        }
      }
    }
  }

  onPlanChange(event: any) {
    const planName = event.detail.value;
    const plan = this.pricingPlans.find((p) => p.planName === planName);
    if (plan) {
      this.onboardForm.patchValue({
        amount: plan.rate,
        // billingCycle: plan.planType.toLowerCase() // Optional: auto-select if mapped
      });
    }
  }

  // Getters for form validation
  get fullName() {
    return this.onboardForm.get('fullName');
  }
  get email() {
    return this.onboardForm.get('email');
  }
  get phoneNumber() {
    return this.onboardForm.get('phoneNumber');
  }
  get address() {
    return this.onboardForm.get('address');
  }
  get idCardNumber() {
    return this.onboardForm.get('idCardNumber');
  }
  get selectedPlan() {
    return this.onboardForm.get('selectedPlan');
  }
  get billingCycle() {
    return this.onboardForm.get('billingCycle');
  }
  get amount() {
    return this.onboardForm.get('amount');
  }
  get paymentDate() {
    return this.onboardForm.get('paymentDate');
  }
  get startDate() {
    return this.onboardForm.get('startDate');
  }
  get startTime() {
    return this.onboardForm.get('startTime');
  }
  get endTime() {
    return this.onboardForm.get('endTime');
  }

  async onSubmit() {
    if (this.onboardForm.invalid) {
      this.onboardForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;

    try {
      const formValue = this.onboardForm.value;
      const currentUser = this.authService.getCurrentUser();
      const libraryId = currentUser?.primaryLibraryId;

      if (!libraryId) {
        throw new Error('Library ID not found');
      }

      const onboardData = {
        email: formValue.email,
        fullName: formValue.fullName,
        phoneNumber: formValue.phoneNumber,
        address: formValue.address,
        idCardNumber: formValue.idCardNumber,
        acPreference: formValue.acPreference,
        libraryId: libraryId,
        planDetails: {
          planName: formValue.selectedPlan,
          billingCycle: formValue.billingCycle,
          amount: formValue.amount,
          paymentDate: formValue.paymentDate,
          startDate: formValue.startDate,
          startTime: formValue.startTime,
          endTime: formValue.endTime,
        },
      };

      const result: any = await this.libraryService.onboardUser(onboardData);

      if (result.data && result.data.status === 'success') {
        const { password, email } = result.data;

        const alert = await this.alertController.create({
          header: 'User Onboarded Successfully',
          message: `User created with email: <b>${email}</b><br><br>Temporary Password: <b style="font-size: 1.2em; color: var(--ion-color-primary);">${password}</b><br><br>Please share this password with the student. They should change it upon their first login.`,
          buttons: [
            {
              text: 'OK',
              handler: () => {
                this.router.navigate(['/manager/users']);
              },
            },
          ],
        });

        await alert.present();
      }
    } catch (error: any) {
      console.error('Error onboarding user:', error);
      this.toaster.showToast(error.message || 'Error onboarding user. Please try again.', 'danger');
    } finally {
      this.isSubmitting = false;
    }
  }

  onCancel() {
    this.router.navigate(['/manager/users']);
  }
}
