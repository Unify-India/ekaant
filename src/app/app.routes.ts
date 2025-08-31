import { Routes } from '@angular/router';

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
    loadComponent: () => import('./student/browse-libraries/browse-libraries.page').then((m) => m.BrowseLibrariesPage),
  },
  {
    path: 'library-details',
    loadComponent: () => import('./student/library-details/library-details.page').then((m) => m.LibraryDetailsPage),
  },
  {
    path: 'apply-library',
    loadComponent: () => import('./student/apply-library/apply-library.page').then((m) => m.ApplyLibraryPage),
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
    path: 'complete-profile',
    loadComponent: () => import('./manager/complete-profile/complete-profile.page').then((m) => m.CompleteProfilePage),
  },
  {
    path: 'student-applications',
    loadComponent: () =>
      import('./manager/student-applications/student-applications.page').then((m) => m.StudentApplicationsPage),
  },
  {
    path: 'student-application-detail',
    loadComponent: () =>
      import('./manager/student-application-detail/student-application-detail.page').then(
        (m) => m.StudentApplicationDetailPage,
      ),
  },
  {
    path: 'admin',
    loadChildren: () => import('./admin/admin-routing.module').then((m) => m.AdminRoutingModule),
  },
  {
    path: 'library-requests',
    loadComponent: () => import('./admin/library-requests/library-requests.page').then((m) => m.LibraryRequestsPage),
  },
  {
    path: 'library-request-detail',
    loadComponent: () =>
      import('./admin/library-request-detail/library-request-detail.page').then((m) => m.LibraryRequestDetailPage),
  },
  {
    path: 'user-feedback',
    loadComponent: () => import('./admin/user-feedback/user-feedback.page').then((m) => m.UserFeedbackPage),
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
    loadComponent: () => import('./privacy-policy/privacy-policy.page').then((m) => m.PrivacyPolicyPage),
  },
  {
    path: 'delete-account',
    loadComponent: () => import('./pages/delete-account/delete-account.page').then((m) => m.DeleteAccountPage),
  },
  {
    path: 'support',
    loadComponent: () => import('./pages/support/support.page').then((m) => m.SupportPage),
  },
];

export const staticRoutes = [
  {
    path: '**',
    loadComponent: () => import('./pages/not-found/not-found.page').then((m) => m.NotFoundPage),
  },
];
