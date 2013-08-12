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

        $(ui.draggable[0]).attr('style','position:relative;');
        $( this ).append($(ui.draggable[0]).editable());
        $('.gray').remove();
        var content = '<form class="form-horizontal"><label for="urlLink">What web address should this button open?</label><input id="urlLink" type="url" class="form-control" placeholder="https://google.com"></form>';
        $('#teach-button').popover({ content: content, html: true, placement: 'top', trigger: 'click' });
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