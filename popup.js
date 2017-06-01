(function($){
  $(document).ready(function(){

    var cards = $("#cards");
    var page = 0;
    var page_count = 4;
    var total = 0;

    function getActionHeader(item){
      return '<div class="action-bar" id="'+item.created_at+'">'
        + '<a href="'+item.url+'" title="Page where this word was found." class="action-icon link"><i class="icon-link"></i> Link</a>'
        + '<a href="#" title="Delete this card" class="action-icon delete"><i class="icon-close"></i></a>'
        + '</div>';
    }

    function getCard(item){

      var domStr = getActionHeader(item) + '<div class="card" ontouchstart="this.classList.toggle(\"hover\");">'
      +'<div class="flipper">'
      +'  <div class="front">'
      +'    <div class="word">'+item.word+'</div>'
      + '   <div class="pos">'+item.pos+'</div>'
      +'    <div class="pronun">'+item.pronun+'</div>'
      +'  </div>'
      +'  <div class="back">'
      +'    <div class="definition">'+item.def+'</div>'
      +'  </div>'
      +'</div>'
    +'</div>';
       return domStr;
    }

    function getBlankState() {
        var domStr = '<div class="blank-state">'
        +   '<strong>No flash cards yet.</strong> </br>'
        +   '<p>Highlight a word on any page and right click to add a flash card.</p>'
        + '</div>';
        return domStr;
    }

    function setBlankState() {
      cards.html(getBlankState());
    }

    function deleteCard(){
      console.log('calling delete');
      var parent = $(this).parent();
      var key = parseInt(parent.attr("id"));
      db_m.deleteWord(key, function(){
        console.log('calling delete word from db');
        var deleted_word = parent.next(".card").find(".word").text();
        chrome.storage.sync.remove(deleted_word, function(){
          console.log('calling refresh');
          refreshCards();
        });
      });
      return false;
    }

    function openLink(){
      var page_url = $(this).attr("href");
      chrome.tabs.create({ url: page_url });
      return false;
    }

    function refreshCards(){
      //lets get the total number of cards
      db_m.total(function(count){
        total = count;
        paging_m.init();
      }); 

      db_m.fetchWords(page, page_count, function (words) {
        if(!words.length) {
          //reset to initial screen
          setBlankState();
          return;
        }
        
        //refresh the cards
        cards.html("");
        for(var i = 0; i < words.length; i++){
          //console.log(words[i]);
          cards.append(getCard(words[i]));
        }
        $(".front").each(function(){
          var self = $(this);
          setTimeout(function(){self.addClass("fullsize");}, 100);
        });
        $(".back").each(function(){
          var self = $(this);
          setTimeout(function(){self.addClass("fullsize");}, 100);
        });

        $(".action-icon.delete").each(function(){
          $(this).off("click", deleteCard).on("click", deleteCard);
        });
        $(".action-icon.link").each(function(){
          $(this).off("click", openLink).on("click", openLink);
        });
      });
    }

    db_m.open(refreshCards);

    /* Paging Module 
    *****************************/
    paging_m = (function(){
      var next_link = $(".page-link.next");
      var prev_link = $(".page-link.prev");

      function getNextPage(){
        page++;
        refreshCards();
        return false;
      }

      function getPrevPage(){
        page--;
        refreshCards();
        return false;
      }

      function initialize(){
        //console.log("Page: ", page, " total: ", total );
        if((page+1)*page_count >= total){
          next_link.addClass("disabled")
          next_link.off('click', getNextPage);
        }else{
          next_link.removeClass("disabled");
          next_link.off('click', getNextPage).on('click', getNextPage);
        }

        if(page == 0){
          prev_link.addClass("disabled");
          prev_link.off("click", getPrevPage);
        }else{
          prev_link.removeClass("disabled");
          prev_link.off('click', getPrevPage).on('click', getPrevPage);
        }
      }

      return {
        init: initialize
      }
    })();

    /* paging functionaity */
    
    // chrome extension link
    $('#cabulary-link').on('click', function (){
       chrome.tabs.create({url: $(this).attr('href')});
       return false;
    });

  });
})(jQuery)