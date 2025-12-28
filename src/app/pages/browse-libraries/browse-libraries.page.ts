import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { Auth, authState } from '@angular/fire/auth';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IonContent, IonInput, IonHeader, IonTitle, IonToolbar, IonIcon, IonButtons } from '@ionic/angular/standalone';
import { LibraryCardComponent } from 'src/app/components/library-card/library-card.component';
import { Library } from 'src/app/models/library.interface';
import { LibraryService } from 'src/app/services/library/library.service';
import { BaseUiComponents } from 'src/app/shared/core/micro-components/base-ui.module';

import { FooterPage } from '../footer/footer.page';

@Component({
  selector: 'app-browse-libraries',
  templateUrl: './browse-libraries.page.html',
  styleUrls: ['./browse-libraries.page.scss'],
  standalone: true,
  imports: [
    BaseUiComponents,
    IonIcon,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    CommonModule,
    LibraryCardComponent,
    FormsModule,
    ReactiveFormsModule,
    IonInput,
    FooterPage,
  ],
})
export class BrowseLibrariesPage implements OnInit {
  private router = inject(Router);
  private libraryService = inject(LibraryService);
  private auth = inject(Auth);

  libraries: Library[] = [];
  query: string = '';
  isAuthenticated = false;

  constructor() {}

  ngOnInit() {
    this.loadLibraries();
    authState(this.auth).subscribe((user) => {
      this.isAuthenticated = !!user;
    });
  }

  loadLibraries() {
    this.libraryService.getLibrariesForCardView().subscribe({
      next: (data: Library[]) => {
        this.libraries = data;
        console.log('Loaded libraries:', this.libraries);
      },
      error: (err) => console.error('Error loading libraries:', err),
    });
  }

  handleLibraryAction(library: Library) {
    console.log('event', library);
    if (!library) {
      console.warn('No library data in action event');
      return;
    }

    if (this.isAuthenticated) {
      this.router.navigate(['student/application-form', library.id]);
    } else {
      this.router.navigate(['/login'], {
        queryParams: {
          redirectTo: '/student/application-form/' + library.id,
          role: 'student',
        },
      });
    }
  }

  onSearch() {
    // TODO: Hook into your library search logic
    console.log('Searching for:', this.query);
  }
}
