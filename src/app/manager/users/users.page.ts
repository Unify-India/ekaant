import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { Firestore, collection, query, getDocs, Timestamp } from '@angular/fire/firestore';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonButtons,
  IonButton,
  IonIcon,
  IonSpinner,
  IonCard,
  IonGrid,
  IonRow,
  IonCol,
  IonChip,
  IonLabel,
  IonBadge,
  IonText,
  IonMenuButton,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { personAddOutline, eyeOutline, createOutline } from 'ionicons/icons';
import { AuthService } from 'src/app/auth/service/auth.service';
import { UserStatus } from 'src/app/models/enums';
import { User } from 'src/app/models/user';

@Component({
  selector: 'app-enrolled-users',
  templateUrl: './users.page.html',
  styleUrls: ['./users.page.scss'],
  standalone: true,
  imports: [
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonButtons,
    IonButton,
    IonIcon,
    IonSpinner,
    IonCard,
    IonGrid,
    IonRow,
    IonCol,
    IonChip,
    IonLabel,
    IonBadge,
    IonText,
    IonMenuButton,
    CommonModule,
    FormsModule,
  ],
})
export class UsersPage implements OnInit {
  private firestore = inject(Firestore);
  private authService = inject(AuthService);
  private router = inject(Router);

  users: User[] = [];
  isLoading = false;

  constructor() {
    addIcons({ personAddOutline, eyeOutline, createOutline });
  }

  async ngOnInit() {
    await this.fetchUsers();
  }

  // Helper to safely convert Timestamp or Date to Date object
  toDate(date: Timestamp | Date | undefined): Date | null {
    if (!date) return null;
    if (date instanceof Timestamp) {
      return date.toDate();
    }
    return date as Date;
  }

  async fetchUsers() {
    this.isLoading = true;
    try {
      const currentUser = this.authService.getCurrentUser();
      const libraryId = currentUser?.primaryLibraryId;

      if (!libraryId) {
        console.error('No primary library ID found for manager.');
        this.isLoading = false;
        return;
      }

      const usersRef = collection(this.firestore, `libraries/${libraryId}/users`);
      const q = query(usersRef);
      const querySnapshot = await getDocs(q);

      this.users = querySnapshot.docs.map((doc) => {
        const data = doc.data() as User;
        return { ...data, uid: doc.id }; // Ensure UID is set
      });
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      this.isLoading = false;
    }
  }

  getStatusColor(status: UserStatus): string {
    switch (status) {
      case UserStatus.Active:
        return 'success';
      case UserStatus.Inactive:
        return 'medium';
      case UserStatus.Suspended:
        return 'danger';
      default:
        return 'medium';
    }
  }

  onboardUser() {
    this.router.navigate(['/manager', 'onboard-user']);
  }

  viewUser(user: User) {
    // Navigate to user detail or open modal (to be implemented)
    console.log('View user:', user);
  }

  editUser(user: User) {
    // Navigate to edit user or open modal (to be implemented)
    console.log('Edit user:', user);
  }
}
