var instructions = (function (instructions) { 
  // private properties
  var debug = true;
  var width = window.screen.width;
  var height = window.screen.height;
  var bodyPadding = 0;
  var lessonId = 0; // Blank lesson
  var lesson = {};
  var steps = [];
  var step = {};
  var oauthToken = null;
  var currentStep = {};
  // var htcUrl = 'http://howtocity.herokuapp.com'
  var htcUrl = 'http://127.0.0.1:8000'
  // var htcUrl = 'http://0.0.0.0:5000'
  var htcApiVer = '/api/v1'

  // PUBLIC METHODS
  // initialize variables and load JSON
  function init(){
    if (debug) console.log('init');
    // Get lessonId from the url
    lessonId = window.location.search.split('?')[1];
    // Call the API and get that lesson
    $.getJSON(htcUrl+htcApiVer+'/lessons/'+lessonId, _main);
  }

  // PRIVATE METHODS 

  // Main Function
  function _main(response){
    // Attach response to global lesson variable
    lesson = response;
    // Set the name of the lesson
    $('#instructions-title').html(lesson.name);
    // Make sure steps are in order of id
    _orderSteps();
    // Convert python names to javascript names
    _convertStepsAttributesNames();
    // Set current step
    currentStep = steps[0];
    // Initialize steps state
    _updateStepsStates();
    //Build progress bar
    _makeProgressBar();
    // Update progress Bar
    _updateProgressBar();
    // Show first step
    _showStep();
    _checkStep();
    // Adds button event handlers
    $('#back').click(_backClicked);
    $('#next').click(_nextClicked);
  }

  function _orderSteps(){
    if (debug) console.log('ordering steps');
    steps = lesson.steps.sort(function(a, b){
      if (a.id < b.id) return -1;
      if (a.id > b.id) return 1;
      return 0;
    })
  }

  // Change steps attributes to have camelCase
  function _convertStepsAttributesNames(){
    if (debug) console.log('Change attribute names to camelCase.');
    var stepsWithJsNames = [];
    $(steps).each(function(i){
      step = {
        id : steps[i].id,
        name : steps[i].name,
        stepType : steps[i].step_type,
        stepNumber : steps[i].step_number,
        stepText : steps[i].step_text,
        lessonId : steps[i].lesson_id,
        triggerEndpoint : steps[i].trigger_endpoint,
        triggerCheck : steps[i].trigger_check,
        triggerValue : steps[i].trigger_value,
        thingToRemember : steps[i].thing_to_remember,
        feedback : steps[i].feedback,
        nextStepNumber : steps[i].next_step_number,
        stepState : '', // Add the stepState attribute
        lessonService : lesson.third_party_service  // Add the name of the service
      }
      stepsWithJsNames.push(step);
    })
    steps = stepsWithJsNames;
  }

  // Set the steps state
  function _updateStepsStates(){
    if (debug) console.log('updating steps states');
    $(steps).each(function(i){
      if (currentStep.stepNumber == steps[i].stepNumber){
        steps[i].stepState = "active";
      }
      if (currentStep.stepNumber > steps[i].stepNumber){
        steps[i].stepState = "finished";
      }
      if (currentStep.stepNumber < steps[i].stepNumber){
        steps[i].stepState = "unfinished";
      }
    })
  }

  // Make progress bar
  function _makeProgressBar(){
    if (debug) console.log('making progress bar');
    $(steps).each(function(i){
        $('#progress').append('<li id="step'+steps[i].stepNumber+'_progress"></li>');
    });
    // Todo: Need to account for 12 possible steps
    // var widthPercent = '';
    // widthPercent = 100/steps.length+'%';
    // $('#progress li').attr('width',widthPercent);
  }

  // Update the progress bar
  function _updateProgressBar(){
    if (debug) console.log('updating progress bar');
    $(steps).each(function(i){
      $('#step'+steps[i].stepNumber+'_progress').removeClass('unfinished active finished').addClass(steps[i].stepState);
      if (steps[i].stepNumber == currentStep.stepNumber){
        $('#step'+steps[i].stepNumber+'_progress').html('<h2>'+currentStep.stepNumber+'</h2>');
      } else {
        $('#step'+steps[i].stepNumber+'_progress').html('');
      }
    })
  }

  // Show the current step
  function _showStep(){
    if (debug) console.log('showing step');
    $('section').attr('id','step'+currentStep.stepNumber);
    $('section h2').html(currentStep.name);
    $('.step_text').html(currentStep.stepText);
    $('.feedback').html(currentStep.feedback);
    // Set step_text back to visible and hide others
    if ($('.step_text').css('display') == 'none'){
      $('.step_text').toggle();
    }
    if ($('.feedback').css('display') == 'block'){
      $('.feedback').toggle();
    }
    if ($('#next').hasClass('animated pulse')){
      $('#next').removeClass('animated pulse');
    }
    if ($('#congrats').css('display') == 'block'){
      $('#congrats').toggle();
    }
    
  }

  // next button is clicked
  function _nextClicked(evt){
    if (currentStep.stepNumber < steps.length){
      currentStep = steps[currentStep.stepNumber];
      _updateStepsStates();
      _updateProgressBar();
      // Record most recent opened step 
      // BfUser.record_step(currentStep, _recordedStep);
      _showStep();
      _checkStep();
    }
  }

  // back button is clicked
  function _backClicked(evt){
    if (currentStep.stepNumber > 1){
      currentStep = steps[currentStep.stepNumber - 2];
      _updateStepsStates();
      _updateProgressBar();
      _showStep();
      _checkStep();
    }
  }

  // login clicked
  function _loginClicked(evt){
    if (debug) console.log('login clicked');
    OAuth.initialize('uZPlfdN3A_QxVTWR2s9-A8NEyZs');
    OAuth.popup(lesson.third_party_service, function(error, result) {
      //handle error with error
      if (error) console.log(error);
      oauthToken = result.access_token;

      // Add connection to server db
      var serviceName = lesson.third_party_service.toLowerCase()
      var data = {service_name: serviceName, oauth_token: oauthToken}
      BfUser.create_connection(data, _createdConnection);

      // Check first step
      _checkStep();  
    }); 
  }

  // Check steps
  function _checkStep(){
    if (debug) console.log(currentStep.name);
    // If step type is login
    if (currentStep.stepType == 'login'){
      //Activate _loginClicked
      $('#login').click(_loginClicked);
      if (oauthToken){
        BfUser.is_logged_in(currentStep, _loggedIn);
      }
    }
    // If step type is open
    if (currentStep.stepType == 'open'){
      $(".open").click(_openClicked);
    }
    // If step type is check_for_new
    if (currentStep.stepType == 'check_for_new' && oauthToken){
      BfUser.check_for_new(currentStep, _checkForNew);
    }
    // If step type is get_remembered_thing
    if (currentStep.stepType == 'get_remembered_thing' && oauthToken){
      BfUser.get_remembered_thing(currentStep, _getRememberedThing);
    }
    // If step type is get_added_data
    if (currentStep.stepType == 'get_added_data' && oauthToken){
      BfUser.get_added_data(currentStep, _getAddedData);
    }
    // If step type is choose_next_step
    if (currentStep.stepType == 'choose_next_step'){
      $("#choice_one").click(_chooseNextStep);
      $("#choice_two").click(_chooseNextStep);
    }
    if (currentStep.stepType == 'congrats'){
      _showCongrats();
    }
    // Add example popover clicker
    var example = $('#example').html();
    $('#example').css('display','none');
    $('#popover').popover({ content: example, html: true, placement: 'top', trigger: 'hover' });
  }

  // Are they logged in?
  function _loggedIn(response){
    if (debug) console.log(response);
    if (response.timeout) _checkStep();
    if ( response.logged_in ){
      $('#step'+currentStep.stepNumber+' .step_text').css('display','none');
      $('#step'+currentStep.stepNumber+' .feedback').css('display','block');
      $('#next').addClass('animated pulse');
    }
  }

  // Saved a connection in the db
  function _createdConnection(response){
    if (debug) console.log(response);
  }

  function _recordedStep(response){
    if (debug) console.log(response);
  }

  // .open is clicked
  function _openClicked(evt){
    var challengeFeatures = {
      height: height,
      width: width - 340,
      name: 'challengeWindow',
      center: false
    }
    challengeWindow = $.popupWindow(currentStep.triggerEndpoint, challengeFeatures);
    // $('#step'+currentStep.stepNumber+' .step_text').css('display','none');
    // $('#step'+currentStep.stepNumber+' .feedback').css('display','block');
    
    // Advance to next step
    currentStep = steps[currentStep.stepNumber];
    if ($('.feedback').css('display') == 'block'){
      $('.feedback').toggle();
    }
    if ($('.step_text').css('display') == 'none'){
      $('.step_text').toggle();
    }
    _updateStepsStates();
    _updateProgressBar();
    // Record most recent opened step 
    // BfUser.record_step(currentStep, _recordedStep);
    _showStep();
    _checkStep();
  }

  function _checkForNew(response){
    if (debug) console.log(response);
    if (response.timeout) _checkStep();
    if ( response.new_thing_name ){
      $('#step'+currentStep.stepNumber+' .feedback .newThingName').html(response.new_thing_name);
      $('#step'+currentStep.stepNumber+' .step_text').css('display','none');
      $('#step'+currentStep.stepNumber+' .feedback').css('display','block');
      $('#next').addClass('animated pulse');
    }
  }

  function _getRememberedThing(response){
    if (debug) console.log(response);
    if (response.timeout) _checkStep();
    if (response.new_data) {
      $('#step'+currentStep.stepNumber+' .feedback .newData').html(response.new_data);
      $('#step'+currentStep.stepNumber+' .step_text').css('display','none');
      $('#step'+currentStep.stepNumber+' .feedback').css('display','block');
      $('#next').addClass('animated pulse');
    }
  }

  function _getAddedData(response){
    if (debug) console.log(response);
    if (response.timeout) _checkStep();
    if (response.new_data) {
      $('#step'+currentStep.stepNumber+' .step_text').css('display','none');
      // ToDo: Show added facebook page logo
      $('#step'+currentStep.stepNumber+' .feedback').css('display','block');
      $('#next').addClass('animated pulse');
    }
  }

  function _chooseNextStep(evt){
    if (debug) console.log(evt.target.id);
    choice = evt.target.id;
    $.post(htcUrl+'/choose_next_step?choice='+choice, currentStep, _goToChosenStep);
  }

  function _goToChosenStep(response){
    if (debug) console.log(response);
    console.log(response.chosenStep);
    currentStep = steps[parseInt(response.chosenStep)-1];
    _showStep();
    _checkStep();
  }

  function _showCongrats(){
    $('section h2').toggle();
    $('.step_text').toggle();
    $('#congrats').css('display','block');
  }

  // add public methods to the returned module and return it
  instructions.init = init;
  return instructions;
}(instructions || {}));

// initialize the module
instructions.init()