import { AfterViewInit, Component, inject, OnDestroy, OnInit } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import {
  IonApp,
  IonSplitPane,
  IonMenu,
  IonContent,
  IonList,
  IonListHeader,
  IonNote,
  IonMenuToggle,
  IonItem,
  IonIcon,
  IonLabel,
  IonRouterOutlet,
  IonRouterLink,
} from '@ionic/angular/standalone';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { addIcons } from 'ionicons';
import { Subscription } from 'rxjs';

import { AuthService } from './auth/service/auth.service';
import { IMenuOptions, IUser } from './models/global.interface';
import { LibraryService } from './services/library/library.service';
import { TranslateConfigService } from './services/translation/translation.service';
import { UsedIcons } from './shared/core/icons/used-icons';
import { MenuData } from './shared/core/menu/menu.data';
import { ApiService } from './shared/services/api/api.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  imports: [
    RouterLink,
    RouterLinkActive,
    IonApp,
    IonSplitPane,
    IonMenu,
    IonContent,
    IonList,
    IonListHeader,
    IonNote,
    IonMenuToggle,
    IonItem,
    IonIcon,
    IonLabel,
    IonRouterLink,
    IonRouterOutlet,
    TranslateModule,
  ],
})
export class AppComponent implements OnInit, OnDestroy, AfterViewInit {
  private translate = inject(TranslateService);
  private libraryService = inject(LibraryService);

  appPages: IMenuOptions[] = MenuData.defaultAppPages;
  icons = UsedIcons.icons;
  isLoggedIn = false;
  private authListenerSubs!: Subscription;

  constructor(
    private authService: AuthService,
    private translateConfigService: TranslateConfigService,
    private apiService: ApiService,
  ) {
    addIcons(this.icons);
  }
  ngOnInit() {
    this.isLoggedIn = this.authService.isLoggedIn();
    this.authListenerSubs = this.authService.getAuthStatusListener().subscribe((user) => {
      this.isLoggedIn = !!user;
      this.updateMenu(user);
    });
    this.apiService
      .getDataFromRealtimeDB('/translations')
      .then((data) => {
        console.log('Fetched data from RTDB:', data);
      })
      .catch((error) => {
        console.warn('Error fetching data from RTDB:', error);
      });

    console.info('isLoggedIn', this.isLoggedIn);
  }

  ngAfterViewInit() {
    const browserLang = this.translate.getBrowserLang() || 'en';
    this.translateConfigService.fetchTranslations(browserLang);
  }
  ngOnDestroy() {
    this.authListenerSubs.unsubscribe();
  }

  async updateMenu(user: IUser | null) {
    this.isLoggedIn = !!user;
    if (!user) {
      this.appPages = MenuData.defaultAppPages;
    } else {
      switch (user.role) {
        case 'admin':
          this.appPages = MenuData.adminAppPages;
          break;
        case 'manager': {
          await this.libraryService.hasLibrary(user);
          const libraryString = localStorage.getItem('library');
          const library = libraryString ? JSON.parse(libraryString) : {};
          if (library.registration === 'registered') {
            this.appPages = MenuData.managerAppPages;
          } else if (library.registration === 'pending') {
            this.appPages = MenuData.libraryRegistrationPending;
          } else {
            this.appPages = MenuData.libraryRegistrationPending;
          }
          break;
        }

        case 'student':
          this.appPages = MenuData.studentAppPages;
          break;
        default:
          this.appPages = MenuData.defaultAppPages;
          break;
      }
    }
  }

  logout() {
    this.authService.logout();
  }

  getIconColor(page: { icon: string; color?: string }): string {
    if (!page) {
      return 'medium';
    }
    if (!page.color) {
      return 'medium';
    }
    return page.color || 'medium';
  }
}
