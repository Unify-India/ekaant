import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonGrid,
  IonRow,
  IonCol,
  IonCard,
  IonIcon,
  IonBadge,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  barChartOutline,
  calendarOutline,
  personAddOutline,
  pulseOutline,
  timeOutline,
  trendingUpOutline,
} from 'ionicons/icons';
import { BaseUiComponents } from 'src/app/shared/core/micro-components/base-ui.module';

@Component({
  selector: 'app-manager-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
  standalone: true,
  imports: [
    IonBadge,
    BaseUiComponents,
    IonIcon,
    IonCard,
    IonCol,
    IonRow,
    IonGrid,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    CommonModule,
    FormsModule,
  ],
})
export class DashboardPage implements OnInit {
  libraryInfo = {
    name: 'Central City Library',
    address: '123 Main St, Central City',
    totalSeats: 100,
    availableSeats: 25,
    occupiedSeats: 75,
    availabilityPercentage: 25,
  };

  dashboardStats = [
    {
      title: "Today's Bookings",
      value: 45,
      trend: '+12%',
      color: '#3b82f6',
      icon: 'calendar-outline',
    },
    {
      title: 'Active Students',
      value: 38,
      trend: '+8%',
      color: '#22c55e',
      icon: 'people-outline',
    },
    {
      title: "Today's Revenue",
      value: '320',
      trend: '+15%',
      color: '#f59e0b',
      icon: 'cash-outline',
    },
    {
      title: 'Occupancy Rate',
      value: '75%',
      trend: '0%',
      color: '#a855f7',
      icon: 'pulse-outline',
    },
  ];

  recentBookings = [
    { name: 'Alice Johnson', code: 'C-01', date: '2025-01-03', amount: '15', status: 'pending' },
    { name: 'Bob Smith', code: 'C-05', date: '2025-01-05', amount: '25', status: 'paid' },
    { name: 'Carol Davis', code: 'C-03', date: '2025-01-04', amount: '15', status: 'pending' },
  ];

  quickActions = [
    { label: 'Send Notifications', icon: 'notifications-outline', bg: '#e0f2ff', badge: 3 },
    { label: 'Manage Campaigns', icon: 'megaphone-outline', bg: '#f5e8ff' },
    { label: 'View Analytics', icon: 'bar-chart-outline', bg: '#e8ffef' },
  ];

  constructor() {
    addIcons({
      trendingUpOutline,
      calendarOutline,
      pulseOutline,
      barChartOutline,
      personAddOutline,
      timeOutline,
    });
  }

  ngOnInit() {}
}
