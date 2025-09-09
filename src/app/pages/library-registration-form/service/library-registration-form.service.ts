import { Injectable, signal } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { IFormSections } from '../model/library-from.interface';
import {
  createAmenitiesForm,
  createBasicInformationForm,
  createBookCollectionForm,
  createCodeOfConductForm,
  createHostProfileForm,
  createLibraryImagesForm,
  createPricingPlansForm,
  createRequirementsForm,
  createSeatManagementForm,
} from '../helpers/library-form-definitions';

@Injectable({
  providedIn: 'root',
})
export class LibraryRegistrationFormService {
  public readonly steps: IFormSections[] = [
    { key: 'basicInformation', icon: 'business-outline', label: 'Basic Info' },
    { key: 'hostProfile', icon: 'person-outline', label: 'Host Profile' },
    { key: 'libraryImages', icon: 'image-outline', label: 'Images' },
    { key: 'bookCollection', icon: 'book-outline', label: 'Book Collection' },
    { key: 'amenities', icon: 'wifi-outline', label: 'Amenities' },
    { key: 'seatManagement', icon: 'people-outline', label: 'Seating' },
    { key: 'pricingPlans', icon: 'cash-outline', label: 'Pricing' },
    { key: 'requirements', icon: 'document-outline', label: 'Requirements' },
    { key: 'codeOfConduct', icon: 'document-lock-outline', label: 'Conduct Code' },
    { key: 'preview', icon: 'eye-outline', label: 'Preview & Submit' },
  ];

  public mainForm: FormGroup;
  currentSectionIndex = signal(0);
  maxReachedIndex = signal(0);

  constructor(private fb: FormBuilder) {
    this.mainForm = this.fb.group({
      basicInformation: createBasicInformationForm(this.fb),
      hostProfile: createHostProfileForm(this.fb),
      libraryImages: createLibraryImagesForm(this.fb),
      bookCollection: createBookCollectionForm(this.fb),
      amenities: createAmenitiesForm(this.fb),
      seatManagement: createSeatManagementForm(this.fb),
      pricingPlans: createPricingPlansForm(this.fb),
      requirements: createRequirementsForm(this.fb),
      codeOfConduct: createCodeOfConductForm(this.fb),
    });
  }

  getFormGroup(key: string): FormGroup {
    return this.mainForm.get(key) as FormGroup;
  }

  isCurrentStepValid(): boolean {
    const currentKey = this.steps[this.currentSectionIndex()].key;
    return this.getFormGroup(currentKey)?.valid ?? false;
  }

  goToStep(index: number): void {
    if (index <= this.maxReachedIndex()) {
      this.currentSectionIndex.set(index);
    }
  }

  nextStep(): void {
    if (this.isCurrentStepValid() && this.currentSectionIndex() < this.steps.length - 1) {
      const newIndex = this.currentSectionIndex() + 1;
      this.currentSectionIndex.set(newIndex);
      this.maxReachedIndex.set(Math.max(this.maxReachedIndex(), newIndex));
    }
  }

  prevStep(): void {
    if (this.currentSectionIndex() > 0) {
      this.currentSectionIndex.set(this.currentSectionIndex() - 1);
    }
  }

  reset(): void {
    this.mainForm.reset();
    this.currentSectionIndex.set(0);
    this.maxReachedIndex.set(0);
  }
}
