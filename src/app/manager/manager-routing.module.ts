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
        path: 'complete-profile',
        loadComponent: () => import('./complete-profile/complete-profile.page').then((m) => m.CompleteProfilePage),
      },
      {
        path: 'student-applications',
        loadComponent: () =>
          import('./student-applications/student-applications.page').then((m) => m.StudentApplicationsPage),
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ManagerRoutingModule {}
