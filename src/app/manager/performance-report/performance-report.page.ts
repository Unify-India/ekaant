import { Component, OnInit } from '@angular/core';
import { BaseUiComponents } from 'src/app/shared/core/micro-components/base-ui.module';

@Component({
  selector: 'app-library-performance-report',
  templateUrl: './performance-report.page.html',
  styleUrls: ['./performance-report.page.scss'],
  standalone: true,
  imports: [BaseUiComponents],
})
export class PerformanceReportPage implements OnInit {
  constructor() {}

  ngOnInit() {}
}
