import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { sendOutline } from 'ionicons/icons';
import { Observable } from 'rxjs';
import { LibraryService } from 'src/app/services/library/library.service';

@Component({
  selector: 'app-approval-comments',
  templateUrl: './approval-comments.component.html',
  styleUrls: ['./approval-comments.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, ReactiveFormsModule],
})
export class ApprovalCommentsComponent implements OnInit {
  @Input() registrationId!: string;
  @Input() currentUserRole: 'admin' | 'manager' = 'admin';
  @Input() currentUserId!: string;

  commentForm: FormGroup;
  comments$!: Observable<any[]>;

  constructor(
    private fb: FormBuilder,
    private libraryService: LibraryService,
  ) {
    addIcons({
      sendOutline,
    });
    this.commentForm = this.fb.group({
      message: ['', Validators.required],
    });
  }

  ngOnInit() {
    if (this.registrationId) {
      this.comments$ = this.libraryService.getComments(this.registrationId);
    }
  }

  addComment() {
    if (this.commentForm.valid) {
      const comment = {
        message: this.commentForm.value.message,
        role: this.currentUserRole,
        uid: this.currentUserId,
      };
      this.libraryService.addComment(this.registrationId, comment).then(() => {
        this.commentForm.reset();
      });
    }
  }
}
