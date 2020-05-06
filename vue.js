Vue.config.devtools = true

var app = new Vue({
    el: '#app',
    data: {
        tripUpdates: RT,
        GTFS: GTFS,
        selectedTrip: ""
    },
    methods: {
        getETA: function(stopSequence){
            for(var i = 0; i< this.selectedTrip.tripUpdate.stopTimeUpdate.length; i++){
                if(stopSequence == this.selectedTrip.tripUpdate.stopTimeUpdate[i].stopSequence){
                    return new Date(this.selectedTrip.tripUpdate.stopTimeUpdate[i].arrival.time*1000).toLocaleTimeString();
                }
            }
        }
    }

})