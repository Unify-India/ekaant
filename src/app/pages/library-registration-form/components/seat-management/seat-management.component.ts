import { Component, computed, inject, OnDestroy, OnInit, Signal, signal } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { addIcons } from 'ionicons';
import {
  warningOutline,
  addOutline,
  removeOutline,
  trashOutline,
  createOutline,
  cogOutline,
  checkmarkCircle,
} from 'ionicons/icons';
import { Subscription } from 'rxjs';
import { BaseUiComponents } from 'src/app/shared/core/micro-components/base-ui.module';
import { FormEssentials } from 'src/app/shared/core/micro-components/form-essentials.module';
import { UiEssentials } from 'src/app/shared/core/micro-components/ui-essentials.module';

import { LibraryRegistrationFormService } from '../../service/library-registration-form.service';

// Define interfaces for better type safety
interface FacilityRange {
  facility: string;
  from: number;
  to: number;
}

interface FacilityOption {
  label: string;
  value: string;
}

@Component({
  selector: 'app-seat-management',
  templateUrl: './seat-management.component.html',
  styleUrls: ['./seat-management.component.scss'],
  standalone: true,
  imports: [BaseUiComponents, UiEssentials, FormEssentials],
})
export class SeatManagementComponent implements OnInit, OnDestroy {
  private lrfService = inject(LibraryRegistrationFormService);

  public seatManagementForm!: FormGroup; // Initialized in ngOnInit
  public newRangeForm!: FormGroup;
  public totalSeatsControl!: FormControl<number>;
  private fb = inject(FormBuilder);

  // --- String Variables for the Template ---
  public readonly pageTitle = 'Seat Management';
  public readonly subTitle = 'Configure seating arrangement and facilities';
  public readonly completionWarning = 'This section needs to be completed';
  public readonly seatManagementDescription =
    "Configure your library's seating arrangement by setting the total number of seats, defining facility ranges, and customizing individual seats.";
  public readonly totalSeatsLabel = 'Total Number of Seats';
  public readonly seatsHelperText = (count: number) => `You'll have seats numbered from 1 to ${count}`;

  public readonly facilityRangesTitle = 'Facility Ranges';
  public readonly facilityRangesDescription =
    "Assign facilities to groups of seats (e.g., seats 1-20 have AC, seats 21-50 don't)";
  public readonly addRangeButtonText = 'Add Range';
  public readonly seatsLabel = 'Seats';
  public readonly toLabel = 'to';

  public readonly individualSeatConfigTitle = 'Individual Seat Configuration';
  public readonly individualSeatConfigDescription =
    'Customize features for specific seats. Click on any seat to edit its features.';

  // --- Facility Options ---
  public readonly facilityOptions: FacilityOption[] = [
    { value: 'Air Conditioning', label: 'Air Conditioning' },
    { value: 'No Air Conditioning', label: 'No Air Conditioning' },
    { value: 'Wi-Fi Access', label: 'Wi-Fi Access' },
    { value: 'Power Outlet', label: 'Power Outlet' },
  ];

  // --- Component State (using signals for reactivity) ---
  selectedIndividualSeat = signal<number | null>(null);
  // Total seats signal (initialized to 0 so computed below works immediately)
  public totalSeats = signal<number>(0);

  // Create an array of seat numbers for individual configuration buttons
  seatNumbers = computed(() => Array.from({ length: this.totalSeats() }, (_, i) => i + 1));

  private subs = new Subscription();

  constructor() {
    addIcons({
      warningOutline,
      addOutline,
      removeOutline,
      trashOutline,
      createOutline,
      cogOutline,
      checkmarkCircle,
    });
  }

  ngOnInit() {
    this.seatManagementForm = this.lrfService.getFormGroup('seatManagement');

    // --- UPDATE THIS LOGIC ---
    // Get a direct reference to the FormControl after it's created
    this.totalSeatsControl = this.seatManagementForm.get('totalSeats') as FormControl<number>;

    // Convert the control's valueChanges observable into a signal
    this.totalSeats.set(this.totalSeatsControl?.value ?? 0);

    // keep signal in sync with the control
    const sub = this.totalSeatsControl.valueChanges.subscribe((v) => {
      this.totalSeats.set(v ?? 0);
      // ensure newRangeForm 'to' value doesn't exceed total
      if (this.newRangeForm) {
        const toVal = this.newRangeForm.get('to')?.value ?? 0;
        if (toVal > this.totalSeats()) {
          this.newRangeForm.get('to')?.setValue(this.totalSeats());
        }
        // re-run validators that depend on totalSeats
        this.newRangeForm.updateValueAndValidity({ onlySelf: true });
      }
    });
    this.subs.add(sub);

    this.initializeNewRangeForm();
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  // --- FormArray Getters ---
  get facilityRanges(): FormArray {
    return this.seatManagementForm.get('facilityRanges') as FormArray;
  }

  // --- Seat Count Management ---
  incrementSeats(): void {
    const currentSeats = this.totalSeats();
    console.log('current seats', this.totalSeats());
    this.seatManagementForm.get('totalSeats')?.setValue(currentSeats + 1);
  }

  decrementSeats(): void {
    const currentSeats = this.totalSeats();
    if (currentSeats > 0) {
      this.seatManagementForm.get('totalSeats')?.setValue(currentSeats - 1);
    }
  }

  initializeNewRangeForm(): void {
    this.newRangeForm = this.fb.group({
      from: [1, [Validators.required, Validators.min(1)]],
      to: [this.totalSeats(), [Validators.required, Validators.min(1)]],
      facility: ['', Validators.required],
    });

    // Apply the same custom validator
    this.newRangeForm.setValidators(this.rangeValidator(this.totalSeats));
  }

  // --- UPDATED METHOD to add a range ---
  addFacilityRange(): void {
    // Mark the form as touched to show validation errors if any
    this.newRangeForm.markAllAsTouched();

    if (this.newRangeForm.invalid) {
      return; // Stop if the new range form is invalid
    }

    // Create a new group with the same structure and validators
    // to push into the FormArray
    const newRangeGroup = this.fb.group({
      from: [this.newRangeForm.value.from, [Validators.required, Validators.min(1)]],
      to: [this.newRangeForm.value.to, [Validators.required, Validators.min(1)]],
      facility: [this.newRangeForm.value.facility, Validators.required],
    });
    newRangeGroup.setValidators(this.rangeValidator(this.totalSeats));

    this.facilityRanges.push(newRangeGroup);

    // Reset the newRangeForm for the next entry
    this.newRangeForm.reset({
      from: 1,
      to: this.totalSeats(),
      facility: '',
    });
  }

  removeFacilityRange(index: number): void {
    this.facilityRanges.removeAt(index);
  }

  // Custom validator for seat ranges
  // Custom validator for seat ranges
  private rangeValidator = (totalSeatsSignal: () => number) => {
    // Change the parameter type here from FormGroup to AbstractControl
    return (group: AbstractControl): { [key: string]: any } | null => {
      const from = group.get('from')?.value;
      const to = group.get('to')?.value;
      const totalSeats = totalSeatsSignal(); // Get the current total seats value

      if (from === null || to === null) {
        return null; // Don't validate if values are not yet set
      }

      if (from > to) {
        return { rangeInvalid: true, message: 'Start seat cannot be greater than end seat.' };
      }
      if (from < 1 || to < 1) {
        return { rangeInvalid: true, message: 'Seats must be 1 or greater.' };
      }
      if (to > totalSeats) {
        return { rangeOutOfBounds: true, message: `End seat cannot exceed total seats (${totalSeats}).` };
      }
      return null;
    };
  };

  // --- Individual Seat Configuration ---
  selectIndividualSeat(seatNumber: number): void {
    this.selectedIndividualSeat.set(seatNumber);
    // In a real app, you would load/display/edit features for this specific seat here.
    console.log(`Editing features for seat: ${seatNumber}`);
  }

  // Method to check if an individual seat has features configured (for styling)
  hasSeatConfig(seatNumber: number): boolean {
    // This is a placeholder. In a real app, you'd check the individualSeats FormArray/FormGroup
    // which would be part of your form. For now, we'll just simulate it.
    // E.g., this.seatManagementForm.get('individualSeats')?.get(seatNumber.toString())?.value;
    return seatNumber % 3 === 0; // Example: every 3rd seat has config
  }

  // Helper to get the label for a facility value
  getFacilityLabel(value: string): string {
    return this.facilityOptions.find((opt) => opt.value === value)?.label || value;
  }
}
