import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';

@Component({
  selector: 'app-library-request-detail',
  templateUrl: './library-request-detail.page.html',
  styleUrls: ['./library-request-detail.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule]
})
export class LibraryRequestDetailPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
