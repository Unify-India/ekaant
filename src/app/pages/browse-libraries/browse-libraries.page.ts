import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonContent, IonInput, IonHeader, IonTitle, IonToolbar, IonIcon, IonButtons } from '@ionic/angular/standalone';
import { Library } from 'src/app/models/library';
import { Router } from '@angular/router';
import { LibraryCardComponent } from 'src/app/components/library-card/library-card.component';
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
  libraries = [
    {
      name: 'Gyanoday Pustakalay',
      address: '123 Lalpur Main Road, Ranchi, Jharkhand',
      availableSeats: 35,
      totalSeats: 120,
      isFull: false,
    },
    {
      name: 'Jamshedpur Reading Hall',
      address: '456 Sakchi Market, Jamshedpur, Jharkhand',
      availableSeats: 0,
      totalSeats: 70,
      isFull: true,
    },
    {
      name: 'Vidya Sagar Library',
      address: '789 Morabadi, Ranchi, Jharkhand',
      availableSeats: 15,
      totalSeats: 90,
      isFull: false,
    },
    {
      name: 'Dhanbad Study Circle',
      address: '101 Bank More, Dhanbad, Jharkhand',
      availableSeats: 0,
      totalSeats: 80,
      isFull: true,
    },
    {
      name: 'Bokaro Digital Library',
      address: '202 Sector 4, Bokaro Steel City, Jharkhand',
      availableSeats: 50,
      totalSeats: 150,
      isFull: false,
    },
    {
      name: 'Kanke Reading Room',
      address: '333 Kanke Road, Ranchi, Jharkhand',
      availableSeats: 8,
      totalSeats: 50,
      isFull: false,
    },
  ];
  query: string = '';

  constructor() {}

  ngOnInit() {}

  handleLibraryAction(event: { type: 'enroll' | 'waitlist'; library: Library }) {
    if (event.type === 'enroll') {
      // navigate or open enrollment modal
      this.router.navigate(['/application-form', event.library.id, 'enroll']);
    } else {
      // open waitlist flow
      // this.openWaitlistModal(event.library);
    }
  }

  onSearch() {
    // TODO: Hook into your library search logic
    console.log('Searching for:', this.query);
  }
}
