import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {
  AlertController,
  IonBackButton,
  IonButton,
  IonButtons,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonContent,
  IonHeader,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonSelect,
  IonSelectOption,
  IonSpinner,
  IonText,
  IonTitle,
  IonToggle,
  IonToolbar,
  IonGrid,
  IonRow,
  IonCol,
  IonInput,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { checkmarkCircle, timeOutline } from 'ionicons/icons';
import { AuthService } from 'src/app/auth/service/auth.service';
import { IStudentRegistrationRequest } from 'src/app/models/booking.interface';
import { ILibrary, ISeat } from 'src/app/models/library.interface';
import { LibraryService } from 'src/app/services/library/library.service';

@Component({
  selector: 'app-student-application-detail',
  templateUrl: './student-application-detail.page.html',
  styleUrls: ['./student-application-detail.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonButtons,
    IonBackButton,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonList,
    IonItem,
    IonLabel,
    IonText,
    IonToggle,
    IonSelect,
    IonSelectOption,
    IonIcon,
    IonButton,
    IonSpinner,
    IonGrid,
    IonRow,
    IonCol,
    IonInput,
  ],
})
export class StudentApplicationDetailPage implements OnInit {
  application: IStudentRegistrationRequest = {} as IStudentRegistrationRequest;
  isLoading = true;
  seats: ISeat[] = [];
  autoAllot = false;
  selectedSeatId: string | null = null;
  startDate: string = new Date().toISOString().split('T')[0];
  endDate: string = '';
  paymentAmount: number = 0;

  constructor(
    private route: ActivatedRoute,
    private libraryService: LibraryService,
    private authService: AuthService,
    private alertController: AlertController,
    private router: Router,
  ) {
    addIcons({ timeOutline, checkmarkCircle });
  }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadApplication(id);
    }
    this.loadSeats();
  }

  loadApplication(id: string) {
    this.libraryService.getStudentApplicationById(id).subscribe({
      next: (data) => {
        this.application = data;
        console.info('application data', data);
        if (this.application.selectedPlan) {
          this.paymentAmount = this.application.selectedPlan.rate || 0;
          if (this.application.selectedPlan.startDate) {
            this.startDate = this.application.selectedPlan.startDate;
          }
          this.calculateEndDate();
        }
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error fetching application', err);
        this.isLoading = false;
      },
    });
  }

  calculateEndDate() {
    if (!this.application.selectedPlan || !this.startDate) return;

    const start = new Date(this.startDate);
    if (isNaN(start.getTime())) return;

    let end = new Date(start);
    const planType = (this.application.selectedPlan.planType || '').toLowerCase();
    console.info('plan type', planType);
    // Simple logic based on plan name/type.
    if (planType.includes('weekly')) {
      end.setDate(start.getDate() + 6);
    } else if (planType.includes('monthly')) {
      end.setDate(start.getDate() + 29);
    } else if (planType.includes('quarterly')) {
      end.setDate(start.getDate() + 89);
    } else {
      // Default to same day for daily/pay-per-use
    }
    console.info('Start date', start);
    console.info('End date', end);

    this.endDate = end.toISOString().split('T')[0];
  }

  onStartDateChange(event: any) {
    const newVal = event?.detail?.value || event?.target?.value;
    if (newVal) {
      this.startDate = newVal.split('T')[0];
    }
    this.calculateEndDate();
  }

  loadSeats() {
    const user = this.authService.getCurrentUser();
    if (user && user.primaryLibraryId) {
      // Ensure RTDB is populated with seat data for this library
      this.libraryService.initializeLibrarySeatsInRTDB(user.primaryLibraryId).catch((err) => {
        console.error('Failed to initialize library seats in RTDB:', err);
      });

      const managedLibrariesStr = localStorage.getItem('managedLibraries');
      if (managedLibrariesStr) {
        try {
          const libraries: ILibrary[] = JSON.parse(managedLibrariesStr);
          const primaryLib = libraries.find((l) => l.id === user.primaryLibraryId);
          if (primaryLib && primaryLib.seatManagement && primaryLib.seatManagement.seats) {
            this.seats = primaryLib.seatManagement.seats;
          }
        } catch (e) {
          console.error('Error parsing managed libraries from local storage', e);
        }
      }
    }
  }

  async onAutoAllotChange(event: any) {
    this.autoAllot = event.detail.checked;
    if (this.autoAllot) {
      this.selectedSeatId = null;
    }
  }

  async onAccept() {
    if (!this.autoAllot && !this.selectedSeatId) {
      const alert = await this.alertController.create({
        header: 'Seat Required',
        message: 'Please allot a seat to the student or enable Auto Allot before accepting.',
        buttons: ['OK'],
      });
      await alert.present();
      return;
    }

    if (!this.startDate || !this.endDate) {
      const alert = await this.alertController.create({
        header: 'Dates Required',
        message: 'Please ensure Start Date and End Date are set.',
        buttons: ['OK'],
      });
      await alert.present();
      return;
    }

    try {
      this.isLoading = true;

      await this.libraryService.approveApplication({
        applicationId: this.application.id,
        seatId: this.selectedSeatId || undefined,
        autoAllot: this.autoAllot,
        startDate: this.startDate,
        endDate: this.endDate,
        paymentAmount: this.paymentAmount,
      });

      this.isLoading = false;
      const alert = await this.alertController.create({
        header: 'Success',
        message: 'Application accepted and seat allocated.',
        buttons: ['OK'],
      });
      await alert.present();
      await alert.onDidDismiss();
      this.router.navigate(['/manager/student-applications']);
    } catch (e: any) {
      console.error('Error accepting application:', e);
      this.isLoading = false;
      const alert = await this.alertController.create({
        header: 'Error',
        message: e.message || 'Failed to accept application. Please try again.',
        buttons: ['OK'],
      });
      await alert.present();
    }
  }
}
