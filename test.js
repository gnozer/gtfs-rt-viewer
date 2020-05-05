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

			if (entity.id.includes("Vehicle")) {
				msg["entity"][i + 1].tripUpdate.vehicle = entity.vehicle;
				displayVehiculeOnTrip(entity);
			} else {
				/*checkConsistancy(entity).then(function(entity){
					RT.push(entity);
				}).catch(function(error){
					console.log(error);
				});*/
				RT.push(entity);
				/*Promise.all(promises).then(function(entity){
					displayTrips();
				}).catch(function(error){
					console.log(error);
				});*/
			}

		});
			  displayTrips();
	}
	xhr.send(null);
});
}
function displayTrips(){
    RT.forEach(function(letrip,i){
        //Titre
        var title = document.createElement("h2");
        var textTitle = document.createTextNode(GTFS.datas.routes[letrip.tripUpdate.trip.routeId].route_long_name/* + " - " + GTFS.datas.trips[letrip.tripUpdate.trip.tripId].trip_headsign*/);
        title.appendChild(textTitle);
        document.getElementById("tripsList").appendChild(title);
        
        //Tableau comparatif
        var table = document.createElement("table");
        table.classList.add("table");
        table.classList.add("table-sm");
        var thead = document.createElement("thead");
        thead.classList.add("thead-dark");
        var trHead = document.createElement("tr");
        var th1 = document.createElement("th");
        var th1Text = document.createTextNode("Arrêts");
        var th2 = document.createElement("th");
        var th2Text = document.createTextNode("Horaire théorique");
        var th3 = document.createElement("th");
        var th3Text = document.createTextNode("Temps réel");
        th1.appendChild(th1Text);
        th2.appendChild(th2Text);
        th3.appendChild(th3Text);
        th1.setAttribute("scope", "col");
        th2.setAttribute("scope", "col");
        th3.setAttribute("scope", "col");
        trHead.appendChild(th1);
        trHead.appendChild(th2);
        trHead.appendChild(th3);
        thead.appendChild(trHead);
        table.appendChild(thead);
        document.getElementById("tripsList").appendChild(table);
        
        //Contenu du tableau
        if(GTFS.datas.stop_times.hasOwnProperty(letrip.tripUpdate.trip.tripId)){
            GTFS.datas.stop_times[letrip.tripUpdate.trip.tripId].forEach(function(stopTime, j){
                var tr = document.createElement("tr");
                var th = document.createElement("th");
                th.setAttribute("scope", "row");
                var thText = document.createTextNode(GTFS.datas.stops[stopTime.stop_id].stop_name);
                th.appendChild(thText);
                tr.appendChild(th);
 
                var td1 = document.createElement("td");
                var td1Text = document.createTextNode(stopTime.arrival_time);
                td1.appendChild(td1Text);
                tr.appendChild(td1);
                for(var k = 0; k < letrip.tripUpdate.stopTimeUpdate.length;k++){
                    if(stopTime.stop_sequence == letrip.tripUpdate.stopTimeUpdate[k].stopSequence){
                        var td2 = document.createElement("td");
                        var td2Text = document.createTextNode(new Date(letrip.tripUpdate.stopTimeUpdate[k].arrival.time*1000).toLocaleTimeString());
                        td2.appendChild(td2Text);
                        tr.appendChild(td2);
                    }
 
                }
 
                table.appendChild(tr);
            })
            
        }
    });
}