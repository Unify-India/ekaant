import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { Auth, authState } from '@angular/fire/auth';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { addIcons } from 'ionicons';
import {
  businessOutline,
  checkmarkDoneOutline,
  documentTextOutline,
  imagesOutline,
  shieldCheckmarkOutline,
  libraryOutline,
  trendingUpOutline,
  arrowForward,
  sparklesOutline,
} from 'ionicons/icons';
import { AdminRoutingModule } from 'src/app/admin/admin-routing.module';
import { IFeatureCard, IRegistrationStep } from 'src/app/models/library-registration-request';
import { BaseUiComponents } from 'src/app/shared/core/micro-components/base-ui.module';
import { UiEssentials } from 'src/app/shared/core/micro-components/ui-essentials.module';

@Component({
  selector: 'app-register-library',
  templateUrl: './register-library.page.html',
  styleUrls: ['./register-library.page.scss'],
  standalone: true,
  imports: [BaseUiComponents, UiEssentials, CommonModule, FormsModule, AdminRoutingModule],
})
export class RegisterLibraryPage implements OnInit {
  pageTitle = 'Library Registration';
  private router = inject(Router);
  private auth = inject(Auth);

  isAuthenticated = false;
  registrationSteps: IRegistrationStep[] = [
    {
      id: 1,
      icon: 'document-text-outline',
      color: 'tertiary',
      title: '1. Basic Information',
      description: 'Library name, address, and operating hours',
    },
    {
      id: 2,
      icon: 'images-outline',
      color: 'secondary',
      title: '2. Setup Details',
      description: 'Photos, seating, amenities, and pricing',
    },
    {
      id: 3,
      icon: 'shield-checkmark-outline',
      color: 'danger',
      title: '3. Policies',
      description: 'Requirements and code of conduct',
    },
    {
      id: 4,
      icon: 'checkmark-done-outline',
      color: 'success',
      title: '4. Review & Submit',
      description: 'Preview and submit for approval',
    },
  ];

  featureCards: IFeatureCard[] = [
    {
      id: 1,
      icon: 'sparkles-outline',
      color: 'warning',
      title: '6-Month Free Trial',
      description: 'Experience all premium features at no cost for the first 6 months. No hidden fees or charges.',
    },
    {
      id: 2,
      icon: 'business-outline',
      color: 'secondary',
      title: 'Easy Management',
      description: 'Streamline your operations with digital enrollment, automated tracking, and real-time analytics.',
    },
    {
      id: 3,
      icon: 'trending-up-outline',
      color: 'success',
      title: 'Increased Revenue',
      description: "Attract more students, reduce administrative overhead, and boost your library's profitability.",
    },
  ];
  constructor() {
    addIcons({
      libraryOutline,
      documentTextOutline,
      imagesOutline,
      shieldCheckmarkOutline,
      checkmarkDoneOutline,
      arrowForward,
      trendingUpOutline,
      businessOutline,
      sparklesOutline,
    });

    authState(this.auth).subscribe((user) => {
      this.isAuthenticated = !!user;
    });
  }

  ngOnInit() {}

  async proceedToRegistration() {
    this.router.navigate(['/login'], {
      queryParams: {
        fromRegistration: 'true',
        redirectTo: '/library-registration-form',
      },
    });
  }
}
