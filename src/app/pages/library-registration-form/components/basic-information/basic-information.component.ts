import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { BaseUiComponents } from 'src/app/shared/core/micro-components/base-ui.module';
import { FormEssentials } from 'src/app/shared/core/micro-components/form-essentials.module';
import { UiEssentials } from 'src/app/shared/core/micro-components/ui-essentials.module';

import { createBasicInformationForm } from '../../helpers/library-form-definitions';
import { LibraryRegistrationFormService } from '../../service/library-registration-form.service';

@Component({
  selector: 'app-basic-information',
  templateUrl: './basic-information.component.html',
  styleUrls: ['./basic-information.component.scss'],
  imports: [BaseUiComponents, UiEssentials, FormEssentials],
})
export class BasicInformationComponent implements OnInit {
  private lrfService = inject(LibraryRegistrationFormService);
  public basicInfoForm!: FormGroup;

  ngOnInit() {
    this.basicInfoForm = this.lrfService.getFormGroup('basicInformation');
  }
  public readonly pageTitle = 'Basic Information';
  public readonly sectionDescription = 'Library name, address, and basic details';
  public readonly completionWarning = 'This section needs to be completed';
  public readonly libraryNameLabel = 'Library Name';
  public readonly libraryNamePlaceholder = 'Enter your library name';
  public readonly addressLine1Label = 'Address Line 1';
  public readonly addressLine1Placeholder = 'House No., Building, Street, Area';
  public readonly addressLine2Label = 'Address Line 2 (Optional)';
  public readonly addressLine2Placeholder = 'Landmark, Colony, Locality';
  public readonly cityLabel = 'City';
  public readonly cityPlaceholder = 'Enter city';
  public readonly stateLabel = 'State';
  public readonly statePlaceholder = 'Enter state';
  public readonly zipCodeLabel = 'Zip Code';
  public readonly zipCodePlaceholder = 'Enter 6-digit zip code';
  public readonly genderCategoryLabel = 'Gender Category';
  public readonly genderCategoryOptions = [
    {
      value: 'Co-ed (Mixed)',
      label: 'Co-ed (Mixed)',
      description: 'Open to all genders',
    },
    {
      value: 'Girls Only',
      label: 'Girls Only',
      description: 'Exclusively for female students',
    },
    {
      value: 'Boys Only',
      label: 'Boys Only',
      description: 'Exclusively for male students',
    },
  ];
  public readonly operatingHoursLabel = 'Operating Hours';
  public readonly operatingHoursPlaceholder = 'E.g., 6 AM - 10 PM or 24 Hours';
  public readonly operatingHoursHelper = 'Specify when your library is open for students';
  public readonly requiredFieldError = 'This field is required.';
  public readonly minLengthError = (requiredLength: number) =>
    `This field must be at least ${requiredLength} characters long.`;

  get libraryName() {
    return this.basicInfoForm.get('libraryName');
  }
  get addressLine1() {
    return this.basicInfoForm.get('addressLine1');
  }
  get addressLine2() {
    return this.basicInfoForm.get('addressLine2');
  }
  get city() {
    return this.basicInfoForm.get('city');
  }
  get state() {
    return this.basicInfoForm.get('state');
  }
  get zipCode() {
    return this.basicInfoForm.get('zipCode');
  }
  get genderCategory() {
    return this.basicInfoForm.get('genderCategory');
  }
  get is24Hours() {
    return this.basicInfoForm.get('is24Hours');
  }
  get openTime() {
    return this.basicInfoForm.get('openTime');
  }
  get closeTime() {
    return this.basicInfoForm.get('closeTime');
  }
}
