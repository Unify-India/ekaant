import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';

import { IonButton } from '@ionic/angular/standalone';

@Component({
  selector: 'app-landing-screen',
  templateUrl: './landing-screen.component.html',
  styleUrls: ['./landing-screen.component.scss'],
  standalone: true,
  imports: [IonButton, RouterLink],
})
export class LandingScreenComponent implements OnInit {
  constructor() {}

  ngOnInit() {}
}
