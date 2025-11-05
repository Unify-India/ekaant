import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IonContent, IonInput, IonHeader, IonTitle, IonToolbar, IonIcon, IonButtons } from '@ionic/angular/standalone';
import { LibraryCardComponent } from 'src/app/components/library-card/library-card.component';
import { Library } from 'src/app/models/library';
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
      id: 'lib-1',
      name: 'Gyanoday Pustakalay',
      address: '123 Lalpur Main Road, Ranchi, Jharkhand',
      availableSeats: 35,
      totalSeats: 120,
      isFull: false,
      type: 'co-ed',
    },
    {
      id: 'lib-2',
      name: 'Jamshedpur Reading Hall',
      address: '456 Sakchi Market, Jamshedpur, Jharkhand',
      availableSeats: 0,
      totalSeats: 70,
      type: 'boys only',
      isFull: true,
    },
    {
      id: 'lib-3',
      name: 'Vidya Sagar Library',
      address: '789 Morabadi, Ranchi, Jharkhand',
      availableSeats: 15,
      totalSeats: 90,
      type: 'co-ed',
      isFull: false,
    },
    {
      id: 'lib-4',
      name: 'Dhanbad Study Circle',
      address: '101 Bank More, Dhanbad, Jharkhand',
      availableSeats: 0,
      totalSeats: 80,
      type: 'girls only',
      isFull: true,
    },
    {
      id: 'lib-5',
      name: 'Bokaro Digital Library',
      address: '202 Sector 4, Bokaro Steel City, Jharkhand',
      availableSeats: 50,
      totalSeats: 150,
      type: 'co-ed',
      isFull: false,
    },
    {
      id: 'lib-6',
      name: 'Kanke Reading Room',
      address: '333 Kanke Road, Ranchi, Jharkhand',
      availableSeats: 8,
      totalSeats: 50,
      type: 'boys only',
      isFull: false,
    },
  ];
  query: string = '';

  constructor() {}

  ngOnInit() {}

  handleLibraryAction(library: Library) {
    console.log('event', library);
    if (!library) {
      console.warn('No library data in action event');
      return;
    }
    this.router.navigate(['/apply-library', library.id]);
  }

  onSearch() {
    // TODO: Hook into your library search logic
    console.log('Searching for:', this.query);
  }
}
