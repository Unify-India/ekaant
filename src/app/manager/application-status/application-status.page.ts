import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { Observable } from 'rxjs';
import { AuthService } from 'src/app/auth/service/auth.service';
import { LibraryService } from 'src/app/services/library/library.service';

@Component({
  selector: 'app-application-status',
  templateUrl: './application-status.page.html',
  styleUrls: ['./application-status.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule],
})
export class ApplicationStatusPage implements OnInit {
  private authService = inject(AuthService);
  private libraryService = inject(LibraryService);

  isLoading = true;
  application: any;

  ngOnInit() {
    this.loadApplicationStatus();
  }

  async loadApplicationStatus() {
    this.isLoading = true;
    const user = this.authService.getCurrentUser();
    if (user) {
      this.libraryService.getLibraryRegistration(user.uid).subscribe({
        next: (data) => {
          this.application = data;
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Error fetching application status:', err);
          this.isLoading = false;
        },
      });
    } else {
      this.isLoading = false;
    }
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