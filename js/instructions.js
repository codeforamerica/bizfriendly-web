var instructions = (function (instructions) {

  // private properties
  var debug = true;
  var bodyPadding = 0;
  var lessonId = 0; // Blank lesson
  var lesson = null;
  var steps = null;
  var accessToken = null;
  var currentStep = 0;
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
  function _jsonLoadSuccess(lessonResponse)
  {
    lesson = lessonResponse;
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
      $('#main').append('<section id="'+lesson.steps[i].url+'">'+
              ' <h2 class="step_name"></h2>'+
              ' <div class="step_text"></div>'+
              ' <div class="feedback"></div>'+
              '</section>')
      $('#'+lesson.steps[i].url+' .step_name').html(lesson.steps[i].name);
      $('#'+lesson.steps[i].url+' .step_text').html(lesson.steps[i].step_text);
      $('#'+lesson.steps[i].url+' .feedback').html(lesson.steps[i].feedback);
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
    if (debug) console.log('Next');
    var next_step = currentStep + 1;
    $('html, body').animate({ scrollTop: $('#step'+next_step).offset().top - bodyPadding }, 1000);
  }

  // back button is clicked
  function _backClicked(evt)
  {
    if (debug) console.log('Back');
    var backStep = currentStep;
    $('html, body').animate({ scrollTop: $('#step'+backStep).offset().top - bodyPadding }, 1000);
  }

  function _checkStep(){
      var trigger = false;
      if (accessToken != null) {
        // Need to add in some debug info if these don't exist.
        if (steps[currentStep].trigger_endpoint != '' && 
            steps[currentStep].trigger_check != '' && 
            steps[currentStep].trigger_value != ''){
                    
          // If step type is login
          if (steps[currentStep].description == 'login'){
            // An example trigger_endpoint
            // https://api.foursquare.com/v2/users/self?v=20130706&oauth_token=
            $.getJSON(steps[currentStep].trigger_endpoint+accessToken, _loginJsonLoaded)
          }
        }

        // If step type is open
        if (steps[currentStep].description == 'open'){
          $("#open").click(_openClicked);
        }
      }
    }

    // #open is clicked
    function _openClicked(evt)
    {
      var height = window.screen.height;
      var challengeFeatures = {
        height: height,
        width: 1000,
        name: 'challengeWindow',
        center: false
      }
      challengeWindow = $.popupWindow(steps[currentStep].trigger_endpoint, challengeFeatures);
      $('html, body').delay(3000).animate({ scrollTop: $('#'+steps[currentStep].next_step).offset().top - bodyPadding }, 1000);
      $('#'+steps[currentStep].url+' .feedback').css('display','block');
      currentStep = currentStep + 1;
    }

    // step type login json has loaded
    function _loginJsonLoaded(response)
    {
      // Cast strings to booleans
      var triggerValue = steps[currentStep].trigger_value;
      if (triggerValue == 'true') triggerValue = true;
      if (triggerValue == 'false') trigger_Value = false;

      // Check the trigger vs the value to see if its correct
      if (eval(steps[currentStep].trigger_check) == triggerValue){
        trigger = true;
      }
      if (trigger == true){
        console.log(steps[currentStep].next_step);
        $('html, body').delay(3000).animate({ scrollTop: $('#'+steps[currentStep].next_step).offset().top - bodyPadding }, 1000);
        $('#'+lesson.steps[currentStep].url+' .feedback').css('display','block');
        currentStep = currentStep + 1;
      }
    }

  // add public methods to the returned module and return it
  instructions.init = init;
  return instructions;
}(instructions || {}));

// initialize the module
instructions.init()