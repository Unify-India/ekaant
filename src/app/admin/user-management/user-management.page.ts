import { CommonModule } from '@angular/common';
import { AsyncPipe, TitleCasePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonButtons,
  IonMenuButton,
  IonGrid,
  IonRow,
  IonCol,
  IonCard,
  IonSpinner,
  IonChip,
  IonButton,
  IonIcon,
} from '@ionic/angular/standalone';
import { Observable, BehaviorSubject, switchMap, tap, map, of } from 'rxjs';
import { AuthService } from 'src/app/auth/service/auth.service';
import { IUser } from 'src/app/models/global.interface';
import { UserService } from 'src/app/services/user/user.service';

@Component({
  selector: 'app-user-management',
  templateUrl: './user-management.page.html',
  styleUrls: ['./user-management.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonButtons,
    IonMenuButton,
    IonGrid,
    IonRow,
    IonCol,
    IonCard,
    IonSpinner,
    IonChip,
    IonButton,
    IonIcon,
    AsyncPipe,
    TitleCasePipe,
  ],
})
export class UserManagementPage implements OnInit {
  users$!: Observable<IUser[]>;
  isAdmin$!: Observable<boolean>;
  private usersReloadTrigger = new BehaviorSubject<void>(undefined);

  constructor(
    private userService: UserService,
    private authService: AuthService,
  ) {}

  ngOnInit() {
    const currentUser = this.authService.getCurrentUser();
    const isAdmin = currentUser?.role === 'admin';

    this.isAdmin$ = of(isAdmin);

    if (isAdmin) {
      this.users$ = this.usersReloadTrigger.pipe(
        switchMap(() => this.userService.getAllUsers()),
        tap((users) => console.log('Fetched users:', users)),
      );
    } else {
      this.users$ = of([]);
    }
  }

  ionViewWillEnter() {
    this.usersReloadTrigger.next(undefined);
  }

  viewUser(userId: string) {
    console.log('View user:', userId);
  }

  editUser(userId: string) {
    console.log('Edit user:', userId);
  }

  deleteUser(userId: string) {
    console.log('Delete user:', userId);
  }

  exportCsv() {
    console.log('Export CSV clicked');
  }

  addNewUser() {
    console.log('Add New User clicked');
  }
}
