Vue.config.devtools = true
var intervalId;
var app = new Vue({
    el: '#app',
    data: {
		  activeVehicle: null,
        tripUpdates: [],
		  vehicles: [],
        GTFS: GTFS,
        urlRT: null,
		  selectedTrip: null,
        GTFSSuccess: false,
        timer: "",
        refresh: false,
        vehicleStatus: ["Le véhicule est sur le point d'arriver à l'arrêt ", "Le véhicule est immobilisé à l'arrêt ", "Le véhicule a quitté l'arrêt précédent et poursuit sa route vers "]
    },
    mounted: function () {

        // Code that will run only after the
        // entire view has been rendered
        //	(function initMap(){
        map = L.map('map').setView([51.505, -0.09], 13);
        L.tileLayer('https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="http://cartodb.com/attributions">CartoDB</a>'
        }).addTo(map);
        //})();

    },
    created: function () {
        setInterval(this.getNow, 1000);
    },
    methods: {
        getETA: function (stopSequence) {
            for (var i = 0; i < this.tripUpdates[this.selectedTrip].tripUpdate.stopTimeUpdate.length; i++) {
                if (stopSequence == this.tripUpdates[this.selectedTrip].tripUpdate.stopTimeUpdate[i].stopSequence && stopSequence != 0 && this.tripUpdates[this.selectedTrip].tripUpdate.stopTimeUpdate[i].hasOwnProperty("arrival")) {
                    return new Date(this.tripUpdates[this.selectedTrip].tripUpdate.stopTimeUpdate[i].arrival.time * 1000).toLocaleTimeString();
                }
            }
            return "N/A";
        },
        getETD: function (stopSequence) {
            for (var i = 0; i < this.tripUpdates[this.selectedTrip].tripUpdate.stopTimeUpdate.length; i++) {
                if (stopSequence == this.tripUpdates[this.selectedTrip].tripUpdate.stopTimeUpdate[i].stopSequence && stopSequence != 0 && this.tripUpdates[this.selectedTrip].tripUpdate.stopTimeUpdate[i].hasOwnProperty("departure")) {
                    return new Date(this.tripUpdates[this.selectedTrip].tripUpdate.stopTimeUpdate[i].departure.time * 1000).toLocaleTimeString();
                }
            }
            return "N/A";
        },
        getStop: function (tripId, stopSeq) {
            if (this.GTFS.datas.trips[tripId]) {
                for (var i = 0; i < this.GTFS.datas.stop_times[tripId].length; i++) {
                    if (i == stopSeq) {
                        return this.GTFS.datas.stops[this.GTFS.datas.stop_times[tripId][stopSeq].stop_id].stop_name;
                    }
                }
            }

        },
		 
        getRT: function (isRefresh) {
            protobuf.load("gtfs-realtime.proto", function (err, root) {
                if (err)
                    throw err;

                var AwesomeMessage = root.lookupType("transit_realtime.FeedMessage");
                var xhr = new XMLHttpRequest();
                xhr.open(
                    /* method */
                    "GET",
                    /* file */
                    this.urlRT,
                    /* async */
                    true
                );
                xhr.responseType = "arraybuffer";
                xhr.onload = function (evt) {
                    // reading whole body
                    var bodyEncodedInString = String.fromCharCode.apply(String, new Uint8Array(xhr.response));
                    //  console.log(bodyEncodedInString);
                    /*
                        for example it would be something like that in console:
                        `RESPONSE_BODY:
                            --protobuf
                            [...someprotobytes]
                            --protobuf--
                        `
                    */

                    var protoStart = bodyEncodedInString.indexOf('--protobuf');
                    var protoEnd = bodyEncodedInString.indexOf('--protobuf--');

                    /*
                         "Offset start" and "offset end" are required for line endings. Don't forget, that on various operating systems there is different line endings, and it is not so uncommon when your backend is running on Windows and generates "\r\n" in place of line endings.
                     */
                    var offsetStart = 2;
                    var offsetEnd = 2;

                    var msg = AwesomeMessage.decode(new Uint8Array(xhr.response));
						 
						 
						 msg['entity'].forEach(function(current){
							 
							 if(current.vehicle){
								 
								 if(this.activeVehicle && this.activeVehicle.id && this.activeVehicle.id === current.id){ //FIXME could we use a watch ? 
									 this.activeVehicle = current;
									 this.displayVehiculeOnTrip(isRefresh);
								 }
								 
								 updateArray(this.vehicles, current);
							 }
							 
							 if(current.tripUpdate){
								  updateArray(this.tripUpdates, current);
							 }
							 
						 }.bind(this));
                   
                }.bind(this);
                xhr.send(null);
            }.bind(this));
        },	
        allowDrop: function (e) {
            e.preventDefault();
            e.stopPropagation();
        },
        drop: function (e) {
            this.readZip(e, this.GTFS.fetchGTFSData, this.setGTFSSuccess);
            e.preventDefault();
            e.stopPropagation();
        },
        readZip: readZip,
        setGTFSSuccess: function () {
            this.GTFSSuccess = true;
        },
        displayVehiculeOnTrip: displayVehiculeOnTrip,
        getNow: function () {
            var today = new Date();
            var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
            this.timer = time;
        },
        stopInterval: function () {
            this.refresh = false;
            clearInterval(intervalId);
        }
    },
    watch: {
        // à chaque fois que le selectedTrip change, cette fonction s'exécutera
        selectedTrip: function (newSelectedTrip, oldSelectedTrip) {
			  var trip = this.tripUpdates[newSelectedTrip]; //TODO use directly the object
				this.vehicles.forEach(function(elt){
					if(elt.vehicle.trip.tripId === trip.tripUpdate.trip.tripId){
						this.activeVehicle = elt;
					}
				}.bind(this));
			  
            this.displayVehiculeOnTrip();
        },
        refresh: function (newRefresh, oldRefresh) {
            if (newRefresh) {
                intervalId = setInterval(function(){this.getRT(true)}.bind(this), 5000);
            }
        }
    }
});
