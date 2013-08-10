var teach = (function (teach) {

  // private properties
  var debug = true;
  var htcUrl = 'http://howtocity.herokuapp.com'
  // var htcUrl = 'http://127.0.0.1:8000'
  var htcApiVer = '/api/v1'
  var numberOfSteps = 1;

  // PUBLIC METHODS
  function init(){
    if (debug) console.log('init');
    _main();
  }

  // PRIVATE METHODS
  function _main(){
    $('#plusSteps').click(_plusStepsClicked);
    $('#minusSteps').click(_minusStepsClicked);
    $( ".draggable" ).draggable();
    $( ".droppable" ).droppable({
      drop: function( event, ui ) {
        console.log();
        $( this ).append('<img src="'+$(ui.draggable[0]).attr('src')+'">');
      }
    });
  }

  function _plusStepsClicked(evt){
    numberOfSteps = numberOfSteps + 1;
    $('#progress').prepend('<li id="teach'+numberOfSteps+'" class="finished"></li>');
    $('#progress .active h2').html(numberOfSteps);
  }

  function _minusStepsClicked(evt){
    numberOfSteps = numberOfSteps - 1;
    $('#progress li')[0].remove();
    $('#progress .active h2').html(numberOfSteps);
  }

  // add public methods to the returned module and return it
  teach.init = init;
  return teach;
}(teach || {}));

// initialize the module
teach.init()