import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BaseUiComponents } from 'src/app/shared/core/micro-components/base-ui.module';

@Component({
  selector: 'app-my-library',
  templateUrl: './my-library.page.html',
  styleUrls: ['./my-library.page.scss'],
  standalone: true,
  imports: [FormsModule, BaseUiComponents],
})
export class MyLibraryPage implements OnInit {
  pageTitle = 'My Library';
  constructor() {}

  ngOnInit() {}
}
