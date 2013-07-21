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

  // initialize variables and load JSON
  function init()
  {
    if (debug) console.log('init');


    bodyPadding = parseInt($('body').css('padding-top'), 10);
    // htcUrl = 'http://howtocity.herokuapp.com'
    // htcUrl = 'http://0.0.0.0:5000'
    htcUrl = 'http://127.0.0.1:8000'
    htcApiVer = '/api/v1'

    // Get lessonId from the url
    lessonId = window.location.search.split('?')[1];
    // Call the API and get that lesson
    $.getJSON(htcUrl+htcApiVer+'/lessons/'+lessonId, _jsonLoadSuccess);
  }

  // PRIVATE METHODS 

  // Fill in the blanks with the lesson
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

        // Check first step
        _checkStep();
      });
    });

    // Adds button event handlers
    $('#back').click(_backClicked);
    $('#next').click(_nextClicked);

    // checkStepInterval = setInterval(_checkStep,1000);
  }

  // next button is clicked
  function _nextClicked(evt)
  {
    if (currentStep < steps.length){
      currentStep = currentStep + 1;
      $('html, body').animate({ scrollTop: $('#step'+currentStep).offset().top - bodyPadding }, 1000);
      setTimeout(_checkStep,2000)
    }}

  // back button is clicked
  function _backClicked(evt)
  {
    if (currentStep > 1){
      currentStep = currentStep - 1;
      $('html, body').animate({ scrollTop: $('#step'+currentStep).offset().top - bodyPadding }, 1000);
      setTimeout(_checkStep,2000)
    }
  }

  function _checkStep(){
      // Make object of the current stop
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
        nextStep : steps[currentStep - 1].next_step
      }

      if (debug) console.log(step.name);
      
      // if (accessToken != null) {
        // Need to add in some debug info if these don't exist.
        // if (step.triggerEndpoint != '' && 
        //     step.triggerCheck != '' && 
        //     step.triggerValue != ''){
                    
          // If step type is login
          if (step.stepType == 'login'){
            console.log('Asking if logged in.')
            $.post(htcUrl+'/logged_in?access_token='+accessToken, step, _loggedIn);
          }
        // }

        // If step type is open
        if (step.stepType == 'open'){
          $("#open").click(_openClicked);
        }

        // If step type is check_for_new
        if (step.stepType == 'check_for_new'){
          $.post(htcUrl+'/check_for_new?access_token='+accessToken, step, _checkForNew);
        }

        // If step type is 
        if (step.stepType == 'get_remembered_thing'){
          console.log('get_remembered_thing');
          $.post(htcUrl+'/get_remembered_thing?access_token='+accessToken, step, _getRememberedThing);
        }
      // }
    }

    function _getRememberedThing(response){
      response = $.parseJSON(response);
      if (debug) console.log(response);
      $('#'+step.url+' .feedback .newData').html(response.newData);
      $('#'+step.url+' .feedback').css('display','block');
    }

    function _loggedIn(response){
      response = $.parseJSON(response);
      console.log(response);
      if ( response.loggedIn ){
        if (debug) console.log(response);
        // $('html, body').delay(3000).animate({ scrollTop: $('#'+steps[currentStep - 1].nextStep).offset().top - bodyPadding }, 1000);
        $('#'+step.url+' .feedback').css('display','block');
      }
    }

    // Need to keep checking list for new additon
    function _checkForNew(response)
    {
      response = $.parseJSON(response);
      if ( response.newThingName ){
        if (debug) console.log(response);
        // $('html, body').delay(3000).animate({ scrollTop: $('#'+steps[currentStep - 1].nextStep).offset().top - bodyPadding }, 1000);
        $('#'+step.url+' .feedback .newThingName').html(response.newThingName);
        $('#'+step.url+' .feedback').css('display','block');
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

    

  // add public methods to the returned module and return it
  instructions.init = init;
  return instructions;
}(instructions || {}));

// initialize the module
instructions.init()


 // An example triggerEndpoint
            // https://api.foursquare.com/v2/users/self?v=20130706&oauth_token=
            // $.getJSON(step.triggerEndpoint+accessToken, _loginJsonLoaded)
            // $.getJSON('http://0.0.0.0:5000/'+lesson.url+'/logged_in?access_token='+accessToken, _loginJsonLoaded);
            // $.post('howtocity.herokuapp.com/logged_in?access_token='+accessToken, step, _whenResponseIsTrue);

// $.getJSON(step.triggerEndpoint+accessToken, _checkRemoteList);
          // $.post('http://howtocity.herokuapp.com/check_for_new?access_token='+accessToken, step, _whenResponseIsTrue);

            // step type login json has loaded
    // function _loginJsonLoaded(response)
    // {
    //   var trigger = false;
    //   // Cast strings to booleans
    //   if (step.triggerValue == 'true') step.triggerValue = true;
    //   if (step.triggerValue == 'false') step.triggerValue = false;

    //   // Check the trigger vs the value to see if its correct
    //   if (eval(step.triggerCheck) == step.triggerValue){
    //     trigger = true;
    //   }
    //   if (trigger == true){
    //     // $('html, body').delay(3000).animate({ scrollTop: $('#'+steps[currentStep - 1].nextStep).offset().top - bodyPadding }, 1000);
    //     $('#'+step.url+' .feedback').css('display','block');
    //   }
    // }