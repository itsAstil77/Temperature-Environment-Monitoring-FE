import { CommonModule, NgFor, NgIf } from '@angular/common';
import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { Roleservice } from '../../../service/role/roleservice';
import { RouterLink, RouterModule } from '@angular/router';
import { Device } from '../../../service/device/device';
import { HttpClient } from '@angular/common/http';
import { Websocket } from '../../../service/websocket/websocket';
import { environment } from '../../../../../environments/environment.prod';
import { FormsModule } from '@angular/forms';
import { LoadingService } from '../../../service/loading/loading';









@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, NgIf, NgFor, RouterModule, FormsModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard implements OnInit, OnDestroy {

  // private wsUrl = environment.wsUrl;

  ngOnInit(): void {
    this.loadProject();
    // this.loadZoneSensors();
    this.connectWebSocket();
    this.loadDashboard();
    this.getDashboards();

  }

  constructor(private cdr: ChangeDetectorRef, private role: Roleservice, private device: Device, private http: HttpClient, private zoneSocket: Websocket,  private loadingService: LoadingService) { }




  someAction() {
    this.loadingService.showToast('Data loaded successfully!', 'success');
    this.loadingService.showToast('Something went wrong!', 'error');
    this.loadingService.showToast('Please note this info', 'info');
    this.loadingService.showToast('Warning: session expiring', 'warning');
  }


  isAddWidgetPopup: boolean = false;

  openAddWidgetPopup() {
    this.resetPopupData();
    this.isAddWidgetPopup = true;
  }
  closeAddWidgetPopup() {
    this.isAddWidgetPopup = false;
    this.cdr.detectChanges();
  }




  projects: any[] = [];

  loadProject() {
    this.role.getProject().subscribe({
      next: (res: any) => {
        this.projects = res;
        this.cdr.detectChanges();

      },
      error: () => {
        console.log("error loading project")
      }
    })
  }



  countriesByProject: { [projectId: string]: any[] } = {};
  expandedProjects: Set<string> = new Set();

  toggleProject(projectId: string) {
    if (this.expandedProjects.has(projectId)) {
      this.expandedProjects.delete(projectId);
    } else {
      this.expandedProjects.add(projectId);
      this.loadCountries(projectId);
    }
  }

  loadCountries(projectId: string) {
    this.resetDeviceSelection();
    this.selectedProjectId = projectId;
    if (this.expandedProjects.has(projectId)) {
      this.expandedProjects.delete(projectId);
      return;
    }

    this.role.countryGetById(projectId).subscribe({
      next: (res: any) => {
        this.countriesByProject[projectId] = Array.isArray(res) ? res : [];
        this.expandedProjects.add(projectId);

        this.cdr.detectChanges();
        this.selectedProjectId = projectId;
        this.devicesGetByProjectId(projectId);

      },
      error: () => {
        console.log("Error loading countries");
      }
    });
  }

  areaByCountry: { [countryId: string]: any[] } = {};
  expandedCountry: Set<string> = new Set();
  toggleCountry(countryId: string) {
    if (this.expandedCountry.has(countryId)) {
      this.expandedCountry.delete(countryId);
    } else {
      this.expandedCountry.add(countryId);
      this.loadArea(countryId);
    }
  }


 
  selectedProjectId: string = '';
  loadArea(countryId: string, projectId?: string) {
    this.resetDeviceSelection();
    this.selectedCountryId = countryId;
    // Collapse if already expanded
    if (this.expandedCountry.has(countryId)) {
      this.expandedCountry.delete(countryId);
      return;
    }

    // Call your area summary API (existing logic)
    if (!this.areaByCountry[countryId]) {
      this.role.getSummary(countryId).subscribe({
        next: (res: any) => {
          this.areaByCountry[countryId] = Array.isArray(res) ? res : [];
          this.expandedCountry.add(countryId);
          this.cdr.detectChanges();

          // ✅ Call devices API for this country
          if (this.selectedProjectId) {
            this.devicesGetByCountryId(this.selectedProjectId, countryId);
          }
        },
        error: () => {
          console.log("Error loading areas");
        }
      });
    } else {
      this.expandedCountry.add(countryId);
      this.cdr.detectChanges();

      // ✅ Also call devices API when re-expanding
      if (this.selectedProjectId) {
        this.devicesGetByCountryId(this.selectedProjectId, countryId);
      }
    }
  }


  buildingByArea: { [areaId: string]: any[] } = {};
  expandedArea: Set<string> = new Set(); // track open dropdowns

  toggleArea(areaId: string) {
    if (this.expandedArea.has(areaId)) {
      this.expandedArea.delete(areaId);
    } else {
      this.expandedArea.add(areaId);
      this.loadBuilding(areaId);
    }
  }

  selectedCountryId: string = '';

  loadBuilding(areaId: string) {
    this.resetDeviceSelection();
    this.selectedAreaId = areaId;
    if (this.expandedArea.has(areaId)) {
      this.expandedArea.delete(areaId);
      return;
    }
    this.role.getBuilding(areaId).subscribe({
      next: (res: any) => {
        this.buildingByArea[areaId] = Array.isArray(res) ? res : [];
        this.expandedArea.add(areaId);
        this.cdr.detectChanges();

        console.log("Before calling devicesGetByAreaId", this.selectedProjectId, this.selectedCountryId, areaId);
        this.devicesGetByAreaId(this.selectedProjectId, this.selectedCountryId, areaId);
      },
      error: () => {
        console.log("Error loading buildings");
      }
    });

  }



  floors: any[] = [];
  floorByBuilding: { [buildingId: string]: any[] } = {};
  expandedBuilding: Set<string> = new Set();



  toggleBuilding(buildingId: string) {
    if (this.expandedBuilding.has(buildingId)) {
      this.expandedBuilding.delete(buildingId);
    } else {
      this.expandedBuilding.add(buildingId);
      this.loadFloor(buildingId);
    }
  }

  selectedAreaId: string = '';
  loadFloor(buildingId: string) {
    this.resetDeviceSelection();
    this.selectedBuildingId = buildingId;
    if (this.expandedBuilding.has(buildingId)) {
      this.expandedBuilding.delete(buildingId);
      return;
    }

    this.role.getFloor(buildingId).subscribe({
      next: (res: any) => {
        this.floorByBuilding[buildingId] = Array.isArray(res) ? res : [];
        this.expandedBuilding.add(buildingId);
        this.cdr.detectChanges();

        // ✅ Fetch devices for this building
        if (this.selectedProjectId && this.selectedCountryId && this.selectedAreaId) {
          this.devicesGetByBuildingId(
            this.selectedProjectId,
            this.selectedCountryId,
            this.selectedAreaId,
            buildingId
          );
        }
      },
      error: () => {
        console.log("Error loading floors");
      }
    });
  }


  zones: any[] = [];
  zoneByFloor: { [floorId: string]: any[] } = {};
  expandedFloor: Set<string> = new Set();

  toggleFloor(floorId: string) {
    if (this.expandedFloor.has(floorId)) {
      this.expandedFloor.delete(floorId);
    } else {
      this.expandedFloor.add(floorId);
      this.loadZones(floorId);
    }
  }

  selectedBuildingId: string = '';
  loadZones(floorId: string) {
    this.resetDeviceSelection();
    this.selectedFloorId = floorId;
    if (this.expandedFloor.has(floorId)) {
      this.expandedFloor.delete(floorId);
      return;
    }

    this.role.getZones(floorId).subscribe({
      next: (res: any) => {
        this.zoneByFloor[floorId] = Array.isArray(res) ? res : [];
        this.expandedFloor.add(floorId);
        this.cdr.detectChanges();

        // ✅ Fetch devices for this floor
        if (this.selectedProjectId && this.selectedCountryId && this.selectedAreaId && this.selectedBuildingId) {
          this.devicesGetByFloorId(
            this.selectedProjectId,
            this.selectedCountryId,
            this.selectedAreaId,
            this.selectedBuildingId,
            floorId
          );
        }
      },
      error: () => {
        console.log("Error loading zones");
      }
    });
  }


  subZones: any[] = [];
  subZoneByZone: { [zoneId: string]: any[] } = {};
  expandedZone: Set<string> = new Set();

  toggleZone(zoneId: string) {
    if (this.expandedZone.has(zoneId)) {
      this.expandedZone.delete(zoneId);
    } else {
      this.expandedZone.add(zoneId);
      this.loadSubZones(zoneId);
    }
  }
  selectedFloorId: string = '';
  loadSubZones(zoneId: string) {
    this.resetDeviceSelection();
    if (this.expandedZone.has(zoneId)) {
      this.expandedZone.delete(zoneId);
      return;
    }

    // ✅ 1. Always fetch subzones
    this.role.getSubZones(zoneId).subscribe({
      next: (res: any) => {
        console.log("SubZones for zone:", zoneId, res);
        this.subZones = res;
        this.subZoneByZone[zoneId] = Array.isArray(res) ? res : [];
        this.expandedZone.add(zoneId);
        this.cdr.detectChanges();
      },
      error: () => {
        console.error("Error loading subzones");
      }
    });

    // ✅ 2. Always fetch devices for this zone
    if (
      this.selectedProjectId &&
      this.selectedCountryId &&
      this.selectedAreaId &&
      this.selectedBuildingId &&
      this.selectedFloorId
    ) {
      this.devicesGetByZoneId(
        this.selectedProjectId,
        this.selectedCountryId,
        this.selectedAreaId,
        this.selectedBuildingId,
        this.selectedFloorId,
        zoneId
      );
    }
  }




  selectedItemId: string | number | null = null; // to store the clicked item's ID

  selectItem(id: string | number) {
    this.selectedItemId = id;
  }

  activeLevel: 'project' | 'country' | 'area' | 'building' | 'floor' | 'zone' | null = null;

  projectDevices: any[] = [];

  devicesGetByProjectId(projectId: any) {
    this.device.getDevicesByProject(projectId).subscribe({
      next: (res: any) => {
        this.projectDevices = res;
        this.areaDevices = [];
        this.countryDevices = []; // clear old country data
        this.activeLevel = 'project';
        this.cdr.detectChanges();
      },
      error: () => {
        console.log("error loading devicesbyproject")
      }
    })

  }


  countryDevices: any[] = []
  devicesGetByCountryId(projectId: any, countryId: any) {
    this.device.getDevicesByCountry(projectId, countryId).subscribe({
      next: (res: any) => {
        this.countryDevices = res;
        this.areaDevices = [];
        this.projectDevices = []; // clear project devices
        this.activeLevel = 'country';
        this.cdr.detectChanges();
      },
      error: () => {
        console.log("error loading devicesbyCountry")
      }
    })
  }

  areaDevices: any[] = [];

  devicesGetByAreaId(projectId: string, countryId: string, areaId: string) {
    this.device.getDevicesByArea(projectId, countryId, areaId).subscribe({
      next: (res: any) => {
        this.areaDevices = res;
        this.projectDevices = [];
        this.countryDevices = [];
        this.activeLevel = 'area';
        this.cdr.detectChanges();
      },
      error: () => {
        console.log("error loading devicesbyCountry")
      }
    })
  }

  buildingDevices: any[] = [];

  devicesGetByBuildingId(projectId: string, countryId: string, areaId: string, buildingId: string) {
    this.device.getDevicesByBuilding(projectId, countryId, areaId, buildingId).subscribe({
      next: (res: any) => {
        this.buildingDevices = res;
        // Clear other levels
        this.projectDevices = [];
        this.countryDevices = [];
        this.areaDevices = [];
        this.activeLevel = 'building';
        this.cdr.detectChanges();
      },
      error: () => {
        console.log("Error loading devices by building");
      }
    });
  }


  floorDevices: any[] = [];

  devicesGetByFloorId(projectId: string, countryId: string, areaId: string, buildingId: string, floorId: string) {
    this.device.getDevicesByFloor(projectId, countryId, areaId, buildingId, floorId).subscribe({
      next: (res: any) => {
        this.floorDevices = res;

        // clear other device arrays
        this.projectDevices = [];
        this.countryDevices = [];
        this.areaDevices = [];
        this.buildingDevices = [];

        this.activeLevel = 'floor';
        this.cdr.detectChanges();
      },
      error: () => {
        console.log("Error loading devices by floor");
      }
    });
  }

  zoneDevices: any[] = [];

  devicesGetByZoneId(
    projectId: string,
    countryId: string,
    areaId: string,
    buildingId: string,
    floorId: string,
    zoneId: string
  ) {
    this.device.getDevicesByZone(projectId, countryId, areaId, buildingId, floorId, zoneId).subscribe({
      next: (res: any) => {
        this.zoneDevices = res;
        this.projectDevices = [];
        this.countryDevices = [];
        this.areaDevices = [];
        this.buildingDevices = [];
        this.floorDevices = [];
        this.activeLevel = 'zone';
        this.cdr.detectChanges();
      },
      error: () => {
        console.log("Error loading devices by zone");
      }
    });
  }


  selectedDeviceId: string = '';
  deviceParameters: any[] = []; // holds API response parameters
  selectedParameters: Set<string> = new Set(); // to track checked boxes



  selectDevice(device: any) {
    this.selectedDeviceId = device.id;
      this.selectedDeviceMac = device.deviceUniqueId || ''; 
    this.loadDeviceParametersByDevice(device.id);
  }

  loadDeviceParametersByDevice(deviceId: string) {
    this.device.getDeviceParametersByDeviceId(deviceId).subscribe({
      next: (res: any) => {
        if (res && res.length > 0) {
          this.deviceParameters = res[0].deviceParameters || [];
        } else {
          this.deviceParameters = [];
        }
        this.cdr.detectChanges();
        console.log('Loaded Parameters:', this.deviceParameters);
      },
      error: (err) => {
        console.error('Error loading device parameters:', err);
        this.deviceParameters = [];
      }
    });
  }

  toggleParameterSelection(param: any) {
    if (this.selectedParameters.has(param.id)) {
      this.selectedParameters.delete(param.id);
    } else {
      if (this.selectedParameters.size >= 3) {
      this.loadingService.showToast('⚠️ You can select a maximum of 3 parameters only.', 'warning');
        return;
      }
      this.selectedParameters.add(param.id);
    }

    console.log('Selected Parameters:', Array.from(this.selectedParameters));
  }

  widgets: any[] = [];



  getDeviceNameById(deviceId: string): string {
    const allDevices = [
      ...this.projectDevices,
      ...this.countryDevices,
      ...this.areaDevices,
      ...this.buildingDevices,
      ...this.floorDevices,
      ...this.zoneDevices
    ];
    const device = allDevices.find(d => d.id === deviceId);
    return device ? device.deviceName : '';
  }


  selectedDeviceName: string = '';

  onDeviceCheckboxChange(event: any, device: any) {
    if (event.target.checked) {
      // ✅ When checkbox is checked
      this.selectedDeviceId = device.id;
      this.selectedDeviceName = device.deviceName;
      this.selectedDeviceMac = device.deviceUniqueId || '';

      console.log("✅ Selected Device:", device.deviceName);
      this.loadDeviceParametersByDevice(device.id);
    } else {
      // ✅ When checkbox is unchecked
      if (this.selectedDeviceId === device.id) {
        this.selectedDeviceId = '';
        this.selectedDeviceName = '';
      }
    }
  }


  resetDeviceSelection() {
    this.selectedDeviceId = '';
    this.selectedDeviceName = '';
    this.selectedDeviceMac = '';
    this.deviceParameters = [];
  }



  resetPopupData() {
    // Clear selected items
    this.selectedItemId = "";
    this.selectedDeviceId = "";
    this.selectedParameters = new Set();

    // Clear device lists
    this.projectDevices = [];
    this.countryDevices = [];
    this.areaDevices = [];
    this.buildingDevices = [];
    this.floorDevices = [];
    this.zoneDevices = [];
    this.deviceParameters = [];

    // Clear expansions
    this.expandedProjects.clear();
    this.expandedCountry.clear();
    this.expandedArea.clear();
    this.expandedBuilding.clear();
    this.expandedFloor.clear();
    this.expandedZone.clear();

    // Clear nested data
    this.countriesByProject = {};
    this.areaByCountry = {};
    this.buildingByArea = {};
    this.floorByBuilding = {};
    this.zoneByFloor = {};
    this.subZoneByZone = {};

    // Reset active level
    this.activeLevel = null;
  }


  private ws!: WebSocket;
  private wsUrl = 'ws://172.16.100.26:5202/ws/sensor';

  //private wsUrl = 'wss://phcc.purpleiq.ai/ws/ZoneCount';

  ngOnDestroy() {
    if (this.ws) this.ws.close();
  }

  


  // connectWebSocket() {
  //   this.ws = new WebSocket(this.wsUrl);

  //   this.ws.onopen = () => {
  //     console.log('✅ WebSocket Connected');

  //     // 🔥 HARD-CODE status = online for all widgets
  //     this.widgets.forEach((widget) => {
  //       let statusParam = widget.params.find(
  //         (p: any) => p.name.toLowerCase() === 'status'
  //       );

  //       if (statusParam) {
  //         statusParam.value = 'online';
  //       } else {
  //         widget.params.push({ name: 'Status', value: 'online' });
  //       }
  //     });

  //     this.cdr.detectChanges();
  //   };

  //   this.ws.onmessage = (event) => {
  //     try {
  //       const data = JSON.parse(event.data);

  //       // 🔥 Empty array → PeopleCount = 0 for all widgets
  //       if (Array.isArray(data) && data.length === 0) {
  //         console.log("📭 Empty update received. Setting PeopleCount = 0");

  //         this.widgets.forEach((widget) => {
  //           let countParam = widget.params.find(
  //             (p: any) => p.name.toLowerCase() === 'PeopleCount'
  //           );

  //           if (countParam) countParam.value = 0;
  //           // else widget.params.push({ name: 'PeopleCount', value: 0 });

  //            else widget.params.push({ name: 'PeopleCount', value: 0 });
  //         });

  //         this.cdr.detectChanges();
  //         return;
  //       }

  //       const updates = Array.isArray(data) ? data : [data];

  //       updates.forEach((update: any) => {
  //         const zoneId = (update.ZoneId || '').trim().toLowerCase();
  //         const count = update.Count ?? 0; // default 0

  //         console.log('📨 Received update:', update);

  //         const widget = this.widgets.find(
  //           (w) => w.deviceName.trim().toLowerCase() === zoneId
  //         );

  //         if (!widget?.params) return;

  //         // ZoneName
  //         let zoneParam = widget.params.find(
  //           (p: any) => p.name.toLowerCase() === 'zonename'
  //         );
  //         if (zoneParam) zoneParam.value = update.ZoneId;
  //         else widget.params.push({ name: 'ZoneName', value: update.ZoneId });

  //         // PeopleCount
  //         let countParam = widget.params.find(
  //           (p: any) => p.name.toLowerCase() === 'PeopleCount'
  //         );
  //         if (countParam) countParam.value = count;
  //         else widget.params.push({ name: 'PeopleCount', value: count });

  //         // 🔥 HARD-CODE status = online (always)
  //         let statusParam = widget.params.find(
  //           (p: any) => p.name.toLowerCase() === 'status'
  //         );
  //         if (statusParam) statusParam.value = 'online';
  //         else widget.params.push({ name: 'Status', value: 'online' });
  //       });

  //       this.cdr.detectChanges();
  //     } catch (err) {
  //       console.error('⚠️ WebSocket message parse error:', err);
  //     }
  //   };

  //   this.ws.onerror = (err) => console.error('❌ WebSocket Error:', err);

  //   this.ws.onclose = () => {
  //     console.warn('🔌 WebSocket Disconnected — retrying in 1s...');
  //     setTimeout(() => this.connectWebSocket(), 1000);
  //   };
  // }






// connectWebSocket() {
//   this.ws = new WebSocket(this.wsUrl);

//   this.ws.onopen = () => {
//     console.log('✅ WebSocket Connected');
//   };

//   this.ws.onmessage = (event) => {
//     try {
//       const data = JSON.parse(event.data);
//       const updates = Array.isArray(data) ? data : [data];

//       updates.forEach((update: any) => {
//         // Normalize mac_address from WebSocket to uppercase for comparison
//         const incomingMac = (update.mac_address || '').toUpperCase();

//         // Search through all widgets and their zoneSensors
//         this.widgets.forEach((widget: any) => {
//           const sensors = widget.zoneSensors || [];

//           sensors.forEach((sensor: any) => {
//             // Compare deviceUniqueId (uppercase) with incoming mac_address (uppercase)
//             const sensorMac = (sensor.deviceUniqueId || '').toUpperCase();

//             if (sensorMac !== incomingMac) return; // no match, skip

//             console.log(`📨 Match found: ${sensorMac} → updating ${sensor.deviceName}`);

//             const params = sensor.params || [];

//             // ── Temperature ────────────────────────────────────────────
//             const tempParam = params.find(
//               (p: any) => p.paramName.toLowerCase() === 'temperature'
//             );
//             if (tempParam) {
//               tempParam.value = update.last_temperature ?? '—';
//             }

//             // ── Battery Level ──────────────────────────────────────────
//             const batteryParam = params.find(
//               (p: any) => p.paramName.toLowerCase() === 'battery level'
//             );
//             if (batteryParam) {
//               batteryParam.value = update.battery_level ?? '—';
//             }

//             // ── Time Stamp ─────────────────────────────────────────────
//             const timeParam = params.find(
//               (p: any) => p.paramName.toLowerCase() === 'time stamp'
//             );
//             if (timeParam) {
//               timeParam.value = update.timestamp ?? '—';
//             }
//           });
//         });
//       });

//       this.cdr.detectChanges();
//     } catch (err) {
//       console.error('⚠️ WebSocket message parse error:', err);
//     }
//   };

//   this.ws.onerror = (err) => console.error('❌ WebSocket Error:', err);

//   this.ws.onclose = () => {
//     console.warn('🔌 WebSocket Disconnected — retrying in 1s...');
//     setTimeout(() => this.connectWebSocket(), 1000);
//   };
// }
utcToDubai(utcTimestamp: string): string {
  if (!utcTimestamp) return '—';
  const dubaiMs   = new Date(utcTimestamp).getTime() + 4 * 60 * 60 * 1000;
  const dubaiDate = new Date(dubaiMs);
  return dubaiDate.toLocaleString('en-GB', {
    day:      '2-digit',
    month:    'short',
    year:     'numeric',
    hour:     '2-digit',
    minute:   '2-digit',
    second:   '2-digit',
    hour12:   true,
    timeZone: 'UTC'
  });
}



connectWebSocket() {
  this.ws = new WebSocket(this.wsUrl);

  this.ws.onopen = () => {
    console.log('✅ WebSocket Connected');
  };

  this.ws.onmessage = (event) => {
    try {
      const data    = JSON.parse(event.data);
      const updates = Array.isArray(data) ? data : [data];

      updates.forEach((update: any) => {
        const incomingMac = (update.mac_address || '').toUpperCase();

        const widget = this.widgets.find(
          (w: any) => w.deviceUniqueId === incomingMac
        );

        if (!widget) return;

        console.log(`📨 Match: ${incomingMac} → ${widget.deviceName}`);

        // ── UTC → Dubai (UTC+4) ──────────────────────────────────────
        // Use Intl.DateTimeFormat with timeZone: 'Asia/Dubai' so the
        // browser does NOT apply the local IST offset on top of it.
        let dubaiTimeStr = '—';
        if (update.timestamp) {
          const utcDate = new Date(update.timestamp);
          dubaiTimeStr  = new Intl.DateTimeFormat('en-GB', {
            timeZone: 'Asia/Dubai',   // ← browser converts UTC → Dubai correctly
            day:      '2-digit',
            month:    'short',
            year:     'numeric',
            hour:     '2-digit',
            minute:   '2-digit',
            second:   '2-digit',
            hour12:   true
          }).format(utcDate);
        }

        // ── Update widget.params ──────────────────────────────────────
        widget.params.forEach((param: any) => {
          switch (param.name.toLowerCase()) {
            case 'temperature':
              param.value = update.last_temperature != null
                ? `${update.last_temperature} °C`
                : '—';
              break;

            case 'battery level':
              param.value = update.battery_level != null
                ? `${update.battery_level} %`
                : '—';
              break;

            case 'time stamp':
              param.value = dubaiTimeStr;   // ← correctly shifted, no double offset
              break;
          }
        });
      });

      this.cdr.detectChanges();
    } catch (err) {
      console.error('⚠️ WebSocket message parse error:', err);
    }
  };

  this.ws.onerror = (err) => console.error('❌ WebSocket Error:', err);
  this.ws.onclose = () => {
    console.warn('🔌 WebSocket Disconnected — retrying in 1s...');
    setTimeout(() => this.connectWebSocket(), 1000);
  };
}













  selectedWidgetId = ""
  showDeleteWidjet: boolean = false;
  cancelDelete() {
    this.showDeleteWidjet = false;
  }
  openDeleteWidget(widget: any) {
    // this.selectedWidgetId = widget.mainId;
    this.selectedWidgetId = widget.widgetId;
    this.showDeleteWidjet = true;

  }
  deleteWidget() {
    const deletedId = this.selectedWidgetId;

    this.device.deleteDashboardWidget(deletedId).subscribe({
      next: () => {
      this.loadingService.showToast('Widget Deleted successfully!', 'success');

        // ✅ REMOVE FROM UI IMMEDIATELY
        this.widgets = this.widgets.filter(
          w => w.widgetId !== deletedId
        );

        this.showDeleteWidjet = false;
        this.cdr.detectChanges();
      },
      error: (err) => {

        // backend returns 200 but empty body
        if (err.status === 200 || err.status === 204) {
          this.widgets = this.widgets.filter(
            w => w.widgetId !== deletedId
          );

         this.loadingService.showToast('Dashboard deleted successfully!', 'success');
          this.showDeleteWidjet = false;
          this.cdr.detectChanges();
          return;
        }

       this.loadingService.showToast('Error deleting widget', 'error');
      }
    });
  }



  showPopup: boolean = false;
  dashboardName: string = "";

  openPopup() {
    this.showPopup = true;
  }

  closePopup() {
    // console.log("Popup closing...");
    this.showPopup = false;
    this.dashboardName = "";
  }

  createDashboard() {

  const name = this.dashboardName.trim();

  if (!name) {
    this.loadingService.showToast('Please enter a dashboard name', 'error');
    return;
  }

  // 🔒 Case-insensitive duplicate check
  const exists = (this.dashboardData || []).some(
    (d: any) =>
      d.dashboardName?.trim().toLowerCase() === name.toLowerCase()
  );

  if (exists) {
    this.loadingService.showToast('Dashboard name already exists!', 'error');
    return;
  }

  this.role.CreateDashboardName(name).subscribe({
    next: (res) => {
       this.loadingService.showToast('Dashboard Created Successfully!', 'success');
      this.closePopup();

      // Reload dashboards
      this.loadDashboard();
      this.cdr.detectChanges();
    },
    error: (err) => {
      if (err.status === 409) {
       this.loadingService.showToast('Dashboard name already exists!', 'error');
      } else {
        this.loadingService.showToast('Failed to create dashboard!', 'error');
      }
    }
  });
}





  dashboardData: any;


  loadDashboard() {
    this.role.getDashboard(1).subscribe({
      next: (res) => {
        this.dashboardData = res;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error("Error loading dashboard", err);
      }
    });
  }


  deleteDashboard(item: any) {
    if (!item.id) {
      console.error("Dashboard ID not found");
      return;
    }

    this.role.DeleteDashboard(item.id).subscribe({
      next: () => {
        console.log("Dashboard deleted:", item.id);

        // Remove from UI instantly
        this.dashboardData = this.dashboardData.filter(
          (d: any) => d.id !== item.id
        );
      },
      error: (err) => {
        console.error("Error deleting dashboard:", err);
      }
    });
  }



  showDeletePopup: boolean = false;
  selectedItem: any = null;


  openDeletePopup(item: any) {
    this.selectedItem = item;   // store dashboard
    this.showDeletePopup = true;  // show popup
  }


  cancelDashboardDelete() {
    this.showDeletePopup = false;
    this.selectedItem = null;
  }


  confirmDeleteDashboard() {
    if (!this.selectedItem?.id) return;

    this.role.DeleteDashboard(this.selectedItem.id).subscribe({
      next: () => {

 this.loadingService.showToast('Dashboard deleted successfully!', 'success');

        this.dashboardData = this.dashboardData.filter(
          (d: any) => d.id !== this.selectedItem.id
        );

        this.showDeletePopup = false;
        this.selectedItem = null;

        this.cdr.detectChanges();
        this.loadDashboard();
      },
      error: (err) => {
        console.error("Error deleting dashboard:", err);
      }
    });
  }



  selectedDashboard: any = null;



  getDashboards() {
    this.role.getDashboard(this.role).subscribe((res: any) => {

      // ✅ ensure array
      this.dashboardData = res || [];

      // ✅ auto select first dashboard
      if (this.dashboardData.length > 0) {
        this.selectDashboard(this.dashboardData[0]);
      }
    });
  }



  selectDashboard(item: any) {
    this.selectedDashboard = item;

    // ✅ pass dashboard ID
    this.loadDashboardContent(item.id);
  }


  activeDashboardId: string | null = null;
  // widgets: any[] = [];

  // loadDashboardContent(dashboardId: string) {
  //   console.log('Loading dashboard content for ID:', dashboardId);

  //   this.activeDashboardId = dashboardId;

  //   this.role.getDashboardID(dashboardId).subscribe({
  //     next: (res: any) => {
  //       const data = res as any[];

  //       this.widgets = data
  //         .filter(d => d.dashboardId === dashboardId)
  //         .flatMap(d =>
  //           d.zoneSensors.map((sensor: any) => ({
  //             widgetId: d.id,                // ✅ REQUIRED
  //             deviceId: sensor.deviceId,
  //             deviceName: sensor.deviceName,
  //             params: sensor.params.map((p: any) => ({
  //               name: p.paramName,
  //               value: '-'
  //             }))
  //           }))
  //         );

  //       this.cdr.detectChanges();
  //     },
  //     error: (err) => {
  //       this.widgets = [];
  //     }
  //   });

  // }

loadDashboardContent(dashboardId: string) {
  console.log('Loading dashboard content for ID:', dashboardId);
  this.activeDashboardId = dashboardId;

  this.role.getDashboardID(dashboardId).subscribe({
    next: (res: any) => {
      const data = res as any[];

      this.widgets = data
        .filter(d => d.dashboardId === dashboardId)
        .flatMap(d =>
          d.zoneSensors.map((sensor: any) => ({
            widgetId:       d.id,
            deviceId:       sensor.deviceId,
            deviceName:     sensor.deviceName,
            deviceUniqueId: (sensor.deviceUniqueId || d.macAddress || '').toUpperCase(), // ← KEY FIX
            params: sensor.params.map((p: any) => ({
              name:  p.paramName,
              value: '-'
            }))
          }))
        );

      this.cdr.detectChanges();
    },
    error: () => {
      this.widgets = [];
    }
  });
}


showPersonalWidgets = false;

togglePersonal() {
  this.showPersonalWidgets = !this.showPersonalWidgets;
}

personalWidgets = [
  { label: 'Worked This Week', selected: false },
  { label: 'Worked Today', selected: false },
  { label: 'Battery Status', selected: false },
  { label: 'Type of People', selected: false },
  { label: 'Building and Floor', selected: false },
  { label: 'Average Hours / Member', selected: false },
  { label: 'Field Status', selected: false },
  { label: 'Total No.of Zone', selected: false },
  { label: 'Recent Activity', selected: false },
  { label: 'Projects', selected: false },
  { label: 'Alerts', selected: false },
  { label: 'Time Sheet', selected: false },
  { label: 'Man Down', selected: false },
  { label: 'Reader Status', selected: false },
  { label: 'Reader Type', selected: false },
  { label: 'SOS', selected: false },
  { label: 'Evacuation and Mustering', selected: false },
  { label: 'Top Exit Point', selected: false }
];













selectedDeviceMac: string = '';
// When user selects a device
onDeviceSelect(deviceId: string) {
  this.selectedDeviceId = deviceId;
  const device = this.projectDevices.find(d => d.id === deviceId);
  this.selectedDeviceMac = device?.deviceUniqueId || '';
}




















// ============================================
// STEP 1: Update your createWidgets() method
// ============================================

// Replace your existing createWidgets() with this:

createWidgets() {
  // ✅ Check if any personal widgets are selected
  const selectedPersonalWidgets = this.personalWidgets.filter(w => w.selected);
  
  // Check if device is selected
  const hasDeviceSelection = this.selectedDeviceId && this.selectedParameters.size > 0;
  const hasPersonalSelection = selectedPersonalWidgets.length > 0;
  
  // Validate
  if (!hasDeviceSelection && !hasPersonalSelection) {
    this.loadingService.showToast('Please select at least one device with parameters OR one personal widget.', 'warning');
    return;
  }

  // ✅ HANDLE PERSONAL WIDGETS (NEW CODE)
  if (hasPersonalSelection) {
    selectedPersonalWidgets.forEach(widget => {
      // Get default params based on widget name
      const params = this.getParamsForPersonalWidget(widget.label);
      
      const payload = {
        id: "",
        projectId: this.selectedProjectId || "",
          macAddress: this.selectedDeviceMac,
        countryId: this.selectedCountryId || "",
        areaId: this.selectedAreaId || "",
        buildingId: this.selectedBuildingId || "",
        floorId: this.selectedFloorId || "",
        zoneId: this.selectedFloorId || "",
        zone: "",
        dashboardId: this.selectedDashboard?.id ?? "",
        dashboardName: this.selectedDashboard?.dashboardName ?? "",
      
        zoneSensors: [
          {
            deviceId: "personal-widget",
            deviceName: widget.label,
            params: params
          }
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      console.log("🟢 Creating Personal Widget:", payload);

      // Create the widget
      this.device.createZoneSensor(payload).subscribe({
        next: (res) => {
          console.log("✅ Widget Created:", res);
          widget.selected = false; // Uncheck after creation
          
          // Refresh dashboard
          if (this.selectedDashboard?.id) {
            this.loadDashboardContent(this.selectedDashboard.id);
          }
        },
        error: (err) => {
          console.error("❌ Error:", err);
        this.loadingService.showToast('Failed to create widget!', 'error');
        }
      });
    });

    this.closeAddWidgetPopup();
  this.loadingService.showToast('Widget created successfully!', 'success');
    return;
  }

  // ✅ YOUR EXISTING DEVICE WIDGET CODE STAYS HERE (DON'T CHANGE IT)
  if (hasDeviceSelection) {
    const selectedDeviceName = this.getDeviceNameById(this.selectedDeviceId);

    const selectedParams = Array.from(this.selectedParameters)
      .map(paramId => this.deviceParameters.find(p => p.id === paramId))
      .filter(p => !!p)
      .map(p => ({
        paramId: p!.id,
        paramName: p!.name
      }));

    const payload = {
      id: "",
      projectId: this.selectedProjectId,
      countryId: this.selectedCountryId,
      areaId: this.selectedAreaId,
      buildingId: this.selectedBuildingId,
      floorId: this.selectedFloorId,
      zoneId: this.selectedFloorId ?? "",
      zone: "",
      dashboardId: this.selectedDashboard?.id ?? "",
      dashboardName: this.selectedDashboard?.dashboardName ?? "",
       macAddress: this.selectedDeviceMac, // ADD THIS
      zoneSensors: [
        {
          deviceId: this.selectedDeviceId,
          deviceName: selectedDeviceName,
           deviceUniqueId: this.selectedDeviceMac, 
          params: selectedParams
        }
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    console.log("🟢 Zone Sensor Payload:", payload);

    this.device.createZoneSensor(payload).subscribe({
      next: (res) => {
        console.log("✅ ZoneSensor Created Successfully:", res);
        this.closeAddWidgetPopup();
        
        if (this.selectedDashboard?.id) {
          this.loadDashboardContent(this.selectedDashboard.id);
        }

        setTimeout(() => {
      this.loadingService.showToast('Zone Sensor created successfully!', 'success');
        }, 0);
      },
      error: (err) => {
        console.error("❌ Error creating zone sensor:", err);
      this.loadingService.showToast('Failed to create zone sensor!', 'error');
      }
    });
  }
}


getParamsForPersonalWidget(widgetName: string): any[] {
  switch (widgetName) {
    case 'Worked This Week':
      return [
        { paramName: 'NoOfWorkers', paramId: 'now' },
        { paramName: 'WorkPercentage', paramId: 'wp' },
        { paramName: 'ComparitivePercentage', paramId: 'cp' }
      ];
    
    case 'Worked Today':
      return [
        { paramName: 'NoOfWorkers', paramId: 'now-today' },
        { paramName: 'WorkPercentage', paramId: 'wp-today' }
      ];
    
    case 'Battery Status':
      return [
        { paramName: 'BatteryLevel', paramId: 'battery' }
      ];
    
    case 'Type of People':
      return [
        { paramName: 'Contractors', paramId: 'contractors' },
        { paramName: 'Visitors', paramId: 'visitors' },
        { paramName: 'Staff', paramId: 'staff' }
      ];
    
    // Add more personal widgets here as needed
    default:
      return [];
  }
}








}