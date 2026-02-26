import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment.prod';

@Injectable({
  providedIn: 'root'
})

export class Peopleservice {
  

 private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient){}

getPerson(pageNumber: number = 1, pageSize: number = 10) {
  return this.http.get(`${this.apiUrl}Person/summary?pageNumber=${pageNumber}&pageSize=${pageSize}`);
}

createNewPerson(createPerson:any){
  return this.http.post(`${this.apiUrl}Person/create`,createPerson)
}
  


updatePerson(updatePerson:any,id:string){
  return this.http.put(`${this.apiUrl}Person/update/${id}`,updatePerson)
}

DeletePerson(PersonId:string){
  return this.http.delete(`${this.apiUrl}Person/delete/${PersonId}`)
}
}
