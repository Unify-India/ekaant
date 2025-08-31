import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full',
      },
      {
        path: 'dashboard',
        loadComponent: () => import('./dashboard/dashboard.page').then((m) => m.DashboardPage),
      },
      {
        path: 'library-requests',
        loadComponent: () => import('./library-requests/library-requests.page').then((m) => m.LibraryRequestsPage),
      },
      {
        path: 'library-request-detail',
        loadComponent: () =>
          import('./library-request-detail/library-request-detail.page').then((m) => m.LibraryRequestDetailPage),
      },
      {
        path: 'user-feedback',
        loadComponent: () => import('./user-feedback/user-feedback.page').then((m) => m.UserFeedbackPage),
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AdminRoutingModule {}
