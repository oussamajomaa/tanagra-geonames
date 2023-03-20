import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import * as L from 'leaflet';



@Injectable({
	providedIn: 'root'
})
export class FunctionsService {

	constructor(private http:HttpClient) { }

	// Transform string into Camel Case
	toCamelCase(s) {
		return s.split(/(?=[A-Z])/).map(function (p) {
			return p.charAt(0).toUpperCase() + p.slice(1);
		}).join(' ');
	}

	// Sort list of Objects
	sortListObject(list:[]) {
		list.sort((a: any, b: any) => {
			if (a.city > b.city) return 1
			if (a.city < b.city) return -1
			return 0
		})
	}

	// Cette methode va regrouper la liste selon le nom d'un propriété
	groupBy(list, keyGetter) {
		const map = new Map();
		list.forEach((item) => {
			const key = keyGetter(item);
			const collection = map.get(key);
			if (!collection) {
				map.set(key, [item]);
			} else {
				collection.push(item);
			}
		});
		return map;
	}


	// methode pour créer un fichier csv
	downloadFile(data: any, name: string) {
		const replacer = (key, value) => (value === null ? '' : value); // specify how you want to handle null values here
		const header = Object.keys(data[0]);
		const csv = data.map((row) =>
			header
				.map((fieldName) => JSON.stringify(row[fieldName], replacer))
				.join(',')
		);
		csv.unshift(header.join(','));
		const csvArray = csv.join('\r\n');

		const a = document.createElement('a');
		const blob = new Blob([csvArray], { type: 'text/csv' });
		const url = window.URL.createObjectURL(blob);

		a.href = url;
		a.download = name;
		a.click();
		window.URL.revokeObjectURL(url);
		a.remove();
	}

	// Exporter les ambigus et les lieus non reconnus dans un fichier csv
	// Ou bien exporter les lieux cartographier et non cartographier dans un fichier csv
	exportCSV(foundCities:any[],notFoundCities:any[]) {
		let found = []
		foundCities.map(location => found.push(
			{
				place: location.city,
				region:location.adminName1,
				country: location.country,
				type: location.fclName.split(',')[0],
				occurence:location.occurence,
				mapped:'yes' 
			}
		))
		
		// this.downloadFile(found, 'reconnu')
		let notFound = []
		notFoundCities.map(location => notFound.push(
			{ 
				place: location.city,
				region:location.adminName1,
				country: location.country,
				type: location.fclName.split(',')[0],
				occurence:location.occurence,
				mapped:'no'   
			}
		))
		let list = found.concat(notFound)
		this.downloadFile(list, 'file')
	}

	// récupérer le nombre d'occurrences
	getOccurence(arr1:any[],arr2:any[]){
		// compter combien de fois le même lieu est cartographié
		let repeated = this.groupBy(arr1, item => item.city)
		for (let key of repeated) {
			arr1.map(item => {
				if (key[0] === item.city)
				return item.repeated = key[1].length
			})
		}
		
		arr1.map(location => {
			// return location.occurence = this.wordList.filter(word => word === location.city).length
			return location.occurence = arr2.filter(item => ((item.city.match("\\b" + location.city + "\\b")) && (item.fileName === location.fileName))).length
		})

	}

	cleanSpacyResults(spacyList:any[], res:any[]){
		// supprimer les espaces and lowercase location
		res.map(item => {
			spacyList.push({city:item.city.trim().toLowerCase(), fileName:'textarea', fileDate:'no date'})
			// let split = item.city.split(' ')
			// split.map(splitItem => this.spacyList.push({city:splitItem.trim().toLowerCase()}))
			
		})

		// remove special characters
		spacyList = spacyList.filter(item => {
			return item.city = item.city.replace(/[/\n/\/^#,+()$€~%.!":|_*?<>{}0-9]/g,'')
		})


		// Camelcase location
		spacyList = spacyList.filter(item => {
			return item.city = item.city.charAt(0).toUpperCase() + item.city.substring(1)
		})

		// supprimer les lieux moins de 2 lettres
		spacyList = spacyList.filter(item => {
			return item.city.length > 2
		})

		// regrouper les nom des lieux selon le lieu
		let groupLocations = this.groupBy(spacyList, item => item.city)
		
		spacyList = []
		for (let key of groupLocations) {
			
			spacyList.push({ city: key[0]})
		}
	}

	// get difference between two array
	getDifference(arr1, arr2) {
		let pos
		arr1.map(item => {
			pos = arr2.findIndex(location => location.city === item.city && location.country === item.country)
			if (pos != -1) arr2.splice(pos,1)
		})
	}

}
