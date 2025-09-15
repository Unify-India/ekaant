import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';

@Component({
  selector: 'app-library-performance-report',
  templateUrl: './performance-report.page.html',
  styleUrls: ['./performance-report.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule],
})
export class PerformanceReportPage implements OnInit {
  constructor() {}

  ngOnInit() {}
}
