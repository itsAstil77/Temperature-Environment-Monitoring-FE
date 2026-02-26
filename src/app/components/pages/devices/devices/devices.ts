import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Peopletype } from '../../../service/peopletype/peopletype';
import { FormsModule } from '@angular/forms';
import { Roleservice } from '../../../service/role/roleservice';
import { forkJoin } from 'rxjs';
import { Assetservice } from '../../../service/asset/assetservice';

@Component({
  selector: 'app-devices',
  imports: [RouterModule, CommonModule, FormsModule],
  templateUrl: './devices.html',
  styleUrl: './devices.css'
})


export class Devices implements OnInit {

  constructor(
    private deviceService: Peopletype,
    private cdr: ChangeDetectorRef,
    private role: Roleservice,
    private assetservice: Assetservice
  ) { }

  ngOnInit(): void {
    this.loadDevices();
    this.loadDeviceTypes();
    this.loadDeviceParameters();
    this.loadProject();
    this.loadAssets();
  }

  activeTab: string = 'device';

  setActive(tab: string) {
    this.activeTab = tab;
    this.cdr.detectChanges();
  }


  // ===================== SHARED HIERARCHICAL DATA =====================

  projects: any[] = [];
  selectedProjectId: string = '';
  selectedCountryId: string = '';
  countriesByProject: { [projectId: string]: any[] } = {};
  areaByCountry: { [countryId: string]: any[] } = {};
  buildingByArea: { [areaId: string]: any[] } = {};
  floorByBuilding: { [buildingId: string]: any[] } = {};
  zoneByFloor: { [floorId: string]: any[] } = {};
  outdoorZonesByArea: { [areaId: string]: any[] } = {};
  outdoorZoneByArea: { [areaId: string]: any[] } = {};

  loadProject() {
    this.role.getProject().subscribe({
      next: (res: any) => {
        this.projects = res;
        this.cdr.detectChanges();
      },
      error: () => console.log('error loading project')
    });
  }

  loadOutdoorZonesForArea(areaId: string) {
    this.deviceService.getOutdoorZoneMapping(areaId).subscribe({
      next: (zones: any) => {
        const zonesArray = Array.isArray(zones) ? zones : (zones.data ? zones.data : []);
        this.outdoorZonesByArea[areaId] = zonesArray;
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error('❌ Error loading outdoor zones:', err);
        this.outdoorZonesByArea[areaId] = [];
        this.cdr.detectChanges();
      }
    });
  }

  // ===================== DEVICE TAB – SHARED DROPDOWN HANDLERS =====================
  // These are used by DEVICE create/edit popups only.
  // Asset popup uses dedicated onAsset* handlers below to avoid conflicts.

  onProjectChange(projectId: string) {
    this.selectedProjectId = projectId;
    this.selectedCountryId = '';

    if (this.openAddDevice) {
      this.createDevice.country = '';
      this.createDevice.area = '';
      this.createDevice.building = '';
      this.createDevice.floor = '';
      this.createDevice.zone = '';
    }

    if (!projectId) { this.cdr.detectChanges(); return; }

    if (!this.countriesByProject[projectId]) {
      this.role.countryGetById(projectId).subscribe({
        next: (res: any) => {
          this.countriesByProject[projectId] = Array.isArray(res) ? res : [];
          this.cdr.detectChanges();
        },
        error: () => console.log('Error loading countries')
      });
    } else {
      this.cdr.detectChanges();
    }
  }

  onCountryChange(countryId: string) {
    this.selectedCountryId = countryId;

    if (this.openAddDevice) {
      this.createDevice.country = countryId;
      this.createDevice.area = '';
      this.createDevice.building = '';
      this.createDevice.floor = '';
      this.createDevice.zone = '';
    }

    if (!countryId) { this.cdr.detectChanges(); return; }

    if (!this.areaByCountry[countryId]) {
      this.role.getSummary(countryId).subscribe({
        next: (res: any) => {
          this.areaByCountry[countryId] = Array.isArray(res) ? res : [];
          this.cdr.detectChanges();
        },
        error: () => console.log('Error loading areas')
      });
    } else {
      this.cdr.detectChanges();
    }
  }

  onAreaChange(areaId: string) {
    if (this.openAddDevice) {
      this.createDevice.area = areaId;
      this.createDevice.outdoorZoneName = '';
      this.createDevice.building = '';
      this.createDevice.floor = '';
      this.createDevice.zone = '';
    }

    if (!areaId) { this.cdr.detectChanges(); return; }

    if (!this.outdoorZonesByArea[areaId]) {
      this.loadOutdoorZonesForArea(areaId);
    }

    if (!this.buildingByArea[areaId]) {
      this.role.getBuilding(areaId).subscribe({
        next: (res: any) => {
          this.buildingByArea[areaId] = Array.isArray(res) ? res : [];
          this.cdr.detectChanges();
        },
        error: () => console.log('Error loading buildings')
      });
    } else {
      this.cdr.detectChanges();
    }
  }

  onBuildingChange(buildingId: string) {
    if (this.openAddDevice) {
      this.createDevice.building = buildingId;
      this.createDevice.floor = '';
      this.createDevice.zone = '';
    }

    if (!buildingId) { this.cdr.detectChanges(); return; }

    if (!this.floorByBuilding[buildingId]) {
      this.role.getFloor(buildingId).subscribe({
        next: (res: any) => {
          this.floorByBuilding[buildingId] = Array.isArray(res) ? res : [];
          this.cdr.detectChanges();
        },
        error: () => console.log('Error loading floors')
      });
    } else {
      this.cdr.detectChanges();
    }
  }

  onFloorChange(floorId: string) {
    if (this.openAddDevice) {
      this.createDevice.floor = floorId;
      this.createDevice.zone = '';
    }

    if (!floorId) { this.cdr.detectChanges(); return; }

    if (!this.zoneByFloor[floorId]) {
      this.role.getZones(floorId).subscribe({
        next: (res: any) => {
          this.zoneByFloor[floorId] = Array.isArray(res) ? res : [];
          this.cdr.detectChanges();
        },
        error: () => console.log('Error loading zones')
      });
    } else {
      this.cdr.detectChanges();
    }
  }

  loadArea(countryId: string) {
    if (!this.areaByCountry[countryId]) {
      this.role.getSummary(countryId).subscribe({
        next: (res: any) => {
          this.areaByCountry[countryId] = Array.isArray(res) ? res : [];
          this.cdr.detectChanges();
        },
        error: () => console.log('Error loading areas')
      });
    }
  }

  loadBuilding(areaId: string) {
    if (!this.buildingByArea[areaId]) {
      this.role.getBuilding(areaId).subscribe({
        next: (res: any) => {
          this.buildingByArea[areaId] = Array.isArray(res) ? res : [];
          this.cdr.detectChanges();
        },
        error: () => console.log('Error loading buildings')
      });
    }
  }

  loadFloor(buildingId: string) {
    if (!this.floorByBuilding[buildingId]) {
      this.role.getFloor(buildingId).subscribe({
        next: (res: any) => {
          this.floorByBuilding[buildingId] = Array.isArray(res) ? res : [];
          this.cdr.detectChanges();
        },
        error: () => console.log('Error loading floors')
      });
    }
  }

  loadZones(floorId: string) {
    if (!this.zoneByFloor[floorId]) {
      this.role.getZones(floorId).subscribe({
        next: (res: any) => {
          this.zoneByFloor[floorId] = Array.isArray(res) ? res : [];
          this.cdr.detectChanges();
        },
        error: () => console.log('Error loading zones')
      });
    }
  }

  selectedBuildingId: string = '';
  selectedFloorId: string = '';
  selectedZoneId: string = '';


  // ===================== DEVICE TAB =====================

  deviceList: any[] = [];
  deviceOptions: string[] = []; // used in Asset Mapped Device dropdown

  openAddDevice = false;
  outdoorZoneByAreaDevice: { [key: string]: any[] } = {};

  createDevice: any = {
    deviceType: '', uniqueId: '', model: '', project: '',
    deviceName: '', country: '', area: '', outdoorZoneName: '',
    building: '', floor: '', zone: '', technology: '', status: false
  };

  devices: any[] = [];
  deviceSummary: any = { total: 0, active: 0, inactive: 0 };
  deviceTypeOptions: string[] = [];

  technologyOptions: string[] = [
    'BLE GATEWAY', 'BLE TAGS', 'LORA', 'QR BARCODE', 'RFID',
    'Zigbee', 'GSM', 'WIFI', 'VISUAL', 'GPS'
  ];

  openCreateDevicePopup() {
    this.openAddDevice = true;
    this.createDevice = {
      deviceType: '', uniqueId: '', model: '', area: '',
      outdoorZoneName: '', building: '', floor: '', zone: '',
      deviceName: '', technology: '', status: false
    };
    this.selectedProjectId = '';
    this.selectedCountryId = '';
  }

  closeCreateDevicePopup() {
    this.openAddDevice = false;
  }

  loadDevices(): void {
    this.deviceService.getaddDevices().subscribe({
      next: (res: any) => {
        this.deviceList = res.data ? res.data : [];

        this.deviceSummary = {
          total: this.deviceList.length,
          active: this.deviceList.filter((d: any) => d.status === true).length,
          inactive: this.deviceList.filter((d: any) => d.status === false).length
        };

        this.deviceTypeOptions = [...new Set(this.deviceList.map((d: any) => d.deviceType))];

        // Build device options for Asset mapped device dropdown
        this.deviceOptions = this.deviceList.map((d: any) => `${d.deviceName} (${d.uniqueId})`);

        this.cdr.detectChanges();
      },
      error: (err: any) => console.error('Error loading devices', err)
    });
  }

  createNewDevice() {
    if (!this.createDevice.deviceType) { alert('⚠️ Please select a Device Type.'); return; }
    if (!this.createDevice.uniqueId?.trim()) { alert('⚠️ Please enter the Unique ID.'); return; }

    const isDuplicate = this.deviceList.some(
      (d: any) => d.uniqueId?.trim().toLowerCase() === this.createDevice.uniqueId.trim().toLowerCase()
    );
    if (isDuplicate) { alert('⚠️ This Unique ID already exists. Please use a different one.'); return; }
    if (!this.createDevice.deviceName?.trim()) { alert('⚠️ Please enter the Device Name.'); return; }

    const projectObj = this.projects.find(p => p.id === this.selectedProjectId);
    const countryObj = (this.countriesByProject[this.selectedProjectId] || []).find(c => c.id === this.selectedCountryId);
    const areaObj = (this.areaByCountry[this.selectedCountryId] || []).find(a => a.id === this.createDevice.area);
    const buildingObj = (this.buildingByArea[this.createDevice.area] || []).find(b => b.id === this.createDevice.building);
    const floorObj = (this.floorByBuilding[this.createDevice.building] || []).find(f => f.id === this.createDevice.floor);
    const zoneObj = (this.zoneByFloor[this.createDevice.floor] || []).find(z => z.id === this.createDevice.zone);

    const reqBody = {
      deviceType: this.createDevice.deviceType,
      uniqueId: this.createDevice.uniqueId,
      model: this.createDevice.model,
      projectId: this.selectedProjectId,
      projectName: projectObj?.projectName || '',
      countryId: this.selectedCountryId,
      countryName: countryObj?.countryName || '',
      areaId: this.createDevice.area,
      areaName: areaObj?.areaName || '',
      outdoorZoneName: this.createDevice.outdoorZoneName || '',
      buildingId: this.createDevice.building,
      buildingName: buildingObj?.buildingName || '',
      floorId: this.createDevice.floor,
      floorName: floorObj?.floorName || '',
      zoneId: this.createDevice.zone,
      zoneName: zoneObj?.zoneName || '',
      deviceName: this.createDevice.deviceName,
      technology: this.createDevice.technology || '',
      status: this.createDevice.status
    };

    this.deviceService.createadddevice(reqBody).subscribe({
      next: (res: any) => {
        alert(res.message || '✅ Device created successfully!');
        this.openAddDevice = false;
        this.loadDevices();
      },
      error: (err: any) => { console.error('❌ Error creating device:', err); alert('❌ Failed to create device.'); }
    });
  }

  // Edit Device
  openEditDevice = false;
  editDevice: any = {
    id: '', deviceType: '', uniqueId: '', model: '', projectName: '',
    deviceName: '', countryName: '', areaName: '', outdoorZoneName: '',
    buildingName: '', floorName: '', zoneName: '', technology: '', status: true
  };

  openEditDevicePopup(device: any) {
    this.openEditDevice = true;
    this.editDevice = {
      id: device.id,
      deviceType: device.deviceType || '',
      uniqueId: device.uniqueId || '',
      model: device.model || '',
      deviceName: device.deviceName || '',
      technology: device.technology || '',
      status: device.status ?? true,
      project: device.projectId || '',
      country: device.countryId || '',
      area: device.areaId || '',
      outdoorZoneName: device.outdoorZoneName || '',
      building: device.buildingId || '',
      floor: device.floorId || '',
      zone: device.zoneId || ''
    };

    this.selectedProjectId = device.projectId || '';
    this.selectedCountryId = device.countryId || '';

    const project = this.projects.find(p => p.id === device.projectId);
    if (!project) { console.error('❌ Project not found for ID:', device.projectId); this.cdr.detectChanges(); return; }

    this.loadHierarchicalDataParallel(device, project.id);
  }

  private loadHierarchicalDataParallel(device: any, projectId: string) {
    this.role.countryGetById(projectId).subscribe({
      next: (countries: any) => {
        this.countriesByProject[projectId] = Array.isArray(countries) ? countries : [];
        this.cdr.detectChanges();
        if (!device.countryId) return;

        this.role.getSummary(device.countryId).subscribe({
          next: (areas: any) => {
            this.areaByCountry[device.countryId] = Array.isArray(areas) ? areas : [];
            this.cdr.detectChanges();
            if (!device.areaId) return;

            this.loadOutdoorZonesForArea(device.areaId);

            this.role.getBuilding(device.areaId).subscribe({
              next: (buildings: any) => {
                this.buildingByArea[device.areaId] = Array.isArray(buildings) ? buildings : [];
                this.cdr.detectChanges();
                if (!device.buildingId) return;

                this.role.getFloor(device.buildingId).subscribe({
                  next: (floors: any) => {
                    this.floorByBuilding[device.buildingId] = Array.isArray(floors) ? floors : [];
                    this.cdr.detectChanges();
                    if (!device.floorId) return;

                    this.role.getZones(device.floorId).subscribe({
                      next: (zones: any) => {
                        this.zoneByFloor[device.floorId] = Array.isArray(zones) ? zones : [];
                        this.cdr.detectChanges();
                      },
                      error: (err) => { console.error('❌ Error loading zones:', err); this.cdr.detectChanges(); }
                    });
                  },
                  error: (err) => { console.error('❌ Error loading floors:', err); this.cdr.detectChanges(); }
                });
              },
              error: (err) => { console.error('❌ Error loading buildings:', err); this.cdr.detectChanges(); }
            });
          },
          error: (err) => { console.error('❌ Error loading areas:', err); this.cdr.detectChanges(); }
        });
      },
      error: (err) => { console.error('❌ Error loading countries:', err); this.cdr.detectChanges(); }
    });
  }

  closeEditDevicePopup() {
    this.openEditDevice = false;
  }

  updateDevice() {
    if (!this.editDevice.deviceType) { alert('⚠️ Please select a Device Type.'); return; }
    if (!this.editDevice.uniqueId?.trim()) { alert('⚠️ Please enter the Unique ID.'); return; }

    const isDuplicate = this.deviceList.some(
      (d: any) => d.uniqueId?.trim().toLowerCase() === this.editDevice.uniqueId.trim().toLowerCase() && d.id !== this.editDevice.id
    );
    if (isDuplicate) { alert('⚠️ This Unique ID already exists for another device.'); return; }
    if (!this.editDevice.deviceName?.trim()) { alert('⚠️ Please enter the Device Name.'); return; }

    const projectObj = this.projects.find(p => p.id === this.editDevice.project);
    const countryObj = (this.countriesByProject[this.editDevice.project] || []).find(c => c.id === this.editDevice.country);
    const areaObj = (this.areaByCountry[this.editDevice.country] || []).find(a => a.id === this.editDevice.area);
    const buildingObj = (this.buildingByArea[this.editDevice.area] || []).find(b => b.id === this.editDevice.building);
    const floorObj = (this.floorByBuilding[this.editDevice.building] || []).find(f => f.id === this.editDevice.floor);
    const zoneObj = (this.zoneByFloor[this.editDevice.floor] || []).find(z => z.id === this.editDevice.zone);

    const reqBody = {
      id: this.editDevice.id,
      deviceType: this.editDevice.deviceType,
      uniqueId: this.editDevice.uniqueId,
      model: this.editDevice.model,
      projectId: this.editDevice.project,
      projectName: projectObj?.projectName || '',
      countryId: this.editDevice.country,
      countryName: countryObj?.countryName || '',
      areaId: this.editDevice.area,
      areaName: areaObj?.areaName || '',
      outdoorZoneName: this.editDevice.outdoorZoneName || '',
      buildingId: this.editDevice.building,
      buildingName: buildingObj?.buildingName || '',
      floorId: this.editDevice.floor,
      floorName: floorObj?.floorName || '',
      zoneId: this.editDevice.zone,
      zoneName: zoneObj?.zoneName || '',
      deviceName: this.editDevice.deviceName,
      technology: this.editDevice.technology,
      status: this.editDevice.status
    };

    this.deviceService.updateAddDevice(reqBody, this.editDevice.id).subscribe({
      next: (res: any) => {
        alert(res.message || '✅ Device updated successfully!');
        this.closeEditDevicePopup();
        this.loadDevices();
      },
      error: (err: any) => { console.error('❌ Error updating device:', err); alert('❌ Error updating device.'); }
    });
  }

  // Delete Device
  openDeleteDevice = false;
  deleteDeviceId: string = '';

  openDeleteDevicePopup(device: any) {
    this.deleteDeviceId = device.id || device._id || device.uniqueId;
    this.openDeleteDevice = true;
  }

  closeDeleteDevicePopup() {
    this.openDeleteDevice = false;
    this.deleteDeviceId = '';
  }

  confirmDeleteDevice() {
    if (!this.deleteDeviceId) return;
    this.deviceService.DeleteAddDevice(this.deleteDeviceId).subscribe({
      next: (res: any) => {
        alert(res.message || 'Device Deleted Successfully');
        this.closeDeleteDevicePopup();
        this.loadDevices();
      },
      error: (err: any) => { console.error('Error deleting device:', err); alert('Error deleting device'); }
    });
  }


  // ===================== DEVICE TYPE TAB =====================

  deviceTypeList: any[] = [];
  currentPage: number = 1;
  pageSize: number = 10;
  pageSizes: number[] = [5, 10, 20, 50];
  totalPages: number = 0;

  loadDeviceTypes(page: number = 1) {
    if (page < 1 || (this.totalPages && page > this.totalPages)) return;
    this.currentPage = page;
    this.deviceService.getaddDeviceType(this.currentPage, this.pageSize).subscribe({
      next: (res: any) => {
        this.deviceTypeList = Array.isArray(res.data) ? res.data : [];
        this.totalPages = res.totalPages || 1;
        this.cdr.detectChanges();
      },
      error: (err: any) => console.error('Error loading device types', err)
    });
  }

  onPageSizeChange(size: number) {
    this.pageSize = +size;
    this.currentPage = 1;
    this.loadDeviceTypes(this.currentPage);
  }

  nextPage() { if (this.currentPage < this.totalPages) this.loadDeviceTypes(this.currentPage + 1); }
  prevPage() { if (this.currentPage > 1) this.loadDeviceTypes(this.currentPage - 1); }

  openAddDeviceType = false;
  createDeviceTypeData: any = { deviceType: '', description: '', status: true };

  openCreateDeviceTypePopup() {
    this.openAddDeviceType = true;
    this.createDeviceTypeData = { deviceType: '', description: '', status: false };
  }

  closeCreateDeviceTypePopup() { this.openAddDeviceType = false; }

  createDeviceType() {
    if (!this.createDeviceTypeData.deviceType?.trim()) { alert('⚠️ Please enter the Device Type.'); return; }
    if (!this.createDeviceTypeData.description?.trim()) { alert('⚠️ Please enter the Description.'); return; }
    if (!this.createDeviceTypeData.status) { alert('⚠️ Device type can only be created when status is active.'); return; }

    const isDuplicate = this.deviceTypeList.some(
      (type: any) => type.deviceType?.trim().toLowerCase() === this.createDeviceTypeData.deviceType.trim().toLowerCase()
    );
    if (isDuplicate) { alert('⚠️ This Device Type already exists!'); return; }

    this.deviceService.createdeviceType(this.createDeviceTypeData).subscribe({
      next: (res: any) => {
        alert(res.message || '✅ Device Type Created Successfully');
        this.closeCreateDeviceTypePopup();
        this.loadDeviceTypes();
      },
      error: (err: any) => { console.error('❌ Error creating device type:', err); alert('❌ Error creating device type'); }
    });
  }

  openEditDeviceType = false;
  editDeviceType: any = { id: '', deviceType: '', description: '', status: true };

  openEditDeviceTypePopup(type: any) { this.openEditDeviceType = true; this.editDeviceType = { ...type }; }
  closeEditDeviceTypePopup() { this.openEditDeviceType = false; }

  updateDeviceType() {
    if (!this.editDeviceType.deviceType?.trim()) { alert('⚠️ Please enter the Device Type.'); return; }
    if (!this.editDeviceType.description?.trim()) { alert('⚠️ Please enter the Description.'); return; }
    if (!this.editDeviceType.status) { alert('⚠️ Device type can only be updated when status is active.'); return; }

    this.deviceService.updateDevice(this.editDeviceType, this.editDeviceType.id).subscribe({
      next: (res: any) => {
        alert(res.message || '✅ Device Type Updated Successfully');
        this.closeEditDeviceTypePopup();
        this.loadDeviceTypes();
      },
      error: (err: any) => { console.error('❌ Error updating Device Type:', err); alert('❌ Error updating Device Type'); }
    });
  }

  openDeleteDeviceType = false;
  deleteDeviceTypeId: string = '';

  openDeleteDeviceTypePopup(type: any) { this.deleteDeviceTypeId = type.id || type._id; this.openDeleteDeviceType = true; }
  closeDeleteDeviceTypePopup() { this.openDeleteDeviceType = false; this.deleteDeviceTypeId = ''; }

  confirmDeleteDeviceType() {
    if (!this.deleteDeviceTypeId) return;
    this.deviceService.DeleteDevicetype(this.deleteDeviceTypeId).subscribe({
      next: (res: any) => {
        alert(res.message || 'Device Type Deleted Successfully');
        this.closeDeleteDeviceTypePopup();
        this.loadDeviceTypes();
      },
      error: (err: any) => { console.error('Error deleting Device Type:', err); alert('Error deleting Device Type'); }
    });
  }


  // ===================== PARAMETER TAB =====================

  deviceParamsList: any[] = [];

  loadDeviceParameters() {
    this.deviceService.getAllDeviceParameters().subscribe({
      next: (res: any) => {
        const data = Array.isArray(res) ? res : [res];
        this.deviceParamsList = data.map((device: any) => ({
          ...device,
          parameterNames: device.deviceParameters.map((p: any) => p.name).join(', ')
        }));
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error loading device parameters', err)
    });
  }

  addDevicePara: boolean = false;
  createPara: any = { deviceId: '', deviceName: '', deviceParameters: '' };

  openAddDevicePara() {
    this.addDevicePara = true;
    this.loadDevices();
    this.createPara = { deviceId: '', deviceName: '', deviceParameters: '' };
  }

  closeAddDevicepara() { this.addDevicePara = false; }

  createNewDevicePara() {
    const selectedDevice = this.deviceList.find((d: any) => d.id === this.createPara.deviceId);
    if (!selectedDevice) { alert('Please select a valid device.'); return; }

    const payload = {
      deviceId: this.createPara.deviceId,
      deviceName: selectedDevice.deviceName,
      deviceUniqueId: selectedDevice.uniqueId,
      deviceParameters: this.createPara.deviceParameters
        ? this.createPara.deviceParameters.split(',').map((p: string) => p.trim())
        : []
    };

    this.deviceService.addNewPara(payload).subscribe({
      next: () => { alert('Parameter created successfully!'); this.closeAddDevicepara(); this.loadDeviceParameters(); },
      error: (err) => { console.error('❌ Failed to create parameter:', err); alert('Failed to create parameter.'); }
    });
  }

  updatePara: boolean = false;
  selectedParaIdToUpdate = '';
  updateParaData = { deviceId: '', deviceName: '', deviceParameters: '' };

  openUpdatePara(device: any) {
    const parameterNames = device.deviceParameters.map((p: any) => typeof p === 'string' ? p : p.name);
    this.updateParaData = {
      deviceId: device.deviceId || device.id,
      deviceName: device.deviceName,
      deviceParameters: parameterNames.join(', ')
    };
    this.selectedParaIdToUpdate = device.id;
    this.updatePara = true;
  }

  closeUpdatePara() { this.updatePara = false; }

  updateDevicePara() {
    if (!this.updateParaData.deviceId) { alert('Please select a valid device'); return; }

    const selectedDevice = this.deviceList.find((d: any) => d.id === this.updateParaData.deviceId);
    const payload = {
      deviceId: this.updateParaData.deviceId,
      deviceUniqueId: selectedDevice.uniqueId,
      deviceName: selectedDevice ? selectedDevice.deviceName : this.updateParaData.deviceName,
      deviceParameters: this.updateParaData.deviceParameters
        ? this.updateParaData.deviceParameters.split(',').map((p: string) => p.trim())
        : []
    };

    this.deviceService.updateDeviceParametersById(this.selectedParaIdToUpdate, payload).subscribe({
      next: () => { alert('Device parameter updated successfully!'); this.closeUpdatePara(); this.loadDeviceParameters(); },
      error: (err) => { console.error('Error updating device parameter:', err); alert('Failed to update device parameter'); }
    });
  }

  deletePara: boolean = false;
  selectedParaIdToDelete = '';

  openDeletePara(device: any) { this.deletePara = true; this.selectedParaIdToDelete = device.id; }
  closeDeletePara() { this.deletePara = false; }

  deleteDevicePara() {
    this.deviceService.deleteDevicePara(this.selectedParaIdToDelete).subscribe({
      next: () => { alert('Parameter Deleted Successfully'); this.closeDeletePara(); this.loadDeviceParameters(); },
      error: () => alert('error deleting parameter')
    });
  }


  // ===================== ASSET TAB =====================
  // Asset uses its own selectedProject/Country IDs to avoid clashing with Device dropdowns

  assetSelectedProjectId: string = '';
  assetSelectedCountryId: string = '';

  assetList: any[] = [];
  openAddAsset = false;
  openEditAsset = false;
  openDeleteAsset = false;
  selectedAssetToDelete: any = null;

  createAssetData: any = {
    assetName: '', uniqueId: '', createdBy: '', outdoorZoneName: '',
    projectId: '', projectName: '', countryId: '', countryName: '',
    areaId: '', areaName: '', buildingId: '', buildingName: '',
    floorId: '', floorName: '', zoneId: '', zoneName: '',
    department: '', custodian: '', mainCategory: '', subCategory: '',
    subSubCategory: '', brand: '', model: '', assetDescription: '',
    assetStatus: false, mappedDevice: '', mappedDeviceUniqueId: '',
    deliverydate: '', capitalizationDate: '', invoiceDate: '', poDate: '',
    expiryDate: '', serviceStartDate: '', serviceEndDate: '', warrantyEndDate: ''
  };

  editAssetData: any = {
    id: '', assetName: '', uniqueId: '', createdBy: '', outdoorZoneName: '',
    projectId: '', projectName: '', countryId: '', countryName: '',
    areaId: '', areaName: '', buildingId: '', buildingName: '',
    floorId: '', floorName: '', zoneId: '', zoneName: '',
    department: '', custodian: '', mainCategory: '', subCategory: '',
    subSubCategory: '', brand: '', model: '', assetDescription: '',
    assetStatus: true, mappedDevice: '', mappedDeviceUniqueId: '',
    deliverydate: '', capitalizationDate: '', invoiceDate: '', poDate: '',
    expiryDate: '', serviceStartDate: '', serviceEndDate: '', warrantyEndDate: ''
  };

  loadAssets() {
    this.assetservice.getAllAssets().subscribe({
      next: (res: any) => {
        this.assetList = Array.isArray(res) ? res : (res?.data ?? []);
        this.cdr.detectChanges();
      },
      error: (err: any) => console.error('❌ Error loading assets', err)
    });
  }

  extractUniqueIdFromMappedDevice(mappedDevice: string): string {
    if (!mappedDevice) return '';
    const match = mappedDevice.match(/\(([^)]+)\)/);
    return match ? match[1] : '';
  }

  // Asset Create
  openCreateAssetPopup() {
    this.openAddAsset = true;
    this.createAssetData = {
      assetName: '', uniqueId: '', createdBy: '', outdoorZoneName: '',
      projectId: '', projectName: '', countryId: '', countryName: '',
      areaId: '', areaName: '', buildingId: '', buildingName: '',
      floorId: '', floorName: '', zoneId: '', zoneName: '',
      department: '', custodian: '', mainCategory: '', subCategory: '',
      subSubCategory: '', brand: '', model: '', assetDescription: '',
      assetStatus: false, mappedDevice: '', mappedDeviceUniqueId: '',
      deliverydate: '', capitalizationDate: '', invoiceDate: '', poDate: '',
      expiryDate: '', serviceStartDate: '', serviceEndDate: '', warrantyEndDate: ''
    };
    this.assetSelectedProjectId = '';
    this.assetSelectedCountryId = '';
  }

  closeCreateAssetPopup() { this.openAddAsset = false; }

  createNewAsset() {
    const mappedDeviceUniqueId = this.extractUniqueIdFromMappedDevice(this.createAssetData.mappedDevice);

    const projectObj = this.projects.find(p => p.id === this.assetSelectedProjectId);
    const countryObj = (this.countriesByProject[this.assetSelectedProjectId] || []).find(c => c.id === this.assetSelectedCountryId);
    const areaObj = (this.areaByCountry[this.assetSelectedCountryId] || []).find(a => a.id === this.createAssetData.areaId);
    const buildingObj = (this.buildingByArea[this.createAssetData.areaId] || []).find(b => b.id === this.createAssetData.buildingId);
    const floorObj = (this.floorByBuilding[this.createAssetData.buildingId] || []).find(f => f.id === this.createAssetData.floorId);
    const zoneObj = (this.zoneByFloor[this.createAssetData.floorId] || []).find(z => z.id === this.createAssetData.zoneId);

    const reqBody = {
      assetName: this.createAssetData.assetName,
      uniqueId: this.createAssetData.uniqueId,
      createdBy: this.createAssetData.createdBy,
      projectId: this.assetSelectedProjectId,
      projectName: projectObj?.projectName || '',
      countryId: this.assetSelectedCountryId,
      countryName: countryObj?.countryName || '',
      areaId: this.createAssetData.areaId,
      areaName: areaObj?.areaName || '',
      outdoorZoneName: this.createAssetData.outdoorZoneName || '',
      buildingId: this.createAssetData.buildingId,
      buildingName: buildingObj?.buildingName || '',
      floorId: this.createAssetData.floorId,
      floorName: floorObj?.floorName || '',
      zoneId: this.createAssetData.zoneId,
      zoneName: zoneObj?.zoneName || '',
      department: this.createAssetData.department,
      custodian: this.createAssetData.custodian,
      mainCategory: this.createAssetData.mainCategory,
      subCategory: this.createAssetData.subCategory,
      subSubCategory: this.createAssetData.subSubCategory,
      brand: this.createAssetData.brand,
      model: this.createAssetData.model,
      assetDescription: this.createAssetData.assetDescription,
      assetStatus: this.createAssetData.assetStatus,
      mappedDevice: this.createAssetData.mappedDevice,
      mappedDeviceUniqueId,
      deliverydate: this.createAssetData.deliverydate,
      capitalizationDate: this.createAssetData.capitalizationDate,
      invoiceDate: this.createAssetData.invoiceDate,
      poDate: this.createAssetData.poDate,
      expiryDate: this.createAssetData.expiryDate,
      serviceStartDate: this.createAssetData.serviceStartDate,
      serviceEndDate: this.createAssetData.serviceEndDate,
      warrantyEndDate: this.createAssetData.warrantyEndDate
    };

    this.assetservice.createAsset(reqBody).subscribe({
      next: () => { alert('✅ Asset created successfully'); this.closeCreateAssetPopup(); this.loadAssets(); },
      error: (err) => { console.error(err); alert('❌ Failed to create asset'); }
    });
  }

  // Asset Edit
  openEditAssetPopup(asset: any) {
    this.openEditAsset = true;
    this.editAssetData = {
      id: asset.id,
      assetName: asset.assetName || '',
      uniqueId: asset.uniqueId || '',
      createdBy: asset.createdBy || '',
      outdoorZoneName: asset.outdoorZoneName || '',
      department: asset.department || '',
      custodian: asset.custodian || '',
      mainCategory: asset.mainCategory || '',
      subCategory: asset.subCategory || '',
      subSubCategory: asset.subSubCategory || '',
      brand: asset.brand || '',
      model: asset.model || '',
      assetDescription: asset.assetDescription || '',
      assetStatus: asset.assetStatus ?? true,
      mappedDevice: asset.mappedDevice || '',
      deliverydate: asset.deliverydate ? asset.deliverydate.split('T')[0] : '',
      capitalizationDate: asset.capitalizationDate ? asset.capitalizationDate.split('T')[0] : '',
      invoiceDate: asset.invoiceDate ? asset.invoiceDate.split('T')[0] : '',
      poDate: asset.poDate ? asset.poDate.split('T')[0] : '',
      expiryDate: asset.expiryDate ? asset.expiryDate.split('T')[0] : '',
      serviceStartDate: asset.serviceStartDate ? asset.serviceStartDate.split('T')[0] : '',
      serviceEndDate: asset.serviceEndDate ? asset.serviceEndDate.split('T')[0] : '',
      warrantyEndDate: asset.warrantyEndDate ? asset.warrantyEndDate.split('T')[0] : '',
      projectId: asset.projectId || '',
      countryId: asset.countryId || '',
      areaId: asset.areaId || '',
      buildingId: asset.buildingId || '',
      floorId: asset.floorId || '',
      zoneId: asset.zoneId || ''
    };

    const project = this.projects.find(p => p.id === asset.projectId || p.projectName === asset.projectName);
    if (!project) { console.error('❌ Project not found'); this.cdr.detectChanges(); return; }

    this.editAssetData.projectId = project.id;
    this.loadAssetHierarchicalDataForEdit(asset, project.id);
  }

  private loadAssetHierarchicalDataForEdit(asset: any, projectId: string) {
    this.role.countryGetById(projectId).subscribe({
      next: (countries: any) => {
        this.countriesByProject[projectId] = Array.isArray(countries) ? countries : [];
        const country = this.countriesByProject[projectId].find(
          (c: any) => c.id === asset.countryId || c.countryName === asset.countryName
        );
        if (!country) { this.cdr.detectChanges(); return; }
        this.editAssetData.countryId = country.id;

        this.role.getSummary(country.id).subscribe({
          next: (areas: any) => {
            this.areaByCountry[country.id] = Array.isArray(areas) ? areas : [];
            const area = this.areaByCountry[country.id].find(
              (a: any) => a.id === asset.areaId || a.areaName === asset.areaName
            );
            if (!area) { this.cdr.detectChanges(); return; }
            this.editAssetData.areaId = area.id;

            if (asset.outdoorZoneName) this.loadOutdoorZonesForArea(area.id);

            this.role.getBuilding(area.id).subscribe({
              next: (buildings: any) => {
                this.buildingByArea[area.id] = Array.isArray(buildings) ? buildings : [];
                const building = this.buildingByArea[area.id].find(
                  (b: any) => b.id === asset.buildingId || b.buildingName === asset.buildingName
                );
                if (!building) { this.cdr.detectChanges(); return; }
                this.editAssetData.buildingId = building.id;

                this.role.getFloor(building.id).subscribe({
                  next: (floors: any) => {
                    this.floorByBuilding[building.id] = Array.isArray(floors) ? floors : [];
                    const floor = this.floorByBuilding[building.id].find(
                      (f: any) => f.id === asset.floorId || f.floorName === asset.floorName
                    );
                    if (!floor) { this.cdr.detectChanges(); return; }
                    this.editAssetData.floorId = floor.id;

                    this.role.getZones(floor.id).subscribe({
                      next: (zones: any) => {
                        this.zoneByFloor[floor.id] = Array.isArray(zones) ? zones : [];
                        const zone = this.zoneByFloor[floor.id].find(
                          (z: any) => z.id === asset.zoneId || z.zoneName === asset.zoneName
                        );
                        if (zone) this.editAssetData.zoneId = zone.id;
                        setTimeout(() => this.cdr.detectChanges(), 100);
                      },
                      error: () => this.cdr.detectChanges()
                    });
                  },
                  error: () => this.cdr.detectChanges()
                });
              },
              error: () => this.cdr.detectChanges()
            });
          },
          error: () => this.cdr.detectChanges()
        });
      },
      error: () => this.cdr.detectChanges()
    });
  }

  closeEditAssetPopup() { this.openEditAsset = false; }

  updateAssetData() {
    const mappedDeviceUniqueId = this.extractUniqueIdFromMappedDevice(this.editAssetData.mappedDevice);

    const projectObj = this.projects.find(p => p.id === this.editAssetData.projectId);
    const countryObj = (this.countriesByProject[this.editAssetData.projectId] || []).find(c => c.id === this.editAssetData.countryId);
    const areaObj = (this.areaByCountry[this.editAssetData.countryId] || []).find(a => a.id === this.editAssetData.areaId);
    const buildingObj = (this.buildingByArea[this.editAssetData.areaId] || []).find(b => b.id === this.editAssetData.buildingId);
    const floorObj = (this.floorByBuilding[this.editAssetData.buildingId] || []).find(f => f.id === this.editAssetData.floorId);
    const zoneObj = (this.zoneByFloor[this.editAssetData.floorId] || []).find(z => z.id === this.editAssetData.zoneId);

    const reqBody = {
      assetName: this.editAssetData.assetName,
      uniqueId: this.editAssetData.uniqueId,
      createdBy: this.editAssetData.createdBy,
      projectId: this.editAssetData.projectId,
      projectName: projectObj?.projectName || '',
      countryId: this.editAssetData.countryId,
      countryName: countryObj?.countryName || '',
      areaId: this.editAssetData.areaId,
      areaName: areaObj?.areaName || '',
      outdoorZoneName: this.editAssetData.outdoorZoneName || '',
      buildingId: this.editAssetData.buildingId,
      buildingName: buildingObj?.buildingName || '',
      floorId: this.editAssetData.floorId,
      floorName: floorObj?.floorName || '',
      zoneId: this.editAssetData.zoneId,
      zoneName: zoneObj?.zoneName || '',
      department: this.editAssetData.department,
      custodian: this.editAssetData.custodian,
      mainCategory: this.editAssetData.mainCategory,
      subCategory: this.editAssetData.subCategory,
      subSubCategory: this.editAssetData.subSubCategory,
      brand: this.editAssetData.brand,
      model: this.editAssetData.model,
      assetDescription: this.editAssetData.assetDescription,
      assetStatus: this.editAssetData.assetStatus,
      mappedDevice: this.editAssetData.mappedDevice,
      mappedDeviceUniqueId,
      deliverydate: this.editAssetData.deliverydate,
      capitalizationDate: this.editAssetData.capitalizationDate,
      invoiceDate: this.editAssetData.invoiceDate,
      poDate: this.editAssetData.poDate,
      expiryDate: this.editAssetData.expiryDate,
      serviceStartDate: this.editAssetData.serviceStartDate,
      serviceEndDate: this.editAssetData.serviceEndDate,
      warrantyEndDate: this.editAssetData.warrantyEndDate
    };

    this.assetservice.updateAsset(this.editAssetData.id, reqBody).subscribe({
      next: (res: any) => {
        alert(res.message || '✅ Asset updated successfully!');
        this.closeEditAssetPopup();
        this.loadAssets();
      },
      error: (err: any) => { console.error('❌ Error updating asset:', err); alert('❌ Error updating asset.'); }
    });
  }

  // Asset Delete
  openDeleteAssetPopup(asset: any) { this.selectedAssetToDelete = asset; this.openDeleteAsset = true; }
  closeDeleteAssetPopup() { this.openDeleteAsset = false; this.selectedAssetToDelete = null; }

  confirmDeleteAsset() {
    if (!this.selectedAssetToDelete?.id) return;
    this.assetservice.deleteAsset(this.selectedAssetToDelete.id).subscribe({
      next: () => { alert('Asset deleted successfully ✅'); this.closeDeleteAssetPopup(); this.loadAssets(); },
      error: (err) => { console.error(err); alert('Failed to delete asset ❌'); }
    });
  }

  // ===================== ASSET – DEDICATED DROPDOWN HANDLERS =====================
  // These use assetSelectedProjectId / assetSelectedCountryId to avoid conflicts with Device dropdowns

  onAssetProjectChange(projectId: string) {
    this.assetSelectedProjectId = projectId;
    this.assetSelectedCountryId = '';
    this.createAssetData.areaId = '';
    this.createAssetData.buildingId = '';
    this.createAssetData.floorId = '';
    this.createAssetData.zoneId = '';
    this.createAssetData.outdoorZoneName = '';

    if (!projectId) { this.cdr.detectChanges(); return; }

    if (!this.countriesByProject[projectId]) {
      this.role.countryGetById(projectId).subscribe({
        next: (res: any) => { this.countriesByProject[projectId] = Array.isArray(res) ? res : []; this.cdr.detectChanges(); },
        error: () => console.log('Error loading countries')
      });
    } else {
      this.cdr.detectChanges();
    }
  }

  onAssetCountryChange(countryId: string) {
    this.assetSelectedCountryId = countryId;
    this.createAssetData.areaId = '';
    this.createAssetData.buildingId = '';
    this.createAssetData.floorId = '';
    this.createAssetData.zoneId = '';
    this.createAssetData.outdoorZoneName = '';

    if (!countryId) { this.cdr.detectChanges(); return; }

    if (!this.areaByCountry[countryId]) {
      this.role.getSummary(countryId).subscribe({
        next: (res: any) => { this.areaByCountry[countryId] = Array.isArray(res) ? res : []; this.cdr.detectChanges(); },
        error: () => console.log('Error loading areas')
      });
    } else {
      this.cdr.detectChanges();
    }
  }

  onAssetAreaChange(areaId: string) {
    this.createAssetData.areaId = areaId;
    this.createAssetData.outdoorZoneName = '';
    this.createAssetData.buildingId = '';
    this.createAssetData.floorId = '';
    this.createAssetData.zoneId = '';

    if (!areaId) { this.cdr.detectChanges(); return; }

    if (!this.outdoorZonesByArea[areaId]) this.loadOutdoorZonesForArea(areaId);

    if (!this.buildingByArea[areaId]) {
      this.role.getBuilding(areaId).subscribe({
        next: (res: any) => { this.buildingByArea[areaId] = Array.isArray(res) ? res : []; this.cdr.detectChanges(); },
        error: () => console.log('Error loading buildings')
      });
    } else {
      this.cdr.detectChanges();
    }
  }

  onAssetBuildingChange(buildingId: string) {
    this.createAssetData.buildingId = buildingId;
    this.createAssetData.floorId = '';
    this.createAssetData.zoneId = '';

    if (!buildingId) { this.cdr.detectChanges(); return; }

    if (!this.floorByBuilding[buildingId]) {
      this.role.getFloor(buildingId).subscribe({
        next: (res: any) => { this.floorByBuilding[buildingId] = Array.isArray(res) ? res : []; this.cdr.detectChanges(); },
        error: () => console.log('Error loading floors')
      });
    } else {
      this.cdr.detectChanges();
    }
  }

  onAssetFloorChange(floorId: string) {
    this.createAssetData.floorId = floorId;
    this.createAssetData.zoneId = '';

    if (!floorId) { this.cdr.detectChanges(); return; }

    if (!this.zoneByFloor[floorId]) {
      this.role.getZones(floorId).subscribe({
        next: (res: any) => { this.zoneByFloor[floorId] = Array.isArray(res) ? res : []; this.cdr.detectChanges(); },
        error: () => console.log('Error loading zones')
      });
    } else {
      this.cdr.detectChanges();
    }
  }

  // Asset Edit dropdown handlers
  onAssetProjectChangeEdit(projectId: string) {
    this.editAssetData.projectId = projectId;
    this.editAssetData.countryId = '';
    this.editAssetData.areaId = '';
    this.editAssetData.buildingId = '';
    this.editAssetData.floorId = '';
    this.editAssetData.zoneId = '';
    this.editAssetData.outdoorZoneName = '';

    if (!projectId) { this.cdr.detectChanges(); return; }

    if (!this.countriesByProject[projectId]) {
      this.role.countryGetById(projectId).subscribe({
        next: (res: any) => { this.countriesByProject[projectId] = Array.isArray(res) ? res : []; this.cdr.detectChanges(); },
        error: () => console.log('Error loading countries')
      });
    } else {
      this.cdr.detectChanges();
    }
  }

  onAssetCountryChangeEdit(countryId: string) {
    this.editAssetData.countryId = countryId;
    this.editAssetData.areaId = '';
    this.editAssetData.buildingId = '';
    this.editAssetData.floorId = '';
    this.editAssetData.zoneId = '';
    this.editAssetData.outdoorZoneName = '';

    if (!countryId) { this.cdr.detectChanges(); return; }

    if (!this.areaByCountry[countryId]) {
      this.role.getSummary(countryId).subscribe({
        next: (res: any) => { this.areaByCountry[countryId] = Array.isArray(res) ? res : []; this.cdr.detectChanges(); },
        error: () => console.log('Error loading areas')
      });
    } else {
      this.cdr.detectChanges();
    }
  }

  onAssetAreaChangeEdit(areaId: string) {
    this.editAssetData.areaId = areaId;
    this.editAssetData.outdoorZoneName = '';
    this.editAssetData.buildingId = '';
    this.editAssetData.floorId = '';
    this.editAssetData.zoneId = '';

    if (!areaId) { this.cdr.detectChanges(); return; }

    if (!this.outdoorZonesByArea[areaId]) this.loadOutdoorZonesForArea(areaId);

    if (!this.buildingByArea[areaId]) {
      this.role.getBuilding(areaId).subscribe({
        next: (res: any) => { this.buildingByArea[areaId] = Array.isArray(res) ? res : []; this.cdr.detectChanges(); },
        error: () => console.log('Error loading buildings')
      });
    } else {
      this.cdr.detectChanges();
    }
  }

  onAssetBuildingChangeEdit(buildingId: string) {
    this.editAssetData.buildingId = buildingId;
    this.editAssetData.floorId = '';
    this.editAssetData.zoneId = '';

    if (!buildingId) { this.cdr.detectChanges(); return; }

    if (!this.floorByBuilding[buildingId]) {
      this.role.getFloor(buildingId).subscribe({
        next: (res: any) => { this.floorByBuilding[buildingId] = Array.isArray(res) ? res : []; this.cdr.detectChanges(); },
        error: () => console.log('Error loading floors')
      });
    } else {
      this.cdr.detectChanges();
    }
  }

  onAssetFloorChangeEdit(floorId: string) {
    this.editAssetData.floorId = floorId;
    this.editAssetData.zoneId = '';

    if (!floorId) { this.cdr.detectChanges(); return; }

    if (!this.zoneByFloor[floorId]) {
      this.role.getZones(floorId).subscribe({
        next: (res: any) => { this.zoneByFloor[floorId] = Array.isArray(res) ? res : []; this.cdr.detectChanges(); },
        error: () => console.log('Error loading zones')
      });
    } else {
      this.cdr.detectChanges();
    }
  }
}







