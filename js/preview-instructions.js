var preview = (function (preview) { 
  // private properties
  var width = window.screen.width;
  var height = window.screen.height;
  var lessonName = window.opener.document.preview.lessonName.value;
  var authorName = window.opener.document.preview.authorName.value;
  var bodyPadding = 0;
  var lessonId = 0; // Blank lesson
  var lesson = {};
  var service = {};
  var steps = window.opener.document.preview.steps.value;
  steps = $.parseJSON(steps);
  console.log(steps);
  var step = {};
  var oauthToken = null;
  var currentStep = {};
  var rememberedAttribute;
  var postData = {};
  var originalCount = false;
  var originalAttributeValues = false;
  var challengeWindow;
  var user_id;
  var feedback;

  // variables for meta lesson
  var userName;
  var city;
  var state;

  // PUBLIC METHODS
  // initialize variables and load JSON
  function init(){
    if (config.debug) console.log('init');
    _main();

  }

  // PRIVATE METHODS 

  // Main Function
  function _main(response){
    _checkWindowSize();
    // Attach response to global lesson variable
    // lesson = response;
    // Set the name of the lesson
    $('#instructions-title').html(lessonName);
    // Set author name
    $('#author-name').text(authorName);
    // Make sure steps are in order of id
    // _orderSteps();
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
    $('.next').click(_nextClicked);
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
    steps = steps.sort(function(a, b){
      if (a.step_number < b.step_number) return -1;
      if (a.step_number > b.step_number) return 1;
      return 0;
    })
  }

  // Change steps attributes to have camelCase
  function _convertStepsAttributesNames(){
    if (config.debug) console.log('Change attribute names to camelCase.');
    console.log(steps);
    var stepsWithJsNames = [];
    $(steps).each(function(i){
      step = {
        id : steps[i].id,
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
        $('.progress-dots').append('<li id="step'+steps[i].stepNumber+'_progress" class="progress-button" data-target="'+steps[i].stepNumber+'"></li>');
    });
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
    $('.step_text').html(currentStep.stepText);
    $('#feedback-content').html(currentStep.feedback);
    // Set step_text back to visible and hide others
    if ($('.step_text').css('display') == 'none'){
      $('.step_text').toggle();
    }
    // if ($('.feedback').css('display') == 'block'){
    //   $('.feedback').toggle();
    // }
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
    console.log("CURRENT EVENT IS: " + currentStep.stepNumber);
    if (currentStep.stepNumber < steps.length){
      $("#feedback").modal('hide');
      _goToNextStep();
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
    service = lesson.service.name.toLowerCase();
    if (config.debug) console.log('Logging into '+service);
    OAuth.initialize('uZPlfdN3A_QxVTWR2s9-A8NEyZs');
    var options;
    if (service == 'facebook'){
      options = {authorize:{display:"popup"}};
    }
    if (service == 'foursquare'){
      options = {authorize:{display:"touch"}};
    }
    if (service == 'trello'){
      options = {authorize:{name:"BizFriendly",expiration:"never"}};
    }
    OAuth.popup(service, options, function(error, result) {
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
      // var data = {service: service, service_access: oauthToken}
      // BfUser.create_connection(data, _createdConnection);

      // Check first step
      _checkStep();  
    }); 
  }

  function _goToNextStep(){
    currentStep = steps[currentStep.stepNumber];
    // if ($('.feedback').css('display') == 'block'){
    //   $('.feedback').toggle();
    // }
    if ($('.step_text').css('display') == 'none'){
      $('.step_text').toggle();
    }
    _updateStepsStates();
    _updateProgressBar();
    _showStep();
    _checkStep();
  }

  // Check steps
  function _checkStep(){
    // Create postData
    postData = {
      currentStep : currentStep,
      rememberedAttribute : rememberedAttribute,
      lessonName : lesson.name,
      lessonId : lesson.id,
      thirdPartyService : service,
      originalCount : false,
      originalAttributeValues : false
    }

    // if (currentStep.stepType == 'meta_intro'){
    //   // Get the users name
    //   $("#userInputSubmit").click(function(evt){
    //     userName = $('#userInput').val();
    //     $('.responseDisplay').text(userName);
    //     // $('.feedback').toggle();
    //     $('.step_text').toggle();
    //   });
    // }

    // if (currentStep.stepType == 'meta_location'){
    //   // Get the users name
    //   $.getJSON('http://ip-api.com/json', function(response){
    //     city = response.city;
    //     state = response.regionName;
    //     $('.cityName').text(city);
    //     $('.stateName').text(state);
    //     rememberedAttribute = 'find_loc='+city+',+'+state
    //     rememberedAttribute = rememberedAttribute.replace(' ','+');
    //   });

    //   // Check with them if location was correct
    //   $('#yes').click(function(evt){
    //     _goToNextStep();
    //   });
    //   // If no, then take in the new address
    //   $('#no').click(function(evt){
    //     // $('.feedback').toggle();
    //     $('#feedbackYes').hide();
    //     $('.step_text').toggle();
    //     // Get new city, state and go to the next step.
    //     $('#userInputSubmit').click(function(evt){
    //       city = $('#userInputCity').val();
    //       state = $('#userInputState').val();
    //       rememberedAttribute = 'find_loc='+city+',+'+state
    //       rememberedAttribute = rememberedAttribute.replace(' ','+');
    //       _goToNextStep();
    //     });
    //   });
    // }

    // if (currentStep.stepType == 'meta_search'){
    //   // Did they find their biz?
    //   $('.yes').click(function(evt){
    //     $('.feedback').show();
    //     $('.feedbackYes').show();
    //     $('.feedbackYes3').hide();
    //     $('.feedbackNo').hide();
    //     $('.feedbackNo2').hide();
    //     $('.feedbackNo3').hide()
    //     $('.step_text').hide();
    //   });
    //   // If no, then search again
    //   $('.no').click(function(evt){
    //     $('.feedback').show();
    //     $('.feedbackYes').hide();
    //     $('.feedbackYes3').hide();
    //     $('.feedbackNo').show();
    //     $('.feedbackNo2').hide();
    //     $('.feedbackNo3').hide()
    //     $('.step_text').hide();
    //   });
    //   $('.no2').click(function(evt){
    //     $('.feedback').show();
    //     $('.feedbackYes').hide();
    //     $('.feedbackYes3').hide();
    //     $('.feedbackNo').hide();
    //     $('.feedbackNo2').show();
    //     $('.feedbackNo3').hide()
    //     $('.step_text').hide();
    //   });
    //   $('.yes3').click(function(evt){
    //     $('.feedback').show();
    //     $('.feedbackYes').hide();
    //     $('.feedbackYes3').show();
    //     $('.feedbackNo').hide();
    //     $('.feedbackNo2').hide();
    //     $('.feedbackNo3').hide()
    //     $('.step_text').hide();
    //   });
    //   $('.no3').click(function(evt){
    //     $('.feedback').show();
    //     $('.feedbackYes').hide();
    //     $('.feedbackYes3').hide();
    //     $('.feedbackNo').hide();
    //     $('.feedbackNo2').hide();
    //     $('.feedbackNo3').show()
    //     $('.step_text').hide();
    //   });
    // }

    // if (currentStep.stepType == 'meta_signup'){
    //   console.log('meta_signup');
    //   $('#signup-name').val(userName);
    // }

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
      $("#open").click(_openClicked);
    }

    // // If step type is check_for_new
    // if (currentStep.stepType == 'check_for_new' && oauthToken){
    //   console.log(originalCount);
    //   // This step fires at least twice. First time it just gets the originalCount
    //   // Every following time it compares the number of objects to the originalCount
    //   if ( originalCount !== false ){
    //     if (config.debug) console.log("originalCount: " + originalCount);
    //     postData["originalCount"] = originalCount;
    //   }
    //   BfUser.check_for_new(postData, _checkForNew);
    // }
    // // check_if_attribute_exists
    // if (currentStep.stepType == 'check_if_attribute_exists' && oauthToken){
    //   if (config.debug) console.log(currentStep);
    //   BfUser.check_if_attribute_exists(postData, _checkIfAttributeExists);
    // }

    // // check_attribute_for_value
    // if (currentStep.stepType == 'check_attribute_for_value' && oauthToken){
    //   BfUser.check_attribute_for_value(postData, _checkAttributeForValue);
    // }

    // // Is step type get_attributes_from_input
    // if (currentStep.stepType == 'get_attributes_from_input'){
    //   // First get the id from the input
    //   $('#userInputSubmit').click(function(evt){
    //     var userInput = $('#userInput').val();
    //     // If Foursquare, get venue id from input URL.
    //     if (service == 'foursquare'){
    //       var userInputPath = userInput.split( '/' );
    //       rememberedAttribute = userInputPath.pop();
    //     }
    //     challengeWindow.close();
    //     _openChallengeWindow(userInput);

    //     postData["rememberedAttribute"] = rememberedAttribute;
    //     // Then call get_attributes
    //     BfUser.get_attributes(postData, _getAttributes);
    //   });
    // }

    // // check_attribute_for_update
    // if (currentStep.stepType == 'check_attribute_for_update' && oauthToken){
    //   console.log(originalAttributeValues);
    //   // This step fires at least twice. First time it just gets the originalAttributeValues
    //   // Every following time it compares the value of the attribute to the originalAttributeValues
    //   if ( originalAttributeValues ){
    //     if (config.debug) console.log("originalAttributeValues: " + originalAttributeValues);
    //     postData["originalAttributeValues"] = originalAttributeValues.toString();
    //   }
    //   console.log(postData);
    //   BfUser.check_attribute_for_update(postData, _checkAttributeForUpdate);
    // }

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
      // $('#step'+currentStep.stepNumber+' .feedback').css('display','block');
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
    // If url has replace_me in it, replace with rememberedAttribute

    console.log(currentStep);
    console.log(rememberedAttribute);
    if(currentStep.triggerEndpoint.indexOf('replace_me') != -1){
      currentStep.triggerEndpoint = currentStep.triggerEndpoint.replace('replace_me',rememberedAttribute);
    }
    _openChallengeWindow(currentStep.triggerEndpoint);
    
    // Advance to next step
    // _goToNextStep();
    $("#feedback").modal("show");
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
      // $('#step'+currentStep.stepNumber+' .feedback .responseDisplay').html(response.attribute_to_display);
      // $('#step'+currentStep.stepNumber+' .step_text').css('display','none');
      // $('#step'+currentStep.stepNumber+' .feedback').css('display','block');
      
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
      // $('#step'+currentStep.stepNumber+' .feedback .responseDisplay').html(response.attribute_to_display);
      $('#step'+currentStep.stepNumber+' .step_text').css('display','none');
      // $('#step'+currentStep.stepNumber+' .feedback').css('display','block');
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
      // if (service == 'facebook'){
      //   $('#step'+currentStep.stepNumber+' .feedback .responseDisplay').attr('src',response.attribute_to_display);
      // }
      // if ( service == 'foursquare'){
      //   $('#step'+currentStep.stepNumber+' .feedback .responseDisplay').html(response.attribute_to_display);
      // }
      $('#step'+currentStep.stepNumber+' .step_text').css('display','none');
      // $('#step'+currentStep.stepNumber+' .feedback').css('display','block');
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
      // $('#step'+currentStep.stepNumber+' .step_text').css('display','none');
      // $('#step'+currentStep.stepNumber+' .feedback').css('display','block');
      $('#next').addClass('animated pulse');
      // Cancel out original attributes!!!
      originalAttributeValues = false;
    }
  }

  // Display the returned attributes
  function _getAttributes(response){
    if (config.debug) console.log(response);
    response = $.parseJSON(response);
    // $('#step'+currentStep.stepNumber+' .feedback #attribute').html(response.attribute);
    // $('#step'+currentStep.stepNumber+' .feedback #attribute-2').html(response.attribute_2);
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

  // function _getUserId(){
  //   var filters = [{"name": "name", "op": "==", "val": BfUser.name}];
  //   $.ajax({
  //     url: config.bfUrl+config.bfApiVersion+'/users',
  //     data: {"q": JSON.stringify({"filters": filters}), "single" : true},
  //     dataType: "json",
  //     contentType: "application/json",
  //     success: function(data) { 
  //       user_id = data.objects[0].id; 
  //       console.log(data.objects[0].id);
  //     }
  //   });
  // }

  // $(function () {
  //   $("#rating-handle").click(function () {
  //     if ($(this).parent().hasClass("popped")) {
  //       $(this).parent().animate({right:'-310px'}, {queue: false, duration: 500}).removeClass("popped");
  //   } else {
  //     $(this).parent().animate({right: "-100px" }, {queue: false, duration: 500}).addClass("popped");}
  //   });
  // });

  // $("#rating-stars").raty();
  // _getUserId();

  // $("#rating-btn").click(function(evt){
  //   var rating = $("#rating-stars").raty('score');
  //   if (rating == null){
  //     rating = null;
  //   }
  //   newRating = {
  //     rating : rating,
  //     lesson_or_step : "step",
  //     lesson_or_step_id : currentStep.id,
  //     user_id : user_id,
  //     feedback : $('#rating-feedback').val()
  //   }

  //   if (config.debug) console.log(BfUser.name, user_id);

  //   $.ajax({
  //       type: "POST",
  //       contentType: "application/json",
  //       url: config.bfUrl+config.bfApiVersion+'/ratings',
  //       data: JSON.stringify(newRating),
  //       dataType: "json",
  //       success : function(response, textStatus, jqxhr){
  //         if (config.debug) console.log(jqxhr.status);
  //       }
  //     });
  // });

  

  // add public methods to the returned module and return it
  preview.init = init;
  return preview;
}(preview || {}));

// initialize the module
preview.init()