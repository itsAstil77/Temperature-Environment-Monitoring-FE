import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment.prod';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class Peopletype {
   private apiUrl = environment.apiUrl;
  constructor(private http: HttpClient) { }

 getPeopleType(pageNumber: number = 1, pageSize: number = 10) {
  return this.http.get(`${this.apiUrl}PeopleType/summary?pageNumber=${pageNumber}&pageSize=${pageSize}`);
}


  createNewPeopleType(createPeopleType: any) {
    return this.http.post(`${this.apiUrl}PeopleType/create`, createPeopleType)
  }



  updatePeopleType(updatePeopleType: any, id: string) {
    return this.http.put(`${this.apiUrl}PeopleType/update/${id}`, updatePeopleType)
  }

  DeletePeopleType(Id: string) {
    return this.http.delete(`${this.apiUrl}PeopleType/delete/${Id}`)
  }




  createNewAcess(createAcess: any) {
    return this.http.post(`${this.apiUrl}access/create`, createAcess)
  }






  getAccess(pageNumber: number = 1, pageSize: number = 10) {
    return this.http.get(`${this.apiUrl}access/summary?pageNumber=${pageNumber}&pageSize=${pageSize}`);
  }



  updateaccess(updateAccess: any, id: string) {
    return this.http.put(`${this.apiUrl}access/update/${id}`, updateAccess)
  }





  DeleteAccess(Id: string) {
    return this.http.delete(`${this.apiUrl}access/delete/${Id}`)
  }



getGroup(pageNumber: number = 1, pageSize: number = 10) {
  return this.http.get(`${this.apiUrl}groups/summary?pageNumber=${pageNumber}&pageSize=${pageSize}`);
}

  //create groups
  createGroups(creategroup: any) {
    return this.http.post(`${this.apiUrl}groups/create`, creategroup)
  }


  updateGroups(updategroups: any, id: string) {
    return this.http.put(`${this.apiUrl}groups/update/${id}`, updategroups);
  }


  DeleteGroups(Id: string) {
    return this.http.delete(`${this.apiUrl}groups/delete/${Id}`)
  }




 gettask(pageNumber: number = 1, pageSize: number = 10) {
  return this.http.get(`${this.apiUrl}tasks/summary?pageNumber=${pageNumber}&pageSize=${pageSize}`);
}



  createNewtask(createTasc: any) {
    return this.http.post(`${this.apiUrl}tasks/create`, createTasc)
  }

  updatetask(task: any, id: string) {
    return this.http.put(`${this.apiUrl}tasks/update/${id}`, task);
  }






  Deletetask(Id: string) {
    return this.http.delete(`${this.apiUrl}tasks/delete/${Id}`)
  }





  //attendance

  getManualAttendance(pageNumber: number, pageSize: number) {
    return this.http.get(`${this.apiUrl}attendance/summary?pageNumber=${pageNumber}&pageSize=${pageSize}`
    );
  }





  createmanualAttendance(createManualAttendance: any) {
    return this.http.post(`${this.apiUrl}attendance/create`, createManualAttendance)
  }


  updateAttendance(attendance: any, id: string) {
    return this.http.put(`${this.apiUrl}attendance/update/${id}`, attendance);
  }

  DeleteAttendance(id: string) {
    return this.http.delete(`${this.apiUrl}attendance/delete/${id}`);
  }




  //devices
  getaddDevices() {
    return this.http.get(`${this.apiUrl}deviceadd/all`)
  }

  //adddevices
  createadddevice(addDevice: any) {
    return this.http.post(`${this.apiUrl}deviceadd/create`, addDevice)
  }


  updateAddDevice(adddevice: any, id: string) {
    return this.http.put(`${this.apiUrl}deviceadd/update/${id}`, adddevice);
  }

  //delete add device
  DeleteAddDevice(id: string) {
    return this.http.delete(`${this.apiUrl}deviceadd/delete/${id}`);
  }

  //device type ==Device
  createdeviceType(Devicetype: any) {
    return this.http.post(`${this.apiUrl}devices/create`, Devicetype)
  }

getaddDeviceType(pageNumber: number, pageSize: number) {
  return this.http.get(`${this.apiUrl}devices/all?pageNumber=${pageNumber}&pageSize=${pageSize}`
  );
}

  //update

  updateDevice(editdevice: any, id: string) {
    return this.http.put(`${this.apiUrl}devices/update/${id}`, editdevice);
  }
  //delete

  DeleteDevicetype(id: string) {
    return this.http.delete(`${this.apiUrl}devices/delete/${id}`);
  }


 //private baseUrl = 'http://172.16.100.26:5202/api';

getAllDeviceParameters() {
  const url = `${this.apiUrl}device-parameters/all`;
  return this.http.get(url);
}

addNewPara(payload: any) {
  return this.http.post(`${this.apiUrl}device-parameters/create`, payload);
}

updateDeviceParametersById(id:string,payload:any){
  return this.http.put(`${this.apiUrl}device-parameters/update/${id}`,payload)
}

deleteDevicePara(id:string){
  return this.http.delete(`${this.apiUrl}device-parameters/delete/${id}`, { responseType: 'text' })
}





   getOutdoorZoneMapping(areaId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}zones/Zone1/${areaId}`);
  }


}
