
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { Router, CanActivateFn, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';

export const managerGuard: CanActivateFn = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (auth.isLoggedIn() && auth.isManager()) {
    return true;
  } else {
    router.navigate(['/login']);
    return false;
  }
};
