import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { warningOutline, wifiOutline } from 'ionicons/icons';
import { AMENITIES_DATA } from 'src/app/models/constants/amenities.constants';

import { LibraryRegistrationFormService } from '../../service/library-registration-form.service';

@Component({
  selector: 'app-amenities',
  templateUrl: './amenities.component.html',
  styleUrls: ['./amenities.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, ReactiveFormsModule],
})
export class AmenitiesComponent implements OnInit {
  private lrfService = inject(LibraryRegistrationFormService);
  public amenitiesForm!: FormGroup;

  // --- String Variables for the Template ---
  public readonly pageTitle = 'Amenities';
  public readonly sectionDescription =
    'Select all the facilities and amenities available at your library. This helps students choose the right library for their needs.';
  public readonly completionWarning = 'This section needs to be completed';
  public readonly selectPrompt = 'Select the amenities available at your library';

  // --- Data for Rendering Checkboxes ---
  public readonly amenities = Object.keys(AMENITIES_DATA).map((key) => ({
    formControlName: key,
    label: AMENITIES_DATA[key].amenityName,
    icon: AMENITIES_DATA[key].icon,
  }));

  constructor() {
    // Add all icons dynamically
    const icons = this.amenities.reduce((acc: any, curr) => {
      // We can't easily import icons dynamically by string name in 'addIcons' here without a map
      // but for now we can just rely on the template using them if they are registered globally or we import specific ones.
      // However, addIcons needs the object { name: iconSvg }.
      // Since we are moving to a constant, we might need to update how icons are added.
      // For this component, let's keep the manual addIcons for now or update it to be comprehensive.
      return acc;
    }, {});

    addIcons({ warningOutline, wifiOutline }); // Keep existing + others will need to be added or imported if we want to show icons in the form
  }

  ngOnInit() {
    this.amenitiesForm = this.lrfService.getFormGroup('amenities');
  }
}
