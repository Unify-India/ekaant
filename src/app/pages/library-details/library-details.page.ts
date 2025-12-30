import { Component, inject, OnInit } from '@angular/core';
import { Auth, authState } from '@angular/fire/auth';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { IonProgressBar, IonSpinner } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  timeOutline,
  peopleOutline,
  star,
  starOutline,
  add,
  callOutline,
  mailOutline,
  locationOutline,
  navigateCircleOutline,
  checkmarkCircle,
  closeCircle,
  wifiOutline,
  flashOutline,
  snowOutline,
  carOutline,
  cafeOutline,
  shieldOutline,
  closeCircleOutline,
  arrowForward,
  waterOutline,
  videocamOutline,
} from 'ionicons/icons';
import { AmenitiesCardComponent } from 'src/app/components/amenities-card/amenities-card.component';
import { ListCodeOfConductComponent } from 'src/app/components/list-code-of-conduct/list-code-of-conduct.component';
import { PriceCardComponent } from 'src/app/components/price-card/price-card.component';
import { RequirementsListComponent } from 'src/app/components/requirements-list/requirements-list.component';
import { ReviewCardComponent } from 'src/app/components/review-card/review-card.component';
import { AMENITIES_DATA } from 'src/app/models/constants/amenities.constants';
import { IAmenities, IBookCategory, ILibrary, IPricingDetails } from 'src/app/models/library.interface';
import { LibraryService } from 'src/app/services/library/library.service';
import { BaseUiComponents } from 'src/app/shared/core/micro-components/base-ui.module';
import { UiEssentials } from 'src/app/shared/core/micro-components/ui-essentials.module';

@Component({
  selector: 'app-library-details',
  templateUrl: './library-details.page.html',
  styleUrls: ['./library-details.page.scss'],
  standalone: true,
  imports: [
    BaseUiComponents,
    UiEssentials,
    IonSpinner,
    IonProgressBar,
    ReviewCardComponent,
    PriceCardComponent,
    AmenitiesCardComponent,
    RequirementsListComponent,
  ],
})
export class LibraryDetailsPage implements OnInit {
  pageTitle = 'Library details';
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private auth = inject(Auth);
  private libraryService = inject(LibraryService);

  isAuthenticated = false;
  isLoading = true;
  libraryId: string | null = null;

  libraryData: ILibrary = {
    id: '',
    amenities: [],
    applicationStatus: 'pending',
    bookCollection: [],
    codeOfConduct: '',
    comments: [],
    basicInformation: {
      libraryName: '',
      addressLine1: '',
      city: '',
      state: '',
      zipCode: '',
      is24Hours: false,
      openTime: '',
      closeTime: '',
      genderCategory: '',
    },
    seatManagement: {
      seats: [],
    },

    pricingPlans: [],
    libraryImages: [],

    hostProfile: {
      fullName: '',
      email: '',
      photoURL: '',
      visionStatement: '',
      address: '',
      experience: '',
      maskEmail: false,
      maskPhoneNumber: false,
      phoneNumber: 0,
    },
    requirements: [],
    createdAt: '',
    managerIds: [],
    ownerId: '',
    occupiedSeats: 0,
    totalSeats: 0,
    rating: {
      averageRating: 0,
      totalReviews: 0,
    },
    reviews: [],
    updatedAt: '',
  };

  public readonly starSummaryArray = [1, 2, 3, 4, 5];

  payPerUsePlans: IPricingDetails[] = [];
  monthlyPlans: IPricingDetails[] = [];
  displayRequirements: string[] = [];
  displayAmenities: IAmenities[] = [];

  // TODO: Fetch these from DB or Constants
  bookCategoryList: IBookCategory[] = [];

  codeOfConduct: SafeHtml | null = null;

  constructor(private sanitizer: DomSanitizer) {
    addIcons({
      timeOutline,
      peopleOutline,
      star,
      starOutline,
      add,
      callOutline,
      mailOutline,
      locationOutline,
      navigateCircleOutline,
      checkmarkCircle,
      closeCircle,
      wifiOutline,
      flashOutline,
      snowOutline,
      carOutline,
      cafeOutline,
      shieldOutline,
      closeCircleOutline,
      arrowForward,
      waterOutline,
      videocamOutline,
    });
  }

  ngOnInit() {
    authState(this.auth).subscribe((user) => {
      this.isAuthenticated = !!user;
    });

    this.route.paramMap.subscribe((params) => {
      this.libraryId = params.get('id');
      if (this.libraryId) {
        this.fetchLibraryDetails(this.libraryId);
      }
    });
  }

  fetchLibraryDetails(id: string) {
    this.isLoading = true;
    this.libraryService.getLibraryById(id).subscribe({
      next: (data) => {
        if (data) {
          this.mapLibraryData(data);
        }
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading library details:', err);
        this.isLoading = false;
      },
    });
  }

  mapLibraryData(data: any) {
    try {
      // 1. Map Amenities (handling both array and object map)
      let rawAmenities = data.amenities || [];
      if (!Array.isArray(rawAmenities) && typeof rawAmenities === 'object') {
        rawAmenities = Object.keys(rawAmenities).filter((k) => rawAmenities[k] === true);
      }
      const mappedAmenities = this.mapAmenities(rawAmenities);
      this.displayAmenities = mappedAmenities;

      // 2. Map Pricing Plans (for UI display)
      const rawPlans = data.pricingPlans || [];
      this.mapPricingPlans(rawPlans);

      // 3. Map Code of Conduct
      if (data.codeOfConduct && typeof data.codeOfConduct === 'string') {
        this.codeOfConduct = this.sanitizer.bypassSecurityTrustHtml(data.codeOfConduct);
      }

      // 4. Construct the ILibrary object
      // We merge 'data' with our default structure, but ensure key fields are correctly placed
      this.libraryData = {
        ...this.libraryData, // Keep defaults
        ...data, // Overwrite with firestore data
        amenities: rawAmenities,
        rating: data.rating || { average: 4.5, totalReviews: 12, breakdown: [{ stars: 5, count: 12 }] }, // Mock fallback if missing
        recentReviews: data.recentReviews || [],
        requirements: data.requirements || [],
      };

      // 5. Map Requirements to strings for UI
      if (this.libraryData.requirements) {
        this.displayRequirements = this.libraryData.requirements.map((r) => r.description || r.name).filter(Boolean);
      }

      // Ensure specific sub-objects are present if data was partial
      if (!this.libraryData.basicInformation) {
        this.libraryData.basicInformation = {
          libraryName: 'Unknown',
          addressLine1: '',
          city: '',
          state: '',
          zipCode: '',
          genderCategory: '',
          is24Hours: false,
          openTime: '',
          closeTime: '',
        };
      }
    } catch (error) {
      console.error('Error mapping library data:', error);
    }
  }

  mapAmenities(keys: any[]): IAmenities[] {
    if (!Array.isArray(keys)) return [];

    return keys
      .map((key) => {
        const strKey = String(key); // Ensure it's a string
        const data = AMENITIES_DATA[strKey];
        if (data) {
          return {
            ...data,
            isAvailable: true,
          };
        }
        // Fallback for unknown keys or legacy data
        return {
          icon: 'checkmark-circle-outline',
          amenityName: strKey,
          isAvailable: true,
        };
      })
      .filter((a) => a !== null);
  }

  mapPricingPlans(plans: any[]) {
    this.payPerUsePlans = plans
      .filter(
        (p) =>
          p.planType?.toLowerCase().includes('pay per use') ||
          p.planType?.toLowerCase().includes('daily pass') ||
          p.pricingType === 'PayPerUse',
      )
      .map((p) => ({
        pricingType: 'PayPerUse',
        price: p.rate || p.price,
        pricingName: p.planName || p.planType,
        unit: p.planType?.toLowerCase().includes('pay per use') ? 'hour' : 'day',
        amenities: [],
      }));

    this.monthlyPlans = plans
      .filter(
        (p) =>
          p.planType?.toLowerCase().includes('monthly') ||
          p.planType?.toLowerCase().includes('weekly') ||
          p.pricingType === 'Monthly',
      )
      .map((p) => ({
        pricingType: 'Monthly',
        price: p.rate || p.price,
        pricingName: p.planName || p.planType,
        unit: p.planType?.toLowerCase().includes('weekly') ? 'week' : 'month',
        timeRange: p.timeSlot,
        amenities: [{ amenityName: 'Reserved Seat', isAvailable: true }],
      }));
  }

  enrollNow() {
    if (this.isAuthenticated && this.libraryId) {
      this.router.navigate(['student/application-form', this.libraryId]);
    } else {
      this.router.navigate(['/login'], {
        queryParams: {
          redirectTo: '/student/application-form/' + this.libraryId,
          role: 'student',
        },
      });
    }
  }

  // Calculate the percentage for the progress bars
  getRatingPercentage(count: number): number {
    if (!this.libraryData.rating || this.libraryData.rating.totalReviews === 0) {
      return 0;
    }
    return count / this.libraryData.rating.totalReviews;
  }

  get getLibraryTypeClass(): string {
    let classes = '';
    const type = this.libraryData.basicInformation?.genderCategory?.toLowerCase();
    switch (type) {
      case 'co-ed':
        classes = 'bg-purple-100 text-purple-800';
        break;
      case 'boys only':
        classes = 'bg-blue-100 text-blue-800';
        break;
      case 'girls only':
        classes = 'bg-pink-100 text-pink-800';
        break;

      default:
        classes = '';
        break;
    }
    return classes;
  }

  get fullAddress(): string {
    const info = this.libraryData.basicInformation;
    if (!info) return '';
    return [info.addressLine1, info.addressLine2, info.city, info.state, info.zipCode].filter(Boolean).join(', ');
  }

  get operatingHours(): string {
    const info = this.libraryData.basicInformation;
    if (!info) return '';
    return `${info.openTime} || 'N/A'} - ${info.closeTime || 'N/A'}`;
  }

  get availableSeats(): number {
    const sm = this.libraryData;
    if (!sm) return 0;
    return (sm.totalSeats || 0) - (sm.occupiedSeats || 0);
  }
}
