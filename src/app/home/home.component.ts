import { HttpClient } from '@angular/common/http';
import { Component, ViewChild, ElementRef, HostListener } from '@angular/core';
import * as L from 'leaflet';
import { environment } from 'src/environments/environment';

import { Options } from "@angular-slider/ngx-slider";
import { FunctionsService } from '../services/functions.service';
import { Layers } from './layers';
import { AuthService } from '../services/auth.service';

import Geonames from 'geonames.js';

import domtoimage from "dom-to-image-more"; // Module for saving dom element

let geonames = Geonames({
	username: 'myusername',
	lan: 'fr',
	encoding: 'JSON'
});





@Component({
	selector: 'app-home',
	templateUrl: './home.component.html',
	styleUrls: ['./home.component.css']
})
export class HomeComponent {

	@ViewChild('myInput') myInput: ElementRef;
	@ViewChild('tools') tools: ElementRef;
	@ViewChild('maps') maps: ElementRef;
	@ViewChild('forward') forward: ElementRef;
	@ViewChild('back') back: ElementRef;
	@ViewChild('message') message: ElementRef;
	@ViewChild('chechboxAll') chechboxAll: ElementRef;
	@ViewChild('slider') slider: ElementRef;
	

	@HostListener('window:resize', ['$event'])
	onResize(event?) {
		this.screenWidth = window.innerWidth;
	}

	geonames: any
	screenWidth = window.screenX
	value: number = 5;
	options: Options = {
		showTicksValues: true,
		stepsArray: [],
	};
	clusters: L.MarkerClusterGroup
	map: any
	marker: any
	markers = []
	fileName = '';
	spacyList = []
	spacyText = ""
	mainLayer: any
	uploadFile: boolean
	textArea: boolean = true
	listOfText = []
	listOfDate = []
	textSelected = ""
	dateSelected = ""
	text: string
	results: any = []

	file: any;
	groupeByList: any
	bounds: any
	model: string

	onCenter = false
	onFirsteCenter = true
	onAllFiles = false
	onClickMap = false

	confirmedLocation: any = []
	occurrences: any = []
	onExceeded = false
	statusMessage: string

	constructor(
		private http: HttpClient,
		private fs: FunctionsService,
		public auth: AuthService

	) { }

	
	ngAfterViewInit(): void {
		this.createMap()
	}

	// Method to saving dom element as png or jpeg
	async savaAsPng() {
		domtoimage
			.toPng(document.getElementById("map"), { quality: 0.99, width: innerWidth, height: innerHeight })
			.then(function (dataUrl) {
				var link = document.createElement("a");
				link.download = "map.png";
				link.href = dataUrl;
				link.click();
			});

	}



	// button to open tools
	openTools() {
		this.tools.nativeElement.style.left = '60px'
		document.getElementById('forward').style.display = 'none'
		document.getElementById('back').style.display = 'block'
	}

	// button to close tools
	closeTools() {
		this.tools.nativeElement.style.left = '-100%'
		document.getElementById('forward').style.display = 'block'
		document.getElementById('back').style.display = 'none'
	}

	// On click on map, close tools if open
	onMapClick() {
		this.closeTools()
	}

	// créer une carte leaflet
	createMap(lat = 0, lng = 0, z = 2) {
		let baseMaps = new Layers().getBaseMap()

		this.map = L.map('map').setView([lat, lng], z);
		this.mainLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
			minZoom: 1,
			maxZoom: 20,
			attribution: 'OSM'
		});
		this.mainLayer.addTo(this.map);

		var marker = L.markerClusterGroup()
		const overlayMaps = {
			'GeoJson Markers': marker
		}

		// ajouter plusieurs layers à la carte
		L.control.layers(baseMaps).addTo(this.map)
	}

	// selection of model
	onSelectModel(event) {
		this.onClickMap = false
		if (this.model === 'french_sm' || this.model === 'french_md' || this.model === 'french_lg') {
			geonames = Geonames({
				username: 'myusername',
				lan: 'fr',
				encoding: 'JSON'
			});
		}
		if (this.model === 'english_md') {
			geonames = Geonames({
				username: 'myusername',
				lan: 'en',
				encoding: 'JSON'
			});
		}

		if (this.model === 'german_sm' || this.model === 'german_md' || this.model === 'german_lg') {
			geonames = Geonames({
				username: 'myusername',
				lan: 'de',
				encoding: 'JSON'
			});
		}
	}

	// toggle between textarea and upload file
	onSelectTextArea(e) {
		this.textArea = true
		this.onClickMap = false
		this.clearText()
	}

	// toggle between textarea and upload file
	onSelectUploadFile(e) {
		this.clearText()
		this.textArea = false
		this.onAllFiles = false
		this.onClickMap = false
	}

	// Vider le textarea et réinitialiser la carte
	clearText() {
		this.onClickMap = false
		this.spacyList = []
		this.listOfText = []
		this.markers = []
		this.text = ''
		this.fileName = ""
		this.listOfDate = []
		this.results = []
		this.doubleArray = []
		this.confirmedLocation = []
		this.numberWords = 0
		if (this.map) this.map.remove()
		this.createMap()
	}


	numberWords = 0
	changeTextArea(){
		this.numberWords = this.text.split(' ').length - 1
	}

	// envoyer le text à SpaCy
	sendToSpacy(event) {
		this.onCenter = false
		this.onFirsteCenter = true
		this.onAllFiles = false
		this.textSelected = ''
		this.onClickMap = true
		this.onExceeded = false
		this.spacyList = []
		this.markers = []
		this.confirmedLocation = []
		this.results = []
		this.doubleArray = []
		if (this.clusters) this.clusters.clearLayers()

		if (this.textArea) {
			if (this.text) {
				if (this.text.split(' ').length < 201){
					// envoyer un text vers l'api spacy
					this.http.get(`${environment.url_py}/text`, { params: { text: this.text, model: this.model } })
					.subscribe((res: any) => {
	
						// supprimer les espaces and lowercase location
						res.map(item => {
							this.spacyList.push({ city: item.city.trim(), fileName: 'textarea', fileDate: 'no date' })
						})
	
						this.occurrences = this.spacyList
						// remove special characters
						this.spacyList = this.spacyList.filter(item => {
							return item.city = item.city.replace(/[/\n/\/^#,+()$€~%.!":|_*?<>{}0-9]/g, '')
						})
						// Camelcase location
						this.spacyList = this.spacyList.filter(item => {
							return item.city = item.city.charAt(0).toUpperCase() + item.city.substring(1)
						})
	
						// supprimer les lieux moins de 2 lettres
						this.spacyList = this.spacyList.filter(item => {
							return item.city.length > 2
						})
	
						// regrouper les nom des lieux selon le lieu
						let groupLocations = this.fs.groupBy(this.spacyList, item => item.city)
	
						this.spacyList = []
						for (let key of groupLocations) {
							this.spacyList.push({ city: key[0], fileName: key[1][0].fileName, fileDate: key[1][0].fileDate })
						}
	
						// récupérer les coordonnées des lieux reconnus par spacy via l'api geonames
						this.spacyList.forEach(item => {
							this.geonameSearch(item)
						})
						
						this.onClickMap = false
						
					}, (error) => console.log(error))
				}
				else {
					this.onClickMap = false
					alert('Text too large')
				}
			}
		}

		if (!this.textArea) {
			this.clearText()
			this.file = event.target.files[0];
			this.myInput.nativeElement.value = ""
			// envoyer un fichier txt ou zip via form data
			if (this.file) {
				let length = this.file.name.split('.').length
				let ext = this.file.name.split('.')[length - 1]
				if (ext === 'txt' && this.file.size < 1000000) {
					this.fileName = this.file.name
					const formData = new FormData();
					formData.append("name", this.file.name);
					formData.append("file", this.file, this.file.name);
					this.sendFormData(formData)
				}
				else {
					if (ext === 'zip' && this.file.size < 350000) {
						this.fileName = this.file.name
						const formData = new FormData();
						formData.append("name", this.file.name);
						formData.append("file", this.file, this.file.name);
						this.sendFormData(formData)
					}
					else {
						this.myInput.nativeElement.value = ""
						alert('Le fichier zip doit être moin de 350 ko et le txt moins de 1000 ko!')
					}
				}


			}
		}
	}

	sendFormData(formData: any) {
		// Send file to Spacy and get response
		
		this.results = []
		this.doubleArray = []
		this.onClickMap = true
		this.http.post(`${environment.url_py}/file`, formData, { params: { text: this.text, model: this.model } }).subscribe((res: any) => {
			this.occurrences = res
			this.spacyList = res

			// Regrouper les noms des fichiers dans la liste listOfText
			this.groupeByList = this.fs.groupBy(this.spacyList, item => item.fileName)
			for (let key of this.groupeByList) {
				let item = {
					legend: key[0],
					value: key[1][0].fileDate,
				}
				this.listOfText.push(item)
			}

			// Regrouper les dates des fichiers dans la liste listOfDate
			this.groupeByList = this.fs.groupBy(this.spacyList, item => item.fileDate)
			for (let key of this.groupeByList) {
				let item = {
					value: key[0]
				}
				this.listOfDate.push(item)
			}
			// this.listOfDate.push({value:null})
			this.listOfDate = this.listOfDate.sort((a, b) => {
				if (parseInt(a.value) > parseInt(b.value)) return 1
				if (parseInt(a.value) < parseInt(b.value)) return -1
				return 0
			})
			this.options.stepsArray = this.listOfDate
			this.options.stepsArray.unshift({value:0})
			

			this.results = []
			this.doubleArray = []

			// remove special characters
			this.spacyList = this.spacyList.filter(item => {
				return item.city = item.city.replace(/[/\n/\/^#,+()$€~%.!":|_*?<>{}0-9]/g, '')
			})
			// Camelcase location
			this.spacyList = this.spacyList.filter(item => {
				return item.city = item.city.charAt(0).toUpperCase() + item.city.substring(1)
			})

			// supprimer les lieux moins de 2 lettres
			this.spacyList = this.spacyList.filter(item => {
				return item.city.length > 2
			})

			// regrouper les nom des lieux selon le lieu
			let groupLocations = this.fs.groupBy(this.spacyList, item => item.city)

			this.spacyList = []
			for (let key of groupLocations) {
				if (!this.spacyList.find(item => item.city === key[0] && item.fileName === key[1][0].fileName)) {
					this.spacyList.push({ city: key[0], fileName: key[1][0].fileName, fileDate: key[1][0].fileDate })
				}
			}
			// récupérer les coordonnées des lieux reconnus par spacy via l'api geonames
			this.spacyList.forEach(item => {
				this.geonameSearch(item)
			})
			this.onClickMap = false
		})
		// let pointer = document.querySelector(".ngx-slider-pointer") as HTMLElement
		// pointer.style.background = '#0db9f0'
	}

	// Create marker for every location
	getMarkers(arr: any[]) {
		this.markers = []
		this.clusters = L.markerClusterGroup({});
		let url = 'assets/icons/blue.png'
		let size = 16
		let lat = 0
		let lng = 0

		arr.map(location => {			
			lat = parseFloat(location.lat)
			lng = parseFloat(location.lng)
			// icon size is 16 px  + nbr of occurrences in text
			this.marker = L.marker([location.lat, location.lng],
				{
					icon: new L.Icon(
						{
							iconUrl: url,
							iconSize: [size + location.occurence/location.repeated, size + location.occurence/location.repeated],
							iconAnchor: [6, 10],
							popupAnchor: [5, -10],
						}
					),
				}
			)			

			this.marker.bindPopup(`
				Name: ${location.city}<br> 
				Country: ${location.country}<br>
				Type: ${location.fclName}<br>
				Occurrence: ${location.occurence}<br>
				File name: ${location.fileName}<br>
				File Date: ${location.fileDate}
				`)
			this.marker.on('mouseover', function () {
				this.openPopup()
			})
			this.marker.on('mouseout', function () {
				this.closePopup()
			})
			this.markers.push(this.marker)
			// this.map.setView([location.lat, location.lng],5)
			this.clusters.addLayer(this.marker)
			this.map.addLayer(this.clusters)
		})

		// Contenir tous les markers sur la carte
		if (this.markers.length > 1) {
			if (this.markers[0]._latlng.lat != this.markers[this.markers.length - 1]._latlng.lat &&
				this.markers[0]._latlng.lng != this.markers[this.markers.length - 1]._latlng.lng) {
				this.bounds = L.featureGroup(this.markers);
				this.map.fitBounds(this.bounds.getBounds(), { padding: [0, 0] });
			}
		}
		else {
			let marker1 = L.marker([lat, lng - 1])
			let marker2 = L.marker([lat, lng + 1])
			this.markers.push(marker1)
			this.markers.push(marker2)
			this.bounds = L.featureGroup(this.markers);
			this.map.fitBounds(this.bounds.getBounds(), { padding: [0, 0] });
		}
	}

	// methode pour filtrer les résultats selon le nom du fichier dans l'occurrence où il y a plusieurs fichiers
	onSelectText(text) {
		this.onAllFiles = true
		this.onFirsteCenter = false
		this.onCenter = true
		this.textSelected = text
		let arr = []

		this.confirmedLocation.filter(place => {
			if (place.fileName === this.textSelected) {
				arr.push(place)
			}
		})
		
		if (arr.length > 0) {
			this.dateSelected = arr[0].fileDate
			// Récupérer l'occurence de chaque lieu
			this.fs.getOccurence(arr, this.occurrences)
			if (this.clusters) this.clusters.clearLayers()
			this.getMarkers(arr)
		}
		else this.onSelectALl()
		
		// let pointer = document.querySelector(".ngx-slider-pointer") as HTMLElement
		// pointer.style.background = '#0db9f0'
	}

	// methode pour filtrer les résultats selon la date du fichier dans l'occurrence où il y a plusieurs fichiers
	onSelectDate(date) {
		this.onCenter = false
		this.onFirsteCenter = false
		this.dateSelected = date
		this.onAllFiles = true
		let arr = []
		this.confirmedLocation.filter(place => {
			if (place.fileDate === this.dateSelected) {
				arr.push(place)
			}
		})
		
		if (arr.length > 0) {
			this.textSelected = arr[0].fileName
			this.fs.getOccurence(arr, this.occurrences)
			if (this.clusters) this.clusters.clearLayers()
			this.getMarkers(arr)
		}
		else this.onSelectALl()

		// let pointer = document.querySelector(".ngx-slider-pointer") as HTMLElement
		// pointer.style.background = '#0db9f0'
	}


	onSelectALl() {
		this.onCenter = false
		this.onFirsteCenter = true
		this.onAllFiles = false
		this.textSelected = ''
		this.dateSelected = "0"
		// Récupérer l'occurence de chaque lieu
		this.fs.getOccurence(this.results, this.occurrences)
		
		
		if (this.clusters) this.clusters.clearLayers()
		this.getMarkers(this.confirmedLocation)
		// let slider = document.querySelector('.ngx-slider-span')
		// console.log(this.slider.nativeElement.querySelector('span'))
		// console.log(document.querySelector('.ngx-slider-span').style)
		// let pointer = document.querySelector(".ngx-slider-pointer") as HTMLElement
		// pointer.style.background = 'transparent'
		
		
		
	}

	// Display location on map
	displayOnMap() {
		
		let res = this.fs.groupBy(this.results, item => item.city)
			
		this.doubleArray = []
		for (let key of res) {
			let item = {
				city: key[0],
				list: key[1]
			}
			// Display directly the location no repeated
			if (item.list.length === 1) {
				
				if (!this.confirmedLocation.find(element => element.city === item.city)){
					this.confirmedLocation.push(item.list[0])
				}
			}
			
			this.doubleArray.push(item)	
		}	
		// this.closeTools()
		this.textSelected = ""
		// this.dateSelected = ""
		this.onFirsteCenter = true
		this.onCenter = false
		
		this.fs.getOccurence(this.confirmedLocation, this.occurrences)
		this.fs.getDifference(this.confirmedLocation,this.results)
		
		let dl = this.doubleArray
		this.doubleArray.forEach(el => {
			this.fs.getDifference(this.confirmedLocation,el.list)
		})
		
		this.markers = []
		if (this.clusters) this.clusters.clearLayers()
		this.getMarkers(this.confirmedLocation)
		if (this.chechboxAll){
			this.chechboxAll.nativeElement.checked = false
		}
		
	}	
	
	
	onCheckAll(event){
		const allCheckBoxes = document.querySelectorAll(".select-first") as NodeListOf<HTMLInputElement>;
		
		if (event.target.checked) {
			allCheckBoxes.forEach(checkBox => {
				checkBox.checked = true;
				let city = checkBox.parentElement.querySelector('.city').textContent
				let country = checkBox.parentElement.querySelector('.country').textContent
				let location = this.results.filter(location => {
					return location.city === city && location.country === country
				})
				
				let item = location[0]
				this.confirmedLocation.push(item)
			});
		}
		else {
			allCheckBoxes.forEach(checkBox => {
				checkBox.checked = false;
				let city = checkBox.parentElement.querySelector('.city').textContent
				let country = checkBox.parentElement.querySelector('.country').textContent
				let location = this.results.filter(location => {
					return location.city === city && location.country === country
				})
				let item = location[0]
				this.confirmedLocation = this.confirmedLocation.filter(location => {
					return !(location.city === item.city && location.country === item.country)
				})
			});
		}
		
		
	}

	// Choose location to display on map
	onCheckLocation(event, item) {
		if (event.target.checked) {
			this.confirmedLocation.push(item)
		}
		else {
			this.confirmedLocation = this.confirmedLocation.filter(location => {
				return !(location.city === item.city && location.country === item.country)
			})
		}

		if (this.confirmedLocation.length === 0) {
			if (this.clusters) this.clusters.clearLayers()
		}
	}

	// Display alert when uploading file and no model selected
	onClickDivFile() {
		if (!this.model) {
			this.message.nativeElement.style.top = '50%'
		}
		setTimeout(() => {
			this.message.nativeElement.style.top = '-100%'
		}, 3000);
	}

	// Close alert message when no place found
	onCloseAlert() {
		this.onClickMap = false
	}

	doubleArray = []
	// send request to Geonames and get results
	geonameSearch(item: any = {}) {
		geonames.search({ q: item.city })
			.then(response => {
				if (!response.status) {

					for (let i = 0; i < response.geonames.length; i++) {
						if (response.geonames[i]) {
							if (item.city === response.geonames[i].name) {
								// éviter la répitition du même lieu dans le même pays et région
								if (!this.results.find(location =>
									location.city === item.city &&
									location.country === response.geonames[i].countryName &&
									location.adminName1 === response.geonames[i].adminName1 &&
									location.fileName === item.fileName)
								) {
									this.results.push({
										city: item.city,
										country: response.geonames[i].countryName,
										lng: response.geonames[i].lng,
										lat: response.geonames[i].lat,
										adminName1: response.geonames[i].adminName1,
										fcodeName: response.geonames[i].fcodeName,
										fcl: response.geonames[i].fcl,
										fclName: response.geonames[i].fclName.split(',')[0],
										fileName: item.fileName,
										fileDate: item.fileDate,
									});
								}
							}
						}
					}
					// sort list by place
					this.fs.sortListObject(this.results)
					
					let res = this.fs.groupBy(this.results, item => item.city)
			
					this.doubleArray = []
					for (let key of res) {
						let item = {
							city: key[0],
							list: key[1]
						}
						// Display directly the location no repeated
						if (item.list.length === 1) {
							
							if (!this.confirmedLocation.find(element => element.city === item.city)){
								this.confirmedLocation.push(item.list[0])
							}
						}
						this.doubleArray.push(item)
						this.displayOnMap()

						
					}					
					
					
				}
				else {
					if (!this.onExceeded) {
						this.onExceeded = true
						alert(`${response.status.message} \n\n` + 'geonames.org')
					}
				}
			})
			
			
			
	}


	exportCSV() {
		this.fs.exportCSV(this.confirmedLocation, this.results)
	}


	

}



