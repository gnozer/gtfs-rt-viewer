//function readZip(response){
function readZip(e, applyPromise, callback){ //TODO use callback here
	let droppedFiles = e.dataTransfer.files;
	//var blob = new Blob([response], {type: "octet/stream"});
	//if(!blob) return;
	if(!droppedFiles) return;
	
	var promises = [];
	
	zip.workerScriptsPath = './zip/';
	// use a BlobReader to read the zip from a Blob object
	zip.createReader(new zip.BlobReader(droppedFiles[0]), function(reader) {
		// get all entries from the zip
		reader.getEntries(function(entries) {
			if (entries.length) {
				entries.forEach(function(entry, i, array){
					entry.getData(new zip.TextWriter(), function(text) {	
						// text contains the entry data as a String
						promises.push(applyPromise(entry.filename, text));
						if(i == array.length - 1){
							Promise.all(promises).then(callback);
						}
					});	
				});
			}	
		}, function(error) {
			// onerror callback
			console.log(error);
		});
	});
}