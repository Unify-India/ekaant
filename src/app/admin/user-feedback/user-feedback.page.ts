import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';

@Component({
  selector: 'app-user-feedback',
  templateUrl: './user-feedback.page.html',
  styleUrls: ['./user-feedback.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule]
})
export class UserFeedbackPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
