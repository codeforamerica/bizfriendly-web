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
  var htcApiUrl = null;
  var htcApiVer = null;

  // PUBLIC METHODS 

  // initialize variables and load JSON
  function init()
  {
    if (debug) console.log('init');

    bodyPadding = parseInt($('body').css('padding-top'), 10);
    htcApiUrl = 'http://howtocity.herokuapp.com/api/'
    htcApiVer = 'v1'

    // Get lessonId from the url
    lessonId = window.location.search.split('?')[1];
    // Call the API and get that lesson
    $.getJSON(htcApiUrl+htcApiVer+'/lessons/'+lessonId, _jsonLoadSuccess);
  }

  // PRIVATE METHODS 

  // Fill in the blanks with the lesson
  // sets up post-json load initialization
  function _jsonLoadSuccess(lesson)
  {
    // Make sure steps are in order of id
    steps = lesson.steps.sort(function(a, b){
      if (a.id < b.id) return -1;
      if (a.id > b.id) return 1;
      return 0;
    })
    
    // Set the name of the lesson
    $('.instruction_header h4').html(lesson.name);

    // Loop through steps and fill out the page
    $(steps).each(function(i){
      $('#main').append('<section id="'+steps[i].url+'">'+
              ' <h2 class="step_name"></h2>'+
              ' <div class="step_text"></div>'+
              ' <div class="feedback"></div>'+
              '</section>')
      $('#'+steps[i].url+' .step_name').html(steps[i].name);
      $('#'+steps[i].url+' .step_text').html(steps[i].step_text);
      $('#'+steps[i].url+' .feedback').html(steps[i].feedback);
    })

    // OAuth
    $('#login').click(function(){
      OAuth.initialize('uZPlfdN3A_QxVTWR2s9-A8NEyZs');
      OAuth.popup(lesson.url, function(error, result) {
        //handle error with error
        if (error) alert(error);
        if (debug) console.log(result);
        accessToken = result.access_token;
      });
    });

    // Adds button event handlers
    $('#back').click(_backClicked);
    $('#next').click(_nextClicked);

    checkStepInterval = setInterval(_checkStep,1000);
  }

  // next button is clicked
  function _nextClicked(evt)
  {
    if (currentStep < steps.length){
      currentStep = currentStep + 1;
      $('html, body').animate({ scrollTop: $('#step'+currentStep).offset().top - bodyPadding }, 1000);
    }}

  // back button is clicked
  function _backClicked(evt)
  {
    if (currentStep > 1){
      currentStep = currentStep - 1;
      $('html, body').animate({ scrollTop: $('#step'+currentStep).offset().top - bodyPadding }, 1000);
    }
  }

  function _checkStep(){

      // Make object of the current stop
      step = {
        id : steps[currentStep - 1].id,
        name : steps[currentStep - 1].name,
        description : steps[currentStep - 1].description,
        url : steps[currentStep - 1].url,
        stepText : steps[currentStep - 1].step_text,
        lessonId : steps[currentStep - 1].lesson_id,
        triggerEndpoint : steps[currentStep - 1].trigger_endpoint,
        triggerCheck : steps[currentStep - 1].trigger_check,
        triggerValue : steps[currentStep - 1].trigger_value,
        nextStep : steps[currentStep - 1].next_step
      }

      var trigger = false;
      if (accessToken != null) {
        // Need to add in some debug info if these don't exist.
        if (step.triggerEndpoint != '' && 
            step.triggerCheck != '' && 
            step.triggerValue != ''){
                    
          // If step type is login
          if (step.description == 'login'){
            // An example triggerEndpoint
            // https://api.foursquare.com/v2/users/self?v=20130706&oauth_token=
            $.getJSON(step.triggerEndpoint+accessToken, _loginJsonLoaded)
          }
        }

        // If step type is open
        if (step.description == 'open'){
          $("#open").click(_openClicked);
        }
      }
    }

    // #open is clicked
    function _openClicked(evt)
    {
      var challengeFeatures = {
        height: window.screen.height,
        width: 1000,
        name: 'challengeWindow',
        center: false
      }
      challengeWindow = $.popupWindow(step.triggerEndpoint, challengeFeatures);
      // $('html, body').delay(3000).animate({ scrollTop: $('#'+steps[currentStep - 1].nextStep).offset().top - bodyPadding }, 1000);
      $('#'+step.url+' .feedback').css('display','block');
    }

    // step type login json has loaded
    function _loginJsonLoaded(response)
    {
      var trigger = false;
      // Cast strings to booleans
      if (step.triggerValue == 'true') step.triggerValue = true;
      if (step.triggerValue == 'false') step.triggerValue = false;

      // Check the trigger vs the value to see if its correct
      if (eval(step.triggerCheck) == step.triggerValue){
        trigger = true;
      }
      if (trigger == true){
        // $('html, body').delay(3000).animate({ scrollTop: $('#'+steps[currentStep - 1].nextStep).offset().top - bodyPadding }, 1000);
        $('#'+step.url+' .feedback').css('display','block');
      }
    }

  // add public methods to the returned module and return it
  instructions.init = init;
  return instructions;
}(instructions || {}));

// initialize the module
instructions.init()