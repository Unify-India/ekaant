import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
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
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { checkmarkCircleOutline, closeCircleOutline, eyeOutline } from 'ionicons/icons';
import { filter, of, Subscription, switchMap } from 'rxjs';
import { AuthService } from 'src/app/auth/service/auth.service';
import { LibraryService } from 'src/app/services/library/library.service';

export interface StudentApplication {
  id: string;
  studentName: string;
  studentEmail: string;
  selectedPlan?: {
    planName: string;
  };
  applicationStatus: string;
}

@Component({
  selector: 'app-student-applications',
  templateUrl: './student-applications.page.html',
  styleUrls: ['./student-applications.page.scss'],
  standalone: true,
  imports: [
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    CommonModule,
    FormsModule,
    IonLabel,
    IonSpinner,
    IonText,
    IonCard,
    IonGrid,
    IonRow,
    IonCol,
    IonButton,
    IonButtons,
    IonMenuButton,
    IonIcon,
    IonChip,
  ],
})
export class StudentApplicationsPage implements OnInit, OnDestroy {
  applications: StudentApplication[] = [];
  isLoading = true;
  private subscription: Subscription = new Subscription();

  constructor(
    private authService: AuthService,
    private libraryService: LibraryService,
    private router: Router,
    private alertController: AlertController,
  ) {
    addIcons({ eyeOutline, checkmarkCircleOutline, closeCircleOutline });
  }

  ngOnInit() {
    this.subscription.add(
      this.authService
        .getAuthStatusListener()
        .pipe(
          filter((user) => !!user), // Ensure user exists
          switchMap((user) => {
            // Since we know the user is a manager with an approved library (per routing logic),
            // we can try to use managedLibraryIds if available for optimization,
            // or fall back to querying the approved library.
            // For robustness (in case managedLibraryIds isn't synced yet), we'll query.
            return this.libraryService.getApprovedLibrary(user!.uid);
          }),
          switchMap((library) => {
            if (!library || !library.id) {
              return of([]);
            }
            return this.libraryService.getStudentApplicationsForLibrary(library.id);
          }),
        )
        .subscribe({
          next: (apps) => {
            this.applications = apps as StudentApplication[];
            this.isLoading = false;
          },
          error: (err) => {
            console.error('Error fetching applications:', err);
            this.isLoading = false;
          },
        }),
    );
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'approved':
        return 'success';
      case 'pending':
        return 'warning';
      case 'rejected':
        return 'danger';
      default:
        return 'medium';
    }
  }

  viewApplication(application: StudentApplication) {
    this.router.navigate(['/manager/student-application-detail', application.id]);
  }

  acceptApplication(application: StudentApplication) {
    // Navigate to detail page where they can allot seat and confirm acceptance
    this.router.navigate(['/manager/student-application-detail', application.id]);
  }

  async rejectApplication(application: StudentApplication) {
    const alert = await this.alertController.create({
      header: 'Reject Application',
      inputs: [
        {
          name: 'reason',
          type: 'text',
          placeholder: 'Reason for rejection',
        },
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'secondary',
        },
        {
          text: 'Reject',
          handler: async (data) => {
            if (!data.reason) {
              // Optional: You could show a toast or another alert here saying reason is required
              return false; // Prevent closing if validation fails, or just proceed
            }
            try {
              await this.libraryService.updateStudentApplication(application.id, {
                applicationStatus: 'rejected',
                rejectionReason: data.reason,
              });
              console.log('Rejected with reason:', data.reason);
            } catch (error) {
              console.error('Error rejecting application:', error);
            }
            return true;
          },
        },
      ],
    });

    await alert.present();
  }
}
