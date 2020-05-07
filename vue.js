Vue.config.devtools = true

var RT = [];
var app = new Vue({
    el: '#app',
    data: {
        tripUpdates: [],
        GTFS: GTFS,
        selectedTrip: "",
        urlRT: null,
        rtSuccess: false,
        GTFSSuccess: false
    },
    methods: {
        getETA: function (stopSequence) {
            for (var i = 0; i < this.selectedTrip.tripUpdate.stopTimeUpdate.length; i++) {
                if (stopSequence == this.selectedTrip.tripUpdate.stopTimeUpdate[i].stopSequence && stopSequence != 0) {
                    return new Date(this.selectedTrip.tripUpdate.stopTimeUpdate[i].arrival.time * 1000).toLocaleTimeString();
                }
            }
            return "N/A";
        },
        getETD: function (stopSequence) {
            for (var i = 0; i < this.selectedTrip.tripUpdate.stopTimeUpdate.length; i++) {
                if (stopSequence == this.selectedTrip.tripUpdate.stopTimeUpdate[i].stopSequence && stopSequence != 0) {
                    return new Date(this.selectedTrip.tripUpdate.stopTimeUpdate[i].departure.time * 1000).toLocaleTimeString();
                }
            }
            return "N/A";
        },
        runRT: function (urlRT) {
            protobuf.load("gtfs-realtime.proto", function (err, root) {
                if (err)
                    throw err;

                var AwesomeMessage = root.lookupType("transit_realtime.FeedMessage");
                var xhr = new XMLHttpRequest();
                xhr.open(
                    /* method */
                    "GET",
                    /* file */
                    urlRT,
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

                    msg["entity"].forEach(function (entity, i) {

                        if (entity.id.includes("Vehicle")) {
                            msg["entity"][i + 1].tripUpdate.vehicle = entity.vehicle;
                            //displayVehiculeOnTrip(entity);
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
                    //  displayTrips();
                }
                xhr.send(null);
            })
            this.tripUpdates = RT;
            this.rtSuccess = true;
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
        displayVehiculeOnTrip: displayVehiculeOnTrip
    },
    watch: {
        // à chaque fois que le selectedTrip change, cette fonction s'exécutera
        selectedTrip: function (newSelectedTrip, oldSelectedTrip) {
            this.displayVehiculeOnTrip();
        }
    }
});