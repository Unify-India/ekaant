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
  public readonly addressLabel = 'Full Address';
  public readonly addressPlaceholder = 'Enter complete address with landmarks';
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
  get fullAddress() {
    return this.basicInfoForm.get('fullAddress');
  }
  get genderCategory() {
    return this.basicInfoForm.get('genderCategory');
  }
  get operatingHours() {
    return this.basicInfoForm.get('operatingHours');
  }
}
