import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { Auth, authState } from '@angular/fire/auth';
import { Router, RouterLink } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { addIcons } from 'ionicons';
import {
  timeOutline,
  peopleOutline,
  star,
  starOutline,
  create,
  add,
  callOutline,
  mailOutline,
  locateOutline,
  locationOutline,
  shareOutline,
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
} from 'ionicons/icons';
import { AmenitiesCardComponent } from 'src/app/components/amenities-card/amenities-card.component';
import { ListCodeOfConductComponent } from 'src/app/components/list-code-of-conduct/list-code-of-conduct.component';
import { PriceCardComponent } from 'src/app/components/price-card/price-card.component';
import { RequirementsListComponent } from 'src/app/components/requirements-list/requirements-list.component';
import { ReviewCardComponent } from 'src/app/components/review-card/review-card.component';
import { IAmenities, IPricingDetails, Review } from 'src/app/models/library';
import { BookCategory } from 'src/app/models/library-registration.model';

@Component({
  selector: 'app-library-details',
  templateUrl: './library-details.page.html',
  styleUrls: ['./library-details.page.scss'],
  standalone: true,
  imports: [
    IonicModule,
    CommonModule,
    ReviewCardComponent,
    RouterLink,
    PriceCardComponent,
    AmenitiesCardComponent,
    RequirementsListComponent,
    ListCodeOfConductComponent,
  ],
})
export class LibraryDetailsPage implements OnInit {
  pageTitle = 'Library details';
  private router = inject(Router);
  private auth = inject(Auth);
  isAuthenticated = false;

  // Mock data for the entire page
  public libraryData = {
    id: 'mock-library-1',
    name: 'Central City Library',
    type: 'Co-ed',
    address: '123 Lalpur Main Road, Ranchi, Jharkhand',
    operatingHours: '6 AM - 10 PM',
    seats: {
      available: 25,
      total: 100,
    },
    rating: {
      average: 4.5,
      totalReviews: 128,
    },
    ratingsBreakdown: [
      { stars: 5, count: 78 },
      { stars: 4, count: 32 },
      { stars: 3, count: 12 },
      { stars: 2, count: 4 },
      { stars: 1, count: 2 },
    ],
    positiveAspects: ['Fast Wi-Fi', 'Cleanliness', 'Quiet Atmosphere', 'Helpful Staff', 'Good Location'],
    areasForImprovement: ['Crowded', 'AC Issues', 'Limited Parking', 'Slow Internet'],
    recentReviews: [
      {
        name: 'Priya Sharma',
        isVerified: true,
        rating: 5,
        timestamp: '2 days ago',
        comment: 'Excellent facilities and very clean environment. The Wi-Fi is super fast!',
        tags: [
          { text: 'Cleanliness', type: 'positive' },
          { text: 'Fast Wi-Fi', type: 'positive' },
        ],
      },
      {
        name: 'Rahul Singh',
        isVerified: true,
        rating: 4,
        timestamp: '1 week ago',
        comment: 'Great study environment, but can get crowded during exam season.',
        tags: [
          { text: 'Quiet Atmosphere', type: 'positive' },
          { text: 'Crowded', type: 'negative' },
        ],
      },
      {
        name: 'Anonymous User',
        isVerified: false,
        rating: 3,
        timestamp: '2 weeks ago',
        comment: 'Good location but AC needs improvement.',
        tags: [{ text: 'AC Issues', type: 'negative' }],
      },
    ] as Review[],
    amenities: [
      { icon: 'wifi-outline', isAvailable: true, amenityName: 'High speed WiFi' },
      { icon: 'flash-outline', isAvailable: true, amenityName: 'Power outlets' },
      { icon: 'snow-outline', isAvailable: true, amenityName: 'Air Conditioning' },
      { icon: 'car-outline', isAvailable: true, amenityName: 'Parking' },
      { icon: 'cafe-outline', isAvailable: false, amenityName: 'Refreshments' },
      { icon: 'shield-outline', isAvailable: true, amenityName: '24/7 Security' },
    ] as IAmenities[],
    requirements: [
      'Valid Government ID (digital upload accepted)',
      'Student ID or Proof of Study (if applicable)',
      'No hard copies required - all documents can be uploaded digitally',
    ],
  };

  // A helper array for rendering stars in the summary
  public readonly starSummaryArray = [1, 2, 3, 4, 5];

  allPricingPlans: IPricingDetails[] = [
    // Pay Per Use Plans
    {
      pricingType: 'PayPerUse',
      price: 15,
      pricingName: 'Hourly Rate (AC)',
      unit: 'hour',
      amenities: [
        { amenityName: 'AC + Wi-Fi', isAvailable: true },
        { amenityName: 'Power Outlet', isAvailable: true },
      ],
    },
    {
      pricingType: 'PayPerUse',
      price: 10,
      pricingName: 'Hourly Rate (Non-AC)',
      unit: 'hour',
      amenities: [
        { amenityName: 'Wi-Fi', isAvailable: true },
        { amenityName: 'Power Outlet', isAvailable: true },
      ],
    },
    // Monthly Membership Plans
    {
      pricingType: 'Monthly',
      price: 1200,
      pricingName: 'Morning Shift',
      unit: 'month',
      timeRange: '6 AM - 1 PM',
      amenities: [
        { amenityName: '7 hours/day', isAvailable: true },
        { amenityName: 'AC + Wi-Fi', isAvailable: true },
        { amenityName: 'Reserved Seat', isAvailable: true },
      ],
    },
    {
      pricingType: 'Monthly',
      price: 1000,
      pricingName: 'Noon Shift',
      unit: 'month',
      timeRange: '10 AM - 5 PM',
      amenities: [
        { amenityName: '7 hours/day', isAvailable: true },
        { amenityName: 'AC + Wi-Fi', isAvailable: true },
        { amenityName: 'Reserved Seat', isAvailable: true },
      ],
    },
    {
      pricingType: 'Monthly',
      price: 1300,
      pricingName: 'Evening Shift',
      unit: 'month',
      timeRange: '3 PM - 10 PM',
      amenities: [
        { amenityName: '7 hours/day', isAvailable: true },
        { amenityName: 'AC + Wi-Fi', isAvailable: true },
        { amenityName: 'Reserved Seat', isAvailable: false }, // Example of unavailable
      ],
    },
  ];

  codeOfConduct = [
    'Maintain complete silence in study areas',
    'Keep your assigned seat clean and organized',
    'No food or beverages at study desks',
    'Internet Usage Policy: Visiting illegal, adult, or pornographic websites is strictly prohibited. Violation will result in a fine of ₹500 and immediate termination of membership.',
    'Mobile phones must be on silent mode',
    "Respect other students' study time and space",
  ];

  payPerUsePlans!: IPricingDetails[];
  monthlyPlans!: IPricingDetails[];

  constructor() {
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
    });

    this.payPerUsePlans = this.allPricingPlans.filter((p) => p.pricingType === 'PayPerUse');
    this.monthlyPlans = this.allPricingPlans.filter((p) => p.pricingType === 'Monthly');
  }

  ngOnInit() {
    authState(this.auth).subscribe((user) => {
      this.isAuthenticated = !!user;
    });
  }

  enrollNow() {
    if (this.isAuthenticated) {
      this.router.navigate(['student/application-form', this.libraryData.id]);
    } else {
      this.router.navigate(['/login'], {
        queryParams: {
          redirectTo: '/student/application-form/' + this.libraryData.id,
          role: 'student',
        },
      });
    }
  }

  bookCategoryList: BookCategory[] = [
    { name: 'Engineering & Technology', selected: true },
    { name: 'Medical Sciences', selected: false },
    { name: 'Management & Business', selected: false },
    { name: 'Arts & Literature', selected: false },
    { name: 'Science & Mathematics', selected: false },
    { name: 'Competitive Exams', selected: false },
  ];

  // Calculate the percentage for the progress bars
  getRatingPercentage(count: number): number {
    if (this.libraryData.rating.totalReviews === 0) {
      return 0;
    }
    return count / this.libraryData.rating.totalReviews;
  }

  get getLibraryTypeClass(): string {
    let classes = '';
    switch (this.libraryData.type) {
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
}
