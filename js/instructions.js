var instructions = (function (instructions) { 
  // private properties
  var width = window.screen.width;
  var height = window.screen.height;
  var bodyPadding = 0;
  var lessonId = 0; // Blank lesson
  var lesson = {};
  var steps = [];
  var step = {};
  var oauthToken = null;
  var currentStep = {};
  var rememberedAttribute;
  var postData = {};
  var originalCount = false;
  var originalAttributeValues = false;
  var challengeWindow;

  // PUBLIC METHODS
  // initialize variables and load JSON
  function init(){
    if (config.debug) console.log('init');
    // Get lessonId from the url
    lessonId = window.location.search.split('?')[1];
    // Call the API and get that lesson
    $.getJSON(config.bfUrl+config.bfApiVersion+'/lessons/'+lessonId, _main);
  }

  // PRIVATE METHODS 

  // Main Function
  function _main(response){
    _checkWindowSize();
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
    $('li.progress-button').click(_progressClicked);
  }

  function _checkWindowSize(){
    if (config.debug) console.log(window.innerWidth);
    if(window.innerWidth > 340){
      window.resizeTo(340,height);
      window.moveTo(width-340,0);
    }
  }

  function _orderSteps(){
    if (config.debug) console.log('ordering steps');
    steps = lesson.steps.sort(function(a, b){
      if (a.step_number < b.step_number) return -1;
      if (a.step_number > b.step_number) return 1;
      return 0;
    })
  }

  // Change steps attributes to have camelCase
  function _convertStepsAttributesNames(){
    if (config.debug) console.log('Change attribute names to camelCase.');
    var stepsWithJsNames = [];
    $(steps).each(function(i){
      step = {
        id : steps[i].id,
        name : steps[i].name,
        stepType : steps[i].step_type,
        stepNumber : steps[i].step_number,
        stepText : steps[i].step_text,
        triggerEndpoint : steps[i].trigger_endpoint,
        triggerCheck : steps[i].trigger_check,
        triggerValue : steps[i].trigger_value,
        thingToRemember : steps[i].thing_to_remember,
        feedback : steps[i].feedback,
        nextStepNumber : steps[i].next_step_number,
        stepState : "unfinished"
      }
      stepsWithJsNames.push(step);
    })
    steps = stepsWithJsNames;
  }

  // Set the steps state
  function _updateStepsStates(){
    if (config.debug) console.log('updating steps states');
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
    if (config.debug) console.log('making progress bar');
    $(steps).each(function(i){
        $('#progress').append('<li id="step'+steps[i].stepNumber+'_progress" class="progress-button" data-target="'+steps[i].stepNumber+'"></li>');
    });
    // Todo: Need to account for 12 possible steps
    // var widthPercent = '';
    // widthPercent = 100/steps.length+'%';
    // $('#progress li').attr('width',widthPercent);
  }

  // Update the progress bar
  function _updateProgressBar(){
    if (config.debug) console.log('updating progress bar');
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
    _stepTransition();
    if (config.debug) console.log('showing step');
    $('section').attr('id','step'+currentStep.stepNumber);
    // $('section h2').html(currentStep.name);
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
      // $('#additional-resource').attr('href=http://bizfriend.ly/lesson.html?'+lessonId);
      // $('#additional-resource').attr('target','_parent');
      $('#congrats').toggle();
    }
  }

  function _stepTransition(){
    if (config.debug) console.log('Step Transition');
  }

  // next button is clicked
  function _nextClicked(evt){
    if (config.debug) console.log("CURRENT EVENT IS: " + currentStep.stepNumber);
    if (currentStep.stepNumber < steps.length){
      currentStep = steps[currentStep.stepNumber];
      _updateStepsStates();
      _updateProgressBar();
      // Record most recent opened step 
      postData = {
        currentStep : currentStep,
        lessonName : lesson.name,
        lessonId : lesson.id,
      }
      BfUser.record_step(postData, _recordedStep);
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

  // progress circle li element is clicked
  function _progressClicked(evt) {
    console.log("Clicked Step: " + $(this).attr('data-target'));
    
    if (currentStep.stepNumber == steps.length) {
      // toggle congrats off if already on last step
      _showCongrats();
    }
    currentStep = steps[$(this).attr('data-target') - 1];
    _updateStepsStates();
    _updateProgressBar();
    _showStep();
    _checkStep();
  }

  // login clicked
  function _loginClicked(evt){
    if (config.debug) console.log('Logging into '+lesson.third_party_service);
    OAuth.initialize('uZPlfdN3A_QxVTWR2s9-A8NEyZs');
    var options;
    if (lesson.third_party_service == 'facebook'){
      options = {authorize:{display:"popup"}};
    }
    if (lesson.third_party_service == 'foursquare'){
      options = {authorize:{display:"touch"}};
    }
    if (lesson.third_party_service == 'trello'){
      options = {authorize:{name:"BizFriendly",expiration:"never"}};
    }
    OAuth.popup(lesson.third_party_service, options, function(error, result) {
      //handle error with error
      if (error) console.log(error);
      if (config.debug) console.log(result);

      if (result.hasOwnProperty("access_token")){
        oauthToken = result.access_token;
      }
      if (result.hasOwnProperty("oauth_token")){
        oauthToken = result.oauth_token;
      }

      // Add connection to server db
      var data = {service: lesson.third_party_service, service_access: oauthToken}
      BfUser.create_connection(data, _createdConnection);

      // Check first step
      _checkStep();  
    }); 
  }

  // Check steps
  function _checkStep(){
    if (config.debug) console.log(currentStep.name);

    // Create postData
    postData = {
      currentStep : currentStep,
      rememberedAttribute : rememberedAttribute,
      lessonName : lesson.name,
      lessonId : lesson.id,
      thirdPartyService : lesson.third_party_service,
      originalCount : false,
      originalAttributeValues : false
    }

    // If step type is login
    if (currentStep.stepType == 'login'){
        // First step should have a login button
        if (!oauthToken){
          $('#login').click(_loginClicked);
        }
        else {
          _loggedIn();
        }
    }

    // If step type is open
    if (currentStep.stepType == 'open'){
      $(".open").click(_openClicked);
    }

    // If step type is check_for_new
    if (currentStep.stepType == 'check_for_new' && oauthToken){
      console.log(originalCount);
      // This step fires at least twice. First time it just gets the originalCount
      // Every following time it compares the number of objects to the originalCount
      if ( originalCount !== false ){
        if (config.debug) console.log("originalCount: " + originalCount);
        postData["originalCount"] = originalCount;
      }
      BfUser.check_for_new(postData, _checkForNew);
    }
    // check_if_attribute_exists
    if (currentStep.stepType == 'check_if_attribute_exists' && oauthToken){
      if (config.debug) console.log(currentStep);
      BfUser.check_if_attribute_exists(postData, _checkIfAttributeExists);
    }

    // check_attribute_for_value
    if (currentStep.stepType == 'check_attribute_for_value' && oauthToken){
      BfUser.check_attribute_for_value(postData, _checkAttributeForValue);
    }

    // Is step type get_attributes_from_input
    if (currentStep.stepType == 'get_attributes_from_input'){
      // First get the id from the input
      $('#userInputSubmit').click(function(evt){
        var userInput = $('#userInput').val();
        // If Foursquare, get venue id from input URL.
        if (lesson.third_party_service == 'foursquare'){
          var userInputPath = userInput.split( '/' );
          rememberedAttribute = userInputPath.pop();
        }
        challengeWindow.close();
        _openChallengeWindow(userInput);

        postData["rememberedAttribute"] = rememberedAttribute;
        // Then call get_attributes
        BfUser.get_attributes(postData, _getAttributes);
      });
    }

    // check_attribute_for_update
    if (currentStep.stepType == 'check_attribute_for_update' && oauthToken){
      console.log(originalAttributeValues);
      // This step fires at least twice. First time it just gets the originalAttributeValues
      // Every following time it compares the value of the attribute to the originalAttributeValues
      if ( originalAttributeValues ){
        if (config.debug) console.log("originalAttributeValues: " + originalAttributeValues);
        postData["originalAttributeValues"] = originalAttributeValues.toString();
      }
      console.log(postData);
      BfUser.check_attribute_for_update(postData, _checkAttributeForUpdate);
    }

    // congrats
    if (currentStep.stepType == 'congrats'){
      $('#fb-share').attr('href', 'http://api.addthis.com/oexchange/0.8/forward/facebook/offer?pubId=ra-52043c6b31185dab&url=http://bizfriend.ly/lesson.html?'+lessonId);
      $('#tw-share').attr('href', 'http://api.addthis.com/oexchange/0.8/forward/twitter/offer?pubId=ra-52043c6b31185dab&url=http://bizfriend.ly/lesson.html?'+lessonId+'&text=I just finished '+lesson.name+' with help from BizFriendly!');
      $('#g-share').attr('href', 'http://api.addthis.com/oexchange/0.8/forward/google_plusone_share/offer?pubId=ra-52043c6b31185dab&url=http://bizfriend.ly/lesson.html?'+lessonId);
      $('#li-share').attr('href', 'http://api.addthis.com/oexchange/0.8/forward/linkedin/offer?pubId=ra-52043c6b31185dab&url=http://bizfriend.ly/lesson.html?'+lessonId);
      $('#additional-resources').click(function(evt){
        window.close();
      });
      $('#more-lessons').click(function(evt){
        window.opener.location.href='learn.html';
        window.close();
      });
      _showCongrats();
    }

    // Add example popover clicker
    var example = $('#example').html();
    $('#example').css('display','none');
    $('#popover').popover({ content: example, html: true, placement: 'top', trigger: 'hover' });
  }

  // They are loggedIn
  function _loggedIn(){
      $('#step'+currentStep.stepNumber+' .step_text').css('display','none');
      $('#step'+currentStep.stepNumber+' .feedback').css('display','block');
      $('#next').addClass('animated pulse');
  }

  // Saved a connection in the db
  function _createdConnection(response){
    if (config.debug) console.log(response);
  }

  function _recordedStep(response){
    if (config.debug) console.log(response);
  }

  // Open up the main window to the web service we want to teach.
  function _openChallengeWindow(url){
    var width = window.screen.width;
    var height = window.screen.height;
    var challengeFeatures = {
      height: height,
      width: width - 340,
      name: 'challenge',
      center: false
    }
    challengeWindow = $.popupWindow(url, challengeFeatures);
  }

  // .open is clicked
  function _openClicked(evt){
    _openChallengeWindow(currentStep.triggerEndpoint);
    
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
    postData = {
        currentStep : currentStep,
        lessonName : lesson.name,
        lessonId : lesson.id,
      }
    BfUser.record_step(postData, _recordedStep);
    _showStep();
    _checkStep();
  }

  // A new object is added at a url endpoint
  // Remember a certain attribute, object id for example.
  // Display another attribute
  function _checkForNew(response){
    if (config.debug) console.log(response);
    response = $.parseJSON(response);
    if (response.timeout) _checkStep();
    if ( !response.new_object_added ){
      if ( response.original_count !== false ){
        // If no new thing added, yet there is an original count
        // then ask again with the count in the post data.
        originalCount = response.original_count;
        _checkStep();
      }
    }
    if ( response.new_object_added ){
      // Remember the attribute!
      rememberedAttribute = response.attribute_to_remember;
      $('#step'+currentStep.stepNumber+' .feedback .responseDisplay').html(response.attribute_to_display);
      $('#step'+currentStep.stepNumber+' .step_text').css('display','none');
      $('#step'+currentStep.stepNumber+' .feedback').css('display','block');
      $('#next').addClass('animated pulse');
      // Cancel out originalCount!!!
      originalCount = false;
    }
  }

  // A certain attribute exists at the url endpoint
  // Display the returned attribute
  function _checkIfAttributeExists(response){
    if (config.debug) console.log(response);
    response = $.parseJSON(response);
    if (response.timeout) _checkStep();
    if ( response.attribute_exists ){
      $('#step'+currentStep.stepNumber+' .feedback .responseDisplay').html(response.attribute_to_display);
      $('#step'+currentStep.stepNumber+' .step_text').css('display','none');
      $('#step'+currentStep.stepNumber+' .feedback').css('display','block');
      $('#next').addClass('animated pulse');
    }
  }

  // A certain attribute equals a determined value
  // Display the returned attribute
  function _checkAttributeForValue(response){
    if (config.debug) console.log(response);
    response = $.parseJSON(response);
    if (response.timeout) _checkStep();
    if (response.attribute_value_matches) {
      if (lesson.third_party_service == 'facebook'){
        $('#step'+currentStep.stepNumber+' .feedback .responseDisplay').attr('src',response.attribute_to_display);
      }
      if ( lesson.third_party_service == 'foursquare'){
        $('#step'+currentStep.stepNumber+' .feedback .responseDisplay').html(response.attribute_to_display);
      }
      $('#step'+currentStep.stepNumber+' .step_text').css('display','none');
      $('#step'+currentStep.stepNumber+' .feedback').css('display','block');
      $('#next').addClass('animated pulse');
    }
  }

  // An attribute of the object is updated
  // Display that attribute
  function _checkAttributeForUpdate(response){
    if (config.debug) console.log(response);
    response = $.parseJSON(response);
    if (response.timeout) _checkStep();
    if ( !response.attribute_value_updated ){
      if ( response.original_attribute_values != false ){
        // If the attribute hasn't been updated, yet we have the original value
        // then ask again with the original value in the request.
        originalAttributeValues = response.original_attribute_values;
        console.log('Checking again with original_value');
        _checkStep();
      }
    }
    if ( response.attribute_value_updated ){
      // Remember the attribute!
      // rememberedAttribute = response.attribute_to_remember;
      $('#step'+currentStep.stepNumber+' .feedback .responseDisplay').html(response.attribute_to_display);
      $('#step'+currentStep.stepNumber+' .step_text').css('display','none');
      $('#step'+currentStep.stepNumber+' .feedback').css('display','block');
      $('#next').addClass('animated pulse');
      // Cancel out original attributes!!!
      originalAttributeValues = false;
    }
  }

  // Display the returned attributes
  function _getAttributes(response){
    if (config.debug) console.log(response);
    response = $.parseJSON(response);
    $('#step'+currentStep.stepNumber+' .feedback #attribute').html(response.attribute);
    $('#step'+currentStep.stepNumber+' .feedback #attribute-2').html(response.attribute_2);
    $('#step'+currentStep.stepNumber+' .feedback #attribute-3').html(response.attribute_3);
    $('#step'+currentStep.stepNumber+' .step_text').css('display','none');
    $('#step'+currentStep.stepNumber+' .feedback').css('display','block');
    $('#next').addClass('animated pulse');
  }

  function _showCongrats(){
    $('section h2').toggle();
    $('.step_text').toggle();
    $('#controls').toggle();
    $('#congrats').css('display','block');
  }

  // add public methods to the returned module and return it
  instructions.init = init;
  return instructions;
}(instructions || {}));

// initialize the module
instructions.init()