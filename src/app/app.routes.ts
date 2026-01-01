import { Routes } from '@angular/router';

import { adminGuard } from './auth/guards/admin.guard';
import { unauthGuard } from './auth/guards/unauth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },
  {
    path: 'login',
    loadComponent: () => import('./auth/login/login.page').then((m) => m.LoginPage),
  },
  {
    path: 'about-us',
    loadComponent: () => import('./pages/about-us/about-us.page').then((m) => m.AboutUsPage),
  },
  {
    path: 'signup',
    loadComponent: () => import('./student/signup/signup.page').then((m) => m.SignupPage),
  },
  {
    path: 'profile',
    loadComponent: () => import('./student/profile/profile.page').then((m) => m.ProfilePage),
  },
  {
    path: 'browse-libraries',
    loadComponent: () => import('./pages/browse-libraries/browse-libraries.page').then((m) => m.BrowseLibrariesPage),
  },
  {
    path: 'student',
    loadChildren: () => import('./student/student-routing-module').then((m) => m.StudentRoutingModule),
  },
  {
    path: 'manager',
    loadChildren: () => import('./manager/manager-routing.module').then((m) => m.ManagerRoutingModule),
  },
  {
    path: 'admin',
    loadChildren: () => import('./admin/admin-routing.module').then((m) => m.AdminRoutingModule),
    canActivate: [adminGuard],
  },
  {
    path: 'home',
    loadComponent: () => import('./pages/home/home.page').then((m) => m.HomePage),
  },
  {
    path: 'pricing',
    loadComponent: () => import('./pages/pricing/pricing.page').then((m) => m.PricingPage),
  },
  {
    path: 'footer',
    loadComponent: () => import('./pages/footer/footer.page').then((m) => m.FooterPage),
  },
  {
    path: 'privacy-policy',
    loadComponent: () => import('./pages/privacy-policy/privacy-policy.page').then((m) => m.PrivacyPolicyPage),
  },
  {
    path: 'delete-account',
    loadComponent: () => import('./pages/delete-account/delete-account.page').then((m) => m.DeleteAccountPage),
  },
  {
    path: 'support',
    loadComponent: () => import('./pages/support/support.page').then((m) => m.SupportPage),
  },
  {
    path: 'register-library',
    loadComponent: () => import('./pages/register-library/register-library.page').then((m) => m.RegisterLibraryPage),
  },

  {
    path: 'library-registration-form',
    loadComponent: () =>
      import('./pages/library-registration-form/library-registration-form.page').then(
        (m) => m.LibraryRegistrationFormPage,
      ),
  },
  {
    path: 'registration-acknowledgement',
    loadComponent: () =>
      import('./pages/registration-acknowledgement/registration-acknowledgement.page').then(
        (m) => m.RegistrationAcknowledgementPage,
      ),
  },
  {
    path: 'library-details/:id',
    loadComponent: () => import('./pages/library-details/library-details.page').then((m) => m.LibraryDetailsPage),
  },
  {
    path: 'admin-login',
    loadComponent: () => import('./admin/admin-login/admin-login.page').then((m) => m.AdminLoginPage),
  },
  {
    path: 'add-payment',
    loadComponent: () => import('./manager/payment-history/add-payment/add-payment.page').then( m => m.AddPaymentPage)
  },
  {
    path: 'reset-password',
    loadComponent: () => import('./auth/reset-password/reset-password.page').then( m => m.ResetPasswordPage)
  },
];

export const staticRoutes = [
  {
    path: '**',
    loadComponent: () => import('./pages/not-found/not-found.page').then((m) => m.NotFoundPage),
  },
];
