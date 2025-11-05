import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import {
  IonIcon,
  IonInput,
  IonCardContent,
  IonCardTitle,
  IonCard,
  IonCardHeader,
  IonItem,
  IonCheckbox,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  informationCircleOutline,
  bookOutline,
  personCircleOutline,
  personOutline,
  arrowForwardOutline,
} from 'ionicons/icons';
import { BaseUiComponents } from 'src/app/shared/core/micro-components/base-ui.module';

@Component({
  selector: 'app-application-form',
  templateUrl: './application-form.page.html',
  styleUrls: ['./application-form.page.scss'],
  standalone: true,
  imports: [
    IonCheckbox,
    IonItem,
    IonCardHeader,
    IonCard,
    IonCardTitle,
    IonCardContent,
    IonInput,
    IonIcon,
    BaseUiComponents,
    FormsModule,
  ],
})
export class ApplicationFormPage implements OnInit {
  pageTitle = 'Enroll now';
  totalFee = 70.0;
  reservationFee = this.totalFee * 0.05;

  confirmInfo = false;
  acceptTerms = false;
  constructor(private route: ActivatedRoute) {
    addIcons({ bookOutline, personOutline, arrowForwardOutline, personCircleOutline, informationCircleOutline });
  }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    console.log('ApplicationFormPage received id:', id);
  }

  ngAfterViewInit() {
    // log id param for verification
    const id = this.route.snapshot.paramMap.get('id');
    console.log('ApplicationFormPage received id:', id);
  }
}
