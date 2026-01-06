import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormGroup, FormArray, FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { addIcons } from 'ionicons';
import {
  warningOutline,
  addOutline,
  timeOutline,
  cashOutline,
  createOutline,
  closeOutline,
  checkmarkOutline,
} from 'ionicons/icons';

import { createPricingPlanGroup } from '../../helpers/library-form-definitions';
import { LibraryRegistrationFormService } from '../../service/library-registration-form.service';

@Component({
  selector: 'app-pricing-plans',
  templateUrl: './pricing-plans.component.html',
  styleUrls: ['./pricing-plans.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, ReactiveFormsModule],
})
export class PricingPlansComponent implements OnInit {
  private fb = inject(FormBuilder);
  private lrfService = inject(LibraryRegistrationFormService);
  public pricingPlansForm!: FormGroup;

  public readonly pageTitle = 'Pricing Plans';
  public readonly subTitle = 'Set up your pricing structure';
  public readonly sectionDescription =
    'Set up different pricing options for your library. You can offer hourly rates, daily passes, or monthly memberships.';
  public readonly completionWarning = 'This section needs to be completed';
  public readonly optionsTitle = 'Pricing Options';
  public readonly optionsDescription = 'Add multiple pricing plans to cater to different student needs';
  public readonly emptyStateText = 'No pricing plans added yet.';
  public readonly emptyStateSubText = 'Click "Add Plan" to create your first pricing option.';
  public readonly addPlanButtonText = 'Add Plan';

  public readonly planTypes = ['Pay Per Use', 'Daily Pass', 'Weekly Membership', 'Monthly Membership', 'Quarterly Membership'];

  public editingIndex = signal<number | null>(null);

  constructor() {
    addIcons({ warningOutline, addOutline, timeOutline, cashOutline, createOutline, closeOutline, checkmarkOutline });
  }

  ngOnInit() {
    const plansFormArray = this.lrfService.mainForm.get('pricingPlans') as FormArray;
    this.pricingPlansForm = this.fb.group({
      pricingPlans: plansFormArray,
    });
  }

  get pricingPlans(): FormArray {
    return this.pricingPlansForm.get('pricingPlans') as FormArray;
  }

  addPlan(): void {
    const newPlan = createPricingPlanGroup(this.fb);
    this.pricingPlans.push(newPlan);
    this.editingIndex.set(this.pricingPlans.length - 1);
  }

  savePlan(index: number): void {
    const planGroup = this.pricingPlans.at(index);
    this.updateTimeSlot(planGroup as FormGroup);
    planGroup.markAllAsTouched();
    if (planGroup.valid) {
      this.editingIndex.set(null);
    }
  }

  updateTimeSlot(group: FormGroup) {
    const start = group.get('startTime')?.value;
    const end = group.get('endTime')?.value;

    if (start && end) {
      const formattedStart = this.formatTime(start);
      const formattedEnd = this.formatTime(end);
      group.patchValue({ 
        timeSlot: `${formattedStart} - ${formattedEnd}`,
        slotTypeId: `${start}-${end}`
      });
    }
  }

  private formatTime(time: string): string {
    if (!time) return '';
    const date = new Date(`2000-01-01T${time}`);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  editPlan(index: number): void {
    this.editingIndex.set(index);
  }

  removePlan(index: number): void {
    this.pricingPlans.removeAt(index);
    this.editingIndex.set(null);
  }
}
