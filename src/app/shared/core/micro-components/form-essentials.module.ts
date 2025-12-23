import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
  IonTextarea,
  IonListHeader,
  IonRadio,
  IonRadioGroup,
  IonSelect,
  IonSelectOption,
  IonDatetime,
  IonDatetimeButton,
  IonCheckbox,
} from '@ionic/angular/standalone';
@NgModule({
  declarations: [],
  imports: [
    FormsModule,
    ReactiveFormsModule,
    IonTextarea,
    IonListHeader,
    IonRadio,
    IonRadioGroup,
    IonSelect,
    IonSelectOption,
    IonDatetime,
    IonDatetimeButton,
    IonCheckbox,
  ],
  exports: [
    FormsModule,
    ReactiveFormsModule,
    IonTextarea,
    IonListHeader,
    IonRadio,
    IonRadioGroup,
    IonSelect,
    IonSelectOption,
    IonDatetime,
    IonDatetimeButton,
    IonCheckbox,
  ],
})
export class FormEssentials {}
