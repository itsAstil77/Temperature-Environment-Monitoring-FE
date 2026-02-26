// import { HttpInterceptorFn } from '@angular/common/http';

// export const loadingInterceptor: HttpInterceptorFn = (req, next) => {
//   return next(req);
// };
import { inject } from '@angular/core';
import { HttpInterceptorFn } from '@angular/common/http';
import { finalize } from 'rxjs/operators';
import { LoadingService } from '../loading/loading';


export const loadingInterceptor: HttpInterceptorFn = (req, next) => {
  const loading = inject(LoadingService);
  loading.show();

  return next(req).pipe(
    finalize(() => loading.hide())
  );
};