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
import { addIcons } from 'ionicons';
import { saveOutline } from 'ionicons/icons';
import { AuthService } from 'src/app/auth/service/auth.service';
import { UserRole, UserStatus } from 'src/app/models/enums';
import { ILibrary, IPricingPlan } from 'src/app/models/library.interface';
import { User } from 'src/app/models/user';

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

      const newUserId = doc(collection(this.firestore, 'users')).id;

      const userData: User = {
        uid: newUserId,
        email: formValue.email,
        displayName: formValue.fullName,
        phoneNumber: formValue.phoneNumber,
        role: UserRole.Student,
        status: UserStatus.Active,
        createdAt: new Date(),

        // Profile
        address: formValue.address,
        idCardNumber: formValue.idCardNumber,
        acPreference: formValue.acPreference,

        // Context
        libraryId: libraryId,
        associatedLibraries: {
          enrolled: libraryId,
          applied: [],
          previous: [],
        },
        currentSubscription: {
          planName: formValue.selectedPlan,
          billingCycle: formValue.billingCycle,
          amount: formValue.amount,
          paymentDate: new Date(formValue.paymentDate),
          startDate: new Date(formValue.startDate),
          startTime: formValue.startTime,
          endTime: formValue.endTime,
        },
      };

      // 1. Create in root users collection
      await setDoc(doc(this.firestore, 'users', newUserId), userData);

      // 2. Create in library's subcollection
      await setDoc(doc(this.firestore, `libraries/${libraryId}/users`, newUserId), userData);

      this.router.navigate(['/manager/users']);
    } catch (error) {
      console.error('Error onboarding user:', error);
      // Handle error (show toast)
    } finally {
      this.isSubmitting = false;
    }
  }

  onCancel() {
    this.router.navigate(['/manager/users']);
  }
}
