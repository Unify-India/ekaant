import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BaseUiComponents } from 'src/app/shared/core/micro-components/base-ui.module';

@Component({
  selector: 'app-my-bookings',
  templateUrl: './my-bookings.page.html',
  styleUrls: ['./my-bookings.page.scss'],
  standalone: true,
  imports: [FormsModule, BaseUiComponents],
})
export class MyBookingsPage implements OnInit {
  pageTitle = 'My Bookings';
  constructor() {}

  ngOnInit() {}
}
