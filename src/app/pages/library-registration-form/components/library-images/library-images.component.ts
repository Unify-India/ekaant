import { Component, inject, input, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import {
  IonIcon,
  IonNote,
  IonCard,
  IonGrid,
  IonRow,
  IonCol,
  IonImg,
  IonFab,
  IonFabButton,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { imageOutline, warningOutline, closeCircle } from 'ionicons/icons';
import { BaseUiComponents } from 'src/app/shared/core/micro-components/base-ui.module';
import { FormEssentials } from 'src/app/shared/core/micro-components/form-essentials.module';

import { createPhotoGroup } from '../../helpers/library-form-definitions';
import { LibraryRegistrationFormService } from '../../service/library-registration-form.service';

@Component({
  selector: 'app-library-images',
  templateUrl: './library-images.component.html',
  styleUrls: ['./library-images.component.scss'],
  imports: [
    IonFabButton,
    IonFab,
    IonImg,
    IonCol,
    IonRow,
    IonGrid,
    IonCard,
    BaseUiComponents,
    IonIcon,
    IonNote,
    FormEssentials,
  ],
})
export class LibraryImagesComponent implements OnInit {
  private fb = inject(FormBuilder);
  private lrfService = inject(LibraryRegistrationFormService);
  public imagesForm!: FormGroup;

  // --- String Variables ---
  public readonly pageTitle = 'Library Images';
  public readonly pageDescription = 'Upload photos of your library';
  public readonly completionWarning = 'This section needs to be completed';

  public readonly photosSectionTitle = 'Library Photos';
  public readonly photosSectionDescription =
    'Upload high-quality photos showcasing your library’s interior, study areas, and facilities. These photos will be displayed prominently on your library profile.';

  public readonly uploadAreaTitle = 'Upload Library Images';
  public readonly uploadAreaHint = 'Add photos of study areas, facilities, and library interior';
  public readonly uploadAreaConstraints = 'JPEG, PNG, or WebP up to 5MB each';
  public readonly maxImages = 10;

  tipsTitle = 'Photo Tips:';
  photoTips: string[] = [
    'Take photos in good lighting to show your space clearly',
    'Include shots of individual study seats and common areas',
    'Show key amenities like Wi-Fi zones, power outlets, etc.',
    'Ensure photos are recent and accurately represent your library',
  ];

  constructor() {
    addIcons({ imageOutline, warningOutline, closeCircle });
  }

  ngOnInit() {
    this.imagesForm = this.lrfService.getFormGroup('libraryImages');
  }

  get libraryPhotosArray(): FormArray {
    return this.imagesForm.get('libraryPhotos') as FormArray;
  }

  // Updated file selection handler
  async onFileSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    if (!input.files) return;

    for (let i = 0; i < input.files.length; i++) {
      // ...
      const file = input.files[i];
      const previewUrl = await this.readFileAsDataURL(file);

      // This is where you would use the helper function
      const photoGroup = createPhotoGroup(this.fb); // Assuming createPhotoGroup is exported and imported
      photoGroup.patchValue({
        file: file,
        previewUrl: previewUrl,
      });

      this.libraryPhotosArray.push(photoGroup);
    }
  }

  // Helper function to read a file and return a Promise with the Data URL
  private readFileAsDataURL(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  removePhoto(index: number): void {
    this.libraryPhotosArray.removeAt(index);
  }

  triggerFileUpload(fileInput: HTMLInputElement): void {
    fileInput.click();
  }
}
