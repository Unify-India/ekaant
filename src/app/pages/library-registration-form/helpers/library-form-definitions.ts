import { FormBuilder, FormGroup, Validators } from '@angular/forms';

export function createBasicInformationForm(fb: FormBuilder): FormGroup {
  return fb.group({
    libraryName: ['', [Validators.required, Validators.minLength(5)]],
    tagline: ['', Validators.maxLength(100)],
    description: ['', [Validators.required, Validators.maxLength(500)]],
  });
}

export function createHostProfileForm(fb: FormBuilder): FormGroup {
  return fb.group({
    hostName: ['', Validators.required],
    hostEmail: ['', [Validators.required, Validators.email]],
    hostBio: [''],
  });
}

export function createLibraryImagesForm(fb: FormBuilder): FormGroup {
  return fb.group({
    coverImage: [null, Validators.required],
    galleryImages: fb.array([]),
  });
}

export function createBookCollectionForm(fb: FormBuilder): FormGroup {
  return fb.group({
    libraryName: ['', [Validators.required, Validators.minLength(5)]],
    tagline: ['', Validators.maxLength(100)],
    description: ['', [Validators.required, Validators.maxLength(500)]],
  });
}

export function createAmenitiesForm(fb: FormBuilder): FormGroup {
  return fb.group({
    libraryName: ['', [Validators.required, Validators.minLength(5)]],
    tagline: ['', Validators.maxLength(100)],
    description: ['', [Validators.required, Validators.maxLength(500)]],
  });
}

export function createSeatManagementForm(fb: FormBuilder): FormGroup {
  return fb.group({
    libraryName: ['', [Validators.required, Validators.minLength(5)]],
    tagline: ['', Validators.maxLength(100)],
    description: ['', [Validators.required, Validators.maxLength(500)]],
  });
}

export function createPricingPlansForm(fb: FormBuilder): FormGroup {
  return fb.group({
    libraryName: ['', [Validators.required, Validators.minLength(5)]],
    tagline: ['', Validators.maxLength(100)],
    description: ['', [Validators.required, Validators.maxLength(500)]],
  });
}

export function createRequirementsForm(fb: FormBuilder): FormGroup {
  return fb.group({
    libraryName: ['', [Validators.required, Validators.minLength(5)]],
    tagline: ['', Validators.maxLength(100)],
    description: ['', [Validators.required, Validators.maxLength(500)]],
  });
}

export function createCodeOfConductForm(fb: FormBuilder): FormGroup {
  return fb.group({
    libraryName: ['', [Validators.required, Validators.minLength(5)]],
    tagline: ['', Validators.maxLength(100)],
    description: ['', [Validators.required, Validators.maxLength(500)]],
  });
}
