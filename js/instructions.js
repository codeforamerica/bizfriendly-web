var instructions = (function (instructions) {

  // private properties
  var debug = true;
  // var debug = false;
  var width = window.screen.width;
  var height = window.screen.height;
  var bodyPadding = 0;
  var lessonId = 0; // Blank lesson
  var lesson = {};
  var steps = [];
  var step = {};
  var accessToken = null;
  var currentStep = {};
  // var htcUrl = 'http://howtocity.herokuapp.com';
  var htcUrl = 'http://127.0.0.1:8000';
  // var htcUrl = 'http://0.0.0.0:5000';
  var htcApiVer = '/api/v1';
  var rememberedAttribute;
  var postData = {};
  var originalCount = false;

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
  }

  function _checkWindowSize(){
    if (debug) console.log(window.innerWidth);
    if(window.innerWidth > 340){
      window.resizeTo(340,height);
      window.moveTo(width-340,0);
    }
  }

  function _orderSteps(){
    if (debug) console.log('ordering steps');
    steps = lesson.steps.sort(function(a, b){
      if (a.step_number < b.step_number) return -1;
      if (a.step_number > b.step_number) return 1;
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
        triggerEndpoint : steps[i].trigger_endpoint,
        triggerCheck : steps[i].trigger_check,
        triggerValue : steps[i].trigger_value,
        thingToRemember : steps[i].thing_to_remember,
        feedback : steps[i].feedback,
        nextStepNumber : steps[i].next_step_number,
        stepState : "unfinished",
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
    _stepTransition();
    if (debug) console.log('showing step');
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
    if (debug) console.log('Step Transition');
  }

  // next button is clicked
  function _nextClicked(evt){
    if (currentStep.stepNumber < steps.length){
      currentStep = steps[currentStep.stepNumber];
      _updateStepsStates();
      _updateProgressBar();
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
  function _loginClicked(){
    if (debug) console.log('login clicked');
    OAuth.initialize('uZPlfdN3A_QxVTWR2s9-A8NEyZs');
    OAuth.popup(lesson.third_party_service, function(error, result) {
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

    // Create postData
    postData = {
      currentStep : currentStep,
      rememberedAttribute : rememberedAttribute,
      lessonName : lesson.name,
      lessonId : lesson.id,
      thirdPartyService : lesson.third_party_service,
      originalCount: false
    }

    // If step type is login
    if (currentStep.stepType == 'login'){
      if (!accessToken) {
        // First step should have a login button
        $('#login').click(_loginClicked);
      } else {
        if (debug) console.log(currentStep);
        _loggedIn();
      }
    }
    // If step type is open
    if (currentStep.stepType == 'open'){
      $(".open").click(_openClicked);
    }
    // If step type is check_for_new
    if (currentStep.stepType == 'check_for_new' && accessToken){
      // This step fires at least twice. First time it just gets the originalCount
      // Every following time it compares the number of objects to the originalCount
      if ( originalCount ){
        if (debug) console.log("originalCount: " + originalCount);
        postData["originalCount"] = originalCount;
      }
      $.post(htcUrl+'/check_for_new?access_token='+accessToken, postData, _checkForNew);
    }
    if (currentStep.stepType == 'check_if_attribute_exists' && accessToken){
      if (debug) console.log(currentStep);
      $.post(htcUrl+'/check_if_attribute_exists?access_token='+accessToken, postData, _checkIfAttributeExists);
    }
    if (currentStep.stepType == 'check_attribute_for_value' && accessToken){
      $.post(htcUrl+'/check_attribute_for_value?access_token='+accessToken, postData, _checkAttributeForValue);
    }
    // If step type is get_remembered_thing
    if (currentStep.stepType == 'get_remembered_thing' && accessToken){
      $.post(htcUrl+'/get_remembered_thing?access_token='+accessToken, currentStep, _getRememberedThing);
    }
    // Is step type get_user_input
    if (currentStep.stepType == 'get_user_input'){
      _getUserInput();
    }
    if (currentStep.stepType == 'check_for_new_tip'){
      if (currentStep.triggerEndpoint.search('replaceMe') != -1){
        currentStep.triggerEndpoint = currentStep.triggerEndpoint.replace('replaceMe',venueId);
      }
      $.post(htcUrl+'/check_for_new_tip?access_token='+accessToken, currentStep, _checkForNewTip);
    }
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

  // Are they logged in?
  function _loggedIn(){
      $('#step'+currentStep.stepNumber+' .step_text').css('display','none');
      $('#step'+currentStep.stepNumber+' .feedback').css('display','block');
      $('#next').addClass('animated pulse');
  }

  // .open is clicked
  function _openClicked(evt){
    var width = window.screen.width;
    var height = window.screen.height;
    var challengeFeatures = {
      height: height,
      width: width - 340,
      name: 'challenge',
      center: false
    }
    challengeWindow = $.popupWindow(currentStep.triggerEndpoint, challengeFeatures);
    
    // var left = width - 340;
    // var challengeSiteFeatures = 'height='+height+',width='+width;
    // window.open(currentStep.triggerEndpoint,'challengeSiteFeatures',challengeSiteFeatures,false);
  

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
    _showStep();
    _checkStep();
  }

  function _checkForNew(response){
    if (debug) console.log(response);
    response = $.parseJSON(response);
    if (response.timeout) _checkStep();
    if ( !response.new_object_added ){
      if ( response.original_count ){
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
    }
  }

  function _checkIfAttributeExists(response){
    if (debug) console.log(response);
    response = $.parseJSON(response);
    if (response.timeout) _checkStep();
    if ( response.attribute_exists ){
      $('#step'+currentStep.stepNumber+' .feedback .responseDisplay').html(response.attribute_to_display);
      $('#step'+currentStep.stepNumber+' .step_text').css('display','none');
      $('#step'+currentStep.stepNumber+' .feedback').css('display','block');
      $('#next').addClass('animated pulse');
    }
  }

  function _checkAttributeForValue(response){
    if (debug) console.log(response);
    response = $.parseJSON(response);
    if (response.timeout) _checkStep();
    if (response.attribute_value_matches) {
      $('#step'+currentStep.stepNumber+' .feedback .responseDisplay').attr('src',response.attribute_to_display);
      $('#step'+currentStep.stepNumber+' .step_text').css('display','none');
      $('#step'+currentStep.stepNumber+' .feedback').css('display','block');
      $('#next').addClass('animated pulse');
    }
  }


  function _checkForValue(response){
    if (debug) console.log(response);
    response = $.parseJSON(response);
    if (response.timeout) _checkStep();
    if ( response.resource_attribute_to_display ){
      $('#step'+currentStep.stepNumber+' .feedback .responseDisplay').html(response.resource_attribute_to_display);
      $('#step'+currentStep.stepNumber+' .step_text').css('display','none');
      $('#step'+currentStep.stepNumber+' .feedback').css('display','block');
      $('#next').addClass('animated pulse');
    }
  }


  function _checkForNewTip(response){
    if (debug) console.log(response);
    response = $.parseJSON(response);
    if (response.timeout) _checkStep();
    if ( response.new_tip_added ){
      $('.fsBizName').html(venueName);
      $('#step'+currentStep.stepNumber+' .step_text').css('display','none');
      $('#step'+currentStep.stepNumber+' .feedback').css('display','block');
      $('#next').addClass('animated pulse');
    }
  }

  function _getRememberedThing(response){
    if (debug) console.log(response);
    response = $.parseJSON(response);
    if (response.timeout) _checkStep();
    if (response.new_data) {
      $('#step'+currentStep.stepNumber+' .feedback .newData').html(response.new_data);
      $('#step'+currentStep.stepNumber+' .step_text').css('display','none');
      $('#step'+currentStep.stepNumber+' .feedback').css('display','block');
      $('#next').addClass('animated pulse');
    }
  }

  function _getUserInput(){
    $('#fsNewBizUrlSubmit').click(function(evt){
      if (debug) console.log($('#fsNewBizUrl').val());
      rememberMe = $('#fsNewBizUrl').val();
      var challengeFeatures = {
        height: height,
        width: width - 340,
        name: 'challengeWindow',
        center: false
      }
      // ToDO: Check that this is on the domain we expect
      challengeWindow = $.popupWindow(rememberMe, challengeFeatures);

      // ToDo: Move this logic to the API!!!!
      // Get page id
      var pathArray = rememberMe.split( '/' );
      venueId = pathArray.pop();

      // Get page info
      $.getJSON('https://api.foursquare.com/v2/venues/'+venueId+'?v=20130706&oauth_token='+accessToken, function(response){
        venueName = response.response.venue.name;
        var category = response.response.venue.categories[0].shortName;
        //Build feedback
        $('#fsBizName').html(venueName);
        $('#fsBizCategory').html(category);
        $('#fsBizUrl').html(rememberMe);
      });

      // Show feedback
      $('#next').addClass('animated pulse');
      $('.step_text').toggle();
      $('.feedback').toggle();

    });
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