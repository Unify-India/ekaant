import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { addIcons } from 'ionicons';
import {
  businessOutline,
  checkmarkDoneOutline,
  documentTextOutline,
  imagesOutline,
  shieldCheckmarkOutline,
  libraryOutline,
  trendingUpOutline,
  arrowForward,
  sparklesOutline,
} from 'ionicons/icons';
import { AdminRoutingModule } from 'src/app/admin/admin-routing.module';
import { BaseUiComponents } from 'src/app/shared/core/micro-components/base-ui.module';
import { UiEssentials } from 'src/app/shared/core/micro-components/ui-essentials.module';

@Component({
  selector: 'app-register-library',
  templateUrl: './register-library.page.html',
  styleUrls: ['./register-library.page.scss'],
  standalone: true,
  imports: [BaseUiComponents, UiEssentials, CommonModule, FormsModule, AdminRoutingModule],
})
export class RegisterLibraryPage implements OnInit {
  pageTitle = 'Library Registration';

  constructor() {
    addIcons({
      libraryOutline,
      documentTextOutline,
      imagesOutline,
      shieldCheckmarkOutline,
      checkmarkDoneOutline,
      arrowForward,
      trendingUpOutline,
      businessOutline,
      sparklesOutline,
    });
  }

  ngOnInit() {}
}
