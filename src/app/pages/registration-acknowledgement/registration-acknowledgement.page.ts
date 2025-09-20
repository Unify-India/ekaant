import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { checkmarkCircleOutline, arrowBackOutline, gridOutline } from 'ionicons/icons';

import { LibraryRegistrationFormService } from '../library-registration-form/service/library-registration-form.service';

@Component({
  selector: 'app-registration-acknowledgement',
  templateUrl: './registration-acknowledgement.page.html',
  styleUrls: ['./registration-acknowledgement.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule],
})
export class RegistrationAcknowledgementPage implements OnInit {
  private router = inject(Router);
  private lrfService = inject(LibraryRegistrationFormService);

  // --- UI String Variables ---
  public readonly pageTitle = 'Registration Submitted';
  public readonly mainHeading = 'Registration Submitted Successfully!';
  public libraryName = '';
  public readonly thankYouMessage = (name: string) =>
    `Thank you for registering ${name} with our platform. Your application has been received and is now under review.`;
  public readonly nextStepsTitle = 'What happens next?';
  public readonly footerText = 'Need help or have questions? Contact our support team at';
  public readonly supportEmail = 'support@studyportal.com';
  public readonly homeButtonText = 'Back to Home';
  public readonly dashboardButtonText = 'Go to Dashboard';

  // --- Data for the Steps List ---
  public readonly nextSteps = [
    {
      title: 'Review Process',
      description: 'Our team will review your application within 2-3 business days.',
    },
    {
      title: 'Verification',
      description: 'We may contact you for additional information or verification.',
    },
    {
      title: 'Approval Notification',
      description: "You'll receive an email notification once your library is approved and live on the platform.",
    },
  ];

  constructor() {
    addIcons({ checkmarkCircleOutline, arrowBackOutline, gridOutline });
  }

  ngOnInit() {
    // Dynamically get the library name from the form service
    this.libraryName = this.lrfService.mainForm.get('basicInformation.libraryName')?.value || 'your library';
  }

  // --- Navigation Methods ---
  navigateToHome(): void {
    this.router.navigate(['/home']); // Adjust route as needed
  }

  navigateToDashboard(): void {
    this.router.navigate(['/dashboard']); // Adjust route as needed
  }
}
