/******************************************************
Cabulary Chrome Extension
Author: xaksis
*******************************************************/


/* Notification module
*******************************************************/
var notify_m = (function(){
	
	function _createNotification(title, msg){
		console.log(msg);
		var opt = {
			type: 'basic',
		    title: title,
		    message: msg,
		    priority: 1,
		    iconUrl:'imgs/icon128.png'
		}
		chrome.notifications.create('notify1', opt, function(id) { console.log("Last error:", chrome.runtime.lastError); });
	}

	return {
		notify: _createNotification
	}
})();


/* Module to store the word in chrome storage
*******************************************************/
var store_m = (function(){

	function _doesWordExist(word){
		chrome.storage.sync.get(word, function(obj){
			if(obj){
				notify_m.notify("Cabulary Notification", word+" already exists in your deck");
				return true;
			}
		});
		return false;
	}

	function _extractWord(xml){
		var entry_xml = $(xml).find('entry').first();
		var entry_obj = {};
		entry_obj.word = entry_xml.find('ew').text();
		entry_obj.pronun = entry_xml.find("pr").text();
		entry_obj.pos = entry_xml.find("fl").first().text();
		var def_xml = entry_xml.find("def").find("dt").first();
		entry_obj.def = def_xml.text();
		entry_obj.sentence = def_xml.find("vi").text();
		console.log(entry_obj);
		var return_obj = {};
		return_obj[entry_obj.word] = entry_obj;
		return return_obj;
	}

	function _saveWord(xml){
		var word_obj = _extractWord(xml);
		//check if this word form exists already
		chrome.storage.sync.get(Object.keys(word_obj)[0], function(obj){
			if(!$.isEmptyObject(obj)){
				console.log("word form already exists!", obj);
				notify_m.notify("Cabulary Notification", "\""+Object.keys(word_obj)[0]+"\" already exists in your deck");
			}else{
				chrome.storage.sync.set(word_obj, function(){
					notify_m.notify("Cabulary Notification", "\""+Object.keys(word_obj)[0]+"\" saved to deck");
					console.log("word saved!");
				});
			}
		});
	}

	function _addWord(word){
		chrome.storage.sync.get(word, function(obj){
			if(!$.isEmptyObject(obj)){
				console.log("word already exists!", obj);
				notify_m.notify("Cabulary Notification", "\""+word+"\" already exists in your deck");
			}else{
				var the_url = "http://www.dictionaryapi.com/api/v1/references/collegiate/xml/"+word+"?key=34b2cebd-17a8-4fbd-af86-6d2d8b69ffd2";
				$.ajax({
					type: "GET",
					dataType: "xml", 
					url: the_url
				}).done(function(response){
					console.log(response);
					_saveWord(response);
				});
			}
		});
	}

	return {
		addWord: _addWord
	}
})();


var context_m = (function(){
	
	function getword(info,tab) {
	    console.log("Word " + info.selectionText + " was clicked.");
	    // chrome.tabs.create({ 
	    //     url: "http://www.google.com/search?q=" + info.selectionText,
	    // });
		store_m.addWord(info.selectionText);
	}

	function initialize(){
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