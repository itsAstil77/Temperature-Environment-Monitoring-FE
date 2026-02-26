import { ChangeDetectorRef, Component } from '@angular/core';
import { User } from '../../../service/user/user';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { LoadingService } from '../../../service/loading/loading';

@Component({
  selector: 'app-login',
  imports: [FormsModule, CommonModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {

  users = {
    email: '',
    password: ''
  }


  message: string = '';
messageType: 'success' | 'error' = 'success';
showMessage: boolean = false;
private messageTimer: any;


  constructor(private user: User, private router: Router, private cdr: ChangeDetectorRef,   private loadingService: LoadingService) { }





// toasts: { id: number, message: string, type: 'success' | 'error' }[] = [];
// private toastCounter = 0;

// showToast(msg: string, type: 'success' | 'error') {
//   const id = this.toastCounter++;
//   this.toasts.push({ id, message: msg, type });
//   this.cdr.detectChanges();
// }

// dismissToast(id: number, index: number, instant: boolean = false) {
//   const delay = instant ? 0 : 1000;

//   setTimeout(() => {
//     this.toasts = [...this.toasts.filter(t => t.id !== id)];
//     this.cdr.detectChanges();
//   }, delay);

//   // Remove by index from localStorage
//   const pending = JSON.parse(localStorage.getItem('pendingToasts') || '[]');
//   pending.splice(index, 1); // 👈 remove exact index
//   localStorage.setItem('pendingToasts', JSON.stringify(pending));
// }



// requestOtp() {
//   this.user.sendOtp(this.users).subscribe(
//     (res: any) => {
//       console.log('Login API Response:', res);
//       localStorage.setItem('userEmail', this.users.email);

//       if (res?.message?.toLowerCase().includes('otp') ||
//           res?.message?.toLowerCase().includes('sent')) {
//         this.showToast(res.message, 'success');
//         this.saveToastToStorage(res.message, 'success'); // 👈
//         setTimeout(() => this.router.navigate(['/otp']), 2000);
//       } else {
//         this.showToast(res.message || 'Invalid username or password', 'error');
//         this.saveToastToStorage(res.message || 'Invalid username or password', 'error'); // 👈
//       }
//     },
//     (error) => {
//       const msg = error.error?.message ||
//                   (typeof error.error === 'string' ? error.error : 'Invalid username or password');
//       this.showToast(msg, 'error');
//       this.saveToastToStorage(msg, 'error'); // 👈
//     }
//   );
// }






requestOtp() {
  this.user.sendOtp(this.users).subscribe(
    (res: any) => {
      console.log('Login API Response:', res);
      localStorage.setItem('userEmail', this.users.email);

      if (res?.message?.toLowerCase().includes('otp') ||
          res?.message?.toLowerCase().includes('sent')) {
        this.loadingService.showToast(res.message, 'success'); 
        // setTimeout(() => this.router.navigate(['/otp']), 500);
         this.router.navigate(['/otp']);
      } else {
        this.loadingService.showToast(res.message || 'Invalid username or password', 'error'); // 👈
      }
    },
    (error) => {
      const msg = error.error?.message ||
                  (typeof error.error === 'string' ? error.error : 'Invalid username or password');
      this.loadingService.showToast(msg, 'error'); // 👈
    }
  );
}







// 👈 add this method
// saveToastToStorage(msg: string, type: 'success' | 'error') {
//   const existing = JSON.parse(localStorage.getItem('pendingToasts') || '[]');
//   existing.push({ message: msg, type });
//   localStorage.setItem('pendingToasts', JSON.stringify(existing));
// }





}