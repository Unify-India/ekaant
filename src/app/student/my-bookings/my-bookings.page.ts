import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  AlertController,
  IonButton,
  IonButtons,
  IonCard,
  IonChip,
  IonCol,
  IonContent,
  IonGrid,
  IonHeader,
  IonIcon,
  IonLabel,
  IonMenuButton,
  IonRow,
  IonSpinner,
  IonText,
  IonTitle,
  IonToolbar,
  LoadingController,
  ToastController,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { calendarOutline, locationOutline, timeOutline, eyeOutline, closeCircleOutline } from 'ionicons/icons';
import { filter, Subscription, switchMap } from 'rxjs';
import { AuthService } from 'src/app/auth/service/auth.service';
import { BookingService, IBooking } from 'src/app/services/booking/booking.service';
import { LibraryService } from 'src/app/services/library/library.service';

@Component({
  selector: 'app-my-bookings',
  templateUrl: './my-bookings.page.html',
  styleUrls: ['./my-bookings.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonButtons,
    IonMenuButton,
    IonSpinner,
    IonCard,
    IonGrid,
    IonRow,
    IonCol,
    IonText,
    IonChip,
    IonLabel,
    IonButton,
    IonIcon,
  ],
})
export class MyBookingsPage implements OnInit, OnDestroy {
  pageTitle = 'My Bookings';
  bookings: IBooking[] = [];
  libraryNames: { [id: string]: string } = {};
  isLoading = true;
  private subscription: Subscription = new Subscription();

  constructor(
    private authService: AuthService,
    private bookingService: BookingService,
    private libraryService: LibraryService,
    private alertController: AlertController,
    private loadingController: LoadingController,
    private toastController: ToastController,
  ) {
    addIcons({ calendarOutline, locationOutline, timeOutline, eyeOutline, closeCircleOutline });
  }

  ngOnInit() {
    this.loadBookings();
  }

  private loadBookings() {
    this.isLoading = true;
    this.subscription.add(
      this.authService
        .getAuthStatusListener()
        .pipe(
          filter((user) => !!user),
          switchMap((user) => this.bookingService.getAllBookings(user!.uid)),
        )
        .subscribe({
          next: (bookings) => {
            this.bookings = bookings;
            this.loadLibraryNames(bookings);
            this.isLoading = false;
          },
          error: (err) => {
            console.error('Error fetching bookings:', err);
            this.isLoading = false;
          },
        }),
    );
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  private loadLibraryNames(bookings: IBooking[]) {
    const libraryIds = [...new Set(bookings.map((b) => b.libraryId))];
    if (libraryIds.length === 0) return;

    this.subscription.add(
      this.libraryService.getLibrariesByIds(libraryIds).subscribe({
        next: (libraries) => {
          libraries.forEach((lib) => {
            if (lib.id) {
              this.libraryNames[lib.id] = lib.basicInformation?.libraryName || 'Unknown Library';
            }
          });
        },
      }),
    );
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'confirmed':
        return 'success';
      case 'cancelled':
        return 'danger';
      case 'absent':
        return 'warning';
      default:
        return 'medium';
    }
  }

  formatTime(minutes: number | undefined): string {
    if (minutes === undefined) return '--:--';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    const period = hours >= 12 ? 'PM' : 'AM';
    const h = hours % 12 || 12;
    const m = mins < 10 ? '0' + mins : mins;
    return `${h}:${m} ${period}`;
  }

  viewBooking(booking: IBooking) {
    console.log('View booking:', booking);
  }

  async cancelBooking(booking: IBooking) {
    const alert = await this.alertController.create({
      header: 'Cancel Booking',
      message: 'Are you sure you want to cancel this booking? This action cannot be undone.',
      buttons: [
        {
          text: 'No',
          role: 'cancel',
        },
        {
          text: 'Yes, Cancel',
          handler: async () => {
            const loading = await this.loadingController.create({
              message: 'Cancelling booking...',
            });
            await loading.present();

            try {
              await this.bookingService.cancelBooking(booking.id);
              const toast = await this.toastController.create({
                message: 'Booking cancelled successfully.',
                duration: 2000,
                color: 'success',
              });
              await toast.present();
              this.loadBookings(); // Refresh list
            } catch (error: any) {
              console.error('Error cancelling booking:', error);
              const toast = await this.toastController.create({
                message: error.message || 'Failed to cancel booking. Please try again.',
                duration: 3000,
                color: 'danger',
              });
              await toast.present();
            } finally {
              await loading.dismiss();
            }
          },
        },
      ],
    });

    await alert.present();
  }
}
