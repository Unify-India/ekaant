import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';

@Component({
  selector: 'app-student-application-detail',
  templateUrl: './student-application-detail.page.html',
  styleUrls: ['./student-application-detail.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule],
})
export class StudentApplicationDetailPage implements OnInit {
  constructor() {}

  ngOnInit() {}
}
