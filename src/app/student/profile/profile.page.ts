import { Component, OnInit } from '@angular/core';
import { addIcons } from 'ionicons';
import { personCircle, personOutline, cloudUploadOutline, saveOutline, personCircleOutline } from 'ionicons/icons';
import { BaseUiComponents } from 'src/app/shared/core/micro-components/base-ui.module';
import { FormEssentials } from 'src/app/shared/core/micro-components/form-essentials.module';
import { UiEssentials } from 'src/app/shared/core/micro-components/ui-essentials.module';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
  standalone: true,
  imports: [BaseUiComponents, FormEssentials, UiEssentials],
})
export class ProfilePage implements OnInit {
  public selectedFacility = 'ac';
  pageTitle = 'Profile';

  constructor() {
    addIcons({ personCircleOutline, personOutline, cloudUploadOutline, saveOutline, personCircle });
  }

  saveProfile() {
    console.log('Profile saved!');
  }

  ngOnInit() {}
}
