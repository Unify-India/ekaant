import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },
  {
    path: 'login',
    loadComponent: () => import('./public/login/login.page').then((m) => m.LoginPage),
  },
  {
    path: 'about-us',
    loadComponent: () => import('./public/about-us/about-us.page').then((m) => m.AboutUsPage),
  },
  {
    path: 'help-support',
    loadComponent: () => import('./public/help-support/help-support.page').then((m) => m.HelpSupportPage),
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
    path: 'dashboard',
    loadComponent: () => import('./student/dashboard/dashboard.page').then((m) => m.DashboardPage),
  },
  {
    path: 'manager-dashboard',
    loadComponent: () => import('./manager/dashboard/dashboard.page').then((m) => m.DashboardPage),
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
    path: 'dashboard',
    loadComponent: () => import('./admin/dashboard/dashboard.page').then((m) => m.DashboardPage),
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
    loadComponent: () => import('./public/home/home.page').then((m) => m.HomePage),
  },
];
