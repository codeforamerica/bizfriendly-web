var teach = (function (teach) {

  // private properties
  // var debug = true;
  var debug = false;
  var htcUrl = 'https://howtocity.herokuapp.com'
  // var htcUrl = 'https://howtocity-staging.herokuapp.com'
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
    // $('#plusSteps').click(_plusStepsClicked);
    // $('#minusSteps').click(_minusStepsClicked);
    $( ".draggable" ).draggable();
    $( ".droppable" ).droppable({
      drop: function( event, ui ) {

        $(ui.draggable[0]).attr('style','position:relative;');
        $( this ).append($(ui.draggable[0]).clone().editable());
        $('.gray').remove();
        // var content = '<form class="form-horizontal"><label for="urlLink">What web address should this button open?</label><input id="urlLink" type="url" class="form-control" placeholder="https://google.com"></form>';
        // $('#teach-instructions #teach-button, #teach-instructions #teach-button').popover({ content: content, html: true, placement: 'top', trigger: 'click' });
      
        // $('form').bind("keyup", function(e) {
        //   var code = e.keyCode || e.which; 
        //   if (code  == 13) {               
        //     e.preventDefault();
        //     return false;
        //   }
        // });

      }
    });
    
  }

  // function _plusStepsClicked(evt){
  //   numberOfSteps = numberOfSteps + 1;
  //   $('#progress').prepend('<li id="teach'+numberOfSteps+'" class="finished"></li>');
  //   $('#progress .active h2').html(numberOfSteps);
  // }

  // function _minusStepsClicked(evt){
  //   if (numberOfSteps > 1){
  //     numberOfSteps = numberOfSteps - 1;
  //     $('#progress li')[0].remove();
  //     $('#progress .active h2').html(numberOfSteps);
  //   } 
  // }

  // add public methods to the returned module and return it
  teach.init = init;
  return teach;
}(teach || {}));

// initialize the module
teach.init()