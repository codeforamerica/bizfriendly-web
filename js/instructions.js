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
  var accessToken = null;
  var currentStep = {};
  var htcUrl = 'http://howtocity.herokuapp.com'
  // var htcUrl = 'http://127.0.0.1:8000'
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
    // First step should have a login button
    $('#login').click(_loginClicked);
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

  // Set steps to have javascript style names
  function _convertStepsAttributesNames(){
    if (debug) console.log('changing attribute names');
    var steps_with_js_names = [];
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
        nextStepNumber : steps[i].next_step_number
      }
      steps_with_js_names.push(step);
    })
    steps = steps_with_js_names;
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
    })
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
  }

  // next button is clicked
  function _nextClicked(evt){
    if (currentStep.stepNumber < steps.length){
      currentStep = steps[currentStep.stepNumber];
      if ($('.feedback').css('display') == 'block'){
        $('.feedback').toggle();
      }
      _updateStepsStates();
      _updateProgressBar();
      _showStep();
      _checkStep();
    }}

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
  function _loginClicked(){
    if (debug) console.log('login clicked');
    OAuth.initialize('uZPlfdN3A_QxVTWR2s9-A8NEyZs');
    OAuth.popup(lesson.url, function(error, result) {
      //handle error with error
      if (error) console.log(error);
      accessToken = result.access_token;
      // Check first step
      _checkStep();  
    });
  }

  // Check steps
  function _checkStep(){
    if (debug) console.log(currentStep.name);
    // If step type is login
    if (currentStep.stepType == 'login'){
      $.post(htcUrl+'/logged_in?access_token='+accessToken, currentStep, _loggedIn);
    }
    // If step type is open
    if (currentStep.stepType == 'open'){
      $(".open").click(_openClicked);
    }
    // If step type is check_for_new
    if (currentStep.stepType == 'check_for_new'){
      $.post(htcUrl+'/check_for_new?access_token='+accessToken, currentStep, _checkForNew);
    }
    // If step type is get_remembered_thing
    if (currentStep.stepType == 'get_remembered_thing'){
      $.post(htcUrl+'/get_remembered_thing?access_token='+accessToken, currentStep, _getRememberedThing);
    }
    // If step type is get_added_data
    if (currentStep.stepType == 'get_added_data'){
      $.post(htcUrl+'/get_added_data?access_token='+accessToken, currentStep, _getAddedData);
    }
    // If step type is choose_next_step
    if (currentStep.stepType == 'choose_next_step'){
      $("#choice_one").click(_chooseNextStep);
      $("#choice_two").click(_chooseNextStep);
    }
  }

  // Are they logged in?
  function _loggedIn(response){
    if (response == 'TIMEOUT') _loggedIn();
    response = $.parseJSON(response);
    if (debug) console.log(response);
    if ( response.loggedIn ){
      $('#step'+currentStep.stepNumber+' .feedback').css('display','block');
    }
  }

  // .open is clicked
  function _openClicked(evt){
    // resizeInterval = setInterval(_resize, 100)
    
    // function _resize(){
    //   width = width - 100;
    //   left = window.screen.width - width;
    //   window.resizeTo(width,height);
    //   window.moveTo(left,0);
    //   console.log(width);
    //   if (width < 500) {
    //     clearInterval(resizeInterval);
    //   }
    // }
    var challengeFeatures = {
      height: height,
      width: width - 340,
      name: 'challengeWindow',
      center: false
    }
    challengeWindow = $.popupWindow(currentStep.triggerEndpoint, challengeFeatures);
    $('#step'+currentStep.stepNumber+' .feedback').css('display','block');
  }

  function _checkForNew(response){
    if (response == 'TIMEOUT') _checkForNew();
    response = $.parseJSON(response);
    if ( response.newThingName ){
      if (debug) console.log(response);
      $('#step'+currentStep.stepNumber+' .feedback .newThingName').html(response.newThingName);
      $('#step'+currentStep.stepNumber+' .feedback').css('display','block');
    }
  }

  function _getRememberedThing(response){
    if (response == 'TIMEOUT') _getRememberedThing();
    response = $.parseJSON(response);
    if (debug) console.log(response);
    $('#step'+currentStep.stepNumber+' .feedback .newData').html(response.newData);
    $('#step'+currentStep.stepNumber+' .feedback').css('display','block');
  }

  function _getAddedData(response){
    if (response == 'TIMEOUT') _getAddedData();
    response = $.parseJSON(response);
    if (debug) console.log(response);
    // $('#step'+currentStep.stepNumber+' .feedback .newData').attr('src',response.newData);
    $('#step'+currentStep.stepNumber+' .feedback').css('display','block');
  }

  function _chooseNextStep(evt){
    if (debug) console.log(evt.target.id);
    choice = evt.target.id;
    $.post(htcUrl+'/choose_next_step?choice='+choice, currentStep, _goToChosenStep);
  }

  function _goToChosenStep(response){
    if (debug) console.log(response);
    response = $.parseJSON(response);
    console.log(response.chosenStep);
    currentStep = steps[parseInt(response.chosenStep)-1];
    _showStep();
    _checkStep();
  }

  $(function () {
    $("#slideout").click(function () {
        if($(this).hasClass("popped")){
        $(this).animate({right:'-280px'}, {queue: false, duration: 500}).removeClass("popped");
    }else {
        $(this).animate({right: "0px" }, {queue: false, duration: 500}).addClass("popped");}
    });
  });

  // add public methods to the returned module and return it
  instructions.init = init;
  return instructions;
}(instructions || {}));

// initialize the module
instructions.init()