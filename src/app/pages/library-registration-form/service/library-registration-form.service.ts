import { Injectable, signal } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { DraftService } from 'src/app/services/draft.service';
import { FirebaseService } from 'src/app/services/firebase/firebase-service';

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
import { IFormSections } from '../model/library-from.interface';

@Injectable({
  providedIn: 'root',
})
export class LibraryRegistrationFormService {
  public readonly steps: IFormSections[] = [
    { key: 'basicInformation', icon: 'business-outline', label: 'Basic Info' },
    { key: 'hostProfile', icon: 'person-outline', label: 'Host Profile' },
    { key: 'libraryImages', icon: 'image-outline', label: 'Images' },
    { key: 'seatManagement', icon: 'people-outline', label: 'Seating' },
    { key: 'bookCollection', icon: 'book-outline', label: 'Book Collection' },
    { key: 'amenities', icon: 'wifi-outline', label: 'Amenities' },
    { key: 'seatManagement', icon: 'people-outline', label: 'Seating' },
    { key: 'pricingPlans', icon: 'cash-outline', label: 'Pricing' },
    { key: 'requirements', icon: 'document-outline', label: 'Requirements' },
    { key: 'hostProfile', icon: 'person-outline', label: 'Host Profile' },
    { key: 'codeOfConduct', icon: 'document-lock-outline', label: 'Conduct Code' },
    { key: 'preview', icon: 'eye-outline', label: 'Preview & Submit' },
  ];

  public mainForm: FormGroup;
  currentSectionIndex = signal(0);
  maxReachedIndex = signal(0);

  constructor(
    private fb: FormBuilder,
    private firebase: FirebaseService,
    private draft: DraftService,
  ) {
    // Initialize Firebase service (connect emulators if configured)
    try {
      this.firebase.init();
    } catch (e) {
      // ignore
    }
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
    // try load draft if exists (deferred so mainForm is assigned first)
    (async (form) => {
      try {
        await this.draft.loadDraft(form);
      } catch (e) {
        // ignore
      }
    })(this.mainForm);
    // console.log('Main Form Structure:', this.mainForm);
  }

  async submitLibrary(): Promise<string> {
    console.log('Submitting library registration form...');
    // orchestrate modular steps
    const payload = this.mainForm.value;
    const { initialPayload, imagesArray, hostProfileFile, requirementsArray } = this.prepareInitialPayload(payload);

    const libraryId = await this.createLibraryDoc(initialPayload);

    await this.uploadImages(libraryId, imagesArray);
    await this.uploadHostProfile(libraryId, hostProfileFile);
    await this.uploadRequirements(libraryId, requirementsArray);

    return libraryId;
  }

  private prepareInitialPayload(payload: any) {
    const imagesArray = payload.libraryImages?.libraryPhotos ?? [];
    const hostProfileFile: File | null = payload.hostProfile?.profilePhoto ?? null;

    const initialPayload = { ...payload };
    if (initialPayload.libraryImages) {
      initialPayload.libraryImages = { libraryPhotos: [] };
    }
    if (initialPayload.hostProfile) {
      const hp = { ...initialPayload.hostProfile };
      delete (hp as any).profilePhoto;
      delete (hp as any).profilePhotoProgress;
      initialPayload.hostProfile = hp;
    }
    const requirementsArray = payload.requirements?.selectedRequirements ?? [];
    return { initialPayload, imagesArray, hostProfileFile, requirementsArray };
  }

  private async createLibraryDoc(initialPayload: any): Promise<string> {
    return this.firebase.addLibrary(initialPayload);
  }

  private async uploadImages(libraryId: string, imagesArray: any[]): Promise<void> {
    console.log('uploading images...', imagesArray);
    if (!Array.isArray(imagesArray) || imagesArray.length === 0) return;
    for (let idx = 0; idx < imagesArray.length; idx++) {
      const photo = imagesArray[idx];
      const file: File = photo.file;
      if (!file) continue;
      try {
        const imagesFormGroup = this.mainForm.get('libraryImages');
        const photosArray = imagesFormGroup?.get('libraryPhotos');
        const photoControl = (photosArray as any)?.at ? (photosArray as any).at(idx) : null;

        await this.firebase.addLibraryImage(libraryId, file, { order: idx }, (percent) => {
          try {
            if (photoControl) photoControl.patchValue({ uploadProgress: percent });
          } catch (e) {
            // ignore
          }
        });
      } catch (e) {
        console.warn('Failed to upload image', e);
      }
    }
  }

  private async uploadHostProfile(libraryId: string, hostProfileFile: File | null): Promise<void> {
    if (!hostProfileFile) return;
    try {
      const hostForm = this.mainForm.get('hostProfile');
      const onProgress = (percent: number) => {
        try {
          hostForm?.patchValue({ profilePhotoProgress: percent });
        } catch (e) {
          // ignore
        }
      };
      const fileName = `host_profile_${Date.now()}_${hostProfileFile.name}`;
      const url = await this.firebase.uploadFile(libraryId, hostProfileFile, fileName, onProgress);
      await this.firebase.updateLibrary(libraryId, { 'hostProfile.photoURL': url });
      try {
        hostForm?.patchValue({ profilePhotoProgress: 100 });
      } catch (e) {
        // ignore
      }
    } catch (e) {
      console.warn('Failed to upload host profile photo', e);
    }
  }

  private async uploadRequirements(libraryId: string, requirementsArray: any[]): Promise<void> {
    if (!Array.isArray(requirementsArray) || requirementsArray.length === 0) return;
    for (let rIdx = 0; rIdx < requirementsArray.length; rIdx++) {
      const req = requirementsArray[rIdx];
      const file: File = req.sampleFile;
      if (!file) continue;
      try {
        const reqsForm = this.mainForm.get('requirements');
        const selectedArray = reqsForm?.get('selectedRequirements');
        const reqControl = (selectedArray as any)?.at ? (selectedArray as any).at(rIdx) : null;

        await this.firebase.addRequirementDocument(libraryId, file, { description: req.description }, (percent) => {
          try {
            if (reqControl) reqControl.patchValue({ sampleFileProgress: percent });
          } catch (e) {
            // ignore
          }
        });
      } catch (e) {
        console.warn('Failed to upload requirement file', e);
      }
    }
  }

  getFormGroup(key: string): FormGroup {
    return this.mainForm.get(key) as FormGroup;
  }

  isCurrentStepValid(): boolean {
    const currentKey = this.steps[this.currentSectionIndex()].key;
    // console.log('Form group info', this.getFormGroup(currentKey));
    return this.getFormGroup(currentKey)?.valid ?? false;
  }

  goToStep(index: number): void {
    if (index <= this.maxReachedIndex()) {
      this.currentSectionIndex.set(index);
    }
    // save draft when user navigates between steps
    try {
      this.draft.saveDraft(this.mainForm);
    } catch (e) {
      // ignore
    }
  }

  nextStep(): void {
    if (this.isCurrentStepValid() && this.currentSectionIndex() < this.steps.length - 1) {
      const newIndex = this.currentSectionIndex() + 1;
      this.currentSectionIndex.set(newIndex);
      this.maxReachedIndex.set(Math.max(this.maxReachedIndex(), newIndex));
    }
    try {
      this.draft.saveDraft(this.mainForm);
    } catch (e) {
      // ignore
    }
  }

  prevStep(): void {
    if (this.currentSectionIndex() > 0) {
      this.currentSectionIndex.set(this.currentSectionIndex() - 1);
    }
    try {
      this.draft.saveDraft(this.mainForm);
    } catch (e) {
      // ignore
    }
  }

  reset(): void {
    this.mainForm.reset();
    this.currentSectionIndex.set(0);
    this.maxReachedIndex.set(0);
    try {
      this.draft.clearDraft();
    } catch (e) {
      // ignore
    }
  }
}
