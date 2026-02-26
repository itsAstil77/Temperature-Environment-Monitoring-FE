import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { User } from '../../../service/user/user';

@Component({
  selector: 'app-customerdashboard',
  imports: [RouterModule, CommonModule, FormsModule],
  templateUrl: './customerdashboard.html',
  styleUrl: './customerdashboard.css'
})
export class Customerdashboard implements OnInit, OnDestroy {

  constructor(private userService: User, private cdr: ChangeDetectorRef) { }

  ngOnInit(): void {
    this.loadTechnologyByCount();
    this.connectDeviceNotificationWS();
  }
  ngOnDestroy(): void {
    // ✅ Clean up WS when component destroyed
    if (this.deviceNotificationWs) {
      this.deviceNotificationWs.close();
    }
  }
  isAddWidgetPopup: boolean = false;

  openAddWidgetPopup() {
    this.isAddWidgetPopup = true;
  }
  closeAddWidgetPopup() {
    this.isAddWidgetPopup = false;
  }

  personalWidgets = [
    { name: 'Top Zone', selected: false },
    { name: 'Peak Time', selected: false },
    { name: 'Peak Day', selected: false },
    { name: 'Total Visitors', selected: false },
    { name: 'Total Employees', selected: false },
    { name: 'Total Contractors', selected: false },
    { name: 'Number of Appearances', selected: false },
    { name: 'Number of Bounced Visitors', selected: false },
    { name: 'Visitors Bounce Rate', selected: false },
    { name: 'Unique Visitors', selected: false },
    { name: 'Repeat Visitors', selected: false },
    { name: 'Male Visitors', selected: false },
    { name: 'Female Visitors', selected: false },
  ];


  // 7-2-26


  technologyCount: any[] = [];
  isTechnologyLoading = false;


  loadTechnologyByCount() {
    this.isTechnologyLoading = true;

    this.userService.technologyByCount().subscribe({
      next: (res: any) => {
        console.log('📊 Technology count response:', res);

        // ✅ Bind API data
        this.technologyCount = res?.data || [];

        this.isTechnologyLoading = false;

        // ✅ FORCE UI UPDATE
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error('❌ Error loading technology count', err);
        this.isTechnologyLoading = false;

        // ✅ Ensure UI updates even on error
        this.cdr.detectChanges();
      }
    });
  }


  // 9-2-26

  // Asset details popup
  isAssetDetailsPopup: boolean = false;
  selectedTechnology: string = '';
  assetDetails: any[] = [];
  assetDetailsLoading: boolean = false;

  openAssetDetailsPopup(technology: string) {
    this.selectedTechnology = technology;
    this.isAssetDetailsPopup = true;
    this.loadAssetsByTechnology(technology);
  }

  closeAssetDetailsPopup() {
    this.isAssetDetailsPopup = false;
    this.assetDetails = [];
    this.selectedTechnology = '';
  }

  loadAssetsByTechnology(technology: string) {
    this.assetDetailsLoading = true;

    this.userService.getAssetByTechnology(technology).subscribe({
      next: (res: any) => {
        console.log('📦 Assets by technology response:', res);
        this.assetDetails = res?.data || [];
        this.assetDetailsLoading = false;
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error('❌ Error loading assets by technology', err);
        this.assetDetailsLoading = false;
        this.cdr.detectChanges();
      }
    });
  }



  deviceNotificationWs!: WebSocket;
  deviceStatusMap: {
    [deviceId: string]: {
      status: string; timestamp: string; markAsRead: boolean; checkintime?: string;
      gsmtimestamp?: string;
      matchType?: string;
    }
  } = {};
  bleTagTimestampMap: { [bleTagId: string]: string } = {};
  zoneTimestampMap: { [zoneId: string]: string } = {};
  tagTimestampMap: { [tagId: string]: string } = {};
  connectDeviceNotificationWS() {

    if (this.deviceNotificationWs) {
      this.deviceNotificationWs.close();
    }

    this.deviceNotificationWs = new WebSocket('ws://172.16.100.29:5202/ws/ZoneCount');

    this.deviceNotificationWs.onopen = () => {
      console.log('✅ Device Notification WS Connected');
    };

    this.deviceNotificationWs.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        const updates = Array.isArray(data) ? data : [data];

        updates.forEach((update: any) => {


          // ─── MATCH BY ZoneId ─────────────────────────────
if (update.ZoneId !== undefined || update.zoneId !== undefined) {
  const zoneId = (update.ZoneId || update.zoneId || '').trim().toUpperCase();

  // ✅ Use checkintime first, fallback to Gsmtimestamp
  const timeToStore = update.checkintime || update.Gsmtimestamp || '';

  // ✅ Only update if we have a non-empty value (don't overwrite good data with empty)
  if (timeToStore) {
    this.zoneTimestampMap[zoneId] = timeToStore;
  }

  this.deviceStatusMap[zoneId] = {
    status: 'online',
    timestamp: new Date().toISOString(),
    
    markAsRead: false,
    checkintime: update.checkintime || '',
    matchType: 'zone'
  };
}
          // ─── MATCH BY tagId ──────────────────────────────
          if (update.tagId !== undefined) {
            const tagId = (update.tagId || '').trim();

            // ✅ Add this one line
            this.tagTimestampMap[tagId] = update.Gsmtimestamp || '';

            this.deviceStatusMap[tagId] = {
              status: 'online',
              timestamp: update.Gsmtimestamp || new Date().toISOString(),
              markAsRead: false,
              gsmtimestamp: update.Gsmtimestamp || '',
              matchType: 'tag'
            };
          }

          // ─── MATCH BY BleTagid ───────────────────────────
          if (update.BleTagid !== undefined) {
            const bleTagId = (update.BleTagid || '').trim().toUpperCase();

            this.bleTagTimestampMap[bleTagId] = update.checkintime || ''; // ✅ existing

            this.deviceStatusMap[bleTagId] = {
              status: 'online',
              timestamp: update.checkintime || update.Gsmtimestamp || new Date().toISOString(),
              markAsRead: false,
              checkintime: update.checkintime || '',
              matchType: 'ble'
            };
          }

        });

        this.cdr.detectChanges(); // ✅ update table live

      } catch (err) {
        console.error('❌ Device Notification WS parse error', err);
      }
    };

    this.deviceNotificationWs.onclose = () => {
      console.log('🔌 Device Notification WS Closed. Reconnecting in 2s...');
      setTimeout(() => this.connectDeviceNotificationWS(), 2000);
    };

    this.deviceNotificationWs.onerror = (err) => {
      console.error('❌ Device Notification WS Error', err);
    };
  }





  //   connectDeviceNotificationWS() {
  //   if (this.deviceNotificationWs) {
  //     this.deviceNotificationWs.close();
  //   }

  //   this.deviceNotificationWs = new WebSocket('ws://172.16.100.29:5202/ws/ZoneCount');

  //   this.deviceNotificationWs.onopen = () => {
  //     console.log('✅ Device Notification WS Connected');
  //   };

  //   this.deviceNotificationWs.onmessage = (event) => {
  //     try {
  //       const data = JSON.parse(event.data);
  //       const updates = Array.isArray(data) ? data : [data];

  //       updates.forEach((update: any) => {

  //         // ─── MATCH BY ZoneId → checkintime ───────────
  //         if (update.ZoneId !== undefined || update.zoneId !== undefined) {
  //           const zoneId = (update.ZoneId || update.zoneId || '').trim().toUpperCase();

  //           // ✅ Store checkintime for zoneId
  //           this.bleTagTimestampMap[zoneId] = update.checkintime || '';
  //           console.log('📡 zoneId stored:', zoneId, '→', update.checkintime);

  //           this.deviceStatusMap[zoneId] = {
  //             status: 'online',
  //             timestamp: new Date().toISOString(),
  //             markAsRead: false,
  //             checkintime: update.checkintime || '',
  //             matchType: 'zone'
  //           };
  //         }

  //         // ─── MATCH BY tagId → Gsmtimestamp ───────────
  //         if (update.tagId !== undefined) {
  //           const tagId = (update.tagId || '').trim();

  //           // ✅ Store Gsmtimestamp for tagId
  //           this.tagTimestampMap[tagId] = update.Gsmtimestamp || '';
  //           console.log('📡 tagId stored:', tagId, '→', update.Gsmtimestamp);

  //           this.deviceStatusMap[tagId] = {
  //             status: 'online',
  //             timestamp: update.Gsmtimestamp || new Date().toISOString(),
  //             markAsRead: false,
  //             gsmtimestamp: update.Gsmtimestamp || '',
  //             matchType: 'tag'
  //           };
  //         }

  //         // ─── MATCH BY BleTagid → checkintime ─────────
  //         if (update.BleTagid !== undefined) {
  //           const bleTagId = (update.BleTagid || '').trim().toUpperCase();

  //           // ✅ Store checkintime for BleTagid
  //           this.bleTagTimestampMap[bleTagId] = update.checkintime || '';
  //           console.log('📡 BleTagid stored:', bleTagId, '→', update.checkintime);

  //           this.deviceStatusMap[bleTagId] = {
  //             status: 'online',
  //             timestamp: update.checkintime || update.Gsmtimestamp || new Date().toISOString(),
  //             markAsRead: false,
  //             checkintime: update.checkintime || '',
  //             matchType: 'ble'
  //           };
  //         }

  //       });

  //       this.cdr.detectChanges();

  //     } catch (err) {
  //       console.error('❌ Device Notification WS parse error', err);
  //     }
  //   };

  //   this.deviceNotificationWs.onclose = () => {
  //     console.log('🔌 Device Notification WS Closed. Reconnecting in 2s...');
  //     setTimeout(() => this.connectDeviceNotificationWS(), 2000);
  //   };

  //   this.deviceNotificationWs.onerror = (err) => {
  //     console.error('❌ Device Notification WS Error', err);
  //   };
  // }

  // ✅ Match asset.uniqueId OR asset.mappedDeviceUniqueId against deviceStatusMap
  getDeviceStatus(asset: any): string {
    const uniqueId = (asset.uniqueId || '').trim().toUpperCase();
    const mappedId = (asset.mappedDeviceUniqueId || '').trim().toUpperCase();

    // Check both uniqueId and mappedDeviceUniqueId
    const wsData = this.deviceStatusMap[uniqueId] || this.deviceStatusMap[mappedId];

    if (!wsData) return 'offline'; // ✅ default offline
    return wsData.status;          // 'online' or 'offline'
  }


  getCheckinTime(asset: any): string {
    const uniqueId = (asset.uniqueId || '').trim().toUpperCase();
    const checkintime = this.bleTagTimestampMap[uniqueId];
    console.log('🔍 getCheckinTime:', uniqueId, '→', checkintime);
    return this.convertToDubaiTime(checkintime || '');
  }

  // getDeviceTimestamp(asset: any): string {
  //   const uniqueId = (asset.uniqueId || '').trim().toUpperCase();

  //   // ✅ Check all maps — return first match found
  //   const timestamp = this.bleTagTimestampMap[uniqueId]   // checkintime
  //     || this.zoneTimestampMap[uniqueId]      // Gsmtimestamp
  //     || this.tagTimestampMap[uniqueId]       // Gsmtimestamp
  //     || '';

  //   return this.convertToDubaiTime(timestamp);
  // }

getDeviceTimestamp(asset: any): string {
  
  const uniqueId = (asset.uniqueId || '').trim().toUpperCase();
  const mappedId = (asset.mappedDeviceUniqueId || '').trim().toUpperCase();
    console.log('🔍 Looking for:', uniqueId, '| zoneMap:', this.zoneTimestampMap);

  // Try all combinations for both IDs
  const timestamp =
    this.zoneTimestampMap[uniqueId]
    || this.zoneTimestampMap[mappedId]      // ← ADD THIS
    || this.bleTagTimestampMap[uniqueId]
    || this.bleTagTimestampMap[mappedId]    // ← ADD THIS
    || this.tagTimestampMap[uniqueId]
    || this.tagTimestampMap[mappedId]       // ← ADD THIS
    || '';

  return this.convertToDubaiTime(timestamp);
}
  convertToDubaiTime(utcTimestamp: string): string {
    if (!utcTimestamp) return '—';
    try {
      return new Date(utcTimestamp).toLocaleString('en-GB', {
        timeZone: 'Asia/Dubai',
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
      });
    } catch {
      return '—';
    }
  }


}




