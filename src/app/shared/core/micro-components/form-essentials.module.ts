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
  ],
})
export class FormEssentials {}
