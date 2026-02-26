// import { Injectable } from '@angular/core';

// @Injectable({
//   providedIn: 'root',
// })
// export class Loading {
  
// }




import { Injectable, signal } from '@angular/core';



export interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
}

@Injectable({ providedIn: 'root' })
export class LoadingService {


  private loadingCount = 0;
  isLoading = signal<boolean>(false);

   // 👈 add these
  private toastCounter = 0;
  toasts = signal<Toast[]>([]);

  show() {
    this.loadingCount++;
    this.isLoading.set(true);
  }

  hide() {
    this.loadingCount = Math.max(0, this.loadingCount - 1);
    if (this.loadingCount === 0) {
      this.isLoading.set(false);
    }
  }

  // 👈 add these methods
  showToast(message: string, type: Toast['type'] = 'success') {
    const id = this.toastCounter++;
    this.toasts.update(t => [...t, { id, message, type }]);

    const pending = JSON.parse(localStorage.getItem('pendingToasts') || '[]');
    pending.push({ message, type });
    localStorage.setItem('pendingToasts', JSON.stringify(pending));
  }

  dismissToast(id: number, index: number, instant: boolean = false) {
    const delay = instant ? 0 : 1000;

    setTimeout(() => {
      this.toasts.update(t => t.filter(toast => toast.id !== id));
    }, delay);

    const pending = JSON.parse(localStorage.getItem('pendingToasts') || '[]');
    pending.splice(index, 1);
    localStorage.setItem('pendingToasts', JSON.stringify(pending));
  }

  loadPendingToasts() {
    const pending = JSON.parse(localStorage.getItem('pendingToasts') || '[]');
    pending.forEach((t: { message: string, type: Toast['type'] }) => {
      const id = this.toastCounter++;
      this.toasts.update(existing => [...existing, { id, message: t.message, type: t.type }]);
    });
    localStorage.removeItem('pendingToasts');
  }
}
