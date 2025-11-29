import { Component, OnInit } from '@angular/core';
import { BaseUiComponents } from 'src/app/shared/core/micro-components/base-ui.module';

@Component({
  selector: 'app-my-bookings',
  templateUrl: './my-bookings.page.html',
  styleUrls: ['./my-bookings.page.scss'],
  standalone: true,
  imports: [BaseUiComponents],
})
export class MyBookingsPage implements OnInit {
  constructor() {}

  ngOnInit() {}
}
