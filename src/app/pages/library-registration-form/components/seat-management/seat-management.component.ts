import { Component, computed, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ModalController } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  warningOutline,
  addOutline,
  removeOutline,
  trashOutline,
  createOutline,
  cogOutline,
  checkmarkCircle,
  addCircleOutline,
  saveOutline,
} from 'ionicons/icons';
import { Subscription } from 'rxjs';
import { BaseUiComponents } from 'src/app/shared/core/micro-components/base-ui.module';
import { FormEssentials } from 'src/app/shared/core/micro-components/form-essentials.module';
import { UiEssentials } from 'src/app/shared/core/micro-components/ui-essentials.module';

import { createSeatConfigGroup } from '../../helpers/library-form-definitions';
import { LibraryRegistrationFormService } from '../../service/library-registration-form.service';
import { EditSeatModalComponent } from '../edit-seat-modal/edit-seat-modal.component';

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
  private fb = inject(FormBuilder);
  private modalCtrl = inject(ModalController);

  seatManagementForm!: FormGroup; // Initialized in ngOnInit
  newRangeForm!: FormGroup;
  totalSeatsControl!: FormControl<number>;

  // --- String Variables for the Template ---
  readonly pageTitle = 'Seat Management';
  readonly subTitle = 'Configure seating arrangement and facilities';
  readonly completionWarning = 'This section needs to be completed';
  readonly seatManagementDescription =
    "Configure your library's seating arrangement by setting the total number of seats, defining facility ranges, and customizing individual seats.";
  readonly totalSeatsLabel = 'Total Number of Seats';
  readonly seatsHelperText = (count: number) => `You'll have seats numbered from 1 to ${count}`;

  readonly facilityRangesTitle = 'Facility Ranges';
  readonly facilityRangesDescription =
    "Assign facilities to groups of seats (e.g., seats 1-20 have AC, seats 21-50 don't)";
  readonly addRangeButtonText = 'Add Range';
  readonly seatsLabel = 'Seats';
  readonly toLabel = 'to';

  readonly individualSeatConfigTitle = 'Individual Seat Configuration';
  readonly individualSeatConfigDescription =
    'Customize features for specific seats. Click on any seat to edit its features.';

  // --- Facility Options ---
  readonly facilityOptions: FacilityOption[] = [
    { value: 'Air Conditioning', label: 'Air Conditioning' },
    { value: 'No Air Conditioning', label: 'No Air Conditioning' },
    { value: 'Wi-Fi Access', label: 'Wi-Fi Access' },
    { value: 'Power Outlet', label: 'Power Outlet' },
  ];

  // --- Component State (using signals for reactivity) ---
  selectedIndividualSeat = signal<number | null>(null);
  // Total seats signal (initialized to 0 so computed below works immediately)
  totalSeats = signal<number>(0);

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
      addCircleOutline,
      saveOutline,
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
      const total = v ?? 0;
      this.totalSeats.set(total);

      if (this.newRangeForm) {
        const fromCtrl = this.newRangeForm.get('from');
        const toCtrl = this.newRangeForm.get('to');

        // Update max validators
        fromCtrl?.setValidators([Validators.required, Validators.min(1), Validators.max(total)]);
        toCtrl?.setValidators([Validators.required, Validators.min(fromCtrl?.value || 1), Validators.max(total)]);

        if ((toCtrl?.value ?? 0) > total) {
          toCtrl?.setValue(total);
        }

        fromCtrl?.updateValueAndValidity({ onlySelf: true });
        toCtrl?.updateValueAndValidity({ onlySelf: true });
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
    const lastRange = this.facilityRanges.at(this.facilityRanges.length - 1);
    const nextFrom = lastRange ? lastRange.value.to + 1 : 1;

    this.newRangeForm = this.fb.group({
      from: [nextFrom, [Validators.required, Validators.min(1), Validators.max(this.totalSeats())]],
      to: [this.totalSeats(), [Validators.required, Validators.min(nextFrom), Validators.max(this.totalSeats())]],
      facility: [[], Validators.required],
    });

    // Subscribe to 'from' value changes to update 'to's min validator
    const fromCtrl = this.newRangeForm.get('from');
    const toCtrl = this.newRangeForm.get('to');

    if (fromCtrl && toCtrl) {
      const sub = fromCtrl.valueChanges.subscribe((fromValue) => {
        // Update validator
        toCtrl.setValidators([Validators.required, Validators.min(fromValue)]);
        toCtrl.updateValueAndValidity({ onlySelf: true });

        // If 'to' is now less than 'from', update 'to's value
        if (toCtrl.value < fromValue) {
          toCtrl.setValue(fromValue);
        }
      });
      this.subs.add(sub);
    }
  }

  // --- UPDATED METHOD to add a range ---
  addFacilityRange(): void {
    this.newRangeForm.markAllAsTouched();
    if (this.newRangeForm.invalid) {
      return;
    }

    const { from, to, facility } = this.newRangeForm.value;
    // Handle both single value and array (from multiple select)
    const selectedFacilities: string[] = Array.isArray(facility) ? facility : [facility];

    // --- Sync with Individual Seat Configs ---
    for (let i = from; i <= to; i++) {
      let seatConfigGroup = this.seats.controls.find((control) => control.get('seatNumber')?.value === i) as
        | FormGroup
        | undefined;

      if (!seatConfigGroup) {
        // If seat config doesn't exist, create it
        seatConfigGroup = createSeatConfigGroup(this.fb, i, []);
        this.seats.push(seatConfigGroup);
      }

      const facilitiesArray = seatConfigGroup.get('facilities') as FormArray;

      selectedFacilities.forEach((fac) => {
        // Add the new facility if it's not already there
        if (!facilitiesArray.value.includes(fac)) {
          facilitiesArray.push(this.fb.control(fac));
        }
      });
    }
    // --- End Sync ---

    const newRangeGroup = this.fb.group({
      from: [from, [Validators.required, Validators.min(1)]],
      to: [to, [Validators.required, Validators.min(1)]],
      facility: [selectedFacilities, Validators.required], // Store as array
    });
    newRangeGroup.setValidators(this.rangeValidator(this.totalSeats));
    this.facilityRanges.push(newRangeGroup);

    const lastTo = to;
    const nextFrom = lastTo + 1;

    this.newRangeForm.reset({
      from: nextFrom > this.totalSeats() ? this.totalSeats() : nextFrom,
      to: this.totalSeats(),
      facility: [],
    });
  }

  removeFacilityRange(index: number): void {
    const removedRange = this.facilityRanges.at(index).value;

    // --- Sync with Individual Seat Configs ---
    if (removedRange) {
      const { from, to, facility } = removedRange;
      const facilitiesToRemove: string[] = Array.isArray(facility) ? facility : [facility];

      for (let i = from; i <= to; i++) {
        const seatConfigGroup = this.seats.controls.find((control) => control.get('seatNumber')?.value === i) as
          | FormGroup
          | undefined;

        if (seatConfigGroup) {
          const facilitiesArray = seatConfigGroup.get('facilities') as FormArray;

          facilitiesToRemove.forEach((fac) => {
            const facilityIndex = facilitiesArray.value.indexOf(fac);
            if (facilityIndex !== -1) {
              facilitiesArray.removeAt(facilityIndex);
            }
          });
        }
      }
    }
    // --- End Sync ---

    this.facilityRanges.removeAt(index);
  }

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

  get seats(): FormArray {
    return this.seatManagementForm.get('seats') as FormArray;
  }

  // --- Individual Seat Configuration ---
  async selectIndividualSeat(seatNumber: number): Promise<void> {
    this.selectedIndividualSeat.set(seatNumber);

    // Find the existing config for this seat, if any
    const seatIndex = this.seats.controls.findIndex((control) => control.get('seatNumber')?.value === seatNumber);

    let currentFacilities: string[] = [];
    if (seatIndex !== -1) {
      currentFacilities = this.seats.at(seatIndex).get('facilities')?.value || [];
    }

    const modal = await this.modalCtrl.create({
      component: EditSeatModalComponent,
      cssClass: 'small-modal',
      componentProps: {
        seatNumber: seatNumber,
        facilities: currentFacilities, // Pass current facilities
        facilityOptions: this.facilityOptions,
      },
    });

    await modal.present();

    const { data, role } = await modal.onWillDismiss();

    if (role === 'save') {
      // Find if a config for this seat already exists
      const seatConfigGroup = this.seats.controls.find((control) => control.get('seatNumber')?.value === seatNumber) as
        | FormGroup
        | undefined;

      if (seatConfigGroup) {
        // If it exists, update its facilities
        const facilitiesArray = seatConfigGroup.get('facilities') as FormArray;
        facilitiesArray.clear();
        data.forEach((facility: string) => facilitiesArray.push(this.fb.control(facility)));
      } else {
        // If it doesn't exist, create a new group and add it to the FormArray
        const newSeatConfig = createSeatConfigGroup(this.fb, seatNumber, data);
        this.seats.push(newSeatConfig);
      }
    }
    this.selectedIndividualSeat.set(null);
  }

  // Method to check if an individual seat has features configured (for styling)
  hasSeatConfig(seatNumber: number): boolean {
    const seatConfig = this.seats.controls.find((control) => control.get('seatNumber')?.value === seatNumber);
    // Check if the config exists and has at least one facility
    return !!seatConfig && (seatConfig.get('facilities') as FormArray).length > 0;
  }

  // Helper to get the label for a facility value
  getFacilityLabel(value: string | string[]): string {
    if (Array.isArray(value)) {
      return value.map((v) => this.facilityOptions.find((opt) => opt.value === v)?.label || v).join(', ');
    }
    return this.facilityOptions.find((opt) => opt.value === value)?.label || value;
  }
}
