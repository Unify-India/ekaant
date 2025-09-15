import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
  IonTextarea,
  IonListHeader,
  IonRadio,
  IonRadioGroup,
  IonSelect,
  IonSelectOption,
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
  ],
})
export class FormEssentials {}
