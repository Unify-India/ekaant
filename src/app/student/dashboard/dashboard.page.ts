import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { ModalController } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  logInOutline,
  closeCircleOutline,
  cardOutline,
  personCircleOutline,
  locationOutline,
  timeOutline,
  calendarOutline,
  logOutOutline,
} from 'ionicons/icons';
import { AttendanceCardComponent } from 'src/app/components/attendance-card/attendance-card.component';
import { BaseUiComponents } from 'src/app/shared/core/micro-components/base-ui.module';
import { UiEssentials } from 'src/app/shared/core/micro-components/ui-essentials.module';

import { ReportAbsenceModal } from '../components/report-absence/report-absence.component';

interface Attendance {
  date: string;
  duration?: string;
  status: 'Completed' | 'Absent';
  timeRange: string;
}

@Component({
  selector: 'app-student-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
  standalone: true,
  imports: [BaseUiComponents, UiEssentials, AttendanceCardComponent, RouterLink],
})
export class DashboardPage implements OnInit {
  pageTitle = 'Student Dashboard';

  today = {
    seatId: 'C-05',
    date: 'Saturday, September 27, 2025',
    amenities: ['Wi-Fi', 'AC', 'Power Outlet'],
    checkedIn: false,
  };
  public seatAssignment: {
    seatNumber: string;
    date: string;
    amenities: string[];
  } | null = {
    seatNumber: 'C-05',
    date: 'Saturday, September 27, 2025',
    amenities: ['Wi-Fi', 'AC', 'Power Outlet'],
  };

  public attendanceHistory: Attendance[] = [
    {
      date: 'Sep 20, 2025',
      timeRange: '03:17 PM - 03:17 PM',
      status: 'Completed',
      duration: '0',
    },
    {
      date: 'Jan 5, 2025',
      timeRange: '02:35 PM - 08:30 PM',
      status: 'Completed',
      duration: '5h 55m',
    },
  ];

  constructor(
    private router: Router,
    private modalController: ModalController,
  ) {
    addIcons({
      logOutOutline,
      logInOutline,
      closeCircleOutline,
      locationOutline,
      timeOutline,
      cardOutline,
      personCircleOutline,
      calendarOutline,
    });
  }

  onCheckIn() {
    // implement check-in logic
    this.today.checkedIn = true;
    // e.g. call API or show toast
    console.log('Checked in');
  }

  onCheckOut() {
    // implement check-out logic
    this.today.checkedIn = false;
    // e.g. call API or show toast
    console.log('Checked out');
  }

  onReportAbsence() {
    // open modal or navigate to absence form
    console.log('Report absence');
  }

  openProfile() {
    this.router.navigate(['/profile']);
  }
  ngOnInit() {}

  async openReportAbsenceModal() {
    const modal = await this.modalController.create({
      component: ReportAbsenceModal,
      cssClass: 'report-absence-modal',
      breakpoints: [0, 0.5, 0.8],
      initialBreakpoint: 0.8,
    });

    modal.onDidDismiss().then((data) => {
      if (data.role === 'submit' && data.data) {
        console.log('Absence submitted:', data.data);
      } else {
        console.log('Modal dismissed without submission or cancelled.');
      }
    });

    return await modal.present();
  }
}
