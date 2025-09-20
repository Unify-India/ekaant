import { Component, Input, OnInit } from '@angular/core';
import {
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle,
  IonCardContent,
  IonList,
  IonIcon,
  IonLabel,
  IonItem,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { closeCircleOutline } from 'ionicons/icons';
import { IPricingDetails } from 'src/app/models/library';

@Component({
  selector: 'app-price-card',
  templateUrl: './price-card.component.html',
  styleUrls: ['./price-card.component.scss'],
  imports: [IonLabel, IonIcon, IonList, IonCardContent, IonCardSubtitle, IonCardTitle, IonCardHeader, IonCard],
})
export class PriceCardComponent implements OnInit {
  @Input() pricing!: IPricingDetails;
  constructor() {}

  ngOnInit() {}
}
