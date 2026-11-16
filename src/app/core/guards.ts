import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

export const authGuard: CanActivateFn = (route, state) => {
    const auth = inject(AuthService);
    return auth.isLogged()
      ? true
      : inject(Router).createUrlTree(['/login'], { queryParams: { returnUrl: state.url } });
};

export const roleGuard = (...roles: string[]): CanActivateFn => (route, state) => {
    const auth = inject(AuthService);
    const router = inject(Router);
    if (!auth.isLogged()) return router.createUrlTree(['/login'], { queryParams: { returnUrl: state.url } });
    return roles.includes(auth.role() as string) ? true : router.createUrlTree(['/']);
};

export const guestGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  return auth.isLogged() ? inject(Router).createUrlTree(['/']) : true;
};
