import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, Validators } from '@angular/forms';

export function createBasicInformationForm(fb: FormBuilder): FormGroup {
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

export function createPhotoGroup(fb: FormBuilder): FormGroup {
  return fb.group({
    file: [null, Validators.required], // The raw File object
    previewUrl: ['', Validators.required], // The local Base64 preview URL
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

export function createPlanGroup(fb: FormBuilder): FormGroup {
  return fb.group({
    planType: ['', Validators.required],
    timeSlot: ['', Validators.required],
    rate: [null, [Validators.required, Validators.min(0)]],
    description: [''],
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
