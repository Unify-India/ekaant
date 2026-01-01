import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonBadge,
  IonButton,
  IonIcon,
  IonCard,
  IonSegmentButton,
  IonSegment,
  IonRow,
  IonCol,
  IonGrid,
  IonSearchbar,
  IonButtons,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  alertCircleOutline,
  checkmarkDoneCircleOutline,
  downloadOutline,
  receiptOutline,
  trendingUpOutline,
  personAddOutline,
  cashOutline,
} from 'ionicons/icons';
import { BaseUiComponents } from 'src/app/shared/core/micro-components/base-ui.module';
import { UiEssentials } from 'src/app/shared/core/micro-components/ui-essentials.module';

@Component({
  selector: 'app-payment-history',
  templateUrl: './payment-history.page.html',
  styleUrls: ['./payment-history.page.scss'],
  standalone: true,
  imports: [
    UiEssentials,
    BaseUiComponents,
    IonButtons,
    IonSearchbar,
    IonGrid,
    IonCol,
    IonRow,
    IonSegment,
    IonSegmentButton,
    IonCard,
    IonIcon,
    IonButton,
    IonBadge,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    CommonModule,
    FormsModule,
  ],
})
export class PaymentHistoryPage implements OnInit {
  pageTitle = 'Payments';
  stats = [
    { title: 'Total Revenue', value: '150', sub: '+12%', icon: 'cash-outline', color: 'success' },
    {
      title: 'Successful Payments',
      value: '1',
      sub: 'Completed',
      icon: 'checkmark-done-circle-outline',
      color: 'tertiary',
    },
    { title: 'Overdue Payments', value: '0', sub: 'Requires follow-up', icon: 'alert-circle-outline', color: 'danger' },
    { title: 'Pending Revenue', value: '0', sub: 'Awaiting', icon: 'trending-up-outline', color: 'warning' },
  ];
  payments = [
    {
      name: 'Alice Johnson',
      email: 'alice@student.edu',
      plan: 'Premium Plan',
      period: 'Jan 2025',
      details: 'Monthly • 60h',
      amount: '150',
      method: 'Credit Card',
      status: 'paid',
      date: 'Jan 10, 2025',
    },
  ];

  constructor() {
    addIcons({
      cashOutline,
      downloadOutline,
      receiptOutline,
      personAddOutline,
      checkmarkDoneCircleOutline,
      alertCircleOutline,
      trendingUpOutline,
    });
  }
  ngOnInit() {}
  getStatusColor(status: string) {
    return status === 'paid' ? 'success' : 'warning';
  }

  addPayment() {}
}
