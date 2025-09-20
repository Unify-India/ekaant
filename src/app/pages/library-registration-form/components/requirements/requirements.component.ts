import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, computed } from '@angular/core';
import { FormGroup, FormArray, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { addIcons } from 'ionicons';
import {
  warningOutline,
  addOutline,
  closeCircleOutline,
  documentAttachOutline,
  documentTextOutline,
} from 'ionicons/icons';

import { LibraryRegistrationFormService } from '../../service/library-registration-form.service';

@Component({
  selector: 'app-requirements',
  templateUrl: './requirements.component.html',
  styleUrls: ['./requirements.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, ReactiveFormsModule],
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

  // A computed signal that reactively calculates which common requirements are available
  public availableRequirements = computed(() => {
    const selected = this.selectedRequirements.value.map((req: any) => req.description);
    return this.commonRequirements.filter((req) => !selected.includes(req));
  });

  constructor() {
    addIcons({ warningOutline, addOutline, closeCircleOutline, documentAttachOutline, documentTextOutline });
  }

  ngOnInit() {
    this.requirementsForm = this.lrfService.getFormGroup('requirements');
  }

  get selectedRequirements(): FormArray {
    return this.requirementsForm.get('selectedRequirements') as FormArray;
  }

  // Creates a FormGroup for a new requirement
  private createRequirementGroup(description = '', isCustom = false): FormGroup {
    return this.fb.group({
      description: [description, Validators.required],
      isCustom: [isCustom],
      attachSample: [false],
      sampleFile: [null],
    });
  }

  addCommonRequirement(requirementText: string): void {
    const newReqGroup = this.createRequirementGroup(requirementText, false);
    this.selectedRequirements.push(newReqGroup);
  }

  addCustomRequirement(): void {
    const newReqGroup = this.createRequirementGroup('', true);
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
      this.selectedRequirements.at(index).patchValue({ sampleFile: file });
      console.log(`File for requirement ${index + 1}:`, file.name);
    }
  }
}
