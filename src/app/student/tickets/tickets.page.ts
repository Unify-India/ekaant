import { Component, OnInit } from '@angular/core';
import { BaseUiComponents } from 'src/app/shared/core/micro-components/base-ui.module';

@Component({
  selector: 'app-tickets',
  templateUrl: './tickets.page.html',
  styleUrls: ['./tickets.page.scss'],
  standalone: true,
  imports: [BaseUiComponents],
})
export class TicketsPage implements OnInit {
  constructor() {}

  ngOnInit() {}
}
