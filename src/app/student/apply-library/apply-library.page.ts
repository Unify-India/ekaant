import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';

@Component({
  selector: 'app-apply-library',
  templateUrl: './apply-library.page.html',
  styleUrls: ['./apply-library.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule]
})
export class ApplyLibraryPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
