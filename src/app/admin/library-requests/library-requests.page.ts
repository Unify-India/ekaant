import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';

@Component({
  selector: 'app-library-requests',
  templateUrl: './library-requests.page.html',
  styleUrls: ['./library-requests.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule]
})
export class LibraryRequestsPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
