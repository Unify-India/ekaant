import { Injectable, signal } from '@angular/core';
import { FormGroup, FormBuilder, FormArray } from '@angular/forms';
import { map, of, switchMap } from 'rxjs';
import { AuthService } from 'src/app/auth/service/auth.service';
import { DraftService } from 'src/app/services/draft.service';
import { FirebaseService } from 'src/app/services/firebase/firebase-service';
import { LibraryService } from 'src/app/services/library/library.service';

import {
  createAmenitiesForm,
  createBasicInformationForm,
  createBookCollectionForm,
  createCodeOfConductForm,
  createFacilityRangeGroup,
  createHostProfileForm,
  createLibraryImagesForm,
  createPhotoGroup,
  createPricingPlanGroup,
  createPricingPlansForm,
  createRequirementGroup,
  createRequirementsForm,
  createSeatConfigGroup,
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
    { key: 'pricingPlans', icon: 'cash-outline', label: 'Pricing' },
    { key: 'requirements', icon: 'document-outline', label: 'Requirements' },
    { key: 'codeOfConduct', icon: 'document-lock-outline', label: 'Conduct Code' },
    { key: 'preview', icon: 'eye-outline', label: 'Preview & Submit' },
  ];

  public mainForm: FormGroup;
  currentSectionIndex = signal(0);
  maxReachedIndex = signal(0);
  public editMode = false;
  public registrationDocId: string | null = null;
  public isApproved = false;

  constructor(
    private fb: FormBuilder,
    private firebase: FirebaseService,
    private draft: DraftService,
    private libraryService: LibraryService,
    private authService: AuthService, // Inject AuthService
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

    // Subscribe to auth status to load library registration data
    this.authService
      .getAuthStatusListener()
      .pipe(
        switchMap((user) => {
          if (user && user.role === 'manager') {
            // First, check for an approved library
            return this.libraryService.getApprovedLibrary(user.uid).pipe(
              switchMap((approvedData) => {
                if (approvedData) {
                  // Found an approved library
                  this.isApproved = true;
                  return of({ type: 'approved', data: approvedData });
                } else {
                  // No approved library, check for a registration document
                  return this.libraryService.getLibraryRegistration(user.uid).pipe(
                    map((registrationData) => {
                      if (registrationData) {
                        this.isApproved = false;
                        return { type: 'registration', data: registrationData };
                      }
                      return null; // No data found
                    }),
                  );
                }
              }),
            );
          }
          return of(null); // Not a manager or not logged in
        }),
      )
      .subscribe((result) => {
        if (result && result.data) {
          this.loadRegistrationData(result.data);
          this.registrationDocId = result.data.id;
          this.editMode = true;
          // Unlock all steps in edit mode
          this.maxReachedIndex.set(this.steps.length - 1);
          // console.log(`Loaded data from ${result.type}:`, result.data);
        } else {
          this.editMode = false;
          this.registrationDocId = null;
          this.isApproved = false;
          // console.log('No existing library data found for manager.');
        }
      });
  }

  public setEditMode(status: boolean, docId: string | null) {
    this.editMode = status;
    this.registrationDocId = docId;
  }

  public loadRegistrationData(data: any): void {
    if (!data) return;

    // Be explicit: patch each section to avoid issues with `patchValue` on the root form
    // Handle basicInformation separately to parse fullAddress if necessary
    if (data.basicInformation) {
      const basicInfoData = { ...data.basicInformation };
      // If an old 'fullAddress' exists, try to parse it into new fields
      if (basicInfoData.fullAddress && !basicInfoData.addressLine1) {
        // This is a simplistic parsing. A more robust solution might use a third-party library
        // or a more sophisticated regex if the fullAddress format varies.
        // For now, we'll just try to split by commas and assign,
        // which might not be perfect but provides a starting point.
        const addressParts = basicInfoData.fullAddress.split(',').map((part: string) => part.trim());
        if (addressParts.length >= 3) {
          basicInfoData.addressLine1 = addressParts[0];
          basicInfoData.city = addressParts[addressParts.length - 3];
          basicInfoData.state = addressParts[addressParts.length - 2];
          basicInfoData.zipCode = addressParts[addressParts.length - 1];
          basicInfoData.addressLine2 = addressParts.slice(1, addressParts.length - 3).join(', ');
        } else {
          basicInfoData.addressLine1 = basicInfoData.fullAddress;
        }
        delete basicInfoData.fullAddress;
      }
      this.mainForm.get('basicInformation')?.patchValue(basicInfoData);
    }

    this.mainForm.get('hostProfile')?.patchValue(data.hostProfile || {});
    this.mainForm.get('bookCollection')?.patchValue(data.bookCollection || {});
    this.mainForm.get('amenities')?.patchValue(data.amenities || {});
    this.mainForm.get('codeOfConduct')?.patchValue(data.codeOfConduct || {});

    // Handle complex groups with primitives and FormArrays separately
    if (data.seatManagement) {
      this.mainForm.get('seatManagement.totalSeats')?.patchValue(data.seatManagement.totalSeats);
      const rangesArray = this.mainForm.get('seatManagement.facilityRanges') as FormArray;
      rangesArray.clear();
      // The facilityRanges are for UI only and may not be present in the stored data
      if (data.seatManagement.facilityRanges) {
        data.seatManagement.facilityRanges.forEach((range: any) => {
          rangesArray.push(createFacilityRangeGroup(this.fb, range.from, range.to, range.facility));
        });
      }

      // If stored data has the new 'seats' structure, load it
      const seatsArray = this.mainForm.get('seatManagement.seats') as FormArray;
      seatsArray.clear();
      if (data.seatManagement.seats) {
        data.seatManagement.seats.forEach((seat: any) => {
          seatsArray.push(createSeatConfigGroup(this.fb, seat.seatNumber, seat.facilities));
        });
      }
    }

    // Manually handle FormArrays in their respective sections
    if (data.libraryImages && data.libraryImages.libraryPhotos) {
      const photosArray = this.mainForm.get('libraryImages.libraryPhotos') as FormArray;
      photosArray.clear();
      data.libraryImages.libraryPhotos.forEach((photo: any) => {
        photosArray.push(createPhotoGroup(this.fb, photo.previewUrl));
      });
    }

    if (data.pricingPlans) {
      const plansArray = this.mainForm.get('pricingPlans') as FormArray;
      plansArray.clear();
      // Handle both old nested object and new direct array structures
      const plans = Array.isArray(data.pricingPlans) ? data.pricingPlans : data.pricingPlans.pricingPlans;
      if (plans && Array.isArray(plans)) {
        plans.forEach((plan: any) => {
          plansArray.push(createPricingPlanGroup(this.fb, plan));
        });
      }
    }

    if (data.requirements && data.requirements.selectedRequirements) {
      const requirementsArray = this.mainForm.get('requirements.selectedRequirements') as FormArray;
      requirementsArray.clear();
      data.requirements.selectedRequirements.forEach((req: any) => {
        requirementsArray.push(createRequirementGroup(this.fb, req));
      });
    }
  }

  async updateLibrary(): Promise<void> {
    if (!this.registrationDocId) {
      throw new Error('No registration document ID found for updating.');
    }
    console.log(`Updating ${this.isApproved ? 'approved library' : 'library registration'}...`);
    const payload = this.mainForm.value;
    const { initialPayload, imagesArray, hostProfileFile, requirementsArray } = this.prepareInitialPayload(payload);

    // TODO: remove this console log
    console.log('DEBUG: Images array passed to uploader:', JSON.stringify(imagesArray, null, 2));

    // Upload new files that might have been added during the edit
    await this.uploadImages(this.registrationDocId, imagesArray, this.isApproved);
    await this.uploadHostProfile(this.registrationDocId, hostProfileFile, this.isApproved);
    await this.uploadRequirements(this.registrationDocId, requirementsArray, this.isApproved);

    // Update the main document with cleaned data
    if (this.isApproved) {
      await this.libraryService.updateApprovedLibrary(this.registrationDocId, initialPayload);
    } else {
      await this.libraryService.updateLibraryRegistration(this.registrationDocId, initialPayload);
    }
  }

  async submitLibrary(): Promise<string> {
    console.log('Submitting library registration form...');
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      throw new Error('User not authenticated. Cannot submit form.');
    }

    // orchestrate modular steps
    const payload = this.mainForm.value;
    const { initialPayload, imagesArray, hostProfileFile, requirementsArray } = this.prepareInitialPayload(payload);

    // Add owner and manager IDs
    initialPayload.ownerId = currentUser.uid;
    initialPayload.managerIds = [currentUser.uid];
    initialPayload.applicationStatus = 'pending';

    const libraryId = await this.createLibraryDoc(initialPayload);

    // Update user document with the new library ID
    const currentManagedIds = currentUser.managedLibraryIds || [];
    await this.authService.updateUserProfile({
      managedLibraryIds: [...currentManagedIds, libraryId],
    });

    await this.uploadImages(libraryId, imagesArray, false);
    await this.uploadHostProfile(libraryId, hostProfileFile, false);
    await this.uploadRequirements(libraryId, requirementsArray, false);

    return libraryId;
  }

  private prepareInitialPayload(payload: any) {
    const imagesArray = payload.libraryImages?.libraryPhotos ?? [];
    const hostProfileFile: File | null = payload.hostProfile?.profilePhoto ?? null;
    const requirementsArray = payload.requirements?.selectedRequirements ?? [];

    const initialPayload = { ...payload };

    // --- Seat Management Transformation ---
    if (initialPayload.seatManagement) {
      initialPayload.seatManagement = this.transformSeatManagementData(initialPayload.seatManagement);
    }
    // --- End Seat Management Transformation ---

    // Clean basicInformation to ensure only new address fields are present
    if (initialPayload.basicInformation) {
      const basicInfo = { ...initialPayload.basicInformation };
      delete (basicInfo as any).fullAddress; // Remove old fullAddress if it somehow persists
      initialPayload.basicInformation = basicInfo;
    }

    // Clean libraryImages to not store File objects
    if (initialPayload.libraryImages) {
      initialPayload.libraryImages = { libraryPhotos: [] };
    }

    // Clean hostProfile to not store File object
    if (initialPayload.hostProfile) {
      const hp = { ...initialPayload.hostProfile };
      delete (hp as any).profilePhoto;
      delete (hp as any).profilePhotoProgress;
      initialPayload.hostProfile = hp;
    }

    // Clean requirements to not store File objects in the main document
    if (initialPayload.requirements && initialPayload.requirements.selectedRequirements) {
      initialPayload.requirements.selectedRequirements = initialPayload.requirements.selectedRequirements.map(
        (req: any) => {
          const cleanReq = { ...req };
          delete cleanReq.sampleFile;
          delete cleanReq.sampleFileProgress;
          return cleanReq;
        },
      );
    }

    return { initialPayload, imagesArray, hostProfileFile, requirementsArray };
  }

  /**
   * Transforms the seat management form data from a UI-friendly range-based structure
   * to a granular, per-seat configuration array suitable for backend storage.
   * @param seatManagementData The value from the `seatManagement` FormGroup.
   * @returns A new object with `totalSeats` and a `seats` array.
   */
  private transformSeatManagementData(seatManagementData: any): any {
    const { totalSeats, facilityRanges, seats: individualSeatConfigs } = seatManagementData;

    // Initialize a map for all seats for efficient lookup
    const seatsMap = new Map<number, { seatNumber: number; facilities: string[] }>();
    for (let i = 1; i <= totalSeats; i++) {
      seatsMap.set(i, { seatNumber: i, facilities: [] });
    }

    // Apply facilities from ranges
    if (facilityRanges && facilityRanges.length > 0) {
      for (const range of facilityRanges) {
        for (let i = range.from; i <= range.to; i++) {
          const seat = seatsMap.get(i);
          if (seat && range.facility) {
            // Add facility if it's not already there
            if (!seat.facilities.includes(range.facility)) {
              seat.facilities.push(range.facility);
            }
          }
        }
      }
    }

    // Apply individual seat configurations, which can override ranges
    if (individualSeatConfigs && individualSeatConfigs.length > 0) {
      for (const individualConfig of individualSeatConfigs) {
        const seat = seatsMap.get(individualConfig.seatNumber);
        if (seat) {
          // Replace the facilities with the ones from individual config
          seat.facilities = [...individualConfig.facilities];
        }
      }
    }

    // Convert map values to an array
    const seats = Array.from(seatsMap.values());

    // Return the transformed data, excluding the temporary 'facilityRanges'
    return {
      totalSeats,
      seats,
    };
  }

  private async createLibraryDoc(initialPayload: any): Promise<string> {
    return this.libraryService.addLibrary(initialPayload);
  }

  private async uploadImages(libraryId: string, imagesArray: any[], isApproved: boolean): Promise<void> {
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

        await this.libraryService.addLibraryImage(libraryId, file, isApproved, { order: idx }, (percent) => {
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

  private async uploadHostProfile(libraryId: string, hostProfileFile: File | null, isApproved: boolean): Promise<void> {
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
      const collectionName = isApproved ? 'libraries' : 'library-registrations';
      const path = `${collectionName}/${libraryId}/${fileName}`;

      const url = await this.firebase.uploadFile(path, hostProfileFile, onProgress);

      const updatePayload = { 'hostProfile.photoURL': url };
      if (isApproved) {
        await this.libraryService.updateApprovedLibrary(libraryId, updatePayload);
      } else {
        await this.libraryService.updateLibraryRegistration(libraryId, updatePayload);
      }

      try {
        hostForm?.patchValue({ profilePhotoProgress: 100 });
      } catch (e) {
        // ignore
      }
    } catch (e) {
      console.warn('Failed to upload host profile photo', e);
    }
  }

  private async uploadRequirements(libraryId: string, requirementsArray: any[], isApproved: boolean): Promise<void> {
    if (!Array.isArray(requirementsArray) || requirementsArray.length === 0) return;
    for (let rIdx = 0; rIdx < requirementsArray.length; rIdx++) {
      const req = requirementsArray[rIdx];
      const file: File = req.sampleFile;
      if (!file) continue;
      try {
        const reqsForm = this.mainForm.get('requirements');
        const selectedArray = reqsForm?.get('selectedRequirements');
        const reqControl = (selectedArray as any)?.at ? (selectedArray as any).at(rIdx) : null;

        await this.libraryService.addRequirementDocument(
          libraryId,
          file,
          isApproved,
          { description: req.description },
          (percent) => {
            try {
              if (reqControl) reqControl.patchValue({ sampleFileProgress: percent });
            } catch (e) {
              // ignore
            }
          },
        );
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
