import { CdkDragDrop, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';
import { Component, inject, input, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
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
  IonProgressBar,
  IonInput,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { imageOutline, warningOutline, closeCircle, menuOutline, close } from 'ionicons/icons';
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
    IonProgressBar,
    FormEssentials,
    IonInput,
    DragDropModule,
  ],
})
export class LibraryImagesComponent implements OnInit {
  private fb = inject(FormBuilder);
  private lrfService = inject(LibraryRegistrationFormService);
  public imagesArray!: FormArray;

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
  public readonly maxImages = 5;

  tipsTitle = 'Photo Tips:';
  photoTips: string[] = [
    'Take photos in good lighting to show your space clearly',
    'Include shots of individual study seats and common areas',
    'Show key amenities like Wi-Fi zones, power outlets, etc.',
    'Ensure photos are recent and accurately represent your library',
  ];

  constructor() {
    addIcons({ imageOutline, warningOutline, closeCircle, menuOutline, close });
  }

  ngOnInit() {
    this.imagesArray = this.lrfService.getFormGroup('libraryImages') as any as FormArray;
  }

  get libraryPhotosArray(): FormArray {
    return this.imagesArray;
  }

  asFormGroup(control: AbstractControl): FormGroup {
    return control as FormGroup;
  }

  // TODO: add file size limit to 5MB. Implement compression if needed
  async onFileSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    if (!input.files) return;

    for (let i = 0; i < input.files.length; i++) {
      if (this.libraryPhotosArray.length >= this.maxImages) break;

      const file = input.files[i];
      const previewUrl = await this.readFileAsDataURL(file);

      const photoGroup = createPhotoGroup(this.fb, previewUrl, '');
      photoGroup.patchValue({
        file: file,
      });

      this.libraryPhotosArray.push(photoGroup);
    }
  }

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

  drop(event: CdkDragDrop<any[]>) {
    const previousIndex = event.previousIndex;
    const currentIndex = event.currentIndex;

    if (previousIndex === currentIndex) return;

    const control = this.libraryPhotosArray.at(previousIndex);
    this.libraryPhotosArray.removeAt(previousIndex);
    this.libraryPhotosArray.insert(currentIndex, control);
  }

  triggerFileUpload(fileInput: HTMLInputElement): void {
    fileInput.click();
  }
}
