import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      console.error('API Error:', error);

      let message = 'Something went wrong';

      if (error.error?.message) {
        message = error.error.message;
      } else if (error.message) {
        message = error.message;
      }

      return throwError(() => new Error(message));
    })
  );
};