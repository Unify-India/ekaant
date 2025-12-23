import { Component, Input, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ModalController, NavParams } from '@ionic/angular/standalone';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonButton,
  IonIcon,
  IonContent,
  IonList,
  IonItem,
  IonCheckbox,
  IonFooter,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { close, saveOutline } from 'ionicons/icons';

interface FacilityOption {
  label: string;
  value: string;
}

@Component({
  selector: 'app-edit-seat-modal',
  templateUrl: './edit-seat-modal.component.html',
  styleUrls: ['./edit-seat-modal.component.scss'],
  standalone: true,
  imports: [
    ReactiveFormsModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonButton,
    IonIcon,
    IonContent,
    IonList,
    IonItem,
    IonCheckbox,
    IonFooter,
  ],
  providers: [ModalController, NavParams],
})
export class EditSeatModalComponent implements OnInit {
  @Input() seatNumber!: number;
  @Input() facilities: string[] = [];
  @Input() facilityOptions: FacilityOption[] = [];

  private fb = inject(FormBuilder);
  private modalCtrl = inject(ModalController);
  private navParams = inject(NavParams);

  public facilitiesForm!: FormGroup;

  constructor() {
    addIcons({ close, saveOutline });
  }

  ngOnInit() {
    console.info(this.facilities, this.facilityOptions);
    // Retrieve data from NavParams to ensure it's available
    if (this.navParams.get('seatNumber')) {
      this.seatNumber = this.navParams.get('seatNumber');
    }
    if (this.navParams.get('facilities')) {
      this.facilities = this.navParams.get('facilities');
    }
    if (this.navParams.get('facilityOptions')) {
      this.facilityOptions = this.navParams.get('facilityOptions');
    }

    // Create a form control for each available facility option
    const formControls = this.facilityOptions.reduce(
      (acc, option) => {
        // The control's initial value is true if the seat already has this facility
        acc[option.value] = this.fb.control(this.facilities.includes(option.value));
        return acc;
      },
      {} as { [key: string]: any },
    );

    this.facilitiesForm = this.fb.group(formControls);
  }

  /**
   * Dismisses the modal without saving any changes.
   */
  dismiss() {
    this.modalCtrl.dismiss(null, 'cancel');
  }

  /**
   * Processes the form, and dismisses the modal, returning the updated facility list.
   */
  save() {
    // Get the values from the form
    const formValue = this.facilitiesForm.value;

    // Filter the keys (facility values) to only include those that are true
    const selectedFacilities = Object.keys(formValue).filter((key) => formValue[key]);

    // Dismiss the modal and pass the data back
    this.modalCtrl.dismiss(selectedFacilities, 'save');
  }
}
