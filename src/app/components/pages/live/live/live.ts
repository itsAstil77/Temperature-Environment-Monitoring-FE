import { CommonModule } from '@angular/common';
import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { Roleservice } from '../../../service/role/roleservice';
import * as L from 'leaflet';

import { FormsModule } from '@angular/forms';
import { Device } from '../../../service/device/device';
import { Peopleservice } from '../../../service/people/peopleservice';
import { Peopletype } from '../../../service/peopletype/peopletype';
import { Assetservice } from '../../../service/asset/assetservice';

interface PlacedDevice {
  id: string;
  name: string;
  x: number;
  y: number;
}


@Component({
  selector: 'app-live',
  imports: [CommonModule, FormsModule],
  templateUrl: './live.html',
  styleUrl: './live.css'
})
export class Live implements OnInit, AfterViewInit {


  @ViewChild('dropdownContainer') dropdownContainer!: ElementRef;



  constructor(private role: Roleservice, private cdr: ChangeDetectorRef, private device: Device, private peopleservice: Peopleservice, private peopletype: Peopletype, private assetservice: Assetservice) { }


  selectedTimeRange: string = 'day';
  hours: string[] = [];
  selectedHour: string = '';
  showHourInputs: boolean = false;
  savedMappingId: string = '';


  hourMap: { [key: string]: number } = {
    // Day options
    // 'Live': 0,
    '1 Hour': 1,
    '2 Hours': 2,
    '8 Hours': 8,
    '24 Hours': 24,

    // Week options
    '1 Day': 1,
    '2 Days': 2,
    '5 Days': 5,
    '7 Days': 7,
    '15 Days': 15,
    '30 Days': 30
  };


  ngOnInit(): void {
    this.loadProject();
    this.setDefaultTimeRange();
    this.savedMappingId = localStorage.getItem("savedMappingId") || "";
    this.connectWebSocket();


    delete (L.Icon.Default.prototype as any)._getIconUrl;

    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'assets/leaflet/marker-icon-2x.png',
      iconUrl: 'assets/leaflet/marker-icon.png',
      shadowUrl: 'assets/leaflet/marker-shadow.png',
    });
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
  private map: any;

  moveToLocation(lat: number, lng: number, zoom: number = 10, name?: string): void {
    if (!this.map) return;

    this.map.flyTo([lat, lng], zoom, { animate: true, duration: 1.5 });

    // Default icon will now work in production
    L.marker([lat, lng])
      .addTo(this.map)
      .bindPopup(name ? `<b>${name}</b>` : `Lat: ${lat}, Lng: ${lng}`)
      .openPopup();
  }

  ngAfterViewInit(): void {


    if (typeof window === 'undefined') return;

    this.map = L.map('map').setView([13.0827, 80.2707], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19
    }).addTo(this.map);

    this.map.on('click', (e: L.LeafletMouseEvent) => {
      if (!this.placingDevice || !this.selectedDeviceId) return;

      // store the clicked position
      this.tempDeviceLatLng = e.latlng;

      // show the popup
      this.showDevicePopup = true;
      this.showAreaDevicePopup = true;

      // stop placement until user clicks Apply/Cancel
      this.placingDevice = false;
    });
  }
  // store where the device is clicked
  tempDeviceLatLng!: L.LatLng;

  openPlacementPopup(latlng: L.LatLng) {
    const popupContent = `
    <div class="popup-actions">
      <button id="applyBtn">Apply</button>
      <button id="cancelBtn">Cancel</button>
    </div>
  `;

    const popup = L.popup()
      .setLatLng(latlng)
      .setContent(popupContent)
      .openOn(this.map);

    setTimeout(() => {
      document.getElementById('applyBtn')?.addEventListener('click', () => {
        this.placeDevice(latlng);
        this.map.closePopup();
      });

      document.getElementById('cancelBtn')?.addEventListener('click', () => {
        this.map.closePopup();
      });
    });
  }
  placeDevice(latlng: L.LatLng) {
    this.placingDevice = false;

    const marker = L.marker(latlng, {
      icon: L.icon({
        iconUrl: 'assets/device-icon.png',
        iconSize: [32, 32],
        iconAnchor: [16, 32]
      })
    }).addTo(this.map);



    // Save for API
    const geoJson = {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [latlng.lng, latlng.lat]
          },
          properties: {
            deviceName: 'Device 1'
          }
        }
      ]
    };

    console.log('Send this to API:', geoJson);
  }


  // Store parent-level coordinates for reverse movement
  locationCache: {
    project?: { lat: number, lng: number, zoom: number, name?: string };
    country?: { lat: number, lng: number, zoom: number, name?: string };
    area?: { lat: number, lng: number, zoom: number, name?: string };
    building?: { lat: number, lng: number, zoom: number, name?: string };
  } = {};


  // loadCountries(projectId: string) {
  //   this.selectedProjectId = projectId;

  //   // ✅ If already expanded, collapse it
  //   if (this.expandedProjects.has(projectId)) {
  //     this.expandedProjects.delete(projectId);
  //     return;
  //   }

  //   // ✅ 1. FIRST: Load project on map
  //   const project = this.projects.find(p => p.id === projectId);
  //   if (project?.latitude && project?.longitude) {
  //     this.moveToLocation(
  //       project.latitude,
  //       project.longitude,
  //       project.zoomLevel || 8,
  //       project.projectName
  //     );
  //   }

  //   // ✅ 2. THEN: Expand countries
  //   this.role.countryGetById(projectId).subscribe({
  //     next: (res: any) => {
  //       this.countriesByProject[projectId] = Array.isArray(res) ? res : [];

  //       this.activeLevel = 'project';
  //       this.devicesGetByProjectId(projectId);

  //       this.expandedProjects.add(projectId);
  //       this.cdr.detectChanges();
  //     },
  //     error: err => console.error("Error loading countries:", err)
  //   });
  // }




  // Cache areas per country
  
  
  loadCountries(projectId: string) {
  this.selectedProjectId = projectId;

  if (this.expandedProjects.has(projectId)) {
    this.expandedProjects.delete(projectId);

    // ✅ Move map back to project location
    const project = this.projects.find(p => p.id === projectId);
    if (project?.latitude && project?.longitude) {
      this.moveToLocation(project.latitude, project.longitude, project.zoomLevel || 8, project.projectName);
    }

    // ✅ Reset all children
    this.expandedCountry.clear();
    this.expandedArea.clear();
    this.expandedBuilding.clear();
    this.expandedFloor.clear();
    this.expandedZone.clear();
    this.floorImage = null;
    this.zoneImage = null;
    this.subZoneImage = null;
    this.polygons = [];
    this.polygonsByZone = {};
    this.placedDevices = [];
    this.zoneClickAreas = [];
    this.cdr.detectChanges();
    return;
  }

  // ✅ rest of your existing expand code unchanged
  const project = this.projects.find(p => p.id === projectId);
  if (project?.latitude && project?.longitude) {
    this.moveToLocation(project.latitude, project.longitude, project.zoomLevel || 8, project.projectName);
  }

  this.role.countryGetById(projectId).subscribe({
    next: (res: any) => {
      this.countriesByProject[projectId] = Array.isArray(res) ? res : [];
      this.activeLevel = 'project';
      this.devicesGetByProjectId(projectId);
      this.expandedProjects.add(projectId);
      this.cdr.detectChanges();
    },
    error: err => console.error("Error loading countries:", err)
  });
}
  
  areaByCountry: { [countryId: string]: any[] } = {};

  expandedCountry: Set<string> = new Set();

  // loadArea(countryId: string) {
  //   this.selectedCountryId = countryId;

  //   // ✅ If already expanded, collapse it
  //   if (this.expandedCountry.has(countryId)) {
  //     this.expandedCountry.delete(countryId);
  //     return;
  //   }

  //   // ✅ 1. FIRST: Find and load country on map
  //   for (const countries of Object.values(this.countriesByProject)) {
  //     const country = (countries as any[]).find(c => c.id === countryId);
  //     if (country?.latitude && country?.longitude) {
  //       this.moveToLocation(
  //         country.latitude,
  //         country.longitude,
  //         country.zoomLevel || 10,
  //         country.countryName
  //       );
  //       break;
  //     }
  //   }

  //   // ✅ 2. THEN: Expand areas
  //   this.role.getSummary(countryId).subscribe({
  //     next: (res: any) => {
  //       this.areaByCountry[countryId] = Array.isArray(res) ? res : [];

  //       this.activeLevel = 'country';
  //       this.devicesGetByCountryId(this.selectedProjectId, countryId);

  //       this.expandedCountry.add(countryId);
  //       this.cdr.detectChanges();
  //     },
  //     error: () => console.error("Error loading areas")
  //   });
  // }

  // Store building per area
  
  
  loadArea(countryId: string) {
   this.selectedCountryId = countryId;

  if (this.expandedCountry.has(countryId)) {
    this.expandedCountry.delete(countryId);

    // ✅ Move map back to country location
    for (const countries of Object.values(this.countriesByProject)) {
      const country = (countries as any[]).find(c => c.id === countryId);
      if (country?.latitude && country?.longitude) {
        this.moveToLocation(country.latitude, country.longitude, country.zoomLevel || 10, country.countryName);
        break;
      }
    }

    // ✅ Reset all children
    this.expandedArea.clear();
    this.expandedBuilding.clear();
    this.expandedFloor.clear();
    this.expandedZone.clear();
    this.floorImage = null;
    this.zoneImage = null;
    this.subZoneImage = null;
    this.polygons = [];
    this.polygonsByZone = {};
    this.placedDevices = [];
    this.zoneClickAreas = [];
    this.cdr.detectChanges();
    return;
  }
  // ✅ rest of your existing expand code unchanged
  for (const countries of Object.values(this.countriesByProject)) {
    const country = (countries as any[]).find(c => c.id === countryId);
    if (country?.latitude && country?.longitude) {
      this.moveToLocation(country.latitude, country.longitude, country.zoomLevel || 10, country.countryName);
      break;
    }
  }

  this.role.getSummary(countryId).subscribe({
    next: (res: any) => {
      this.areaByCountry[countryId] = Array.isArray(res) ? res : [];
      this.activeLevel = 'country';
      this.devicesGetByCountryId(this.selectedProjectId, countryId);
      this.expandedCountry.add(countryId);
      this.cdr.detectChanges();
    },
    error: () => console.error("Error loading areas")
  });
}
  
  buildingByArea: { [areaId: string]: any[] } = {};

  expandedArea: Set<string> = new Set();


  // loadBuilding(areaId: string) {
  //   this.getAreaBasedZone(areaId);
  //   this.loadDevicesByArea(areaId);
  //   this.selectedAreaId = areaId;

  //   // ✅ If already expanded, collapse it
  //   if (this.expandedArea.has(areaId)) {
  //     this.expandedArea.delete(areaId);
  //     return;
  //   }

  //   // ✅ 1. FIRST: Find and load area on map
  //   for (const areas of Object.values(this.areaByCountry)) {
  //     const area = (areas as any[]).find(a => a.id === areaId);
  //     if (area?.latitude && area?.longitude) {
  //       this.moveToLocation(
  //         area.latitude,
  //         area.longitude,
  //         area.zoomLevel || 10,
  //         area.areaName
  //       );
  //       break;

  //     }
  //     this.cdr.detectChanges();
  //   }

  //   // ✅ 2. THEN: Expand buildings
  //   this.role.getBuilding(areaId).subscribe({
  //     next: (res: any) => {
  //       this.buildingByArea[areaId] = Array.isArray(res) ? res : [];

  //       this.activeLevel = 'area';
  //       this.devicesGetByAreaId(this.selectedProjectId, this.selectedCountryId, areaId);

  //       this.expandedArea.add(areaId);
  //       this.cdr.detectChanges();
  //     },
  //     error: () => console.error("Error loading building")
  //   });
  // }


  loadBuilding(areaId: string) {
 this.getAreaBasedZone(areaId);
  this.loadDevicesByArea(areaId);
  this.selectedAreaId = areaId;

  if (this.expandedArea.has(areaId)) {
    this.expandedArea.delete(areaId);

    // ✅ Move map back to area location
    for (const areas of Object.values(this.areaByCountry)) {
      const area = (areas as any[]).find(a => a.id === areaId);
      if (area?.latitude && area?.longitude) {
        this.moveToLocation(area.latitude, area.longitude, area.zoomLevel || 10, area.areaName);
        break;
      }
    }

    // ✅ Reset all children
    this.expandedBuilding.clear();
    this.expandedFloor.clear();
    this.expandedZone.clear();
    this.floorImage = null;
    this.zoneImage = null;
    this.subZoneImage = null;
    this.polygons = [];
    this.polygonsByZone = {};
    this.placedDevices = [];
    this.zoneClickAreas = [];
    this.cdr.detectChanges();
    return;
  }

  // ✅ rest of your existing expand code unchanged
  for (const areas of Object.values(this.areaByCountry)) {
    const area = (areas as any[]).find(a => a.id === areaId);
    if (area?.latitude && area?.longitude) {
      this.moveToLocation(area.latitude, area.longitude, area.zoomLevel || 10, area.areaName);
      break;
    }
    this.cdr.detectChanges();
  }

  this.role.getBuilding(areaId).subscribe({
    next: (res: any) => {
      this.buildingByArea[areaId] = Array.isArray(res) ? res : [];
      this.activeLevel = 'area';
      this.devicesGetByAreaId(this.selectedProjectId, this.selectedCountryId, areaId);
      this.expandedArea.add(areaId);
      this.cdr.detectChanges();
    },
    error: () => console.error("Error loading building")
  });
}
  floors: any[] = [];
  floorByBuilding: { [buildingId: string]: any[] } = {};
  expandedBuilding: Set<string> = new Set();
  floorImage: string | null = null;
  zoneImage: string | null = null;
  subZoneImage: string | null = null;




  // loadFloor(buildingId: string, building?: any) {  // ✅ Accept building object
  //   this.selectedBuildingId = buildingId;

  //   // ✅ COLLAPSE LOGIC
  //   if (this.expandedBuilding.has(buildingId)) {
  //     this.expandedBuilding.delete(buildingId);
  //     this.floorImage = null;
  //     this.clearPolygons();

  //     // 🔁 Move map back to building's location
  //     // First try passed building object
  //     if (building?.latitude && building?.longitude) {
  //       this.moveToLocation(
  //         building.latitude,
  //         building.longitude,
  //         building.zoomLevel || 10,
  //         building.buildingName
  //       );
  //     } else {
  //       // Fallback: search in buildingByArea
  //       for (const areaBuildings of Object.values(this.buildingByArea)) {
  //         const parentBuilding = (areaBuildings as any[]).find(b => b.id === buildingId);
  //         if (parentBuilding?.latitude && parentBuilding?.longitude) {
  //           this.moveToLocation(
  //             parentBuilding.latitude,
  //             parentBuilding.longitude,
  //             parentBuilding.zoomLevel || 10,
  //             parentBuilding.buildingName
  //           );
  //           break;
  //         }
  //       }
  //     }

  //     this.activeLevel = 'building';
  //     this.devicesGetByBuildingId(
  //       this.selectedProjectId!,
  //       this.selectedCountryId!,
  //       this.selectedAreaId!,
  //       buildingId
  //     );

  //     this.cdr.detectChanges();
  //     return;
  //   }

  //   // ✅ 1. FIRST: Load BUILDING on map using passed object
  //   if (building?.latitude && building?.longitude) {
  //     this.moveToLocation(
  //       building.latitude,
  //       building.longitude,
  //       building.zoomLevel || 10,
  //       building.buildingName
  //     );
  //   } else {
  //     // Fallback: search in buildingByArea (shouldn't be needed on first click)
  //     for (const areaBuildings of Object.values(this.buildingByArea)) {
  //       const foundBuilding = (areaBuildings as any[]).find(b => b.id === buildingId);
  //       if (foundBuilding?.latitude && foundBuilding?.longitude) {
  //         this.moveToLocation(
  //           foundBuilding.latitude,
  //           foundBuilding.longitude,
  //           foundBuilding.zoomLevel || 10,
  //           foundBuilding.buildingName
  //         );
  //         break;
  //       }
  //     }
  //   }

  //   // ✅ 2. THEN: Expand floors
  //   this.role.getFloor(buildingId).subscribe({
  //     next: (res: any) => {
  //       const data = Array.isArray(res) ? res : [];
  //       this.floorByBuilding[buildingId] = data;
  //       this.expandedBuilding.add(buildingId);

  //       // Don't show floor image when expanding building
  //       this.floorImage = null;  // ✅ Changed: don't load floor image yet
  //       this.zoneImage = null;
  //       this.subZoneImage = null;
  //       this.clearPolygons();

  //       this.activeLevel = 'building';

  //       // ✅ Load devices for building
  //       this.devicesGetByBuildingId(
  //         this.selectedProjectId!,
  //         this.selectedCountryId!,
  //         this.selectedAreaId!,
  //         buildingId
  //       );

  //       this.cdr.detectChanges();
  //     },
  //     error: () => console.error('Error loading floor'),
  //   });
  // }


loadFloor(buildingId: string, building?: any) {
  this.selectedBuildingId = buildingId;

  if (this.expandedBuilding.has(buildingId)) {
    this.expandedBuilding.delete(buildingId);

    // ✅ Reset all children
    this.expandedFloor.clear();
    this.expandedZone.clear();
    this.floorImage = null;
    this.zoneImage = null;
    this.subZoneImage = null;
    this.polygons = [];
    this.polygonsByZone = {};
    this.placedDevices = [];
    this.zoneClickAreas = [];

    // ✅ your existing map move back logic unchanged
    if (building?.latitude && building?.longitude) {
      this.moveToLocation(building.latitude, building.longitude, building.zoomLevel || 10, building.buildingName);
    } else {
      for (const areaBuildings of Object.values(this.buildingByArea)) {
        const parentBuilding = (areaBuildings as any[]).find(b => b.id === buildingId);
        if (parentBuilding?.latitude && parentBuilding?.longitude) {
          this.moveToLocation(parentBuilding.latitude, parentBuilding.longitude, parentBuilding.zoomLevel || 10, parentBuilding.buildingName);
          break;
        }
      }
    }

    this.activeLevel = 'building';
    this.devicesGetByBuildingId(this.selectedProjectId!, this.selectedCountryId!, this.selectedAreaId!, buildingId);
    this.cdr.detectChanges();
    return;
  }

  // ✅ rest of your existing expand code unchanged
  if (building?.latitude && building?.longitude) {
    this.moveToLocation(building.latitude, building.longitude, building.zoomLevel || 10, building.buildingName);
  } else {
    for (const areaBuildings of Object.values(this.buildingByArea)) {
      const foundBuilding = (areaBuildings as any[]).find(b => b.id === buildingId);
      if (foundBuilding?.latitude && foundBuilding?.longitude) {
        this.moveToLocation(foundBuilding.latitude, foundBuilding.longitude, foundBuilding.zoomLevel || 10, foundBuilding.buildingName);
        break;
      }
    }
  }

  this.role.getFloor(buildingId).subscribe({
    next: (res: any) => {
      const data = Array.isArray(res) ? res : [];
      this.floorByBuilding[buildingId] = data;
      this.expandedBuilding.add(buildingId);
      this.floorImage = null;
      this.zoneImage = null;
      this.subZoneImage = null;
      this.clearPolygons();
      this.activeLevel = 'building';
      this.devicesGetByBuildingId(this.selectedProjectId!, this.selectedCountryId!, this.selectedAreaId!, buildingId);
      this.cdr.detectChanges();
    },
    error: () => console.error('Error loading floor'),
  });
}

  zones: any[] = [];
  zoneByFloor: { [floorId: string]: any[] } = {};
  expandedFloor: Set<string> = new Set();



  loadZones(floorId: string) {
    this.selectedFloorId = floorId;

    // 🟡 COLLAPSE LOGIC (go back from zone → floor)
    if (this.expandedFloor.has(floorId)) {
      this.expandedFloor.delete(floorId);
      this.zoneImage = null;
      this.clearPolygons();

      // 🔁 Restore floor image
      for (const floors of Object.values(this.floorByBuilding)) {
        const parentFloor = (floors as any[]).find(f => f.id === floorId);
        if (parentFloor?.uploadMap) {
          this.floorImage = parentFloor.uploadMap;
        }

        // 🔁 Move to floor location
        if (parentFloor?.latitude && parentFloor?.longitude) {
          this.moveToLocation(
            parentFloor.latitude,
            parentFloor.longitude,
            parentFloor.zoomLevel || 10,
            parentFloor.floorName
          );
        }

        if (parentFloor) break;
      }

      this.activeLevel = 'floor';

      // ✅ Load devices for this floor (when collapsing zones)
      this.devicesGetByFloorId(
        this.selectedProjectId!,
        this.selectedCountryId!,
        this.selectedAreaId!,
        this.selectedBuildingId!,
        floorId
      );
      this.loadPolygonsByFloor(floorId);
      this.loadDevicesByFloor(floorId);

      this.cdr.detectChanges();
      return;
    }

    // ✅ 1. FIRST: Find and load FLOOR on map
    for (const floors of Object.values(this.floorByBuilding)) {
      const floor = (floors as any[]).find(f => f.id === floorId);
      if (floor?.latitude && floor?.longitude) {
        this.moveToLocation(
          floor.latitude,
          floor.longitude,
          floor.zoomLevel || 10,
          floor.floorName
        );
        break;
      }
    }

    // ✅ 2. THEN: Expand zones
    this.role.getZones(floorId).subscribe({
      next: (res: any) => {
        const data = Array.isArray(res) ? res : [];

        // 🗂️ Store zones grouped by floor
        this.zoneByFloor[floorId] = data;
        this.zoneByFloor = { ...this.zoneByFloor }; // force change detection

        // ✅ Mark this floor as expanded
        this.expandedFloor.add(floorId);

        // 🖼️ Update map images
        this.zoneImage = data.length ? data[0].uploadMap : null;
        this.floorImage = null;
        this.subZoneImage = null;
        this.clearPolygons();

        // 🏷️ Update active level
        this.activeLevel = 'floor'; // ✅ Keep as 'floor' since we're showing floor devices

        // ✅ Fetch devices for this floor (after zones load)
        this.devicesGetByFloorId(
          this.selectedProjectId!,
          this.selectedCountryId!,
          this.selectedAreaId!,
          this.selectedBuildingId!,
          floorId
        );

        this.loadPolygonsByFloor(floorId);
        this.loadDevicesByFloor(floorId);

        // ✅ Call floor report API when zones are expanded
        if (this.selectedTimeRange === 'day') {
          this.loadFloorReportByHours();
        } else {
          this.loadFloorReportByDays();
        }

        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading zones:', err);
      },
    });
  }
  subZones: any[] = [];

  subZoneByZone: { [zoneId: string]: any[] } = {};

  expandedZone: Set<string> = new Set();

  selectedZoneId: string = "";
  selectedZoneName: string = "";


  loadSubZones(zoneId: string) {
    const zone = this.zoneByFloor[this.selectedFloorId]?.find(z => z.id === zoneId);
    this.selectedZoneId = zoneId;
    this.selectedZoneName = zone?.zoneName || '';

    // ------------------- COLLAPSE LOGIC -------------------
    if (this.expandedZone.has(zoneId)) {
      this.expandedZone.delete(zoneId);
      this.subZoneImage = null;

      this.clearPolygons();

      // 🔄 Load parent zone map (fresh map from API)
      this.getZoneImageByZoneid(zoneId);

      this.activeLevel = 'zone';
      this.loadSavedPolygonsForZone(zoneId);
      this.loadDevicesByZone(zoneId);
      this.fetchZoneMapping(zoneId);
      this.cdr.detectChanges();
      return;
    }

    // ------------------- EXPAND LOGIC -------------------
    this.role.getSubZones(zoneId).subscribe({
      next: (res: any) => {
        const data = Array.isArray(res) ? res : [];

        this.subZoneByZone[zoneId] = data;
        this.expandedZone.add(zoneId);

        this.clearPolygons();

        if (data.length > 0) {
          // 🟢 SHOW SUB-ZONE IMAGE
          this.subZoneImage = data[0].uploadMap;
          this.floorImage = null;
          this.zoneImage = null;
        } else {
          // 🟠 NO SUBZONES → USE ZONE MAP API
          this.getZoneImageByZoneid(zoneId);
          this.loadDevicesByZone(zoneId);
          this.cdr.detectChanges();
        }

        this.activeLevel = 'zone';
        this.loadSavedPolygonsForZone(zoneId);
        this.fetchZoneMapping(zoneId);
      },

      error: () => {
        // 🟠 API FAILED → still try to load zone map
        this.getZoneImageByZoneid(zoneId);
        this.loadDevicesByZone(zoneId);
        this.loadSavedPolygonsForZone(zoneId);
        this.fetchZoneMapping(zoneId);
        this.cdr.detectChanges();
      }
    });
  }



  setDefaultTimeRange() {
    switch (this.selectedTimeRange) {
      case 'day':
        // this.hours = ['Live', '1 Hour', '2 Hours', '8 Hours', '24 Hours'];
        this.hours = ['Live']
        this.selectedHour = 'Live';
        break;

      case 'week':
        this.hours = ['1 Day', '2 Days', '5 Days', '7 Days'];
        this.selectedHour = '1 Day';
        break;

      case 'month':
        this.hours = ['15 Days', '30 Days'];
        this.selectedHour = '15 Days';
        break;
    }
    this.showHourInputs = true;
  }

  @ViewChild('drawingCanvas') drawingCanvas!: ElementRef<HTMLCanvasElement>;
  private ctx!: CanvasRenderingContext2D;
  private polygons: {
    points: { x: number; y: number }[]; color: string; label?: string;
    zoneId?: string; deviceUniqueId?: string;
  }[] = [];
  private tempPoints: { x: number; y: number }[] = [];
  currentColor: string = '#ff0000';

  // Initialize canvas
  initializeCanvas() {
    setTimeout(() => {
      const canvas = this.drawingCanvas?.nativeElement;
      if (!canvas) return;
      this.ctx = canvas.getContext('2d')!;
      canvas.width = this.getImageWidth();
      canvas.height = this.getImageHeight();
      this.redrawCanvas();
    }, 200);
  }

  onImageLoad(event: Event) {
    const img = event.target as HTMLImageElement;
    const canvas = this.drawingCanvas.nativeElement;
    canvas.width = img.clientWidth;
    canvas.height = img.clientHeight;
    this.ctx = canvas.getContext('2d')!;
    this.redrawCanvas();

  }



  // Double-click to complete polygon
  @HostListener('dblclick', ['$event'])
  onDoubleClick(event: MouseEvent) {
    if (this.tempPoints.length >= 3) {
      this.polygons.push({
        points: [...this.tempPoints],
        color: this.currentColor,
      });
    }
    this.tempPoints = [];
    this.redrawCanvas();
  }





  clearPolygons() {
    this.polygons = [];
    this.tempPoints = [];
    this.polygonCompleted = false;
  }


  setColor(event: any) {
    this.currentColor = event.target.value;

    this.isPolygonDrawingEnabled = true; // ✅ enable drawing
    this.polygonCompleted = false;       // reset state
    this.tempPoints = [];

    this.redrawCanvas();
  }


  isPolygonDrawingEnabled = false;

  enablePolygonDrawing() {
    this.isPolygonDrawingEnabled = true;
  }



  redrawCanvas() {
    if (!this.ctx) return;
    const canvas = this.drawingCanvas.nativeElement;
    this.ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw saved polygons
    this.polygons.forEach((poly) => {
      // Draw polygon
      this.ctx.fillStyle = poly.color + '40';
      this.ctx.strokeStyle = poly.color;
      this.ctx.lineWidth = 2;
      this.ctx.beginPath();
      this.ctx.moveTo(poly.points[0].x, poly.points[0].y);
      for (let i = 1; i < poly.points.length; i++) {
        this.ctx.lineTo(poly.points[i].x, poly.points[i].y);
      }
      this.ctx.closePath();
      this.ctx.fill();
      this.ctx.stroke();

      if (poly.label) {
        // Calculate centroid
        const centroid = poly.points.reduce(
          (acc, pt) => {
            acc.x += pt.x;
            acc.y += pt.y;
            return acc;
          },
          { x: 0, y: 0 }
        );
        centroid.x /= poly.points.length;
        centroid.y /= poly.points.length;

        const zoneText = poly.label;



        // 🔥 GET COUNT FROM DEVICES IN THIS ZONE
        const devicesInZone = this.placedDevices.filter(d => {
          // Check if device is inside this polygon
          return this.isPointInPolygon({ x: d.x, y: d.y }, poly.points);
        });

        // 🔥 SUM UP ALL DEVICE COUNTS IN THIS ZONE
        let totalCount = 0;
        devicesInZone.forEach(device => {
          // const deviceCount = this.deviceVisitorCounts[device.deviceUniqueId] || 0;
          // totalCount += deviceCount;
          const countByZone = this.deviceVisitorCounts[device.zoneId] || 0;
  const countByDevice = this.deviceVisitorCounts[device.deviceUniqueId] || 0;
          totalCount += Math.max(countByZone, countByDevice);
        });
        const deviceUniqueId = devicesInZone.length > 0
          ? devicesInZone[0].deviceUniqueId
          : '';
        console.log('✅ deviceUniqueId for zone box:', deviceUniqueId);


        const visitorText = `Total Assets: ${totalCount}`;

        this.ctx.font = '14px Aria';
        const zoneTextWidth = this.ctx.measureText(zoneText).width;
        const visitorTextWidth = this.ctx.measureText(visitorText).width;
        const padding = 6;
        const rectWidth = Math.max(zoneTextWidth, visitorTextWidth) + padding * 4;
        const rectHeight = 60;

        const offsetX = -30;  // 👉 move right side

        const boxX = centroid.x - rectWidth / 2 + offsetX;
        const boxY = centroid.y - rectHeight / 4;

        this.zoneClickAreas.push({
          deviceUniqueId: deviceUniqueId,
          zoneName: zoneText,
          x: boxX,
          y: boxY,
          width: rectWidth,
          height: rectHeight,
          polygonIndex: 1
        });

        this.ctx.fillStyle = '#cb99f1ff';
        this.ctx.strokeStyle = '#7030a0';
        this.ctx.lineWidth = 1;
        this.ctx.fillRect(boxX, boxY, rectWidth, rectHeight);
        this.ctx.strokeRect(boxX, boxY, rectWidth, rectHeight);

        this.ctx.fillStyle = 'white';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'top';
        this.ctx.fillText(zoneText, centroid.x + offsetX, centroid.y - 4);
        this.ctx.fillText(visitorText, centroid.x + offsetX, centroid.y + 10);
      }
    });

    // Draw points while creating polygon
    this.tempPoints.forEach((p) => {
      this.ctx.fillStyle = this.currentColor;
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, 4, 0, 2 * Math.PI);
      this.ctx.fill();
    });
  }




  // Helper method to check if a point is inside a polygon
  isPointInPolygon(point: { x: number; y: number }, polygon: { x: number; y: number }[]): boolean {
    let inside = false;
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      const xi = polygon[i].x;
      const yi = polygon[i].y;
      const xj = polygon[j].x;
      const yj = polygon[j].y;

      const intersect =
        yi > point.y !== yj > point.y &&
        point.x < ((xj - xi) * (point.y - yi)) / (yj - yi) + xi;

      if (intersect) inside = !inside;
    }
    return inside;
  }





  zoneClickAreas: Array<{
    zoneName: string;
    deviceUniqueId: string;
    x: number;
    y: number;
    width: number;
    height: number;
    polygonIndex: number;
  }> = [];


  onCanvasClick(event: MouseEvent) {
    const canvas = this.drawingCanvas.nativeElement;
    const rect = canvas.getBoundingClientRect();

    // Get click coordinates relative to canvas
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // Check if click is inside any zone box
    const clickedZone = this.zoneClickAreas.find(zone =>

      x >= zone.x &&
      x <= zone.x + zone.width &&
      y >= zone.y &&
      y <= zone.y + zone.height
    );
    if (clickedZone) {
      console.log('Clicked on zone:', clickedZone.zoneName);

      this.getActiveAssetDetails(clickedZone.deviceUniqueId);
    }


  }

  // Helpers
  getImageWidth(): number {
    const img = document.querySelector('.map-image') as HTMLImageElement;
    return img ? img.clientWidth : 0;
  }

  getImageHeight(): number {
    const img = document.querySelector('.map-image') as HTMLImageElement;
    return img ? img.clientHeight : 0;
  }


  projectDevices: any[] = [];

  devicesGetByProjectId(projectId: any) {
    this.device.getDevicesByProject(projectId).subscribe({
      next: (res: any) => {
        this.projectDevices = res;
        this.areaDevices = [];
        this.countryDevices = []; // clear old country data
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
        this.areaDevices = Object.values(res);
        this.projectDevices = [];
        this.countryDevices = [];
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
        this.cdr.detectChanges();
      },
      error: () => {
        console.log("Error loading devices by building");
      }
    });
  }


  floorDevices: any[] = [];
  devicesGetByFloorId(
    projectId: string,
    countryId: string,
    areaId: string,
    buildingId: string,
    floorId: string
  ) {
    this.device
      .getDevicesByFloor(projectId, countryId, areaId, buildingId, floorId)
      .subscribe({
        next: (res: any) => {
          console.log('✅ Floor devices API response:', res);

          // Your API returns [{ deviceId, deviceName }]
          this.floorDevices = res.map((d: any) => ({
            id: d.deviceId, // 👈 match dropdown [value]
            deviceName: d.deviceName,
          }));

          console.log('✅ Transformed floorDevices:', this.floorDevices);

          this.activeLevel = 'floor'; // 👈 ensure correct switch case
          this.cdr.detectChanges();   // 👈 force UI refresh
        },
        error: (err) => {
          console.error('❌ Error loading devices by floor', err);
        },
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
        console.log('✅ Devices by Zone:', res);

        // 🧩 Ensure response is an array and mapped correctly
        this.zoneDevices = (Array.isArray(res) ? res : []).map(d => ({
          id: d.id || d.deviceId, // handle either field name
          deviceName: d.deviceName || d.name,
        }));

        // 🧹 Clear other device lists
        this.projectDevices = [];
        this.countryDevices = [];
        this.areaDevices = [];
        this.buildingDevices = [];
        this.floorDevices = [];

        // 🧠 Important: Update active level
        this.activeLevel = 'zone';

        // 🔁 Trigger UI refresh
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('❌ Error loading devices by zone:', err);
      }
    });
  }




  selectedDeviceId: string | null = null;
  selectedDeviceUId: string | null = null;
  activeLevel: string = 'project'; // or dynamically set this value based on user selection



  selectedDevice: any = null;
  selectedDeviceName: string = '';

  onDeviceSelect(event: Event) {
    const selectedId = (event.target as HTMLSelectElement).value;

    this.selectedDevice = null;

    switch (this.activeLevel) {

      case 'project':
        this.selectedDevice = this.projectDevices.find(
          d => d.deviceId === selectedId
        );
        break;
      case 'country':
        this.selectedDevice = this.countryDevices.find(
          d => d.deviceId === selectedId
        );
        break;
      case 'area':
        this.selectedDevice = this.areaDevices.find(
          d => d.deviceId === selectedId
        );
        break;
      case 'building':
        this.selectedDevice = this.buildingDevices.find(
          d => d.deviceId === selectedId
        );
        break;
      case 'floor':
        this.selectedDevice = this.floorDevices.find(
          d => d.deviceId === selectedId
        );
        break;
      case 'zone':
        this.selectedDevice = this.zoneDevices.find(
          d => d.deviceId === selectedId
        );
        break;
      // add others if needed
    }

    if (this.selectedDevice) {
      this.selectedDeviceId = this.selectedDevice.deviceId;
      this.selectedDeviceUId = this.selectedDevice.deviceUniqueId;
      console.log('✅ Selected Device:', this.selectedDevice);
    }
  }





  selectedProjectId: string = '';
  selectedCountryId: string = '';
  selectedAreaId: string = '';
  selectedBuildingId: string = '';
  selectedFloorId: string = '';




  placingDevice: boolean = false;
  placedDevices: any[] = []; // stores placed devices {id, name, x, y}
  drawing = false;



  enableDrawing() {
    this.drawing = true;
    this.placingDevice = false;


  }





  onMapImageClick(event: MouseEvent) {
    if (!this.placingDevice || this.selectedItems.size === 0) return;

    const imgElement = event.target as HTMLElement;
    const rect = imgElement.getBoundingClientRect();

    const baseX = event.clientX - rect.left;
    const baseY = event.clientY - rect.top;

    const selectedIds = Array.from(this.selectedItems);

    // 🔁 RESET pending devices every click
    this.pendingPlacedDevices = [];

    selectedIds.forEach((id, index) => {
      const device = this.dataList.find(d => d.id === id);
      if (!device) return;

      const offset = index * 25; // prevent overlap

      this.pendingPlacedDevices.push({
        id: device.id,
        deviceUniqueId: device.uniqueId,
        //uniqueId: device.uniqueId || device.idNumber, // 🔥 IMPORTANT
        name: device.displayLabel,
        x: baseX + offset,
        y: baseY
      });
    });

    // 🔍 Preview only (NOT committed yet)
    this.placedDevices = [...this.pendingPlacedDevices];

    this.placingDevice = false;

    if (this.drawingCanvas?.nativeElement) {
      this.drawingCanvas.nativeElement.style.pointerEvents = 'auto';
    }

    // ✅ Show confirmation popup
    this.showDevicePopup = true;

    console.log('🟡 Pending devices (preview):', this.pendingPlacedDevices);
  }



  polygonPoints: any[] = [];
  showPolygonPopup = false;
  polygonCompleted = false;
  firstPointThreshold = 10;  // pixels


  // addPolygonPoint(event: MouseEvent) {

  //   if (!this.isPolygonDrawingEnabled) return; // 🔒 KEY LINE
  //   if (this.placingDevice) return;

  //   if (this.polygonCompleted) return;

  //   const rect = this.drawingCanvas.nativeElement.getBoundingClientRect();
  //   const x = event.clientX - rect.left;
  //   const y = event.clientY - rect.top;

  //   // 🔵 If user tries to close polygon
  //   if (this.tempPoints.length >= 3) {
  //     const first = this.tempPoints[0];
  //     const distance = Math.sqrt((x - first.x) ** 2 + (y - first.y) ** 2);

  //     if (distance <= 3) {
  //       this.polygonCompleted = true;
  //       this.showPolygonPopup = true;
  //       this.isPolygonDrawingEnabled = false; // ✅ stop drawing

  //       return;
  //     }
  //   }

  //   // Normal point adding
  //   this.tempPoints.push({ x, y });
  //   this.redrawCanvas();

  //   if (this.tempPoints.length > 1) {
  //     this.ctx.beginPath();
  //     this.ctx.strokeStyle = this.currentColor;
  //     this.ctx.lineWidth = 2;
  //     this.ctx.moveTo(this.tempPoints[0].x, this.tempPoints[0].y);

  //     for (let i = 1; i < this.tempPoints.length; i++) {
  //       this.ctx.lineTo(this.tempPoints[i].x, this.tempPoints[i].y);
  //     }
  //     this.ctx.stroke();
  //   }
  // }

  addPolygonPoint(event: MouseEvent) {
    const rect = this.drawingCanvas.nativeElement.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // 🎯 FIRST: Always check if click is on a zone box
    if (this.zoneClickAreas && this.zoneClickAreas.length > 0) {
      const clickedZone = this.zoneClickAreas.find(zone =>
        x >= zone.x &&
        x <= zone.x + zone.width &&
        y >= zone.y &&
        y <= zone.y + zone.height
      );

      if (clickedZone) {
        // Zone was clicked - show asset details
        console.log('Clicked on zone:', clickedZone.zoneName);
        // this.selectedZone = clickedZone.zoneName;
        this.getActiveAssetDetails(clickedZone.deviceUniqueId)
        return; // Stop here - don't proceed to polygon drawing
      }
    }

    // 🔒 If NOT clicking on a zone, proceed with ORIGINAL polygon drawing logic
    if (!this.isPolygonDrawingEnabled) return; // 🔒 KEY LINE
    if (this.placingDevice) return;

    if (this.polygonCompleted) return;

    // 🔵 If user tries to close polygon
    if (this.tempPoints.length >= 3) {
      const first = this.tempPoints[0];
      const distance = Math.sqrt((x - first.x) ** 2 + (y - first.y) ** 2);

      if (distance <= 3) {
        this.polygonCompleted = true;
        this.showPolygonPopup = true;
        this.isPolygonDrawingEnabled = false; // ✅ stop drawing

        return;
      }
    }

    // Normal point adding
    this.tempPoints.push({ x, y });
    this.redrawCanvas();

    if (this.tempPoints.length > 1) {
      this.ctx.beginPath();
      this.ctx.strokeStyle = this.currentColor;
      this.ctx.lineWidth = 2;
      this.ctx.moveTo(this.tempPoints[0].x, this.tempPoints[0].y);

      for (let i = 1; i < this.tempPoints.length; i++) {
        this.ctx.lineTo(this.tempPoints[i].x, this.tempPoints[i].y);
      }
      this.ctx.stroke();
    }
  }


  cancelPolygon() {
    this.showPolygonPopup = false;
    this.polygonCompleted = false;
    this.tempPoints = [];
  }


  //savedMappingId: string = "";

  applyPolygon() {
    if (this.tempPoints.length < 3) return;

    const geoJson = this.convertPointsToGeoJSON(this.tempPoints,
      this.selectedZoneName,
      this.currentColor);

    const body = {
      id: "",
      areaId: this.selectedAreaId,
      assemblyPoint: false,
      buildingId: this.selectedBuildingId,
      clientId: '',
      countryId: this.selectedCountryId,
      createdAt: new Date(),
      createdBy: "admin",
      exit: "",
      floorId: this.selectedFloorId,
      geoJsonData: geoJson,
      priority: "High",
      projectId: this.selectedProjectId,
      status: true,
      topZone: "",
      zoneId: this.selectedZoneId,
      zoneName: this.selectedZoneName,
    };

    this.device.saveZoneMapping(body).subscribe({
      next: (res: any) => {
        console.log("Zone Saved Successfully", res);
        this.savedMappingId = res.id;
        localStorage.setItem("savedMappingId", res.id);

        this.showPolygonPopup = false;
        this.loadPolygonsByFloor(this.selectedFloorId);
        this.loadSavedPolygonsForZone(this.selectedZoneId);
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error("Error saving zone", err);
      }
    });

  }




  convertPointsToGeoJSON(points: any[], zoneName: string, color: string) {
    const coordinates = points.map(p => [p.x, p.y]);
    coordinates.push([points[0].x, points[0].y]); // close polygon

    return {
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          geometry: {
            type: "Polygon",
            coordinates: [coordinates]
          },
          properties: {
            additionalProp1: zoneName,  // Zone Name
            additionalProp2: color,     // Selected Color Code
            additionalProp3: ""
          }
        }
      ]
    };
  }


  onZoneSelect(zoneId: string) {
    this.selectedZoneId = zoneId;

    // Show only this zone’s devices
    if (this.placedDevicesByZone[zoneId]) {
      this.placedDevices = [...this.placedDevicesByZone[zoneId]];
    } else {
      this.placedDevices = [];  // VERY IMPORTANT
    }

    // Load from API if exists
    this.fetchZoneMapping(zoneId);

  }


  drawSavedPolygon(data: any) {
    this.clearPolygons(); // remove old drawings

    const feature = data.geoJsonData.features[0];
    const coords = feature.geometry.coordinates[0];
    const color = feature.properties.additionalProp2; // "#613583"

    this.currentColor = color;

    // Create a fresh polygon
    this.currentPolygon = coords.map((point: any) => ({
      x: point[0],
      y: point[1]
    }));

    this.renderPolygonOnCanvas(this.currentPolygon, this.currentColor);
  }
  @ViewChild('drawingCanvas', { static: false }) canvasRef!: ElementRef<HTMLCanvasElement>;

  renderPolygonOnCanvas(points: any[], color: string) {
    const canvas = this.canvasRef.nativeElement;
    const ctx = canvas.getContext('2d')!;

    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);

    points.forEach(p => {
      ctx.lineTo(p.x, p.y);
    });

    ctx.closePath();
    ctx.strokeStyle = color;
    ctx.fillStyle = color + "55"; // transparent fill
    ctx.fill();
    ctx.stroke();
  }

  currentPolygon: any[] = [];

  polygonsByZone: { [zoneId: string]: any[] } = {};

  // loadSavedPolygonsForZone(zoneId: string) {
  //   if (!zoneId) return;

  //   this.device.getZoneMappingById(zoneId).subscribe({
  //     next: (res: any) => {

  //       const mapping = Array.isArray(res) ? res[0] : res;
  //       if (!mapping?.geoJsonData?.features?.[0]) return;

  //       const feature = mapping.geoJsonData.features[0];
  //       const coords = feature.geometry.coordinates[0];
  //       const color = feature.properties?.additionalProp2 || this.currentColor;
  //       const label = feature.properties?.additionalProp1 || this.selectedZoneName;

  //       const points = coords.map((pt: any) => ({ x: pt[0], y: pt[1] }));

  //       // 🟢 Initialize zone polygon list if empty
  //       if (!this.polygonsByZone[zoneId]) {
  //         this.polygonsByZone[zoneId] = [];
  //       }

  //       // 🟢 Replace only this zone’s polygons
  //       this.polygonsByZone[zoneId] = [{
  //         points,
  //         color,
  //         label,
  //         zoneId
  //       }];

  //       // 🟢 Set ACTIVE polygon list for UI
  //       this.polygons = this.polygonsByZone[zoneId];

  //       this.redrawCanvas();
  //       this.cdr.detectChanges();
  //     }
  //   });
  // }

loadSavedPolygonsForZone(zoneId: string) {
  if (!zoneId) return;

  this.device.getZoneMappingById(zoneId).subscribe({
    next: (res: any) => {
      const mapping = Array.isArray(res) ? res[0] : res;

      // ✅ No polygon for this zone — clear and return
      if (!mapping?.geoJsonData?.features?.[0]) {
        this.polygons = [];                    // ✅ clear — don't show other zones
        this.polygonsByZone[zoneId] = [];      // ✅ mark as empty
        this.zoneClickAreas = [];
        this.redrawCanvas();
        return;
      }

      const feature = mapping.geoJsonData.features[0];
      const coords = feature.geometry.coordinates[0];
      const color = feature.properties?.additionalProp2 || this.currentColor;
      const label = feature.properties?.additionalProp1 || this.selectedZoneName;
      const points = coords.map((pt: any) => ({ x: pt[0], y: pt[1] }));

      // ✅ Store only this zone
      this.polygonsByZone[zoneId] = [{ points, color, label, zoneId }];

      // ✅ Zone level — show ONLY this zone's polygon
      this.polygons = this.polygonsByZone[zoneId];

      this.zoneClickAreas = [];
      this.redrawCanvas();
      this.cdr.detectChanges();
    },
    error: () => {
      // ✅ API error — show empty canvas, don't leak other zones
      this.polygons = [];
      this.polygonsByZone[zoneId] = [];
      this.zoneClickAreas = [];
      this.redrawCanvas();
    }
  });
}


  enableDevicePlacement() {
    this.placingDevice = true;
    this.isPolygonDrawingEnabled = false;


    // Disable canvas clicks temporarily
    if (this.drawingCanvas && this.drawingCanvas.nativeElement) {
      this.drawingCanvas.nativeElement.style.pointerEvents = "none";
    }
  }





  disableDevicePlacement() {
    this.placingDevice = false;

    // Enable drawing clicks again
    if (this.drawingCanvas && this.drawingCanvas.nativeElement) {
      this.drawingCanvas.nativeElement.style.pointerEvents = "auto";
    }
  }



  showDevicePopup: boolean = false;



  cancelDevice() {
    // Remove the last placed device (the one just clicked on the map)
    if (this.placedDevices.length > 0) {
      this.placedDevices.pop();
    }

    // Close the popup
    this.showDevicePopup = false;
    this.showAreaDevicePopup = false;

    this.tempDevice = null;

    // Re-enable device placement if needed
    this.placingDevice = false;
  }


  // selectedDevice: any = null;
  deviceClickX: number = 0;
  deviceClickY: number = 0;


  applyDevice() {
    if (!this.pendingPlacedDevices.length) {
      console.warn('❌ No device to apply');
      return;
    }

    if (!this.placedDevicesByZone[this.selectedZoneId]) {
      this.placedDevicesByZone[this.selectedZoneId] = [];
    }

    this.pendingPlacedDevices.forEach(d => {
      const payload = {
        id: "",
        areaId: this.selectedAreaId,
        assemblyPoint: false,
        buildingId: this.selectedBuildingId,
        clientId: "CLIENT_001",
        countryId: this.selectedCountryId,

        createdAt: new Date().toISOString(),
        createdBy: "admin",

        deviceGeoJsonData: {
          type: "FeatureCollection",
          features: [
            {
              type: "Feature",
              geometry: {
                type: "Point",
                coordinates: [d.x, d.y]
              },
              properties: {}
            }
          ]
        },

        deviceName: d.name,
        deviceReferenceId: d.id,
        //deviceUniqueId: d.uniqueId,
        deviceUniqueId: d.deviceUniqueId,

        // ✅ REQUIRED FIELDS (FIX)
        exit: "NA",
        userId: "admin",              // logged-in user id
        topZone: this.selectedZoneId, // or zone name if required
        priority: "normal",
        zoneName: this.selectedZoneName, // MUST NOT BE EMPTY

        floorId: this.selectedFloorId,
        projectId: this.selectedProjectId,
        zoneId: this.selectedZoneId,
        status: true
      };

      console.log('🚀 FINAL PAYLOAD:', payload);

      this.device.saveDeviceGeoJson(payload).subscribe({
        // next: () => console.log('✅ Device saved:', d.name),
        // error: err => console.error('❌ Save failed', err)
        next: (res: any) => {

          console.log("SAVE RESPONSE:", res);
          this.fetchZoneMapping(this.selectedZoneId);

          const newDevice = {
            id: res.id,   // ✅ mapping id from backend
            name: res.deviceName,
            deviceUniqueId: res.deviceUniqueId,
            x: d.x,
            y: d.y
          };
        }

      });

      this.placedDevicesByZone[this.selectedZoneId].push(d);
    });

    this.placedDevices = [...this.placedDevicesByZone[this.selectedZoneId]];
    this.pendingPlacedDevices = [];
    this.showDevicePopup = false;
  }




  pendingPlacedDevices: any[] = [];



  // fetchZoneMapping(zoneId: string) {
  //   this.device.getZoneMapping(zoneId).subscribe({
  //     next: (response: any[]) => {
  //       if (!Array.isArray(response)) {
  //         console.warn("Invalid response format");
  //         return;
  //       }

  //       const devices = response.flatMap((item: any) =>
  //         item.deviceGeoJsonData?.features?.map((f: any) => ({
  //           id: item.id,   // ✅ FIXED HERE
  //           name: item.deviceName,
  //           deviceUniqueId: item.deviceUniqueId,
  //           x: f.geometry.coordinates[0],
  //           y: f.geometry.coordinates[1]
  //         })) || []
  //       );

  //       this.placedDevicesByZone[zoneId] = devices;
  //       this.placedDevices = devices;

  //       console.log("🟢 Devices loaded correctly:", devices);

  //       this.cdr.detectChanges();
  //     }
  //   });
  // }


fetchZoneMapping(zoneId: string) {
  this.device.getZoneMapping(zoneId).subscribe({
    next: (response: any[]) => {
      if (!Array.isArray(response)) {
        console.warn("Invalid response format");
        return;
      }
      const devices = response.flatMap((item: any) =>
        item.deviceGeoJsonData?.features?.map((f: any) => ({
          id: item.id,
          name: item.deviceName,
          deviceUniqueId: item.deviceUniqueId,
          zoneId: item.zoneId,
          x: f.geometry.coordinates[0],
          y: f.geometry.coordinates[1]
        })) || []
      );

      this.placedDevicesByZone[zoneId] = devices;
      this.placedDevices = devices;
      console.log('🟢 placedDevices with zoneId:', devices);

      this.zoneClickAreas = []; // ✅ clear stale areas
      this.cdr.detectChanges();
      this.redrawCanvas();      // ✅ redraw AFTER placedDevices is set
      this.cdr.detectChanges();
    }
  });
}

  ws!: WebSocket;
  wsConnected = false;

  // connectWebSocket() {
  //   //this.ws = new WebSocket('wss://phcc.purpleiq.ai/ws/ZoneCount');
  //   this.ws = new WebSocket('ws://172.16.100.29:5202/ws/ZoneCount');

  //   this.ws.onopen = () => {
  //     console.log('✅ WebSocket Connected');
  //   };

  //   this.ws.onmessage = (event) => {
  //     try {
  //       const data = JSON.parse(event.data);
  //       const updates = Array.isArray(data) ? data : [data];

  //       updates.forEach(update => {
  //         // 🔥 DEVICE LIVE LOCATION UPDATE
  //         if (update.tagId && update.latitude != null && update.longitude != null) {
  //           console.log('📡 WS Location Update:', update);
  //           this.moveDeviceMarker(update);
  //         }

  //         // 🔥 DEVICE COUNT UPDATE
  //         if (update.ZoneId && typeof update.Count === 'number') {
  //           this.deviceVisitorCounts[update.ZoneId] = update.Count;
  //           console.log(`📊 Device ${update.ZoneId} count: ${update.Count}`);

  //           // 🔥 REDRAW CANVAS TO UPDATE ZONE LABEL
  //           this.redrawCanvas();
  //         }
  //       });

  //       this.cdr.detectChanges();
  //     } catch (err) {
  //       console.error('❌ WebSocket parse error', err);
  //     }
  //   };

  //   this.ws.onclose = () => console.log('🔌 WebSocket Closed');
  //   this.ws.onerror = err => console.error('❌ WebSocket Error', err);
  // }

  wsLocationMap: { [tagId: string]: any } = {};  // key = tagId, value = latest WS data
matchedWsData: any = null;

  connectWebSocket() {
  this.ws = new WebSocket('ws://172.16.100.29:5202/ws/ZoneCount');

  this.ws.onopen = () => {
    console.log('✅ WebSocket Connected');
  };

  this.ws.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      const updates = Array.isArray(data) ? data : [data];

      updates.forEach(update => {

        // 🔥 DEVICE LIVE LOCATION UPDATE
        if (update.tagId && update.latitude != null && update.longitude != null) {
          console.log('📡 WS Location Update:', update);

          // ✅ Store latest location data keyed by tagId
          this.wsLocationMap[update.tagId] = update;

          // ✅ If popup is open and this update matches the current asset, refresh it
          if (this.assetData && this.assetData.uniqueId === update.tagId) {
            this.matchedWsData = update;
          }

          this.moveDeviceMarker(update);
        }

        // 🔥 DEVICE COUNT UPDATE
        if (update.ZoneId && typeof update.Count === 'number') {
          this.deviceVisitorCounts[update.ZoneId] = update.Count;
          console.log(`📊 Device ${update.ZoneId} count: ${update.Count}`);
          this.redrawCanvas();
        }

      });

      this.cdr.detectChanges();
    } catch (err) {
      console.error('❌ WebSocket parse error', err);
    }
  };

  this.ws.onclose = () => console.log('🔌 WebSocket Closed');
  this.ws.onerror = err => console.error('❌ WebSocket Error', err);
}

  deviceMarkers = new Map<string, any>();

  // moveDeviceMarker(update: any) {
  //   const { tagId, latitude, longitude } = update;

  //   const marker = this.deviceMarkers.get(tagId);

  //   if (!marker) {
  //     console.warn(`⚠️ No marker found for tagId ${tagId}`);
  //     return;
  //   }

  //   // 🔥 Move marker
  //   marker.setLatLng([latitude, longitude]);
  // }

  selectedItemId: string | number | null = null; // to store the clicked item's ID

  selectItem(id: string | number) {
    this.selectedItemId = id;
  }

  activeLevels: 'project' | 'country' | 'area' | 'building' | 'floor' | 'zone' | null = null;



  // loadPolygonsByFloor(floorId: string) {
  //   if (!floorId) return;

  //   this.device.getZoneMappingByFloor(floorId).subscribe({
  //     next: (res: any[]) => {
  //       console.log("🟩 Floor polygon response:", res);

  //       // Clear old polygons
  //       this.polygons = [];

  //       // Loop all zone mappings
  //       res.forEach((mapping: any) => {
  //         const feature = mapping.geoJsonData?.features?.[0];
  //         if (!feature) return;

  //         const coords = feature.geometry?.coordinates?.[0];
  //         if (!coords) return;

  //         const color = feature.properties?.additionalProp2 || '#ff0000';
  //         const label = feature.properties?.additionalProp1 || '';
  //         const zoneId = mapping.id;

  //         const points = coords.map((pt: any) => ({ x: pt[0], y: pt[1] }));

  //         // Insert polygon
  //         this.polygons.push({
  //           points,
  //           color,
  //           label,
  //           zoneId
  //         });
  //       });

  //       // Redraw once after adding all polygons
  //       this.redrawCanvas();
  //     },
  //     error: (err) => {
  //       console.error("❌ Error loading polygons for floor", err);
  //     }
  //   });
  // }

loadPolygonsByFloor(floorId: string) {
  if (!floorId) return;

  this.device.getZoneMappingByFloor(floorId).subscribe({
    next: (res: any[]) => {
      console.log("🟩 Floor polygon response:", res);

      // ✅ Reset and rebuild fresh for this floor only
      this.polygonsByZone = {};

      res.forEach((mapping: any) => {
        const feature = mapping.geoJsonData?.features?.[0];
        if (!feature) return;
        const coords = feature.geometry?.coordinates?.[0];
        if (!coords) return;

        const color = feature.properties?.additionalProp2 || '#ff0000';
        const label = feature.properties?.additionalProp1 || '';
        const zoneId = mapping.zoneId;           // ✅ correct field
        const points = coords.map((pt: any) => ({ x: pt[0], y: pt[1] }));

        if (!this.polygonsByZone[zoneId]) {
          this.polygonsByZone[zoneId] = [];
        }
        this.polygonsByZone[zoneId].push({ points, color, label, zoneId });
      });

      // ✅ Floor level — always show all zones merged
      this.polygons = Object.values(this.polygonsByZone).flat();

      this.zoneClickAreas = [];
      this.redrawCanvas();
    },
    error: (err) => {
      console.error("❌ Error loading polygons for floor", err);
    }
  });
}

  getZoneImageByZoneid(zoneId: string) {
    this.device.getZoneImageByZoneId(zoneId).subscribe({
      next: (res: any) => {

        console.log("🔥 ZONE MAP URL RECEIVED:", res.mapUrl);

        this.zoneImage = res.mapUrl;
        this.subZoneImage = null;
        this.floorImage = null;

        this.activeLevel = 'zone';

        setTimeout(() => {
          this.cdr.markForCheck();
          this.cdr.detectChanges();
        }, 50);
      },
      error: () => {
        console.warn("Zone map API failed");

        const zone = this.zoneByFloor[this.selectedFloorId]
          ?.find(z => z.id === zoneId);

        if (zone?.uploadMap) this.zoneImage = zone.uploadMap;

        setTimeout(() => {
          this.cdr.detectChanges();
        }, 50);
      }
    });
  }


  loadDevicesByZone(zoneId: string) {
    this.device.getDevicesByZoneId(zoneId).subscribe({
      next: (res: any) => {
        console.log("Zone devices:", res);
        this.zoneDevices = res; // store for UI
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error("Error loading devices for zone", err);
      }
    });
  }



  // loadDevicesByFloor(floorId: string) {
  //   if (!floorId) return;

  //   this.device.getDeviceGeoJsonByFloor(floorId).subscribe({
  //     next: (res: any) => {
  //       console.log("🟩 Floor device mapping response:", res);

  //       // Clear old device markers
  //       this.placedDevices = [];

  //       res.forEach((mapping: any) => {
  //         const feature = mapping.deviceGeoJsonData?.features?.[0];
  //         if (!feature) return;

  //         const coords = feature.geometry?.coordinates;
  //         if (!coords || feature.geometry.type !== "Point") return;

  //         const x = coords[0];
  //         const y = coords[1];

  //         this.placedDevices.push({
  //           id: mapping.deviceReferenceId,
  //           name: mapping.deviceName,
  //           x,
  //           y
  //         });
  //       });
  //       this.cdr.detectChanges();

  //       console.log("📌 Loaded devices:", this.placedDevices);
  //     },

  //     error: (err) => {
  //       console.error("❌ Error loading device mapping for floor", err);
  //     }
  //   });
  // }


  loadDevicesByFloor(floorId: string) {
  if (!floorId) return;
  this.device.getDeviceGeoJsonByFloor(floorId).subscribe({
    next: (res: any) => {
      console.log("🟩 Floor device mapping response:", res);
      this.placedDevices = [];
      res.forEach((mapping: any) => {
        const feature = mapping.deviceGeoJsonData?.features?.[0];
        if (!feature) return;
        const coords = feature.geometry?.coordinates;
        if (!coords || feature.geometry.type !== "Point") return;

        this.placedDevices.push({
          id: mapping.id,                          // ✅ mapping record id
          name: mapping.deviceName,
          deviceUniqueId: mapping.deviceUniqueId,  // ✅ for count lookup
          zoneId: mapping.zoneId,                  // ✅ for zone matching
          x: coords[0],
          y: coords[1]
        });
      });

      console.log("📌 Loaded devices:", this.placedDevices);
      this.zoneClickAreas = [];    // ✅ clear stale areas
      this.cdr.detectChanges();
      this.redrawCanvas();         // ✅ redraw AFTER placedDevices is set
    },
    error: (err) => {
      console.error("❌ Error loading device mapping for floor", err);
    }
  });
}

  selectedDays: number = 1;  // default 1 day
  daysOptions: number[] = [1, 2, 5, 7, 15, 30]; // example options



  loadZoneCounts() {
    if (!this.selectedZoneName) return;

    const numericHour = this.hourMap[this.selectedHour];
    if (numericHour == null) return;

    this.device.ProcessedEvetbyHours(this.selectedZoneName, numericHour)
      .subscribe({
        next: (res: any) => {

          // 👇 Store the response using zoneName as the key
          this.zoneVisitorCounts[res.zoneName] = res.totalCount;

          this.redrawCanvas();
        },
        error: (err) => console.error('API Error:', err)
      });
  }


  loadZoneCountsByDate() {
    if (!this.selectedZoneName) return;

    const numericDays = this.hourMap[this.selectedHour];
    if (numericDays == null) return;

    this.device.getVisitorsByDate(this.selectedZoneName, numericDays)
      .subscribe({
        next: (res: any) => {

          // 👇 Store the response
          this.zoneVisitorCounts[res.zoneName] = res.totalCount;

          this.redrawCanvas();
        },
        error: (err) => console.error("API Error:", err)
      });
  }


  tempDevice: any = null;


  onMapPixelClick(e: any) {
    if (!this.placingDevice || !this.selectedDeviceId) return;

    console.log('✅ MAP CLICK DETECTED'); // <-- MUST PRINT

    const point = this.map.latLngToContainerPoint(e.latlng);

    const x = point.x;
    const y = point.y;

    const selectedDevice = this.zoneDevices.find(
      d => d.id === this.selectedDeviceId
    );

    if (!selectedDevice) return;

    // temp placement
    this.placedDevices = [{
      id: selectedDevice.id,
      name: selectedDevice.deviceName,
      x,
      y
    }];

    this.showDevicePopup = true;
    this.showAreaDevicePopup = true;

    this.placingDevice = false;
  }


  applyDeviceMap() {

    if (!this.tempDeviceLatLng || !this.selectedDevice) {
      console.warn('⚠️ Device not selected');
      return;
    }

    const payload = {
      id: '',
      areaId: this.selectedAreaId,
      assemblyPoint: false,
      clientId: '',
      countryId: this.selectedCountryId,
      createdAt: new Date().toISOString(),
      createdBy: 'loggedInUserId',

      deviceGeoJsonData: {
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            geometry: {
              type: 'Point',
              coordinates: [
                this.tempDeviceLatLng.lng,
                this.tempDeviceLatLng.lat
              ]
            },
            properties: {}
          }
        ]
      },

      // 👇 FROM GET API
      deviceName: this.selectedDevice.deviceName,
      deviceReferenceId: this.selectedDevice.deviceId,
      deviceUniqueId: this.selectedDevice.deviceUniqueId,

      exit: '',
      priority: 'normal',
      projectId: this.selectedProjectId,
      status: true,
      userId: 'loggedInUserId'
    };

    this.device.saveDeviceGeoJsonMap(payload).subscribe({
      next: (res: any) => {
        alert("Device Plotted Successfully")
        this.cancelDevice();
        this.loadDevicesByArea(this.selectedAreaId);
      },
      error: err => console.error(err)
    });

    this.showAreaDevicePopup = false;
  }


  showAreaDevicePopup: boolean = false;


  renderDevicesOnMap(devices: any[]) {
    devices.forEach(device => {
      const feature = device.deviceGeoJsonData?.features?.[0];
      if (!feature) return;

      const [lng, lat] = feature.geometry.coordinates;

      const marker = L.marker([lat, lng], {
        icon: L.icon({
          iconUrl: 'assets/marker.png',
          iconSize: [32, 32],
          iconAnchor: [16, 32]
        })
      })
        .bindTooltip(device.deviceName, {
          permanent: true,
          direction: 'bottom',
          className: 'device-label'
        })


        .addTo(this.map);

      // 🔥 CLICK TO DELETE
      marker.on('click', () => {
        this.selectedDeleteDeviceId = device.id;
        this.selectedDeleteMarker = marker;
        this.showDeletePopup = true;

      });


      // 🔥 STORE marker using deviceUniqueId
      this.deviceMarkers.set(device.deviceUniqueId, marker);
    });
  }


  loadDevicesByArea(areaId: string) {
    this.device.getDevicesByAreaId(areaId).subscribe({
      next: (devices) => {
        this.renderDevicesOnMap(devices);
        this.cdr.detectChanges();

      },
      error: (err) => console.error('Device load error', err)
    });
  }



  // deviceMarkers: any[] = [];

  clearDeviceMarkers() {
    this.deviceMarkers.forEach(m => this.map.removeLayer(m));
    //this.deviceMarkers = [];
  }


  // selectedDevice: any = null;






  loadFloorReportByHours() {
    if (!this.selectedFloorId) {
      console.warn('⚠️ No floor selected');
      return;
    }

    const hoursValue = this.convertHourToNumber(this.selectedHour);

    console.log(`📞 Calling Floor Hour API: floorId=${this.selectedFloorId}, hours=${hoursValue}`);

    this.device.getZoneReportByHours(this.selectedFloorId, hoursValue).subscribe({
      next: (res: any) => {
        console.log('✅ Hour-based floor data received:', res);

        // Process the response here
        // Example: Update chart, display data, etc.
        // this.floorReportData = res;
        // this.updateFloorChart(res);

        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error('❌ Error loading hour-based floor data:', err);
        alert('Failed to load hour-based floor data');
      }
    });
  }




  loadFloorReportByDays() {
    if (!this.selectedFloorId) {
      console.warn('⚠️ No floor selected');
      return;
    }

    const daysValue = this.convertDayToNumber(this.selectedHour);

    console.log(`📞 Calling Floor Day API: floorId=${this.selectedFloorId}, days=${daysValue}`);

    this.device.getZoneReportByDays(this.selectedFloorId, daysValue).subscribe({
      next: (res: any) => {
        console.log('✅ Day-based floor data received:', res);

        // Process the response here
        // this.floorReportData = res;
        // this.updateFloorChart(res);

        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error('❌ Error loading day-based floor data:', err);
        alert('Failed to load day-based floor data');
      }
    });
  }






  convertHourToNumber(hourString: string): number {
    const mapping: { [key: string]: number } = {
      'Live': 0,
      '1 Hour': 1,
      '2 Hours': 2,
      '8 Hours': 8,
      '24 Hours': 24
    };

    return mapping[hourString] || 0;
  }


  convertDayToNumber(dayString: string): number {
    const mapping: { [key: string]: number } = {
      '1 Day': 1,
      '2 Days': 2,
      '5 Days': 5,
      '7 Days': 7,
      '15 Days': 15,
      '30 Days': 30
    };

    return mapping[dayString] || 1;
  }






  onTimeRangeChange() {
    switch (this.selectedTimeRange) {
      case 'day':
        this.hours = ['Live', '1 Hour', '2 Hours', '8 Hours', '24 Hours'];
        this.selectedHour = 'Live';
        break;

      case 'week':
        this.hours = ['1 Day', '2 Days', '5 Days', '7 Days'];
        this.selectedHour = '1 Day';
        break;

      case 'month':
        this.hours = ['15 Days', '30 Days'];
        this.selectedHour = '15 Days';
        break;

      default:
        this.showHourInputs = false;
        return;
    }

    this.showHourInputs = true;

    // ✅ Call floor API automatically when time range changes
    if (this.selectedFloorId) {
      if (this.selectedTimeRange === 'day') {
        this.loadFloorReportByHours();
      } else {
        this.loadFloorReportByDays();
      }
    }

    // 🔥 Keep your existing zone API calls
    if (this.selectedZoneName) {
      if (this.selectedTimeRange === 'day') {
        this.loadZoneCounts();
      } else {
        this.loadZoneCountsByDate();
      }
    }
  }






  onHourChange() {
    console.log(`Selected: ${this.selectedTimeRange} → ${this.selectedHour}`);

    // ✅ Call floor API when hour/day changes
    if (this.selectedFloorId) {
      if (this.selectedTimeRange === 'day') {
        this.loadFloorReportByHours();
      } else if (this.selectedTimeRange === 'week' || this.selectedTimeRange === 'month') {
        this.loadFloorReportByDays();
      }
    }

    // 🔥 Keep your existing zone API calls
    if (this.selectedZoneName) {
      if (this.selectedTimeRange === 'day') {
        this.loadZoneCounts();
      } else if (this.selectedTimeRange === 'week' || this.selectedTimeRange === 'month') {
        this.loadZoneCountsByDate();
      }
    }
  }



  //Device Delete 


  selectedDeleteDeviceId: string | null = null;
  selectedDeleteMarker: L.Marker | null = null;
  showDeletePopup = false;



  cancelDelete() {
    this.showDeletePopup = false;
    this.selectedDeleteDeviceId = null;
    this.selectedDeleteMarker = null;
  }


  confirmDelete() {
    if (!this.selectedDeleteDeviceId) return;

    this.device.deleteDeviceGeoJsonMap(this.selectedDeleteDeviceId)
      .subscribe({
        next: (res: any) => {
          alert(res.message);

          // remove marker from map
          if (this.selectedDeleteMarker) {
            this.map.removeLayer(this.selectedDeleteMarker);
          }

          // cleanup
          this.cancelDelete();

          // optional refresh (safe)
          this.loadDevicesByArea(this.selectedAreaId);
        },
        error: err => console.error('❌ Delete failed', err)
      });
  }





  selectedIndoorDeviceId: string | null = null;
  selectedIndoorDeviceName = '';
  selectedIndoorMarker: L.Marker | null = null;


  openIndoorDeletePopup(id: string, name: string, marker: L.Marker) {
    this.selectedIndoorDeviceId = id;
    this.selectedIndoorDeviceName = name;
    this.selectedIndoorMarker = marker;
    this.showDeletePopup = true;

    console.log('🗑️ Selected Indoor Device ID:', id);
  }


  // cancelIndoorDelete() {
  //   this.showDeletePopup = false;
  //   this.selectedIndoorDeviceId = null;
  //   this.selectedIndoorMarker = null;
  // }


  // confirmIndoorDelete() {
  //   if (!this.selectedIndoorDeviceId) return;

  //   this.device.deleteIndoorDevice(this.selectedIndoorDeviceId).subscribe({
  //     next: () => {
  //       console.log('✅ Indoor device deleted:', this.selectedIndoorDeviceId);

  //       // remove marker from map
  //       if (this.selectedIndoorMarker) {
  //         this.map.removeLayer(this.selectedIndoorMarker);
  //       }

  //       // close popup
  //       this.cancelDelete();
  //     },
  //     error: err => {
  //       console.error('❌ Delete failed', err);
  //     }
  //   });
  // }





























  // new


  selectedItems = new Set<any>();

  isDropdownOpen = false;


  dataList: any[] = [];
  selectedData: any[] = [];


  loadEmployeeTypes() {
    this.peopleservice.getPerson(1, 50).subscribe({
      next: (res: any) => {
        this.dataList = res?.data || res || [];
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error('Employee load failed', err);
      }
    });
  }



  selectedDeviceType: string | null = null;




  onDeviceTypeChange() {
    this.dataList = [];
    this.selectedItemId = null;
    this.selectedItems.clear();
    this.isDropdownOpen = false;

    if (this.selectedDeviceType === 'employee') {
      this.loadEmployees();
      return;
    }

    if (this.selectedDeviceType === 'fixed') {
      this.loadDevicesByType('Fixed Device');
      return;
    }

    if (this.selectedDeviceType === 'mobile') {
      this.loadDevicesByType('Mobile Device');
      return;
    }

    if (this.selectedDeviceType === 'asset') {
      this.loadDevicesByType('Asset');
      return;
    }
  }




  selectedEmployeeId: string | null = null;


  selectedItemIds: any[] = [];




  onEmployeeSelect(event: Event) {
    const select = event.target as HTMLSelectElement;

    // ✅ get selected values
    this.selectedData = Array.from(select.selectedOptions).map(
      option => option.value
    );

    console.log('Selected employee IDs:', this.selectedData);
  }











  fullEmployeeData: any[] = [];  // Add this property
  fullDeviceData: any[] = [];    // Add this property

  loadEmployees() {
    this.peopleservice.getPerson(1, 50).subscribe({
      next: (res: any) => {
        console.log('Employee API raw response:', res);

        const list = res?.data || res || [];

        // Filter only Employees
        const employees = list.filter(
          (p: any) => p.peopleType === 'Employee'
        );

        console.log('Filtered Employees:', employees);

        // ✅ Store full data
        this.fullEmployeeData = employees;

        // Map for dropdown display
        this.dataList = employees.map((p: any) => ({
          id: p.id,
          displayLabel: `${p.firstName} ${p.lastName} (${p.idNumber})`,
          idNumber: p.idNumber  // ✅ Store idNumber directly in dataList
        }));

        console.log('Mapped dataList:', this.dataList);

        this.cdr.detectChanges();
      },
      error: (err: any) => console.error('Employee load failed', err)
    });
  }




  assetList: any[] = []; // ✅ Add this property to store assets


  loadAssets() {
    this.assetservice.getAllAssets().subscribe({
      next: (res: any) => {
        this.assetList = Array.isArray(res) ? res : res?.data ?? [];
        this.cdr.detectChanges();
      },
      error: (err: any) => console.error('❌ Error loading assets', err)
    });
  }





  loadDevicesByType(type: string) {
    this.peopletype.getaddDevices().subscribe({
      next: (res: any) => {
        const list = res?.data || res || [];

        const filtered = list.filter(
          (d: any) => d.deviceType === type
        );

        // ✅ Store full data
        this.fullDeviceData = filtered;

        // Map for dropdown display
        this.dataList = filtered.map((d: any) => ({
          id: d.id,
          displayLabel: `${d.deviceName} (${d.uniqueId})`,
          uniqueId: d.uniqueId  // ✅ Store uniqueId directly in dataList
        }));

        this.cdr.detectChanges();
      },
      error: (err: any) => console.error('Device load failed', err)
    });
  }




  onDataSelect(event: Event) {
    const select = event.target as HTMLSelectElement;
    this.selectedItemId = select.value;

    console.log('Selected ID:', this.selectedItemId);
  }











  toggleDropdown() {
    this.isDropdownOpen = !this.isDropdownOpen;
  }
















  onCheckboxChange(itemId: any, event: any) {
    const checked = event.target.checked;

    if (this.selectedDeviceType === 'fixed') {
      // 🔒 Fixed device → only ONE selection allowed
      this.selectedItems.clear();

      if (checked) {
        this.selectedItems.add(itemId);
      }
    } else {
      // ✅ Multi-select mode
      if (checked) {
        this.selectedItems.add(itemId);
      } else {
        this.selectedItems.delete(itemId);
      }
    }
  }


  getSelectedItemsLabel(): string {
    if (this.selectedItems.size === 0) {
      return `Select ${this.selectedDeviceType === 'fixed' ? 'Device' : this.selectedDeviceType === 'employee' ? 'Employee' : 'Item'}`;
    } else if (this.selectedItems.size === 1) {
      const selectedId = Array.from(this.selectedItems)[0];
      const item = this.dataList.find(i => i.id === selectedId);
      return item ? item.displayLabel : 'Selected';
    } else {
      return `${this.selectedItems.size} items selected`;
    }
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: Event) {
    if (this.dropdownContainer && !this.dropdownContainer.nativeElement.contains(event.target)) {
      this.isDropdownOpen = false;
    }
  }


  onApplySelection() {
    if (this.selectedItems.size === 0) {
      alert('Please select at least one item');
      return;
    }

    const selectedIds = Array.from(this.selectedItems);
    let idsToSend: string[] = [];

    if (this.selectedDeviceType === 'employee') {
      idsToSend = this.dataList
        .filter(i => selectedIds.includes(i.id))
        .map(i => i.idNumber)
        .filter(Boolean);
    } else {
      idsToSend = this.dataList
        .filter(i => selectedIds.includes(i.id))
        .map(i => i.uniqueId)
        .filter(Boolean);
    }

    this.device.getRecentProcessedEvents(idsToSend).subscribe({
      next: (res: any[]) => {
        if (!res || res.length === 0) return;
          this.latestProcessedEvents = res; 
        this.moveMapToDevices(res);
        this.addAppliedDevicesToMap(res);
      },
      error: err => console.error(err)
    });
  }
latestProcessedEvents: any[] = [];


  renderDevicesOnOutsideMap(devices: any[]) {
    const mapEl = document.getElementById('map');
    if (!mapEl || !devices || devices.length === 0) return;

    const mapWidth = mapEl.getBoundingClientRect().width;
    const mapHeight = mapEl.getBoundingClientRect().height;

    const lats = devices.map(d => d.latitude);
    const lngs = devices.map(d => d.longitude);

    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);

    const sameLat = minLat === maxLat;
    const sameLng = minLng === maxLng;

    this.placedDevices = devices.map((d, index) => {
      let x: number;
      let y: number;

      if (sameLat && sameLng) {
        // 🟢 Single device → center
        x = mapWidth / 2;
        y = mapHeight / 2;
      } else {
        x = sameLng
          ? mapWidth / 2
          : ((d.longitude - minLng) / (maxLng - minLng)) * mapWidth;

        y = sameLat
          ? mapHeight / 2
          : ((maxLat - d.latitude) / (maxLat - minLat)) * mapHeight;
      }

      console.log('📍 Device plotted:', d.tagid, x, y);

      return {
        name: d.tagid,
        x,
        y
      };
    });
  }


  moveMapToDevices(devices: any[]) {

    // Single device
    if (devices.length === 1) {
      const d = devices[0];
      this.map.flyTo([d.latitude, d.longitude], 18);
      return;
    }

    // Multiple devices → fit bounds
    const bounds = L.latLngBounds(
      devices.map(d => [d.latitude, d.longitude])
    );

    this.map.fitBounds(bounds, { padding: [40, 40] });
  }
  appliedDeviceMarkers: L.Marker[] = [];


  addAppliedDevicesToMap(devices: any[]) {
    if (!this.map || !devices?.length) return;

    this.clearAppliedDeviceMarkers();

    const deviceIcon = L.divIcon({
      className: 'device-wrapper',
      html: `
      <div class="device-ring">
        <div class="device-core">📡</div>
      </div>
    `,
      iconSize: [36, 36],
      iconAnchor: [18, 18]
    });

    devices.forEach(d => {
      if (!d.latitude || !d.longitude || !d.tagid) return;

      const marker = L.marker([d.latitude, d.longitude], { icon: deviceIcon })
        .addTo(this.map)
        .bindTooltip(
          d.deviceName ?? d.tagid,   // ✅ real name
          {
            permanent: true,
            direction: 'top',
            offset: [0, -20],
            className: 'device-label'
          }
        );

      marker.on('click', () => {
        console.log('📍 Clicked outdoor device:', d);
        this.onOutdoorDeviceClick(d);
      });

      // 🔥 THIS IS THE MOST IMPORTANT LINE
      this.deviceMarkers.set(String(d.tagid), marker);

      console.log('🟢 Marker added for tagId:', d.tagid);
    });
  }






  clearAppliedDeviceMarkers() {
    this.appliedDeviceMarkers.forEach(marker => {
      this.map.removeLayer(marker);
    });
    this.appliedDeviceMarkers = [];
  }

  moveDeviceMarker(update: any) {
    const tagId = String(update.tagId);
    const lat = update.latitude;
    const lng = update.longitude;

    const marker = this.deviceMarkers.get(tagId);

    if (!marker) {
      console.warn(`⚠️ No marker found for tagId: ${tagId}`);
      return;
    }

    marker.setLatLng([lat, lng]);

    console.log(`🚀 Device ${tagId} moved to`, lat, lng);
  }



  callRecentProcessedEvents(ids: string[]) {
    this.device.getRecentProcessedEvents(ids).subscribe({
      next: (res: any) => {
        console.log('✅ Recent processed events:', res);
        // Handle the response here
        // Update UI, show markers on map, etc.
      },
      error: (err: any) => {
        console.error('❌ Error fetching recent processed events:', err);
      }
    });
  }

  // Helper method to get employee by ID
  getEmployeeById(id: string): any {
    // You need to store the full employee data, not just the mapped version
    return this.fullEmployeeData?.find((emp: any) => emp.id === id);
  }

  // Helper method to get device by ID
  getDeviceById(id: string): any {
    // You need to store the full device data, not just the mapped version
    return this.fullDeviceData?.find((dev: any) => dev.id === id);
  }



  isAllSelected(): boolean {
    return (
      this.dataList.length > 0 &&
      this.selectedItems.size === this.dataList.length
    );
  }



  toggleSelectAll(event: any) {
    if (this.selectedDeviceType === 'fixed') {
      return; // ❌ no select-all for fixed device
    }

    const checked = event.target.checked;

    if (checked) {
      this.dataList.forEach(item => this.selectedItems.add(item.id));
    } else {
      this.selectedItems.clear();
    }
  }



  toggleArea(areaId: string) {
    if (this.expandedArea.has(areaId)) {
      this.expandedArea.delete(areaId);
    } else {
      this.expandedArea.add(areaId);

      // 🔥 Initialize empty arrays for both zones and buildings
      this.zoneByArea[areaId] = [];
      this.buildingByArea[areaId] = [];

      // Load both zones and buildings for this area
      this.getAreaBasedZone(areaId);
      this.loadBuilding(areaId);
    }
  }
  zoneByArea: { [areaId: string]: any[] } = {};
  getAreaBasedZone(areaId: string) {
    this.role.getAreaZone(areaId).subscribe({
      next: (res: any) => {
        console.log('Area Zones for', areaId, ':', res);
        this.zoneByArea[areaId] = res;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.log('Error loading area based zones', error);
        this.zoneByArea[areaId] = [];
      }
    });
  }



  // placedDevices: PlacedDevice[] = [];
  placedDevicesByZone: { [zoneId: string]: PlacedDevice[] } = {};


  activeDevice: any = null;
  assetData: any = null;
  showAssetPopup: boolean = false;

  // onDeviceClick(device: any) {
  //   console.log('Clicked device:', device);
  //   if (!device.deviceUniqueId) {
  //     console.error('❌ deviceUniqueId missing');
  //     return;
  //   }

  //   this.activeDevice = device;

  //   this.device
  //     .getMappedDevice(device.deviceUniqueId)
  //     .subscribe((res: any) => {
  //       this.assetData = res.data; // ✅ no error now
  //       this.showAssetPopup = true;
  //       this.cdr.detectChanges(); // 🔥 important
  //     });
  // }







  assetPopup: boolean = false;
  activeAssets: any[] = [];

  getActiveAssetDetails(deviceUniqueId: string) {
    console.log('🔍 Calling API with deviceUniqueId:', deviceUniqueId); // ✅ check this logs correct value

    this.device.getActiveAsset(deviceUniqueId).subscribe({
      next: (res: any) => {
        this.activeAssets = res.data;
        this.assetPopup = true;
        this.cdr.detectChanges();
      },
      error: () => {
        alert("Active Asset Not Found");
      }
    });
  }

wsDeviceData: any[] = [];   // holds all live WS messages

  // onOutdoorDeviceClick(device: any) {
  //   console.log('Clicked device:', device);

  //   // Use tagId instead of deviceUniqueId
  //   if (!device.tagid) {
  //     console.error('❌ tagid missing');
  //     return;
  //   }

  //   this.activeDevice = device;
 


  //   // Call the new API method
  //   this.device.getMappedDeviceByTagId(device.tagid).subscribe({
  //     next: (res: any) => {


  //    this.assetData = res.data; // store API response

  //       this.showAssetPopup = true;
  //       this.cdr.detectChanges(); // ensure popup updates
  //     },
  //     error: err => {
  //       console.error('API error:', err);
  //     }
  //   });
  // }



  onOutdoorDeviceClick(device: any) {
  console.log('Clicked device:', device);

  if (!device.tagid) {
    console.error('❌ tagid missing');
    return;
  }

  this.activeDevice = device;
  this.matchedWsData = null;

  // ✅ IMMEDIATE FALLBACK — device object already has lat/lng from the recent API
  // Use it right away so popup shows location instantly without waiting for WS
  if (device.latitude != null && device.longitude != null) {
    this.matchedWsData = {
      tagId: device.tagid,
      latitude: device.latitude,
      longitude: device.longitude,
      Gsmtimestamp: device.checkInTime,   // map checkInTime → Gsmtimestamp for display
      checkintime: device.checkInTime
    };
    console.log('✅ Using device object location as initial data:', this.matchedWsData);
  }

  this.device.getMappedDeviceByTagId(device.tagid).subscribe({
    next: (res: any) => {
      this.assetData = res.data;

      const uniqueId = res.data?.uniqueId;
      console.log('🔑 Asset uniqueId from API:', uniqueId);
      console.log('🗺️ Current wsLocationMap keys:', Object.keys(this.wsLocationMap));

      if (uniqueId) {
        // ✅ Check wsLocationMap for a fresher WS update — if found, prefer it
        const wsMatch = this.wsLocationMap[String(uniqueId)] || null;

        if (wsMatch) {
          this.matchedWsData = { ...wsMatch };
          console.log('✅ WS map match found, using live WS data:', this.matchedWsData);
        } else {
          console.log('⚠️ No WS map entry yet — keeping device object location data');
          // matchedWsData already set above from device object, keep it
        }
      }

      this.showAssetPopup = true;
      this.cdr.detectChanges();
    },
    error: err => {
      console.error('API error:', err);
    }
  });
}

  zoneVisitorCounts: { [zoneId: string]: number } = {};












  // 10-2-26

  // Add this property to store device counts
  deviceVisitorCounts: { [deviceUniqueId: string]: number } = {};






  testWebSocketMatch() {
    console.log('📊 Device Visitor Counts:', this.deviceVisitorCounts);
    console.log('📍 Placed Devices:', this.placedDevices);

    this.placedDevices.forEach(device => {
      const count = this.deviceVisitorCounts[device.deviceUniqueId];
      console.log(`Device ${device.deviceUniqueId}: Count = ${count || 0}`);
    });
  }

  // --- Delete mode state ---
  isDeleteModeActive = false;


  enableDeleteMode() {
    this.isDeleteModeActive = true;
    this.showAssetPopup = false; // close asset popup if open
  }

  disableDeleteMode() {
    this.isDeleteModeActive = false;
  }


  onDeviceClick(d: any) {
    if (this.isDeleteModeActive) {
      console.log('🗑️ selected id for delete:', d.id); // ✅ must log 698f1699...
      this.selectedIndoorDeviceId = d.id;
      this.selectedIndoorDeviceName = d.name;
      this.showDeletePopup = true;
    } else {
      if (!d.deviceUniqueId) {
        console.error('❌ deviceUniqueId missing');
        return;
      }
      this.activeDevice = d;
      this.device.getMappedDevice(d.deviceUniqueId).subscribe((res: any) => {
        this.assetData = res.data;
        this.showAssetPopup = true;
        this.cdr.detectChanges();
      });
    }
  }
  cancelIndoorDelete() {
    this.showDeletePopup = false;
    this.isDeleteModeActive = false;  // important
    this.selectedIndoorDeviceId = null;
    this.selectedIndoorDeviceName = '';
    this.disableDeleteMode(); // exit delete mode after cancel
  }

  // confirmIndoorDelete() {
  //   console.log("Apply button clicked");
  //   if (!this.selectedIndoorDeviceId) return;

  //   this.device.deleteIndoorDevice(this.selectedIndoorDeviceId).subscribe({
  //     next: (res: any) => {
  //       console.log('✅ Deleted:', res);
  //       this.showDeletePopup = false;
  //       this.placedDevices = this.placedDevices.filter(
  //         d => d.id !== this.selectedIndoorDeviceId  // ✅ matches correctly now
  //       );
  //       this.cancelIndoorDelete();
  //       this.cdr.detectChanges();

  //     },
  //     error: err => console.error('❌ Delete failed', err)
  //   });
  // }

  confirmIndoorDelete() {

  console.log("Apply button clicked");

  if (!this.selectedIndoorDeviceId) return;

  this.device.deleteIndoorDevice(this.selectedIndoorDeviceId).subscribe({

    next: (res: any) => {

      console.log('✅ Deleted:', res);

      this.showDeletePopup = false;

      // ✅ Remove from placedDevices
      this.placedDevices = this.placedDevices.filter(
        d => d.id !== this.selectedIndoorDeviceId
      );

      // ✅ ALSO remove from placedDevicesByZone
      Object.keys(this.placedDevicesByZone).forEach(zoneId => {

        this.placedDevicesByZone[zoneId] =
          this.placedDevicesByZone[zoneId].filter(
            d => d.id !== this.selectedIndoorDeviceId
          );

      });

      // ✅ Redraw canvas to remove visually
      this.redrawCanvas();

      this.cancelIndoorDelete();
      this.cdr.detectChanges();
    },

    error: err => console.error('❌ Delete failed', err)
  });
}








}