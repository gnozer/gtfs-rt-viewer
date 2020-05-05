var GTFS = {
	patterns:{
		"agency.txt": {
			"agency_id": null,
			"agency_name": null,
			"agency_url": null,
			"agency_timezone": null
		},
		"routes.txt":{
			'route_id':null,
			'route_short_name':null,
			'route_long_name':null,
			'route_desc':null,
			'route_type':null,
			'route_url':null,
			'route_color':null,
			'route_text_color':null,
			"agency_id": null
		},
		"stops.txt": {
			'stop_id':null,
			'stop_code':null,
			'stop_name':null,
			'stop_desc':null,
			'stop_lat':null,
			'stop_lon':null,
			'zone_id':null,
			'stop_url':null,
			'location_type':null,
			'parent_station':null,
			'stop_timezone':null,
			'wheelchair_boarding':null
		},
		"trips.txt": {
			'route_id':null,
			'service_id':null,
			'trip_id':null,
			'trip_headsign':null,
			'trip_short_name':null,
			'direction_id':null,
			'block_id':null,
			'shape_id':null,
			'wheelchair_accessible':null,
			'bikes_allowed':null
		},
		"shapes.txt": {
			'shape_id':null,
			'shape_pt_lat':null,
			'shape_pt_lon':null,
			'shape_pt_sequence':null,
			'shape_dist_traveled':null,
		},
		"stop_times.txt": {
			'trip_id': null,
			'arrival_time': null,
			'departure_time': null,
			'stop_id': null,
			'stop_sequence': null
		},
		"calendar.txt":{
			'service_id': null,
			'monday': null,
			'tuesday': null,
			'wednesday': null,
			'thursday': null,
			'friday': null,
			'saturday': null,
			'sunday': null,
			'start_date': null,
			'end_date': null
		},
		"calendar_dates.txt":{
			'service_id': null,
			'date': null,
			'exception_type': null
		}
	},
	getGTFSPropertyId: function(fileName){
		if(fileName === "calendar.txt"){
			return 'service_id';
		}
		if(fileName === "calendar_dates.txt"){
			return 'service_id';
		}
		if(fileName === "shapes.txt"){
			return 'shape_id';
		}
		if(fileName === "trips.txt"){
			return 'trip_id';
		}
		if(fileName === "stops.txt"){
			return 'stop_id';
		}
		if(fileName === "routes.txt"){
			return 'route_id';
		}
		if(fileName === "agency.txt"){
			return 'agency_id';
		}
		if(fileName === "stop_times.txt"){
			return 'trip_id';
		}
		console.log(fileName + " --> don't know this file :) "); //TODO do it ! 
	},
	datas: {
		agency: null,
		routes: null,
		stops: null,
		trips: null,
		shapes: null,
		stop_times: null,
		calendar: null,
		calendar_dates: null,
	},

	getGTFSLines: function(gtfsData){
		return gtfsData.split(/[\r\n]+/g).filter(function (line) {
			  return line !== ""; // remove empty lines
		});
	},
	fetchGTFSData: function(filename, textContent){
		
		return new Promise(function(resolve, reject) {
			var 
			data = GTFS.getGTFSLines(textContent),
			pattern = GTFS.patterns[filename],
			gtfs_property = filename.slice(0,filename.indexOf(".")),
			id = GTFS.getGTFSPropertyId(filename);

			if(pattern){
				var 
				template = null;

				data.forEach(function(line){
					line = line.split(',');
					if(!template){
						template = pattern; 
						line.forEach(function(elt, i){
							template[elt] = (template.hasOwnProperty(elt) ? i : false);
						});
						GTFS.datas[gtfs_property] = {};

					}else{
						var entry = {};
						for(var key in template){
							if(template.hasOwnProperty(key)){
								entry[key] = line[template[key]];
							}
						}
						if(GTFS.datas[gtfs_property][entry[id]]){
							if(!Array.isArray(GTFS.datas[gtfs_property][entry[id]])){
								//array if several datas for same entries (shapes...)
								GTFS.datas[gtfs_property][entry[id]] = [GTFS.datas[gtfs_property][entry[id]]];
							}
							GTFS.datas[gtfs_property][entry[id]].push(entry);
						}else{
							GTFS.datas[gtfs_property][entry[id]] = entry;
						}
					}
				});
				
				resolve();
			}
		});
		
	}
};