import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import {
  IonHeader,
  IonButton,
  IonToolbar,
  IonButtons,
  IonMenu,
  IonMenuButton,
  IonTitle,
  IonContent,
} from '@ionic/angular/standalone';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    IonHeader,
    IonToolbar,
    IonButton,
    IonButtons,
    IonMenuButton,
    IonMenu,
    IonTitle,
    IonContent,
    IonToolbar,
  ],
  exports: [
    CommonModule,
    IonHeader,
    IonToolbar,
    IonButton,
    IonButtons,
    IonMenuButton,
    IonMenu,
    IonTitle,
    IonContent,
    IonToolbar,
  ],
})
export class BaseUiComponents {}
