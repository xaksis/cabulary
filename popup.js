(function($){
  $(document).ready(function(){

    var cards = $("#cards");
    var page = 0;
    var page_count = 4;

    function formatDefinition(def){
      def = def.substring(1, def.length); 
      def = def.replace(":", "<br/>");
      return def;
    }

    function getActionHeader(item){
      return '<div class="action-bar" id="'+item.created_at+'">'
        + '<a href="'+item.url+'" title="Page where this word was found." class="action-icon link"><i class="icon-link"></i></a>'
        + '<a href="#" title="Delete this card" class="action-icon delete"><i class="icon-close"></i></a>'
        + '</div>';
    }

    function getCard(item){

      var domStr = getActionHeader(item) + '<div class="card" ontouchstart="this.classList.toggle(\"hover\");">'
      +'<div class="flipper">'
      +'  <div class="front">'
      +'    <div class="word">'+item.word+'</div>'
      + '   <div class="pos">'+item.pos+'</div>'
      +'    <div class="pronun">('+item.pronun+')</div>'
      +'  </div>'
      +'  <div class="back">'
      +'    <div class="definition">'+formatDefinition(item.def)+'</div>'
      +'  </div>'
      +'</div>'
    +'</div>';
       return domStr;
    }

    function deleteCard(){
      var key = parseInt($(this).parent().attr("id"));
      console.log(key);
      db_m.deleteWord(key, function(){
        refreshCards();
      });
      return false;
    }

    function openLink(){
      var page_url = $(this).attr("href");
      chrome.tabs.create({ url: page_url });
      return false;
    }

    function refreshCards(){
      cards.html("");
      console.log("Page Number: ", page);
      db_m.fetchWords(page, page_count, function(words){
        for(var i = 0; i < words.length; i++){
          console.log(words[i]);
          cards.append(getCard(words[i]));
        }
        $(".action-icon.delete").each(function(){
          $(this).off("click", deleteCard).on("click", deleteCard);
        });
        $(".action-icon.link").each(function(){
          $(this).off("click", openLink).on("click", openLink);
        });
      });
    }

    db_m.open(refreshCards);

    function getNextPage(){
      page++;
      refreshCards();
      return false;
    }

    /* paging functionaity */
    $(".page-link.next").off('click', getNextPage).on('click', getNextPage);

  });
})(jQuery)