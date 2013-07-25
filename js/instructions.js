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
  var htcUrl = null;
  var htcApiVer = null;
  var originalCount;
  var originalCountFlag = false;

  // PUBLIC METHODS 
  
    function createStep(steps, currentStep){
      step = {
        id : steps[currentStep - 1].id,
        name : steps[currentStep - 1].name,
        stepType : steps[currentStep - 1].step_type,
        url : steps[currentStep - 1].url,
        stepText : steps[currentStep - 1].step_text,
        lessonId : steps[currentStep - 1].lesson_id,
        triggerEndpoint : steps[currentStep - 1].trigger_endpoint,
        triggerCheck : steps[currentStep - 1].trigger_check,
        triggerValue : steps[currentStep - 1].trigger_value,
        thingToRemember : steps[currentStep - 1].thing_to_remember,
        feedback : steps[currentStep - 1].feedback,
        nextStep : steps[currentStep - 1].next_step
      }
      return step;
    }

    function showStep(step) {
      $('section').attr('id',step.url);
      $('section h2').html(step.name);
      $('.step_text').html(step.stepText);
      $('.feedback').html(step.feedback);
    }


  // initialize variables and load JSON
  function init()
  {
    if (debug) console.log('init');

    // bodyPadding = parseInt($('body').css('padding-top'), 10);
    htcUrl = 'http://howtocity.herokuapp.com'
    // htcUrl = 'http://127.0.0.1:8000'
    htcApiVer = '/api/v1'

    // Get lessonId from the url
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

    step = createStep(steps, currentStep);
    showStep(step);

    // OAuth
    $('#login').click(function(){

      OAuth.initialize('uZPlfdN3A_QxVTWR2s9-A8NEyZs');
      OAuth.popup(lesson.url, function(error, result) {
        //handle error with error
        if (error) alert(error);
        if (debug) console.log(result);
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
      // $('html, body').animate({ scrollTop: $('#step'+currentStep).offset().top - bodyPadding }, 1000);
      if ($('.feedback').css('display') == 'block'){
        $('.feedback').toggle();
      }
      step = createStep(steps, currentStep);
      showStep(step);
      _checkStep()
    }}

  // back button is clicked
  function _backClicked(evt)
  {
    if (currentStep > 1){
      currentStep = currentStep - 1;
      // $('html, body').animate({ scrollTop: $('#step'+currentStep).offset().top - bodyPadding }, 1000);
      step = createStep(steps, currentStep);
      showStep(step);
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
        if (debug) console.log('get_remembered_thing');
        $.post(htcUrl+'/get_remembered_thing?access_token='+accessToken, step, _getRememberedThing);
      }

      // If step type is get_added_data
      if (step.stepType == 'get_added_data'){
        if (debug) console.log('get_added_data');
        $.post(htcUrl+'/get_added_data?access_token='+accessToken, step, _getAddedData);
      }

      // If step type is choose_next_step
      if (step.stepType == 'choose_next_step'){
        if (debug) console.log('choose_next_step');
        $("#choice_one").click(_chooseNextStep);
        $("#choice_two").click(_chooseNextStep);
      }
    }

    function _goToChosenStep(response){
      if (debug) console.log(response);
      response = $.parseJSON(response);
      currentStep = parseInt(response.chosenStep);
      $('html, body').animate({ scrollTop: $('#step'+currentStep).offset().top - bodyPadding }, 1000);
      setTimeout(_checkStep,2000)
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
      // $('#'+step.url+' .feedback .newData').attr('src',response.newData);
      $('#'+step.url+' .feedback').css('display','block');
    }

    function _getRememberedThing(response){
      if (response == 'TIMEOUT') _getRememberedThing();
      response = $.parseJSON(response);
      if (debug) console.log(response);
      $('#'+step.url+' .feedback .newData').html(response.newData);
      $('#'+step.url+' .feedback').css('display','block');
    }

    function _loggedIn(response){
      if (response == 'TIMEOUT') _loggedIn();
      response = $.parseJSON(response);
      if (debug) console.log(response);
      if ( response.loggedIn ){
        if (debug) console.log(response);
        // $('html, body').delay(3000).animate({ scrollTop: $('#'+steps[currentStep - 1].nextStep).offset().top - bodyPadding }, 1000);
        $('#'+step.url+' .feedback').css('display','block');
      }
    }

    function _checkForNew(response){
      if (response == 'TIMEOUT') _checkForNew();
      response = $.parseJSON(response);
      if ( response.newThingName ){
        if (debug) console.log(response);
        // $('html, body').delay(3000).animate({ scrollTop: $('#'+steps[currentStep - 1].nextStep).offset().top - bodyPadding }, 1000);
        $('#'+step.url+' .feedback .newThingName').html(response.newThingName);
        $('#'+step.url+' .feedback').css('display','block');
      }
    }

    // .open is clicked
    function _openClicked(evt)
    {
      if (debug) console.log('Open clicked.')
      var challengeFeatures = {
        height: window.screen.height,
        width: 1000,
        name: 'challengeWindow',
        center: false
      }
      challengeWindow = $.popupWindow(step.triggerEndpoint, challengeFeatures);
      $('#'+step.url+' .feedback').css('display','block');
      // $('html, body').delay(1000).animate({ scrollTop: $('#'+step.nextStep).offset().top - bodyPadding }, 1000);
      
      // I keep forgetting to click next here.
      // currentStep = currentStep + 1;
      // setTimeout(_checkStep,3000);
    }

  // add public methods to the returned module and return it
  instructions.init = init;
  return instructions;
}(instructions || {}));

// initialize the module
instructions.init()