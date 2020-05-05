//load static

/*GET('https://zenbus.net/gtfs/static/download.zip?dataset=moselle-et-madon')
.then(function (datums) {
  console.log(typeof datums.response);
	
	readZip(datums.response, null)
});*/
var RT = [];

function allowDrop(e) {
    e.preventDefault();
    e.stopPropagation();
}

function drop(e) {
    readZip(e, GTFS.fetchGTFSData, runRT);
    e.preventDefault();
    e.stopPropagation();
}

function checkConsistancy(entity){
	console.log(entity);
	return new Promise(function(resolve, reject) {
		//vehicule 
		if(entity && entity.vehicle && entity.vehicle.trip && entity.vehicle.trip.tripId){
			if(GTFS.datas.trips[entity.vehicle.trip.tripId]){ //FIXME test ad hoc
				resolve(entity);
			}else{
				reject("trip id is not constistancy, or ad hoc"); 
			}
		}
		//
		if(entity && entity.tripUpdate && entity.tripUpdate.trip && entity.tripUpdate.trip.tripId){
			if(GTFS.datas.trips[entity.tripUpdate.trip.tripId]){
				resolve(entity);
			}else{
				reject("trip id is not constistancy");
			}
		}
		reject(entity);
	});
}

//run real time polling
function runRT() {
    protobuf.load("gtfs-realtime.proto", function (err, root) {
        if (err)
            throw err;

        var AwesomeMessage = root.lookupType("transit_realtime.FeedMessage");
        var xhr = new XMLHttpRequest();
        xhr.open(
            /* method */
            "GET",
            /* file */
            "https://zenbus.net/gtfs/rt/poll.proto?dataset=moselle-et-madon",
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

       var StatusEnum = [
           "Arrive bientôt",
           "A l'arrêt",
           "Sur la route"
       ]
        
       var msg = AwesomeMessage.decode(new Uint8Array(xhr.response));
        msg["entity"].forEach(function(entity, i){
			  
			  checkConsistancy(entity).then(function(entity){
				  var divResult = document.getElementById("result");
            
					//Titre de l'entité
					var h2Entity = document.createElement("h2");
					if(entity.id.includes("Vehicle")){
						 var textH2Entity = document.createTextNode("Entité "+i+" : Véhicule ("+entity.id+")");
						 h2Entity.appendChild(textH2Entity);
						 divResult.appendChild(h2Entity); 

						 //Position GMaps
						 var gmapsLink = document.createElement('a');
						 var GmapsLinkText = document.createTextNode("Position géographique (GMaps)");
						 gmapsLink.setAttribute('href', "https://www.google.com/maps/search/"+entity.vehicle.position.latitude+"+"+entity.vehicle.position.longitude);
						 gmapsLink.setAttribute('target', "_blank");
						 gmapsLink.appendChild(GmapsLinkText);
						 divResult.appendChild(gmapsLink);

						 //Status
						 var statusP = document.createElement("p");
						 var statusPText = document.createTextNode(StatusEnum[entity.vehicle.currentStatus]);
						 statusP.appendChild(statusPText);
						 divResult.appendChild(statusP);

						 //Timestamp
						 var timestampP = document.createElement("p");
						 var timestampPText = document.createTextNode(new Date(entity.vehicle.timestamp*1000));
						 timestampP.appendChild(timestampPText);
						 divResult.appendChild(timestampP);

						 //Route
						 var routeP = document.createElement("p");
						 var routePText = document.createTextNode("Route : "+entity.vehicle.trip.routeId);
						 routeP.appendChild(routePText);
						 divResult.appendChild(routeP);

						 //Trip
						 var tripP = document.createElement("p");
						 var tripPText = document.createTextNode("Trip : "+entity.vehicle.trip.tripId);
						 tripP.appendChild(tripPText);
						 divResult.appendChild(tripP);

						 //Stop sequence
						 var stopSeqP = document.createElement("p");
						 var stopSeqPText = document.createTextNode("Stop sequence : "+entity.vehicle.currentStopSequence);
						 stopSeqP.appendChild(stopSeqPText);
						 divResult.appendChild(stopSeqP);
					} else {
						 var textH2Entity = document.createTextNode("Entité "+i+" : TripUpdate ("+entity.id+")");
						 h2Entity.appendChild(textH2Entity);
						 divResult.appendChild(h2Entity); 
					}

			  }).catch(function(error){
				  console.log("error");
				  console.log(error);
			  });
			// document.getElementById('result').innerHTML += JSON.stringify(msg, null, 4);
	//       alert(JSON.stringify(msg, null, 4)); // Correctly decoded
		 });
	 	}
		xhr.send(null);
	});
}
