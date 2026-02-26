// import { Component } from '@angular/core';

// @Component({
//   selector: 'app-loading-overlay',
//   imports: [],
//   templateUrl: './loading-overlay.html',
//   styleUrl: './loading-overlay.css',
// })
// export class LoadingOverlay {

// }



import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoadingService } from '../../../service/loading/loading';

@Component({
  selector: 'app-loading-overlay',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (loadingService.isLoading()) {
      <div class="overlay">
        <div class="spinner-container">
          <div class="ring ring-3"></div>
          <div class="ring ring-2"></div>
          <div class="ring ring-1"></div>
        </div>
      </div>
    }

    <!-- 👈 add this toast stack -->
    <div class="toast-stack">
      @for (toast of loadingService.toasts(); track toast.id; let i = $index) {
        <div
          class="toast-message"
          [ngClass]="toast.type"
          (mouseenter)="loadingService.dismissToast(toast.id, i, false)"
          (click)="loadingService.dismissToast(toast.id, i, true)">
          {{ toast.message }}
        </div>
      }
    </div>
  `,
  styles: [`
    .overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.4);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 9999;
    }

    .spinner-container {
      position: relative;
      width: 100px;
      height: 100px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .ring {
      position: absolute;
      border-radius: 50%;
      border: 5px solid transparent;
      animation: spin 1.2s linear infinite;
    }

    .ring-1 {
      width: 40px;
      height: 40px;
      border-top-color: green;
      animation-duration: 0.8s;
    }

    .ring-2 {
      width: 65px;
      height: 65px;
      border-top-color: orange;
      animation-duration: 1.2s;
      animation-direction: reverse;
    }

    .ring-3 {
      width: 90px;
      height: 90px;
      border-top-color: #7030a0;
      animation-duration: 1.6s;
    }

    @keyframes spin {
      0%   { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    /* 👈 add these toast styles */
    .toast-stack {
      position: fixed;
      top: 30px;
      right: 30px;
      display: flex;
      flex-direction: column;
      gap: 10px;
      z-index: 99999;
    }

    .toast-message {
      padding: 14px 24px;
      border-radius: 8px;
      font-size: 0.95rem;
      font-weight: 500;
      color: white;
      cursor: pointer;
      box-shadow: 0 4px 12px rgba(0,0,0,0.2);
      animation: slideIn 0.5s forwards;
      max-width: 320px;
    }

    .toast-message.success  { background-color: #27ae60; }
    .toast-message.error    { background-color: #e74c3c; }
    .toast-message.info     { background-color: #2980b9; }
    .toast-message.warning  { background-color: #f39c12; }

    @keyframes slideIn {
      from { transform: translateX(400px); opacity: 0; }
      to   { transform: translateX(0);     opacity: 1; }
    }
  `]
})
export class LoadingOverlay implements OnInit {
  constructor(public loadingService: LoadingService) {}

  ngOnInit() {
    this.loadingService.loadPendingToasts();
  }
}