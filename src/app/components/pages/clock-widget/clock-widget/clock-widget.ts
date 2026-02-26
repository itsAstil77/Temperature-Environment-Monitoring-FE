import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';


@Component({
  selector: 'app-clock-widget',
  imports: [CommonModule],
  templateUrl: './clock-widget.html',
  styleUrl: './clock-widget.css'
})
export class ClockWidget implements OnInit, OnDestroy {

 currentTime: string = '';
  private intervalId: any;
  @Input() isPreview: boolean = false;


  // ✅ Emit events to parent
  @Output() addWidget = new EventEmitter<void>();
  @Output() cancelWidget = new EventEmitter<void>();

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.updateTime();

    this.intervalId = setInterval(() => {
      this.updateTime();
      this.cdr.detectChanges();
    }, 1000);
  }

  // updateTime() {
  //   const now = new Date();
  //   this.currentTime = now.toLocaleTimeString('en-GB', {
  //     hour: '2-digit',
  //     minute: '2-digit',
  //     second: '2-digit'
  //   });
  // }

  // ✅ Button handlers
  onAdd() {
    this.addWidget.emit();
  }

  onCancel() {
    this.cancelWidget.emit();
  }

  ngOnDestroy() {
    clearInterval(this.intervalId);
  }



currentDate = '';

updateTime() {
  const now = new Date();

  this.currentTime = now.toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });

  this.currentDate = now.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: '2-digit',
    year: 'numeric'
  });
}

}
