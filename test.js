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

            var bufferSliceWhereProtobufBytesIs = xhr.response.slice(protoStart + offsetStart, protoEnd - offsetEnd);

            var msg = AwesomeMessage.decode(new Uint8Array(xhr.response));
            console.log(msg);
            msg["entity"].forEach(function (entity, i) {
                if (entity.id.includes("Vehicle")) {
                    msg["entity"][i + 1].tripUpdate.vehicle = entity.vehicle;
                } else {
                    RT.push(entity);
                }

            })
            displayTrips();

        }

        xhr.send(null);
    });
};

function displayTrips(){
    RT.forEach(function(letrip,i){
        //Titre
        var title = document.createElement("h2");
        var textTitle = document.createTextNode(GTFS.datas.routes[letrip.tripUpdate.trip.routeId].route_long_name + " - " + GTFS.datas.trips[letrip.tripUpdate.trip.tripId].trip_headsign);
        title.appendChild(textTitle);
        document.getElementById("result").appendChild(title);
        
        //Tableau comparatif
        var table = document.createElement("table");
        table.classList.add("table");
        var thead = document.createElement("thead");
        thead.classList.add("thead-dark");
        var tr = document.createElement("tr");
        var th1 = document.createElement("th");
        var th1Text = document.createTextNode("Arrêts");
        var th2 = document.createElement("th");
        var th1Text = document.createTextNode("Temps réel");
        var th3 = document.createElement("th");
        var th1Text = document.createTextNode("Horaire théorique");
        var thProperty = document.createAttribute("scope");
        thProperty.value = "col";
        th1.setAttribute(thProperty);
        th2.setAttribute(thProperty);
        th3.setAttribute(thProperty);
        tr.appendChild(th1);
        tr.appendChild(th2);
        tr.appendChild(th3);
        thead.appendChild(tr);
        table.appendChild(thead);
    })
}