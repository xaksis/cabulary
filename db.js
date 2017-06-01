/******************************************************
Cabulary Chrome Extension
Author: xaksis
about: db handler file
*******************************************************/

/* IndexedDB storage
*******************************************************/
var db_m = (function(){
	var db_name = "cabulary_db";
	var db_store = "words";
	var tDB = {};
	var datastore = null;
	var busy = false;

	tDB.onerror = function(event){
		console.error("IndexedDB Error: ", event.message);
		busy = false;
	}

	tDB.open = function (callback){
		if (busy) return;

		busy = true;

		//Database verison
		var version = 1;

		//open connection to db
		var request = indexedDB.open(db_name, version);

		//handle datastore upgrades
		request.onupgradeneeded = function(e){
			var db = e.target.result;

			e.target.transaction.onerror = tDB.onerror;

			//Delete the old datastore 
			if (db.objectStoreNames.contains(db_store)) {
		      db.deleteObjectStore(db_store);
		    }

		    // Create a new datastore.
		    //keypath is created_at timestamp
		    var store = db.createObjectStore(db_store, {
		      keyPath: 'created_at'
		    });

		    //create index on word itself
		    store.createIndex( 'word', 'word', { unique: true } );
		};

		// Handle successful datastore access.
		  request.onsuccess = function(e) {
		  	// not busy anymore
		  	busy = false;
		    // Get a reference to the DB.
		    datastore = e.target.result;

		    // Execute the callback.
		    callback();
		  };

		  // Handle errors when opening the datastore.
		  request.onerror = tDB.onerror;

	};

	tDB.total = function(callback){
	  // Get a reference to the db.
	  var db = datastore;

	  // Initiate a new transaction.
	  var objStore = db.transaction([db_store], 'readwrite').objectStore(db_store);
	  
	  var count = objStore.count();
	  
	  count.onsuccess = function(){
	  	callback(count.result);
	  };
	};

	/**
	 * Fetch all of the words in the datastore.
	 */
	tDB.fetchWords = function(page_no, count_pp, callback) {
	  var db = datastore;
	  var advanced = false;
	  var transaction = db.transaction([db_store], 'readwrite');
	  var objStore = transaction.objectStore(db_store);

	  var keyRange = IDBKeyRange.lowerBound(0);
	  var cursorRequest = objStore.openCursor(keyRange, "prev");

	  var words = [];

	  transaction.oncomplete = function(e) {
	    // Execute the callback function.
	    callback(words);
	  };

	  cursorRequest.onsuccess = function(e) {
	    var result = e.target.result;
	    var counter = 0;

	    if (!!result == false || words.length >= count_pp) {
	      return;
	    }

	    if(!advanced && page_no > 0){
	    	console.log("advancing...", page_no*count_pp);
	    	result.advance((page_no*count_pp));
	    	advanced = true;
	    }else{

	    	console.log(result.value);

		    words.push(result.value);
		    result.continue();
	    }
	  };

	  cursorRequest.onerror = tDB.onerror;
	};

	/**
	 * Create a new word item.
	 */
	tDB.addWord = function(word_obj, callback) {
	  // Get a reference to the db.
	  var db = datastore;

	  // Initiate a new transaction.
	  var transaction = db.transaction([db_store], 'readwrite');

	  // Get the datastore.
	  var objStore = transaction.objectStore(db_store);

	  // Create a timestamp for the todo item.
	  var timestamp = new Date().getTime();

	  //add timestamp to word
	  word_obj.created_at = timestamp;

	  // Create the datastore request.
	  var request = objStore.add(word_obj);

	  // Handle a successful datastore put.
	  request.onsuccess = function(e) {
	    // Execute the callback function.
	    callback(word_obj);
	  };

	  // Handle errors.
	  request.onerror = tDB.onerror;
	};

	/**
	 * Delete a word item. word is the string word
	 */
	tDB.deleteWord = function(key, callback) {
	  var db = datastore;
	  var transaction = db.transaction([db_store], 'readwrite');
	  var objStore = transaction.objectStore(db_store);

	  var request = objStore.delete(key);

	  request.onsuccess = function(e) {
	  	console.log(e);
	    callback();
	  }

	  request.onerror = function(e) {
	    console.log(e);
	  }
	};

	return tDB;
})();
