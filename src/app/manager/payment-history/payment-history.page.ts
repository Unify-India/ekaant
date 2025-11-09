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
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  alertCircleOutline,
  checkmarkDoneCircleOutline,
  downloadOutline,
  receiptOutline,
  trendingUpOutline,
} from 'ionicons/icons';

@Component({
  selector: 'app-payment-history',
  templateUrl: './payment-history.page.html',
  styleUrls: ['./payment-history.page.scss'],
  standalone: true,
  imports: [
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
  stats = [
    { title: 'Total Revenue', value: '150', sub: '+12% from last month', icon: 'cash-outline', color: '#e7f9f0' },
    {
      title: 'Successful Payments',
      value: '1',
      sub: 'Completed transactions',
      icon: 'checkmark-done-circle-outline',
      color: '#e6f0ff',
    },
    {
      title: 'Overdue Payments',
      value: '0',
      sub: 'Requires follow-up',
      icon: 'alert-circle-outline',
      color: '#ffecec',
    },
    {
      title: 'Pending Revenue',
      value: '0',
      sub: 'Awaiting collection',
      icon: 'trending-up-outline',
      color: '#fff3e5',
    },
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
    addIcons({ checkmarkDoneCircleOutline, alertCircleOutline, trendingUpOutline, downloadOutline, receiptOutline });
  }
  ngOnInit() {}
  getStatusColor(status: string) {
    return status === 'paid' ? 'success' : 'warning';
  }
}
