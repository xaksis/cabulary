(function($){
	var defs;
	console.log("creating dialog now...", new Date());

	function getOptionRow(word){
    	return '<div class="option-row">'
    	+ '<span class="option-word">'+ word.word +'</span>'
    	+ '<span class="option-speech">'+ word.pos +'</span>'
    	+ '<span class="option-meaning">'+ word.def +'</span>'
    	+ '</div>';
    }

	chrome.runtime.onMessage.addListener(function (msg, sender) {
		console.log("receiving message...");
  	// First, validate the message's structure
	  if ((msg.from === 'background') && (msg.subject === 'definitions')) {
	    // display all definitions
	   defs = JSON.parse(msg.data);
	   console.log(defs); 
	    var optionDom = $(".options");
	    optionDom.html("");
	    defs.forEach(function(v,i){
	    	optionDom.append(getOptionRow(v));
	    });

	  }
	});

	$(".options").on("click", ".option-row", function(){
		console.log("called");
		$(".option-row").each(function(){
			$(this).removeClass("active");
		});
		$(this).addClass("active");
	});

	$("#cancel-btn").click(function(){
		window.close();
	});

	$("#select-btn").click(function(){
		var index = $(".option-row").index($(".active"));
		console.log('index', index);
		if(index > -1){
			chrome.runtime.sendMessage({
			  from:    'dialog',
			  subject: 'definition',
			  data: JSON.stringify(defs[index])
			}, function () {
				window.close();
			});
		}
	})
	
})(jQuery)