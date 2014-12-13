(function($){
  $(document).ready(function(){

    var cards = $("#cards");

    function formatDefinition(def){
      def = def.substring(1, def.length); 
      def = def.replace(":", "<br/>");
      return def;
    }

    function getCard(item){

      var domStr = '<div class="card" ontouchstart="this.classList.toggle(\"hover\");">'
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

    function refreshCards(){
      db_m.fetchWords(function(words){
        for(var i = 0; i < words.length; i++){
          console.log(words[i]);
          cards.append(getCard(words[i]));
        }
      });
    }

    db_m.open(refreshCards);

    //getting data from storage sync
    // chrome.storage.sync.get(null, function(items){
    //   console.log(items);
    //   for (var key in items){
    //     console.log(key);
    //     cards.append(getCard(items[key])); 
    //   }
    // });


  });
})(jQuery)