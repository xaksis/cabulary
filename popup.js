(function($){
  $(document).ready(function(){

    var cards = $("#cards");

    function formatDefinition(def){
      def = def.substring(1, def.length); 
      def = def.replace(":", "<br/>");
      return def;
    }

    function getCard(item){
      var domStr = '<div class="card">'
       + '<div><span class="word">'+item.word+'</span> ('+item.pronun+')</div>'
       + '<div class="pos">'+item.pos+'</div>'
       + '<div class="definition"> '+formatDefinition(item.def)+'</div>'
       +'</div>';
       return domStr;
    }


    chrome.storage.sync.get(null, function(items){
      console.log(items);
      for (var key in items){
        console.log(key);
        cards.append(getCard(items[key])); 
      }
    });


  });
})(jQuery)