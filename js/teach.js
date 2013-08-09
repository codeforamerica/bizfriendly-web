var teach = (function (teach) {

  // private properties
  var debug = true;
  var htcUrl = 'http://howtocity.herokuapp.com'
  // var htcUrl = 'http://127.0.0.1:8000'
  var htcApiVer = '/api/v1'

  // PUBLIC METHODS
  function init(){
    if (debug) console.log('init');
    _main();
  }

  // PRIVATE METHODS
  function _main(){
    $( ".draggable" ).draggable();
    $( ".droppable" ).droppable({
      drop: function( event, ui ) {
        console.log();
        $( this ).append('<img src="'+$(ui.draggable[0]).attr('src')+'">');
      }
    });
  }

  // add public methods to the returned module and return it
  teach.init = init;
  return teach;
}(teach || {}));

// initialize the module
teach.init()