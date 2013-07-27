var instructions = (function (instructions) {

  // private properties
  var debug = true;
  var bodyPadding = 0;
  var lessonId = 0; // Blank lesson
  var lesson = {};
  var steps = [];
  var accessToken = null;
  var currentStep = 1;
  var checkStepInterval;
  // var htcUrl = 'http://howtocity.herokuapp.com'
  var htcUrl = 'http://127.0.0.1:8000'
  var htcApiVer = '/api/v1'
  var originalCount;
  var originalCountFlag = false;
  var loginPopup = 'hi';

  // PUBLIC METHODS

    function setState(step){
        if (currentStep == step.stepNumber){
          step.stepState = "active";
        }
        if (currentStep > step.stepNumber){
          step.stepState = "finished";
        }
        if (currentStep < step.stepNumber){
          step.stepState = "unfinished";
        }
        return step;
    }
    

    function createStep(steps, currentStep){
      step = {
        id : steps[currentStep - 1].id,
        name : steps[currentStep - 1].name,
        stepType : steps[currentStep - 1].step_type,
        stepNumber : steps[currentStep - 1].step_number,
        stepText : steps[currentStep - 1].step_text,
        lessonId : steps[currentStep - 1].lesson_id,
        triggerEndpoint : steps[currentStep - 1].trigger_endpoint,
        triggerCheck : steps[currentStep - 1].trigger_check,
        triggerValue : steps[currentStep - 1].trigger_value,
        thingToRemember : steps[currentStep - 1].thing_to_remember,
        feedback : steps[currentStep - 1].feedback,
        nextStepNumber : steps[currentStep - 1].next_step_number,
        stepState : "unfinished"
      }
      step = setState(step);
      return step;
    }

    function showStep(step) {
      $('section').attr('id','step'+step.stepNumber);
      $('section h2').html(step.name);
      $('.step_text').html(step.stepText);
      $('.feedback').html(step.feedback);
    }

    function showProgress(){
      $(steps).each(function(i){
        if (step.stepState == 'active'){
          $('#step'+steps[i].stepNumber+'_progress').removeClass('finished unfinished').addClass('active');
        }
        if (step.stepState == 'finished'){
          $('#step'+steps[i].stepNumber+'_progress').removeClass('active unfinished').addClass('finished');
        }
        if (step.stepState == 'unfinished'){
          $('#step'+steps[i].stepNumber+'_progress').removeClass('finished active').addClass('unfinished');
        }
      })
    }

    function updateSteps(steps, currentStep){
      step = createStep(steps, currentStep);
      showStep(step);
      showProgress();
    }

  // initialize variables and load JSON
  function init()
  {
    if (debug) console.log('init');
    // Get lessonId from the stepNumber
    lessonId = window.location.search.split('?')[1];
    // Call the API and get that lesson
    $.getJSON(htcUrl+htcApiVer+'/lessons/'+lessonId, _jsonLoadSuccess);
  }

  // PRIVATE METHODS 

  // sets up post-json load initialization
  function _jsonLoadSuccess(response)
  {
    // Attach response to top level variable
    lesson = response;
    // Make sure steps are in order of id
    steps = lesson.steps.sort(function(a, b){
      if (a.id < b.id) return -1;
      if (a.id > b.id) return 1;
      return 0;
    })

    // Set the name of the lesson
    $('header h4').html(lesson.name);

    //Build step progress bar
    $(steps).each(function(i){
        $('#progress').append('<li id="step'+steps[i].stepNumber+'_progress"></li>');
      })

    // Initialize steps
    updateSteps(steps, currentStep);

    // OAuth
    $('#login').click(function(){
      
      OAuth.initialize('uZPlfdN3A_QxVTWR2s9-A8NEyZs');
      OAuth.popup(lesson.url, function(error, result) {
        //handle error with error
        if (error) alert(error);
        accessToken = result.access_token;

        // Check first step
        _checkStep();  
      });
      });

    // Adds button event handlers
    $('#back').click(_backClicked);
    $('#next').click(_nextClicked);
  }

  // next button is clicked
  function _nextClicked(evt)
  {
    if (currentStep < steps.length){
      currentStep = currentStep + 1;
      if ($('.feedback').css('display') == 'block'){
        $('.feedback').toggle();
      }
      updateSteps(steps, currentStep);
      _checkStep();
    }}

  // back button is clicked
  function _backClicked(evt)
  {
    if (currentStep > 1){
      currentStep = currentStep - 1;
      updateSteps(steps, currentStep);
      _checkStep();
    }
  }

  function _checkStep(){
     
      if (debug) console.log(step.name);
      
      // If step type is login
      if (step.stepType == 'login'){
        $.post(htcUrl+'/logged_in?access_token='+accessToken, step, _loggedIn);
      }
    
      // If step type is open
      if (step.stepType == 'open'){
        $(".open").click(_openClicked);
      }

      // If step type is check_for_new
      if (step.stepType == 'check_for_new'){
        $.post(htcUrl+'/check_for_new?access_token='+accessToken, step, _checkForNew);
      }

      // If step type is get_remembered_thing
      if (step.stepType == 'get_remembered_thing'){
        $.post(htcUrl+'/get_remembered_thing?access_token='+accessToken, step, _getRememberedThing);
      }

      // If step type is get_added_data
      if (step.stepType == 'get_added_data'){
        $.post(htcUrl+'/get_added_data?access_token='+accessToken, step, _getAddedData);
      }

      // If step type is choose_next_step
      if (step.stepType == 'choose_next_step'){
        $("#choice_one").click(_chooseNextStep);
        $("#choice_two").click(_chooseNextStep);
      }
    }

    function _goToChosenStep(response){
      if (debug) console.log(response);
      response = $.parseJSON(response);
      currentStep = parseInt(response.chosenStep);
      updateSteps(steps, currentStep);
      _checkStep();
    }

    function _chooseNextStep(evt){
      if (debug) console.log(evt.target.id);
      choice = evt.target.id;
      $.post(htcUrl+'/choose_next_step?choice='+choice, step, _goToChosenStep);
    }

    function _getAddedData(response){
      if (response == 'TIMEOUT') _getAddedData();
      response = $.parseJSON(response);
      if (debug) console.log(response);
      // $('#step'+step.stepNumber+' .feedback .newData').attr('src',response.newData);
      $('#step'+step.stepNumber+' .feedback').css('display','block');
    }

    function _getRememberedThing(response){
      if (response == 'TIMEOUT') _getRememberedThing();
      response = $.parseJSON(response);
      if (debug) console.log(response);
      $('#step'+step.stepNumber+' .feedback .newData').html(response.newData);
      $('#step'+step.stepNumber+' .feedback').css('display','block');
    }

    function _loggedIn(response){
      if (response == 'TIMEOUT') _loggedIn();
      response = $.parseJSON(response);
      if (debug) console.log(response);
      if ( response.loggedIn ){
        if (debug) console.log(response);
        // $('html, body').delay(3000).animate({ scrollTop: $('#'+steps[currentStep - 1].nextStepNumber).offset().top - bodyPadding }, 1000);
        $('#step'+step.stepNumber+' .feedback').css('display','block');
      }
    }

    function _checkForNew(response){
      if (response == 'TIMEOUT') _checkForNew();
      response = $.parseJSON(response);
      if ( response.newThingName ){
        if (debug) console.log(response);
        $('#step'+step.stepNumber+' .feedback .newThingName').html(response.newThingName);
        $('#step'+step.stepNumber+' .feedback').css('display','block');
      }
    }

    // .open is clicked
    function _openClicked(evt)
    {
      var challengeFeatures = {
        height: window.screen.height,
        width: 1000,
        name: 'challengeWindow',
        center: false
      }
      challengeWindow = $.popupWindow(step.triggerEndpoint, challengeFeatures);
      $('#step'+step.stepNumber+' .feedback').css('display','block');
    }

  // add public methods to the returned module and return it
  instructions.init = init;
  return instructions;
}(instructions || {}));

// initialize the module
instructions.init()