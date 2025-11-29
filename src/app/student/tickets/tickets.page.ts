import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BaseUiComponents } from 'src/app/shared/core/micro-components/base-ui.module';

@Component({
  selector: 'app-tickets',
  templateUrl: './tickets.page.html',
  styleUrls: ['./tickets.page.scss'],
  standalone: true,
  imports: [FormsModule, BaseUiComponents],
})
export class TicketsPage implements OnInit {
  pageTitle = 'My Tickets';
  constructor() {}

  ngOnInit() {}
}
