import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';

@Component({
  selector: 'app-registration-acknowledgement',
  templateUrl: './registration-acknowledgement.page.html',
  styleUrls: ['./registration-acknowledgement.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule]
})
export class RegistrationAcknowledgementPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
