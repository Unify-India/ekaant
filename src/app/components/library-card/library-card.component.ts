import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { IonButton, IonCardSubtitle, IonCardHeader, IonCard, IonCardTitle, IonBadge } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { pinOutline } from 'ionicons/icons';
import { Library } from 'src/app/models/library';
import { UiEssentials } from 'src/app/shared/core/micro-components/ui-essentials.module';

@Component({
  selector: 'app-library-card',
  templateUrl: './library-card.component.html',
  styleUrls: ['./library-card.component.scss'],
  imports: [UiEssentials, CommonModule, IonCard, IonCardHeader, IonCardSubtitle, IonCardTitle, IonButton],
})
export class LibraryCardComponent {
  @Input() library!: Library;
  constructor() {
    addIcons({ pinOutline });
  }
  /**
   * Emits when the bottom action button is pressed.
   * Payload: { type: 'enroll' | 'waitlist', library }
   */
  @Output() action = new EventEmitter<{ type: 'enroll' | 'waitlist'; library: Library }>();

  /** readable availability text */
  get availabilityText(): string {
    return `${this.library.availableSeats} / ${this.library.totalSeats} seats available`;
  }

  /** derived values for label and type */
  get actionType(): 'enroll' | 'waitlist' {
    return this.library.isFull ? 'waitlist' : 'enroll';
  }

  get actionLabel(): string {
    return this.library.isFull ? 'Apply to Waitlist' : 'Enroll / Register';
  }

  get actionColor(): string {
    return this.library.isFull ? 'danger' : 'primary';
  }

  /** called from template when user clicks the button */
  onActionClick() {
    this.action.emit({ type: this.actionType, library: this.library });
  }
}
