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
  createLibraryImagesArray,
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
  private hasLocalDraft = false;

  constructor(
    private fb: FormBuilder,
    private firebase: FirebaseService,
    private draft: DraftService,
    private libraryService: LibraryService,
    private authService: AuthService,
  ) {
    try {
      this.firebase.init();
    } catch (e) {
      // ignore
    }
    this.mainForm = this.fb.group({
      basicInformation: createBasicInformationForm(this.fb),
      hostProfile: createHostProfileForm(this.fb),
      libraryImages: createLibraryImagesArray(this.fb),
      bookCollection: createBookCollectionForm(this.fb),
      amenities: createAmenitiesForm(this.fb),
      seatManagement: createSeatManagementForm(this.fb),
      pricingPlans: createPricingPlansForm(this.fb),
      requirements: createRequirementsForm(this.fb),
      codeOfConduct: createCodeOfConductForm(this.fb),
    });

    (async () => {
      try {
        const data = await this.draft.getDraft();
        if (data) {
          this.hasLocalDraft = true;
          this.loadRegistrationData(data);
          this.recalculateMaxReachedIndex();
        }
      } catch (e) {
        // ignore
      }
    })();

    this.authService
      .getAuthStatusListener()
      .pipe(
        switchMap((user) => {
          if (user && user.role === 'manager') {
            return this.libraryService.getApprovedLibrary(user.uid).pipe(
              switchMap((approvedData) => {
                if (approvedData) {
                  this.isApproved = true;
                  return of({ type: 'approved', data: approvedData });
                } else {
                  return this.libraryService.getLibraryRegistration(user.uid).pipe(
                    map((registrationData) => {
                      if (registrationData) {
                        this.isApproved = false;
                        return { type: 'registration', data: registrationData };
                      }
                      return null;
                    }),
                  );
                }
              }),
            );
          }
          return of(null);
        }),
      )
      .subscribe((result) => {
        if (result && result.data) {
          this.registrationDocId = result.data.id || null;
          this.editMode = true;

          if (!this.hasLocalDraft) {
            this.loadRegistrationData(result.data);
            this.maxReachedIndex.set(this.steps.length - 1);
          }
        } else {
          this.editMode = false;
          this.registrationDocId = null;
          this.isApproved = false;
        }
      });
  }

  public setEditMode(status: boolean, docId: string | null) {
    this.editMode = status;
    this.registrationDocId = docId;
  }

  public loadRegistrationData(data: any): void {
    if (!data) return;

    this.mainForm.get('basicInformation')?.patchValue(data.basicInformation || {});
    this.mainForm.get('hostProfile')?.patchValue(data.hostProfile || {});

    const hostProfilePhoto = this.mainForm.get('hostProfile.profilePhoto')?.value;
    if (hostProfilePhoto instanceof File) {
      const newUrl = URL.createObjectURL(hostProfilePhoto);
      this.mainForm.get('hostProfile')?.patchValue({ photoURL: newUrl });
    }

    this.mainForm.get('bookCollection')?.patchValue(data.bookCollection || {});

    if (Array.isArray(data.amenities)) {
      const amObj: any = {};
      data.amenities.forEach((k: string) => (amObj[k] = true));
      this.mainForm.get('amenities')?.patchValue(amObj);
    } else {
      this.mainForm.get('amenities')?.patchValue(data.amenities || {});
    }

    this.mainForm.get('codeOfConduct')?.patchValue(data.codeOfConduct || {});

    if (data.seatManagement) {
      this.mainForm.get('seatManagement.totalSeats')?.patchValue(data.seatManagement.totalSeats);
      const rangesArray = this.mainForm.get('seatManagement.facilityRanges') as FormArray;
      rangesArray.clear();
      if (data.seatManagement.facilityRanges) {
        data.seatManagement.facilityRanges.forEach((range: any) => {
          rangesArray.push(createFacilityRangeGroup(this.fb, range.from, range.to, range.facility));
        });
      }

      const seatsArray = this.mainForm.get('seatManagement.seats') as FormArray;
      seatsArray.clear();
      if (data.seatManagement.seats) {
        data.seatManagement.seats.forEach((seat: any) => {
          const facilities = [];
          if (seat.isAC) facilities.push('AC');
          if (seat.hasPower) facilities.push('Power Socket');
          seatsArray.push(createSeatConfigGroup(this.fb, parseInt(seat.seatNumber), facilities));
        });
      }
    }

    if (data.libraryImages) {
      const photosArray = this.mainForm.get('libraryImages') as FormArray;
      photosArray.clear();
      // Handle both array (new structure) and object wrapper (old structure)
      const imagesList = Array.isArray(data.libraryImages)
        ? data.libraryImages
        : data.libraryImages.libraryPhotos || [];

      imagesList.forEach((photo: any) => {
        const group = createPhotoGroup(this.fb, photo.previewUrl || photo.imageURL, photo.caption);
        if (photo.file) {
          group.patchValue({ file: photo.file });
        }
        photosArray.push(group);
      });
    }

    if (data.pricingPlans) {
      const plansArray = this.mainForm.get('pricingPlans') as FormArray;
      plansArray.clear();
      const plans = Array.isArray(data.pricingPlans) ? data.pricingPlans : data.pricingPlans.pricingPlans;
      if (plans && Array.isArray(plans)) {
        plans.forEach((plan: any) => {
          plansArray.push(createPricingPlanGroup(this.fb, plan));
        });
      }
    }

    const requirementsData = Array.isArray(data.requirements)
      ? data.requirements
      : data.requirements?.selectedRequirements;

    if (requirementsData) {
      const requirementsArray = this.mainForm.get('requirements') as FormArray;
      requirementsArray.clear();
      requirementsData.forEach((req: any) => {
        const group = createRequirementGroup(this.fb, req);
        if (req.sampleFile) {
          group.patchValue({ sampleFile: req.sampleFile });
        }
        if (req.fileURL) {
          group.patchValue({ fileURL: req.fileURL });
        }
        requirementsArray.push(group);
      });
    }
  }

  recalculateMaxReachedIndex() {
    let max = 0;
    for (let i = 0; i < this.steps.length; i++) {
      const key = this.steps[i].key;
      const control = this.mainForm.get(key);
      if (control && control.valid) {
        max = i + 1;
      } else {
        break;
      }
    }
    if (max > this.steps.length - 1) {
      max = this.steps.length - 1;
    }
    this.maxReachedIndex.set(max);
  }

  async updateLibrary(): Promise<void> {
    if (!this.registrationDocId) {
      throw new Error('No registration document ID found for updating.');
    }
    const payload = this.mainForm.getRawValue();
    const { initialPayload, imagesArray, hostProfileFile, requirementsArray, pricingPlansArray } =
      this.prepareInitialPayload(payload);

    await this.uploadImages(this.registrationDocId, imagesArray, this.isApproved);
    const hostPhotoUrl = await this.uploadHostProfile(this.registrationDocId, hostProfileFile, this.isApproved);
    await this.uploadRequirements(this.registrationDocId, requirementsArray, this.isApproved);

    if (hostPhotoUrl) {
      initialPayload.hostProfile.photoURL = hostPhotoUrl;
    }

    if (this.isApproved) {
      await this.libraryService.updateApprovedLibrary(this.registrationDocId, initialPayload);
    } else {
      await this.libraryService.updateLibraryRegistration(this.registrationDocId, initialPayload);
    }
  }

  async submitLibrary(): Promise<string> {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      throw new Error('User not authenticated. Cannot submit form.');
    }

    const payload = this.mainForm.getRawValue();
    const { initialPayload, imagesArray, hostProfileFile, requirementsArray, pricingPlansArray } =
      this.prepareInitialPayload(payload);

    initialPayload.ownerId = currentUser.uid;
    initialPayload.managerIds = [currentUser.uid];
    initialPayload.applicationStatus = 'pending';

    const libraryId = await this.createLibraryDoc(initialPayload);

    const currentManagedIds = currentUser.managedLibraryIds || [];
    await this.authService.updateUserProfile({
      managedLibraryIds: [...currentManagedIds, libraryId],
    });

    await this.uploadImages(libraryId, imagesArray, false);
    const hostPhotoUrl = await this.uploadHostProfile(libraryId, hostProfileFile, false);
    await this.uploadRequirements(libraryId, requirementsArray, false);

    if (hostPhotoUrl) {
      await this.libraryService.updateLibraryRegistration(libraryId, {
        'hostProfile.photoURL': hostPhotoUrl,
      });
    }

    return libraryId;
  }

  private prepareInitialPayload(payload: any) {
    const imagesArray = payload.libraryImages ?? [];
    const hostProfileFile: File | null = payload.hostProfile?.profilePhoto ?? null;
    const pricingPlansArray = payload.pricingPlans?.pricingPlans ?? payload.pricingPlans ?? [];

    const requirementsArray = Array.isArray(payload.requirements)
      ? payload.requirements
      : (payload.requirements?.selectedRequirements ?? []);

    const initialPayload = { ...payload };

    if (initialPayload.seatManagement) {
      initialPayload.seatManagement = this.transformSeatManagementData(initialPayload.seatManagement);
    }

    if (initialPayload.basicInformation) {
      const basicInfo = { ...initialPayload.basicInformation };
      delete (basicInfo as any).fullAddress;
      initialPayload.basicInformation = basicInfo;
    }

    if (initialPayload.amenities) {
      const am = initialPayload.amenities;
      initialPayload.amenities = Object.keys(am).filter((k) => am[k] === true);
    }

    if (initialPayload.libraryImages) {
      delete initialPayload.libraryImages;
    }

    if (initialPayload.hostProfile) {
      const hp = { ...initialPayload.hostProfile };
      delete (hp as any).profilePhoto;
      delete (hp as any).profilePhotoProgress;
      initialPayload.hostProfile = hp;
    }

    initialPayload.pricingPlans = pricingPlansArray;

    if (initialPayload.requirements) {
      initialPayload.requirements = initialPayload.requirements.map((req: any) => {
        const { sampleFile, sampleFileProgress, ...rest } = req;
        return rest;
      });
    }

    return { initialPayload, imagesArray, hostProfileFile, requirementsArray, pricingPlansArray };
  }

  private transformSeatManagementData(seatManagementData: any): any {
    const { totalSeats, facilityRanges, seats: individualSeatConfigs } = seatManagementData;

    const seatsMap = new Map<
      number,
      { seatNumber: string; isAC: boolean; hasPower: boolean; status: string; id: string }
    >();

    const getSeat = (num: number) => {
      if (!seatsMap.has(num)) {
        seatsMap.set(num, {
          seatNumber: `${num}`,
          id: `s${num}`,
          isAC: false,
          hasPower: false,
          status: 'active',
        });
      }
      return seatsMap.get(num)!;
    };

    if (facilityRanges && facilityRanges.length > 0) {
      for (const range of facilityRanges) {
        for (let i = range.from; i <= range.to; i++) {
          if (i > totalSeats) continue;
          const seat = getSeat(i);
          if (range.facility === 'AC') seat.isAC = true;
          if (range.facility === 'Power Socket') seat.hasPower = true;
        }
      }
    }

    if (individualSeatConfigs && individualSeatConfigs.length > 0) {
      for (const individualConfig of individualSeatConfigs) {
        if (individualConfig.seatNumber > totalSeats) continue;
        const seat = getSeat(individualConfig.seatNumber);
        if (seat) {
          seat.isAC = individualConfig.facilities.includes('AC');
          seat.hasPower = individualConfig.facilities.includes('Power Socket');
        }
      }
    }

    for (let i = 1; i <= totalSeats; i++) {
      getSeat(i);
    }

    const seats = Array.from(seatsMap.values()).sort((a, b) => parseInt(a.seatNumber) - parseInt(b.seatNumber));

    return {
      totalSeats,
      seats,
    };
  }

  private async createLibraryDoc(initialPayload: any): Promise<string> {
    return this.libraryService.addLibrary(initialPayload);
  }

  private async uploadImages(libraryId: string, imagesArray: any[], isApproved: boolean): Promise<void> {
    if (!Array.isArray(imagesArray)) return;

    try {
      const photosArray = this.mainForm.get('libraryImages') as FormArray;

      const imagesToSync = imagesArray.map((photo, idx) => ({
        file: photo.file,
        previewUrl: photo.previewUrl,
        order: idx,
        caption: photo.caption,
      }));

      await this.libraryService.syncLibraryImages(libraryId, imagesToSync, isApproved, (idx, percent) => {
        try {
          const photoControl = photosArray.at(idx);
          if (photoControl) {
            photoControl.patchValue({ uploadProgress: percent });
          }
        } catch (e) {
          // ignore
        }
      });
    } catch (e) {
      throw e;
    }
  }

  private async uploadHostProfile(
    libraryId: string,
    hostProfileFile: File | null,
    isApproved: boolean,
  ): Promise<string | null> {
    if (!hostProfileFile) return null;
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

      try {
        hostForm?.patchValue({
          profilePhotoProgress: 100,
          photoURL: url,
        });
      } catch (e) {
        // ignore
      }
      return url;
    } catch (e) {
      return null;
    }
  }

  private async uploadRequirements(libraryId: string, requirementsArray: any[], isApproved: boolean): Promise<void> {
    if (!Array.isArray(requirementsArray)) return;
    try {
      const selectedArray = this.mainForm.get('requirements') as FormArray;

      const reqsToSync = requirementsArray.map((req) => ({
        sampleFile: req.sampleFile,
        fileURL: req.fileURL,
        description: req.description,
      }));

      await this.libraryService.syncRequirements(libraryId, reqsToSync, isApproved, (idx, percent) => {
        try {
          const reqControl = selectedArray?.at(idx);
          if (reqControl) reqControl.patchValue({ sampleFileProgress: percent });
        } catch (e) {
          // ignore
        }
      });
    } catch (e) {
      throw e;
    }
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
    try {
      this.draft.saveDraft(this.mainForm.getRawValue());
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
      this.draft.saveDraft(this.mainForm.getRawValue());
    } catch (e) {
      // ignore
    }
  }

  prevStep(): void {
    if (this.currentSectionIndex() > 0) {
      this.currentSectionIndex.set(this.currentSectionIndex() - 1);
    }
    try {
      this.draft.saveDraft(this.mainForm.getRawValue());
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
