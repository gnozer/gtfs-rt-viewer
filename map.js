var 
map,
vehicleMarker,
tripShapeLayer,
tripStopsLayer;

function displayVehiculeOnTrip(){
	
	displayVehicle(this.tripUpdates[this.selectedTrip].tripUpdate);
	
	var trip = this.GTFS.datas.trips[this.tripUpdates[this.selectedTrip].tripUpdate.vehicle.trip.tripId];
	if(trip){
		var 
		stops = this.GTFS.getStopsByTripId(trip.trip_id),
		stopFeature = [];
		//TODO move in build function
		stops.forEach(function(stop){
			stopFeature.push(buildGeoJsonStop(stop));
		});
		
		displayStops(stopFeature);
		
		var shape = this.GTFS.datas.shapes[trip.shape_id];
		
		var shapeFeature = buildGeoJsonShape();
		shape.forEach(function(shape_entry){
			shapeFeature.coordinates.push([parseFloat(shape_entry['shape_pt_lon']), parseFloat(shape_entry['shape_pt_lat'])]);
		});
		displayShape(shapeFeature);
		
	}else{
		console.log("unknown trip");
	}
}

function buildGeoJsonShape(){
	return {
		 "type": "LineString",
		 "coordinates": []
	};
}

function buildGeoJsonStop(stop){
	return {
		"type": "Point",
		"coordinates": [parseFloat(stop.stop_lon), parseFloat(stop.stop_lat)]
	}
}

function displayVehicle(vehiclePosition){
    if(!vehicleMarker){
//		var vehicleIcon = L.icon({
//			iconUrl: 'vehicle.png',
//			iconSize: [64, 64],
//			iconAnchor: [32, 0],
//		});
        var vehicleIcon = L.icon({
			iconUrl: 'vehicle2.png',
			iconSize: [60, 60],
			iconAnchor: [30, 30],
		});
		vehicleMarker = L.marker([vehiclePosition.vehicle.position.latitude, vehiclePosition.vehicle.position.longitude], {icon: vehicleIcon}).addTo(map);
	}else{
		vehicleMarker.setLatLng([vehiclePosition.vehicle.position.latitude, vehiclePosition.vehicle.position.longitude]);
	}
	map.setView(vehicleMarker.getLatLng(),5);
}

function displayStops(geoJson){
	if(tripStopsLayer){
		map.removeLayer(tripStopsLayer);
	}
	tripStopsLayer = L.geoJSON(geoJson);
	tripStopsLayer.addTo(map);
	map.fitBounds(tripStopsLayer.getBounds());
}

function displayShape(geoJson){
	if(tripShapeLayer){
		map.removeLayer(tripShapeLayer);
	}
	tripShapeLayer = L.geoJSON([geoJson]);
	tripShapeLayer.addTo(map);
	map.fitBounds(tripShapeLayer.getBounds());
}