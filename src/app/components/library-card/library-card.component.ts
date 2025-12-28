import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IonButton, IonCardSubtitle, IonCardHeader, IonCard, IonCardTitle, IonBadge } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { eyeOutline, pinOutline } from 'ionicons/icons';
import { AdminRoutingModule } from 'src/app/admin/admin-routing.module';
import { Library } from 'src/app/models/library.interface';
import { UiEssentials } from 'src/app/shared/core/micro-components/ui-essentials.module';

@Component({
  selector: 'app-library-card',
  templateUrl: './library-card.component.html',
  styleUrls: ['./library-card.component.scss'],
  imports: [
    UiEssentials,
    CommonModule,
    IonCard,
    IonCardHeader,
    IonCardSubtitle,
    IonCardTitle,
    IonButton,
    AdminRoutingModule,
    RouterLink,
  ],
})
export class LibraryCardComponent {
  @Input() library!: Library;
  constructor() {
    addIcons({ pinOutline, eyeOutline });
  }
  /**
   * Emits when the bottom action button is pressed.
   * Payload: { type: 'enroll' | 'waitlist', libraryId?, library }
   */
  @Output() action = new EventEmitter<Library>();

  /** readable availability text */
  get availabilityText(): string {
    return `${this.library.occupiedSeats} / ${this.library.totalSeats} seats occupied`;
  }

  /** derived values for label and type */
  get isFull(): boolean {
    return this.library.occupiedSeats >= this.library.totalSeats;
  }

  get actionType(): 'enroll' | 'waitlist' {
    return this.isFull ? 'waitlist' : 'enroll';
  }

  get actionLabel(): string {
    return this.isFull ? 'Waitlist' : 'Enroll';
  }

  get actionColor(): string {
    return this.isFull ? 'danger' : 'primary';
  }

  get getLibraryTypeClass(): string {
    let classes = '';
    switch (this.library.type) {
      case 'co-ed':
        classes = 'bg-purple-100 text-purple-800';
        break;
      case 'boys only':
        classes = 'bg-blue-100 text-blue-800';
        break;
      case 'girls only':
        classes = 'bg-pink-100 text-pink-800';
        break;

      default:
        classes = '';
        break;
    }
    return classes;
  }

  /** called from template when user clicks the button */
  onActionClick(library: Library) {
    this.action.emit(library);
  }
}
