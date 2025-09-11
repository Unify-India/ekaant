import { Component, inject, input, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { IonIcon, IonNote, IonCard } from '@ionic/angular/standalone';
import { BaseUiComponents } from 'src/app/shared/core/micro-components/base-ui.module';
import { FormEssentials } from 'src/app/shared/core/micro-components/form-essentials.module';
import { LibraryRegistrationFormService } from '../../service/library-registration-form.service';

@Component({
  selector: 'app-library-images',
  templateUrl: './library-images.component.html',
  styleUrls: ['./library-images.component.scss'],
  imports: [IonCard, BaseUiComponents, IonIcon, IonNote, FormEssentials],
})
export class LibraryImagesComponent implements OnInit {
  private lrfService = inject(LibraryRegistrationFormService);
  // --- Form Definition ---
  public imagesForm!: FormGroup;

  // --- String Variables for the Template ---
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
  constructor(private fb: FormBuilder) {}

  ngOnInit() {
    this.imagesForm = this.lrfService.getFormGroup('libraryImages');
  }

  get libraryPhotosArray(): FormArray {
    return this.imagesForm.get('libraryPhotos') as FormArray;
  }

  // A simple handler for the file input change event
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      for (let i = 0; i < input.files.length; i++) {
        if (this.libraryPhotosArray.length < this.maxImages) {
          // In a real app, you would handle the file upload here
          // and add a reference (e.g., a URL) to the FormArray.
          // For this demo, we'll just push the file name.
          this.libraryPhotosArray.push(this.fb.control(input.files[i].name));
        }
      }
      console.log('Current photos in FormArray:', this.libraryPhotosArray.value);
    }
  }

  // This function triggers the hidden file input
  triggerFileUpload(fileInput: HTMLInputElement): void {
    fileInput.click();
  }
}
