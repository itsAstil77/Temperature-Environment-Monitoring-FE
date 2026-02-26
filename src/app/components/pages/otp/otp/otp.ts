import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { User } from '../../../service/user/user';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { LoadingService } from '../../../service/loading/loading';

@Component({
  selector: 'app-otp',
  imports: [FormsModule, CommonModule],
  templateUrl: './otp.html',
  styleUrl: './otp.css'
})


export class Otp implements OnInit{


  loginUser = {
    otp: '',
    email: ''
  }

message: string = '';
messageType: 'success' | 'error' = 'success';
showMessage: boolean = false;
private messageTimer: any;


  constructor(private user: User, private router: Router,  private cdr: ChangeDetectorRef ,private loadingService: LoadingService) {
     this.loginUser.email = localStorage.getItem('userEmail') || '';
   }



// ngOnInit() {
//   const pending = JSON.parse(localStorage.getItem('pendingToasts') || '[]');
//   pending.forEach((t: { message: string, type: 'success' | 'error' }) => {
//     this.showToast(t.message, t.type);
//   });
//   localStorage.removeItem('pendingToasts'); // 👈 clean up after loading
// }


// toasts: { id: number, message: string, type: 'success' | 'error' }[] = [];
// private toastCounter = 0;

// showToast(msg: string, type: 'success' | 'error') {
//   const id = this.toastCounter++;
//   this.toasts.push({ id, message: msg, type });
//   this.cdr.detectChanges();
// }

// dismissToast(id: number, instant: boolean = false) {
//   const delay = instant ? 0 : 1000;

//   setTimeout(() => {
//     this.toasts = [...this.toasts.filter(t => t.id !== id)];
//     this.cdr.detectChanges();
//   }, delay);
// }

//   verifyOtp() {
//     this.user.verifyOtp(this.loginUser).subscribe(
//       (response: any) => {
//         localStorage.setItem('token', response.token.token);
//         localStorage.setItem('userid', response.userid);

//         const roleId = response.token.roleId;
//         localStorage.setItem('roleId', roleId);

//         this.showToast('Login Successful! Redirecting...', 'success');

//         this.user.getRoleById(roleId).subscribe(
//           (roleData: any) => {
//             localStorage.setItem('permissions', JSON.stringify(roleData.assignPermissions));
//             setTimeout(() => this.router.navigate(['/dashboard']), 2000);
//           },
//           (error: any) => {
//             console.error('Failed to fetch role permissions', error);
//             setTimeout(() => this.router.navigate(['/dashboard']), 2000);
//           }
//         );
//       },
//       (error: any) => {
//         const msg = error.error?.message || 'Invalid OTP. Please try again.';
//         this.showToast(msg, 'error');
//       }
//     );
//   }
// }



ngOnInit() {
  // ❌ remove all toast loading code, nothing needed here
  this.loginUser.email = localStorage.getItem('userEmail') || '';
}

verifyOtp() {
  this.user.verifyOtp(this.loginUser).subscribe(
    (response: any) => {
      localStorage.setItem('token', response.token.token);
      localStorage.setItem('userid', response.userid);

      const roleId = response.token.roleId;
      localStorage.setItem('roleId', roleId);

      this.loadingService.showToast('Login Successful! Redirecting...', 'success'); // 👈

      this.user.getRoleById(roleId).subscribe(
        (roleData: any) => {
          localStorage.setItem('permissions', JSON.stringify(roleData.assignPermissions));
          setTimeout(() => this.router.navigate(['/dashboard']), 2000);
        },
        (error: any) => {
          console.error('Failed to fetch role permissions', error);
          setTimeout(() => this.router.navigate(['/dashboard']), 2000);
        }
      );
    },
    (error: any) => {
      const msg = error.error?.message || 'Invalid OTP. Please try again.';
      this.loadingService.showToast(msg, 'error'); // 👈
    }
  );
}







}