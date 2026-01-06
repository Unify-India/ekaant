import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonSpinner,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonItem,
  IonInput,
  IonList,
  IonButton,
  IonBackButton,
  IonButtons,
  ToastController,
  IonCheckbox,
  IonIcon,
  IonDatetime,
  IonDatetimeButton,
  IonModal,
  IonLabel,
  IonChip,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  informationCircleOutline,
  bookOutline,
  personCircleOutline,
  personOutline,
  arrowForwardOutline,
  calendarOutline,
} from 'ionicons/icons';
import { Subscription, combineLatest } from 'rxjs';
import { PriceCardComponent } from 'src/app/components/price-card/price-card.component';
import { IUser } from 'src/app/models/global.interface';
import { IPricingDetails, IPricingPlan, ILibrary } from 'src/app/models/library.interface';
import { LibraryService } from 'src/app/services/library/library.service';
import { UserService } from 'src/app/services/user/user.service';
import { BaseUiComponents } from 'src/app/shared/core/micro-components/base-ui.module';

@Component({
  selector: 'app-application-form',
  templateUrl: './application-form.page.html',
  styleUrls: ['./application-form.page.scss'],
  standalone: true,
  imports: [
    IonChip,
    IonLabel,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonSpinner,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonItem,
    IonInput,
    IonList,
    IonButton,
    IonBackButton,
    IonButtons,
    CommonModule,
    FormsModule,
    PriceCardComponent,
    IonCheckbox,
    IonIcon,
    BaseUiComponents,
    RouterLink,
    IonDatetime,
    IonDatetimeButton,
    IonModal,
  ],
})
export class ApplicationFormPage implements OnInit, OnDestroy {
  pageTitle = 'Enroll now';
  totalFee = 0; // Will be calculated based on selected plan
  reservationFee = 0; // Will be calculated based on selected plan

  confirmInfo = false;
  acceptTerms = false;

  libraryId: string | null = null;
  studentProfile: IUser | null = null;
  libraryDetails: ILibrary | null = null;
  displayPlans: (IPricingDetails & { originalPlan: IPricingPlan })[] = [];
  selectedPlan: IPricingPlan | null = null;
  isLoading = true;

  startDate: string = new Date().toISOString().split('T')[0];
  minDate: string = new Date().toISOString().split('T')[0];
  endDate: string = new Date().toISOString().split('T')[0];

  isProfileNameValid = false;
  isProfileEmailValid = false;
  isProfilePhoneValid = false;
  private subscription: Subscription = new Subscription();

  constructor(
    private activatedRoute: ActivatedRoute,
    private userService: UserService,
    private libraryService: LibraryService,
    private router: Router,
    private toastController: ToastController,
  ) {
    addIcons({
      bookOutline,
      personOutline,
      arrowForwardOutline,
      personCircleOutline,
      informationCircleOutline,
      calendarOutline,
    });
  }

  ngOnInit() {
    this.subscription.add(
      this.activatedRoute.paramMap.subscribe({
        next: (params) => {
          this.libraryId = params.get('id');
          if (this.libraryId) {
            this.fetchData(this.libraryId);
          } else {
            console.error('Library ID is missing from route parameters.');
            this.isLoading = false;
          }
        },
      }),
    );
  }

  fetchData(libraryId: string) {
    this.isLoading = true;
    this.subscription.add(
      combineLatest([
        this.userService.getCurrentUserProfile(),
        this.libraryService.getLibraryById(libraryId),
      ]).subscribe({
        next: ([studentProfile, libraryDetails]) => {
          this.studentProfile = studentProfile;
          this.libraryDetails = libraryDetails;
          if (libraryDetails && libraryDetails.pricingPlans) {
            this.displayPlans = this.mapPricingPlans(libraryDetails.pricingPlans);
          }
          this.validateStudentProfile();
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error fetching data:', error);
          this.isLoading = false;
        },
      }),
    );
  }

  mapPricingPlans(plans: IPricingPlan[]): (IPricingDetails & { originalPlan: IPricingPlan })[] {
    if (!plans) return [];
    return plans.map((p) => ({
      pricingType: p.planType,
      price: p.rate,
      pricingName: p.planName,
      unit: p.planType,
      timeRange: p.timeSlot,
      amenities: [], // Not available on IPricingPlan
      originalPlan: p, // Keep a reference to the original
    }));
  }

  selectPlan(mappedPlan: IPricingDetails & { originalPlan: IPricingPlan }) {
    this.selectedPlan = mappedPlan.originalPlan;
    this.totalFee = this.selectedPlan.rate; // Now correctly uses 'rate' from original plan
    this.reservationFee = this.totalFee * 0.05; // 5% reservation fee
    this.calculateEndDate();
  }

  onDateChange(event?: any) {
    const newVal = event?.detail?.value;
    if (newVal) {
      this.startDate = newVal.split('T')[0];
    }
    this.calculateEndDate();
  }

  calculateEndDate() {
    if (!this.selectedPlan || !this.startDate) return;

    const start = new Date(this.startDate);
    if (isNaN(start.getTime())) return;

    const end = new Date(start);
    const planType = (this.selectedPlan.planType || '').toLowerCase();

    // Flexible matching for plan types
    if (planType.includes('weekly')) {
      end.setDate(start.getDate() + 6); // 7 days total
    } else if (planType.includes('monthly')) {
      end.setDate(start.getDate() + 29); // 30 days total
    } else if (planType.includes('quarterly')) {
      end.setDate(start.getDate() + 89); // 90 days total
    } else {
      // Default to same day for Daily/Pay Per Use
    }

    this.endDate = end.toISOString().split('T')[0];
  }

  async submitApplication() {
    if (!this.studentProfile || !this.libraryDetails || !this.selectedPlan) {
      this.presentToast('Please ensure all details are loaded and a plan is selected.', 'danger');
      return;
    }

    const applicationData = {
      studentId: this.studentProfile.uid,
      studentName: this.studentProfile.name,
      studentEmail: this.studentProfile.email,
      libraryId: this.libraryDetails.id,
      libraryName: this.libraryDetails.basicInformation?.libraryName,
      selectedPlan: {
        ...this.selectedPlan,
        startDate: this.startDate,
        endDate: this.endDate,
        slotTypeId: this.selectedPlan.slotTypeId || this.selectedPlan.timeSlot, // Prefer slotTypeId, fallback to timeSlot
      },
      applicationStatus: 'pending', // Initial status
    };

    try {
      await this.libraryService.submitLibraryApplication(applicationData);
      this.presentToast('Application submitted successfully!', 'success');
      this.router.navigate(['/student/dashboard']); // Navigate to student dashboard or a confirmation page
    } catch (error) {
      console.error('Error submitting application:', error);
      this.presentToast('Failed to submit application. Please try again.', 'danger');
    }
  }

  async presentToast(message: string, color: string) {
    const toast = await this.toastController.create({
      message: message,
      duration: 2000,
      color: color,
    });
    toast.present();
  }

  validateStudentProfile() {
    if (!this.studentProfile) {
      this.isProfileNameValid = false;
      this.isProfileEmailValid = false;
      this.isProfilePhoneValid = false;
      return;
    }
    this.isProfileNameValid = !!this.studentProfile.name;
    // A simple email regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    this.isProfileEmailValid = !!this.studentProfile.email && emailRegex.test(this.studentProfile.email);
    this.isProfilePhoneValid = !!this.studentProfile.phoneNumber;
  }

  get isStudentProfileValid(): boolean {
    return this.isProfileNameValid && this.isProfileEmailValid && this.isProfilePhoneValid;
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
