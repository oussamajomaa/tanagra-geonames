import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environments/environment';

import Geonames from 'geonames.js';
const geonames = Geonames({
	username: 'myusername',
	lan: 'fr',
	encoding: 'JSON'
});

@Injectable({
  providedIn: 'root'
})
export class DataService {

	routes:any = []
	constructor(private http:HttpClient) { 
	}

	 async getGeonames(str:string){
		try{
			const response = await geonames.search({ q: str.trim() })
			return response
		}
		catch (err) {
			throw err;
		}
	}



	// getLocation(){
	// 	return this.http.get(`${environment.url}/cities`)
	// }

	// getCountries(){		
	// 	return this.http.get(`${environment.url}/countries`)
	// }

	sendFile(form){
		const headers = new HttpHeaders({
			'Access-Control-Allow-Headers': 'Content-Type',
			'Access-Control-Allow-Methods': 'POST',
			'Access-Control-Allow-Origin': '*'
		})
		return this.http.post(`${environment.url_py}/file`,form)
	}

	getRiver(){
		return this.http.get('assets/data/river.json')
	}
}
