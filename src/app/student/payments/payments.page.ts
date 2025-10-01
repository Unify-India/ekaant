import { Component, OnInit } from '@angular/core';
import { IonChip } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  calendarOutline,
  cashOutline,
  checkmarkCircle,
  alertCircle,
  closeCircle,
  downloadOutline,
} from 'ionicons/icons';
import { BaseUiComponents } from 'src/app/shared/core/micro-components/base-ui.module';
import { FormEssentials } from 'src/app/shared/core/micro-components/form-essentials.module';
import { UiEssentials } from 'src/app/shared/core/micro-components/ui-essentials.module';

// todo: move this to model file
interface Subscription {
  nextAmount: number;
  nextBillingDate: string;
  plan: string;
  status: 'Active' | 'Inactive';
}

interface Payment {
  amount: number;
  date: string;
  invoice: string;
  plan: string;
  status: 'Paid' | 'Overdue' | 'Failed';
}

@Component({
  selector: 'app-payments',
  templateUrl: './payments.page.html',
  styleUrls: ['./payments.page.scss'],
  standalone: true,
  imports: [IonChip, BaseUiComponents, UiEssentials, FormEssentials],
})
export class PaymentsPage implements OnInit {
  // --- Mock Data ---
  public currentSubscription: Subscription = {
    plan: 'Premium Plan',
    status: 'Active',
    nextBillingDate: '2025-02-15',
    nextAmount: 15.0,
  };

  public totalPaid = 50.0;
  public paymentsMade = 6;

  public paymentHistory: Payment[] = [
    { invoice: 'INV-2025-001', date: '2025-01-15', plan: 'Premium Plan', amount: 15.0, status: 'Paid' },
    { invoice: 'INV-2024-012', date: '2024-12-15', plan: 'Premium Plan', amount: 15.0, status: 'Paid' },
    { invoice: 'INV-2024-011', date: '2024-11-15', plan: 'Standard Plan', amount: 5.0, status: 'Paid' },
    { invoice: 'INV-2024-010', date: '2024-10-15', plan: 'Standard Plan', amount: 5.0, status: 'Overdue' },
    { invoice: 'INV-2024-009', date: '2024-09-15', plan: 'Premium Plan', amount: 15.0, status: 'Paid' },
    { invoice: 'INV-2024-008', date: '2024-08-15', plan: 'Premium Plan', amount: 15.0, status: 'Failed' },
  ];

  constructor() {
    addIcons({ calendarOutline, cashOutline, checkmarkCircle, alertCircle, closeCircle, downloadOutline });
  }
  ngOnInit() {}
}
