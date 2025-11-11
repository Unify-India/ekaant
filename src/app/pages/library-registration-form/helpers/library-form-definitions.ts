import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, Validators } from '@angular/forms';

export function createBasicInformationForm(fb: FormBuilder): FormGroup {
  // todo: add pattern validation for operation hours like 6AM - 10PM
  return fb.group({
    libraryName: ['', [Validators.required, Validators.minLength(3)]],
    fullAddress: ['', [Validators.required, Validators.minLength(10)]],
    genderCategory: ['Co-ed (Mixed)', Validators.required],
    operatingHours: ['', Validators.required],
  });
}

export function createHostProfileForm(fb: FormBuilder): FormGroup {
  return fb.group({
    profilePhoto: [null],
    profilePhotoProgress: [0],
    fullName: ['', [Validators.required, Validators.minLength(3)]],
    visionStatement: ['', [Validators.required, Validators.maxLength(500)]],
    experience: ['', Validators.maxLength(300)],
    phoneNumber: ['', [Validators.required]],
    maskPhoneNumber: [true],
    email: ['', [Validators.required, Validators.email]],
    maskEmail: [true],
    address: [''],
  });
}

//  Validators.pattern('^(\\+91)?[6-9]\\d{9}$')

export function createPhotoGroup(fb: FormBuilder, photoUrl: string = ''): FormGroup {
  // todo: add validation to have only image in file type
  return fb.group({
    file: [null], // Not required when just displaying URL
    previewUrl: [photoUrl, Validators.required],
    uploadProgress: [0], // percentage 0-100
  });
}

export function createLibraryImagesForm(fb: FormBuilder): FormGroup {
  return fb.group({
    libraryPhotos: fb.array([], [Validators.required, Validators.minLength(1), Validators.maxLength(10)]),
  });
}

export function createBookCollectionForm(fb: FormBuilder): FormGroup {
  return fb.group(
    {
      engineeringTechnology: [false],
      medicalSciences: [false],
      managementBusiness: [false],
      artsLiterature: [false],
      scienceMathematics: [false],
      competitiveExams: [false],
      governmentJobExams: [false],
      languageCommunication: [false],
      computerScienceIT: [false],
      generalKnowledge: [false],
      fictionNovels: [false],
      referenceBooks: [false],
    },
    { validators: minOneCheckboxSelectedValidator() },
  );
}

export function createAmenitiesForm(fb: FormBuilder): FormGroup {
  return fb.group(
    {
      highSpeedWifi: [false],
      airConditioning: [false],
      powerOutlets: [false],
      coffeeMachine: [false],
      waterCooler: [false],
      parkingAvailable: [false],
      security247: [false],
      cctvSurveillance: [false],
      lockers: [false],
      printingServices: [false],
      quietZones: [false],
      discussionRooms: [false],
    },
    { validators: minOneCheckboxSelectedValidator() },
  );
}

export function createSeatManagementForm(fb: FormBuilder): FormGroup {
  return fb.group({
    totalSeats: [0, [Validators.required, Validators.min(1)]],
    facilityRanges: fb.array([]),
  });
}

export function createFacilityRangeGroup(fb: FormBuilder, from = 0, to = 0, facility = ''): FormGroup {
  return fb.group({
    from: [from, [Validators.required, Validators.min(1)]],
    to: [to, [Validators.required, Validators.min(1)]],
    facility: [facility, Validators.required],
  });
}

export function createPricingPlanGroup(fb: FormBuilder, plan: any = {}): FormGroup {
  return fb.group({
    planType: [plan.planType || '', Validators.required],
    timeSlot: [plan.timeSlot || '', Validators.required],
    rate: [plan.rate || null, [Validators.required, Validators.min(0)]],
    description: [plan.description || ''],
  });
}

export function createPricingPlansForm(fb: FormBuilder): FormGroup {
  return fb.group({
    pricingPlans: fb.array([], [Validators.required, Validators.minLength(1)]),
  });
}

export function createRequirementsForm(fb: FormBuilder): FormGroup {
  return fb.group({
    selectedRequirements: fb.array([], [Validators.required, Validators.minLength(1)]),
  });
}

// helper to create individual requirement group (if used externally)
export function createRequirementGroup(fb: FormBuilder, description = '', isCustom = false) {
  return fb.group({
    description: [description, Validators.required],
    isCustom: [isCustom],
    attachSample: [false],
    sampleFile: [null],
    sampleFileProgress: [0],
  });
}

export function createCodeOfConductForm(fb: FormBuilder): FormGroup {
  return fb.group({
    conductText: ['', [Validators.required, Validators.minLength(50)]],
  });
}

export function minOneCheckboxSelectedValidator(): (control: AbstractControl) => ValidationErrors | null {
  return (control: AbstractControl): ValidationErrors | null => {
    if (control instanceof FormGroup) {
      const isAtLeastOneSelected = Object.values(control.value).some((value) => value === true);
      return isAtLeastOneSelected ? null : { requireOne: true };
    }
    return null;
  };
}
