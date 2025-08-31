import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonIcon,
  IonCol,
  IonRow,
  IonGrid,
} from '@ionic/angular/standalone';
import { alertCircleOutline, calendarOutline, locationOutline } from 'ionicons/icons';
import { BaseUiComponents } from 'src/app/shared/core/micro-components/base-ui.module';
import { addIcons } from 'ionicons';
import { FooterPage } from '../footer/footer.page';
import { FeedbackPage } from '../feedback/feedback.page';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: true,
  imports: [
    IonGrid,
    IonRow,
    IonCol,
    BaseUiComponents,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonIcon,
    FormsModule,
    FeedbackPage,
    FooterPage,
  ],
  providers: [],
})
export class HomePage implements OnInit {
  pageTitle = 'Welcome to Ekaant';
  icons = { calendarOutline, alertCircleOutline, locationOutline };
  studentsFeatures = [
    {
      title: 'Easy Digital Enrollment',
      description: 'Sign up in seconds and get immediate access to bookable study spaces.',
    },
    {
      title: 'Real-Time Seat Availability',
      description: 'No more wandering around. See exactly which seats are free right now.',
    },
    {
      title: 'Instant Support Tickets',
      description: 'Report issues with lights, Wi-Fi, or seating directly through the app.',
    },
  ];

  libraryFeatures = [
    {
      title: 'Streamlined Record-Keeping',
      description: 'Automate booking logs and user management. No more manual entries.',
    },
    {
      title: 'Automatic Revenue Tracking',
      description: 'Get clear insights into your earnings and occupancy rates without lifting a finger.',
    },
    {
      title: 'Improved Student Satisfaction',
      description: 'Provide a modern, reliable service that keeps students coming back.',
    },
  ];
  pricingPlans = [
    {
      title: '6-Month Free Trial',
      description: `Enjoy full access to all features of the Study Portal 
        with no charges for 6 months. Perfect for owners to experience 
        the benefits of a smarter digital system replacing traditional registers.`,
      price: '₹0',
      duration: '',
      buttonText: 'Start Free Trial',
      buttonColor: 'success',
      image: 'https://picsum.photos/seed/trial/400/200',
      popular: true,
    },
    {
      title: 'Standard Plan',
      description: `Access to essential study room management features including 
        easy digital enrollment, real-time seat availability, and basic support ticketing. 
        Ideal for small to medium-sized libraries.`,
      price: '₹5',
      duration: '/month/student',
      buttonText: 'Get Started',
      buttonColor: 'primary',
      image: 'https://picsum.photos/seed/standard/400/200',
      popular: false,
    },
    {
      title: 'Premium Plan',
      description: `Full-featured subscription including all Standard Plan benefits plus 
        streamlined record-keeping, automatic revenue tracking, priority support, and 
        enhanced student satisfaction tools. Best for larger institutions.`,
      price: '₹15',
      duration: '/month/student',
      buttonText: 'Go Premium',
      buttonColor: 'warning',
      image: 'https://picsum.photos/seed/premium/400/200',
      popular: false,
    },
  ];
  constructor() {
    addIcons(this.icons);
  }

  ngOnInit(): void {
    // Initialization logic can go here
  }
}
