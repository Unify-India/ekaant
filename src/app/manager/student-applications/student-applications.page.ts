import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonList,
  IonItem,
  IonLabel,
  IonBadge,
  IonSpinner,
  IonText,
  IonCard,
  IonCardContent,
} from '@ionic/angular/standalone';
import { Subscription, switchMap, of, filter } from 'rxjs';
import { AuthService } from 'src/app/auth/service/auth.service';
import { LibraryService } from 'src/app/services/library/library.service';

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
    IonList,
    IonItem,
    IonLabel,
    IonBadge,
    IonSpinner,
    IonText,
    IonCard,
    IonCardContent,
  ],
})
export class StudentApplicationsPage implements OnInit, OnDestroy {
  applications: any[] = [];
  isLoading = true;
  private subscription: Subscription = new Subscription();

  constructor(
    private authService: AuthService,
    private libraryService: LibraryService,
  ) {}

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
            this.applications = apps;
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
}
