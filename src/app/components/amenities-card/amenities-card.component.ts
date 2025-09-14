import { Component, Input, OnInit } from '@angular/core';
import { IonIcon } from '@ionic/angular/standalone';
import { IAmenities } from 'src/app/models/library';

@Component({
  selector: 'app-amenities-card',
  templateUrl: './amenities-card.component.html',
  styleUrls: ['./amenities-card.component.scss'],
  imports: [IonIcon],
})
export class AmenitiesCardComponent implements OnInit {
  @Input() amenity!: IAmenities;

  constructor() {}

  ngOnInit() {}
}
