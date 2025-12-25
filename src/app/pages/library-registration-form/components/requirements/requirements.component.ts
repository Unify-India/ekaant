import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, computed } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormGroup, FormArray, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { IonProgressBar } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  warningOutline,
  addOutline,
  closeCircleOutline,
  documentAttachOutline,
  documentTextOutline,
} from 'ionicons/icons';

import { createRequirementGroup } from '../../helpers/library-form-definitions';
import { LibraryRegistrationFormService } from '../../service/library-registration-form.service';

@Component({
  selector: 'app-requirements',
  templateUrl: './requirements.component.html',
  styleUrls: ['./requirements.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, ReactiveFormsModule, IonProgressBar],
})
export class RequirementsComponent implements OnInit {
  private fb = inject(FormBuilder);
  private lrfService = inject(LibraryRegistrationFormService);
  public requirementsForm!: FormGroup;

  public readonly pageTitle = 'Requirements';
  public readonly subTitle = 'Joining requirements and documents';
  public readonly completionWarning = 'This section needs to be completed';
  public readonly sectionDescription =
    'Specify what documents or requirements students need to join your library. You can upload sample documents or forms.';
  public readonly commonTitle = 'Common Requirements';
  public readonly selectedTitle = 'Selected Requirements';
  public readonly addCustomButtonText = 'Add Custom Requirement';
  public readonly emptyStateText = 'No requirements added yet.';
  public readonly note =
    'Note: Students will be able to upload digital copies of these documents during enrollment. No physical documents are required.';

  // Initial list of all possible common requirements
  private readonly commonRequirements = [
    'Valid Government ID (Aadhaar Card, Voter ID, etc.)',
    'Proof of Enrollment (Student ID Card)',
    'Address Proof (Utility Bill, Bank Statement)',
    'Passport Size Photograph',
    'Parent/Guardian Consent Form (for minors)',
    'Medical Certificate (if required)',
    'Library Membership Form',
    'Security Deposit Receipt',
  ];

  // Signal to track form array value changes
  private selectedReqsSignal = toSignal(
    (this.lrfService.mainForm.get('requirements') as FormArray).valueChanges,
    { initialValue: (this.lrfService.mainForm.get('requirements') as FormArray).value }
  );

  // A computed signal that reactively calculates which common requirements are available
  public availableRequirements = computed(() => {
    const currentValues = this.selectedReqsSignal() || [];
    const selectedDescriptions = currentValues.map((req: any) => req.description);
    return this.commonRequirements.filter((req) => !selectedDescriptions.includes(req));
  });

  constructor() {
    addIcons({ warningOutline, addOutline, closeCircleOutline, documentAttachOutline, documentTextOutline });
  }

  ngOnInit() {
    const reqsArray = this.lrfService.mainForm.get('requirements') as FormArray;
    this.requirementsForm = this.fb.group({
      selectedRequirements: reqsArray,
    });
  }

  get selectedRequirements(): FormArray {
    return this.requirementsForm.get('selectedRequirements') as FormArray;
  }

  addCommonRequirement(requirementText: string): void {
    const newReqGroup = createRequirementGroup(this.fb, { description: requirementText, isCustom: false });
    this.selectedRequirements.push(newReqGroup);
  }

  addCustomRequirement(): void {
    const newReqGroup = createRequirementGroup(this.fb, { description: '', isCustom: true });
    this.selectedRequirements.push(newReqGroup);
  }

  removeRequirement(index: number): void {
    this.selectedRequirements.removeAt(index);
  }

  triggerFileInput(fileInput: HTMLInputElement): void {
    fileInput.click();
  }

  onFileSelected(event: Event, index: number): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      // Patch the value of the 'sampleFile' control at the specific index in the FormArray
      this.selectedRequirements.at(index).patchValue({ sampleFile: file, sampleFileProgress: 0 });
      console.log(`File for requirement ${index + 1}:`, file.name);
    }
  }
}
