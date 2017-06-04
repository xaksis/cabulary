/******************************************************
Cabulary Chrome Extension
Author: xaksis
about: takes care of bulk of our business logic. We will
use IndexedDB as our main storage but we'll also use chrome
storage sync to keep the words in case we ever need to get
them back or sync across
*******************************************************/

/* Notification module
*******************************************************/
var notify_m = (function(){
	
	function _createNotification(name, title, msg){
		console.log(msg);
		var opt = {
			type: 'basic',
		    title: title,
		    message: msg,
		    priority: 1,
		    iconUrl:'imgs/icon128.png'
		}
		chrome.notifications.create(name, opt, function(id) { 
			console.log("Last error:", chrome.runtime.lastError); 
		});
	}

	return {
		notify: _createNotification
	}
})();

/* Listener for Dialog message. once user has selected
   One of the meanings, this will add the word
*****************************************************/
chrome.runtime.onMessage.addListener(function (msg, sender) {
  // First, validate the message's structure
  if ((msg.from === 'dialog') && (msg.subject === 'definition')) {
  	var selected_word = JSON.parse(msg.data);
  	console.log(selected_word); 
  	//add this word
  	store_m.saveWord(selected_word);
  	return;
  }
  if ((msg.from === 'popup') && (msg.subject === 'definition')) {
  	console.log('got message from popup');
  	store_m.addWord(msg.data, undefined);
  	return;
  }
});

/* Module to store the word in chrome storage
*******************************************************/
var store_m = (function(){
	// var word_url = "";

	function _doesWordExist(word){
		chrome.storage.sync.get(word, function(obj){
			if(obj){
				notify_m.notify(word, "Cabulary Notification", word+" already exists in your deck");
				return true;
			}
		});
		return false;
	}

	function _showMultiplePopup(defs, defCount){
		var headerHeight = 50;
		var defHeight = 90;
		var footerHeight = 50;
		var windowHeight = headerHeight + (defHeight * defCount) + footerHeight;
		console.log("creating dialog...");
		chrome.tabs.create({
          url: chrome.extension.getURL('dialog.html'),
          active: false
      }, 
      function (tab) {
        // After the tab has been created, open a window to inject the tab
        chrome.windows.create({
            tabId: tab.id,
            type: 'popup',
            width: 650,
            height: windowHeight,
            focused: true
            // incognito, top, left, ...
        }, function (win) {
        	//forced delay to avoid race condition
        	setTimeout(function (){
        		chrome.runtime.sendMessage({
						  from:    'background',
						  subject: 'definitions',
						  data: defs
						});
        	}, 700);        	
        });
        
      });
	}

	function saveWordObject(word_obj){
		//add the url as well
		word_obj.url = word_url;
		//create an object to store in chrome sync
		var storage_word = {};
		storage_word[word_obj.word] = "y";

		//check if this word form exists already
		chrome.storage.sync.get(word_obj.word, function(obj){
			if(!$.isEmptyObject(obj)){
				//word already exist no need to add
				console.log("word form already exists!", obj);
				notify_m.notify(word_obj.word, "Cabulary Notification", "\""+word_obj.word+"\" already exists in your deck");
			}else{
				//add the word only to sync
				chrome.storage.sync.set(storage_word, function(){
					//add the word object to indexed db
					db_m.addWord(word_obj, function(){
						notify_m.notify(word_obj.word, "Cabulary Notification", "\""+word_obj.word+"\" saved to deck");
						console.log("word saved!");
					});
				});
			}
		});
	}

	function _getWordObject(definition, pronunciation){
		return {
			word: definition.word,
			pronun: pronunciation[0] ? pronunciation[0].raw : '',
			pos: definition.partOfSpeech,
			def: definition.text,
			sentence: ""
		};
	}

	function _handleWord(definitions, pronunciation){
		if(definitions.length > 1){
			var word_array = [];
			//multiple words, launch a seperate window
			for(var i=0; i<definitions.length; i++){
				word_array.push(_getWordObject(definitions[i], pronunciation));
			}
			_showMultiplePopup(JSON.stringify(word_array), word_array.length);
		}else{
			var wordObj = _getWordObject(definitions[0], pronunciation);
			saveWordObject(wordObj);
		}
	}

	function _addWord(word, page_url){
		word_url = page_url;
		chrome.storage.sync.get(word, function(obj){
			if(!$.isEmptyObject(obj)){
				console.log("word already exists!", obj);
				notify_m.notify(word, "Cabulary Notification", "\""+word+"\" already exists in your deck");
			}else{
				var the_url = "http://api.wordnik.com:80/v4/word.json/"+word+"/definitions?limit=5&includeRelated=false&useCanonical=true&includeTags=false&api_key=e41981d8a5170fc6583070f41680e8ed5733fa0670091c033";
				$.ajax({
					type: "GET",
					url: the_url
				}).done(function(definition){
					//get pronunciation also
					$.ajax({
						type: "GET",
						url: "http://api.wordnik.com:80/v4/word.json/"+word+"/pronunciations?useCanonical=true&limit=1&api_key=e41981d8a5170fc6583070f41680e8ed5733fa0670091c033"
					}).done(function(pronunciation){
						_handleWord(definition, pronunciation);
					});
				});
			}
		});
	}

	return {
		addWord: _addWord,
		saveWord: saveWordObject
	}
})();


var context_m = (function(){

	function getword(info,tab) {
	  var text = info.selectionText.split(" ")[0];
	  console.log(text);
		store_m.addWord(text, info.pageUrl);
	}

	function initialize(){
		//make sure we can open db
		db_m.open(function(){
			console.log("db open successful!");	
		});
		chrome.contextMenus.create({
		    title: "Add \"%s\" to Cabulary", 
		    contexts:["selection"], 
		    onclick: getword
		});
	}

	return {
		init: initialize
	}
})();

context_m.init();