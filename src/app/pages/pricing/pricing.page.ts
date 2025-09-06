import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonContent, IonCardHeader, IonCardTitle, IonCardContent } from '@ionic/angular/standalone';
import { BaseUiComponents } from 'src/app/shared/core/micro-components/base-ui.module';

@Component({
  selector: 'app-pricing',
  templateUrl: './pricing.page.html',
  styleUrls: ['./pricing.page.scss'],
  standalone: true,
  imports: [BaseUiComponents, IonCardContent, IonCardTitle, IonCardHeader, IonContent, CommonModule],
})
export class PricingPage implements OnInit {
  pageTitle = 'Pricing Plans';

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

  constructor() {}

  ngOnInit() {}
}
