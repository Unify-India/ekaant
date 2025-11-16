import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonMenuButton } from '@ionic/angular/standalone';
import { AuthService } from 'src/app/auth/service/auth.service';
import { PreviewComponent } from 'src/app/pages/library-registration-form/components/preview/preview.component';
import { LibraryRegistrationFormService } from 'src/app/pages/library-registration-form/service/library-registration-form.service';
import { LibraryService } from 'src/app/services/library/library.service';

@Component({
  selector: 'app-complete-profile',
  templateUrl: './complete-profile.page.html',
  styleUrls: ['./complete-profile.page.scss'],
  standalone: true,
  imports: [
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    CommonModule,
    FormsModule,
    IonButtons,
    IonMenuButton,
    PreviewComponent,
  ],
})
export class CompleteProfilePage implements OnInit {
  private authService = inject(AuthService);
  private libraryService = inject(LibraryService);
  private lrfService = inject(LibraryRegistrationFormService);

  constructor() {}

  ngOnInit() {
    this.loadApplicationData();
  }

  loadApplicationData() {
    const user = this.authService.getCurrentUser();
    if (user) {
      this.libraryService.getLibraryRegistration(user.uid).subscribe((data) => {
        if (data) {
          this.lrfService.loadRegistrationData(data);
          this.lrfService.setEditMode(true, data.id);
        }
      });
    }
  }
}
