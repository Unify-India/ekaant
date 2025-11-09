import { CommonModule, DatePipe } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonButton,
  IonIcon,
  IonContent,
  IonCard,
  IonItem,
  IonLabel,
  IonList,
  IonInput,
  IonTextarea,
  IonGrid,
  IonRow,
  IonCol,
  IonFooter,
  IonModal,
  IonDatetime,
  ModalController, // Import ModalController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { calendarOutline, closeOutline, informationCircleOutline, checkmarkCircleOutline } from 'ionicons/icons';

@Component({
  selector: 'app-report-absence',
  templateUrl: './report-absence.component.html',
  styleUrls: ['./report-absence.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonButton,
    IonIcon,
    IonContent,
    IonCard,
    IonItem,
    IonLabel,
    IonList,
    IonInput,
    IonTextarea,
    IonModal,
    IonDatetime,
    DatePipe,
  ],
})
export class ReportAbsenceModal implements OnInit {
  // ViewChild to access the ion-datetime component
  @ViewChild('datetimePicker') datetimePicker!: IonDatetime;

  selectedDate: string = ''; // Holds the selected date string (ISO format)
  absenceReason: string = '';

  today: string; // Used to set min date for datetime picker
  maxDate: string; // Used to set max date for datetime picker (e.g., 1 year from now)

  constructor(private modalController: ModalController) {
    addIcons({
      calendarOutline,
      closeOutline,
      informationCircleOutline,
      checkmarkCircleOutline,
    });

    const now = new Date();
    this.today = now.toISOString();

    const oneYearFromNow = new Date();
    oneYearFromNow.setFullYear(now.getFullYear() + 1);
    this.maxDate = oneYearFromNow.toISOString();
  }

  ngOnInit() {}

  // Handles the date change event from ion-datetime
  onDateChange(event: CustomEvent) {
    this.selectedDate = event.detail.value;
    // Dismiss the date picker modal after selection
    this.modalController.dismiss();
  }

  // Dismisses the modal without submitting
  dismissModal() {
    this.modalController.dismiss(null, 'cancel');
  }

  // Submits the absence report
  submitAbsence() {
    if (!this.selectedDate) {
      // You might want to show a toast or alert here
      console.warn('Please select an absence date.');
      return;
    }

    const absenceData = {
      date: this.selectedDate,
      reason: this.absenceReason,
    };
    console.log('Submitting absence:', absenceData);
    this.modalController.dismiss(absenceData, 'submit');
  }
}
