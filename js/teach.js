var teach = (function (teach) {

  // private properties
  var debug = true;
  // var debug = false;
  // var bfUrl = 'https://app.bizfriend.ly';
  // var bfUrl = 'https://app-staging.bizfriend.ly';
  var bfUrl = 'http://127.0.0.1:8000';
  var bfApiVersion = '/api/v1'
  var numberOfSteps = 1;

  // PUBLIC METHODS
  function init(){
    if (debug) console.log('init');
    _main();
  }

  // PRIVATE METHODS
  function _main(){
    // Get the list of thirdPartyServices
    $.get(bfUrl+'/third_party_services', _getThirdPartyServices);
    // Load endpoints based on what is selected
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

  function _getThirdPartyServices(response){
    response = $.parseJSON(response);
    // Build select list
    for (i in response){
      // console.log(response[i]);
      $('#availableServices').append('<option>'+response[i].third_party_service+'</option>');
    }
    // Change options based on what service is selected
    // _updateSelectList('#availableResources','#thirdPartyServiceList','third_party_service','resources','resource');
    $('#thirdPartyServiceList').change(function() {
      $('#availableResources').empty();
      var selectedServiceName = $('#thirdPartyServiceList :selected').text()
      var selectedService = $.grep(response, function(e){ return e.third_party_service == selectedServiceName });
      var resources = selectedService[0].resources;
      for (i in resources){
        $('#availableResources').append('<option>'+resources[i].resource+'</option>');
      }
      // Change options based on what resource is selected
      $('#resourcesList').change(function() {
        $('#availableFields').empty();
        var selectedResourceName = $('#resourcesList :selected').text();
        var selectedResource = $.grep(resources, function(e){ return e.resource == selectedResourceName });
        var fields = selectedResource[0].fields;
        for (i in fields){
          $('#availableFields').append('<option>'+fields[i].field+'</option>');
        }
        // Choose step action based on what endpoint is chosen
        $('#fieldsList').change(function() {
          $('#availableActions').empty();
          var selectedFieldName = $('#fieldsList :selected').text();
          var selectedField = $.grep(fields, function(e){ return e.field == selectedFieldName });
          var actionsAvailable = selectedField[0].actions_available;
          for (i in actionsAvailable){
            $('#availableActions').append('<option>'+actionsAvailable[i]+'</option>');
          }
        });
      });
    });
  }

  // function _updateSelectList(idOflistToUpdate, idOfChoiceToWatch, attributeToMatch, listToUse, attributeToUse){
  //   $(idOfChoiceToWatch).change(function() {
  //     $(idOflistToUpdate).empty();
  //     var selectedName = $(idOfChoiceToWatch+' :selected').text()
  //     var selectedObject = $.grep(, function(e){ return e[attributeToMatch] == selectedServiceName });
  //     var returnedList = selectedObject[0][listToUse];
  //     for (i in returnedList){
  //       $(idOflistToUpdate).append('<option>'+returnedList[i].attributeToUse+'</option>');
  //     }
  //   });
  // }

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