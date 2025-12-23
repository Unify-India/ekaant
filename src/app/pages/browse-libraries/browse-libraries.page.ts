import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IonContent, IonInput, IonHeader, IonTitle, IonToolbar, IonIcon, IonButtons } from '@ionic/angular/standalone';
import { LibraryCardComponent } from 'src/app/components/library-card/library-card.component';
import { Library } from 'src/app/models/library';
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
  libraries: any[] = [];
  query: string = '';

  constructor() {}

  ngOnInit() {
    this.loadLibraries();
  }

  loadLibraries() {
    this.libraryService.getLibrariesForCardView().subscribe({
      next: (data) => {
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
    this.router.navigate(['student/application-form', library.id]);
  }

  onSearch() {
    // TODO: Hook into your library search logic
    console.log('Searching for:', this.query);
  }
}
