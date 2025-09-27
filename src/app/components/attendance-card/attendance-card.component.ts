import { Component, Input, OnInit } from '@angular/core';
import { IonList, IonItem, IonNote, IonLabel } from '@ionic/angular/standalone';

@Component({
  selector: 'app-attendance-card',
  templateUrl: './attendance-card.component.html',
  styleUrls: ['./attendance-card.component.scss'],
  imports: [IonLabel, IonNote, IonList, IonItem],
})
export class AttendanceCardComponent implements OnInit {
  @Input() attendanceRecords: { date: string; duration?: string; status: 'Completed' | 'Absent'; timeRange: string }[] =
    [];
  constructor() {}

  ngOnInit() {}
}
