import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { AuthService } from 'src/app/auth/service/auth.service';
import { ApprovalCommentsComponent } from 'src/app/components/approval-comments/approval-comments.component';
import { PreviewComponent } from 'src/app/pages/library-registration-form/components/preview/preview.component';
import { LibraryRegistrationFormService } from 'src/app/pages/library-registration-form/service/library-registration-form.service';
import { LibraryService } from 'src/app/services/library/library.service';

import { IUser } from 'src/app/models/global.interface';

@Component({
  selector: 'app-application-status',
  templateUrl: './application-status.page.html',
  styleUrls: ['./application-status.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, PreviewComponent, RouterModule, ApprovalCommentsComponent],
})
export class ApplicationStatusPage implements OnInit {
  private authService = inject(AuthService);
  private libraryService = inject(LibraryService);
  private lrfService = inject(LibraryRegistrationFormService);

  isLoading = true;
  application: any;
  currentUserRole: 'admin' | 'manager' = 'manager';
  currentUserId!: string;

  ngOnInit() {
    const user = this.authService.getCurrentUser();
    if (user) {
      this.currentUserId = user.uid;
      this.loadApplicationStatus(user.uid);
    } else {
      this.isLoading = false;
      console.log('No user found, cannot load application status.');
    }
  }

  loadApplicationStatus(userId: string) {
    this.isLoading = true;
    this.libraryService.getLibraryRegistration(userId).subscribe({
      next: (data) => {
        this.application = data;
        if (data) {
          this.lrfService.loadRegistrationData(data);
          this.lrfService.setEditMode(true, data.id);
        }
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error fetching application status:', err);
        this.isLoading = false;
      },
    });
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'pending':
        return 'status-pending';
      case 'approved':
        return 'status-approved';
      case 'rejected':
        return 'status-rejected';
      case 'changes-required':
        return 'status-changes-required';
      default:
        return '';
    }
  }
}
