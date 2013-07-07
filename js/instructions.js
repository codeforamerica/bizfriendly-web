var debug = true;

//Fix width
var width = window.screen.width;
$('.narrow').css('width',280); // Hackity

var body_padding = parseInt($('body').css('padding-top'), 10);

// Get lesson
var lesson_id = window.location.search.split('?')[1];
var lesson = null;
var steps = null;
var access_token = null;

$.getJSON('http://127.0.0.1:5000/api/v1/lessons/'+lesson_id,
  // Fill in the blanks with the lesson
  function(lessonResponse){
    lesson = lessonResponse;
    steps = lesson.steps.sort()
    // console.log(steps);

    // Set the name of the lesson
    $('.instruction_header h4').html(lesson.name);

    // Fill in Steps
    $(steps).each(function(i){
      $('#main').append('<section id="'+lesson.steps[i].url+'">'+
              '<h2 class="step_name"></h2>'+
              '<div class="step_text"></div>'+
              '<div class="feedback"></div>'+
              '</section>')
      $('#'+lesson.steps[i].url+' .step_name').html(lesson.steps[i].name);
      $('#'+lesson.steps[i].url+' .step_text').html(lesson.steps[i].step_text);
      $('#'+lesson.steps[i].url+' .feedback').html(lesson.steps[i].feedback);
    })

    // Set for page scrolling
    numOfSections = $('section').length
    doc_height = $('body').height();

    // OAuth
    $('#login').click(function(){
      OAuth.initialize('uZPlfdN3A_QxVTWR2s9-A8NEyZs');
      OAuth.popup(lesson.url, function(error, result) {
        //handle error with error
        access_token = result.access_token;
      });
    });
  }
);

// Get around
var currentStep = 0;

// Back button
$('#back').click(function (){
  if (debug){
    console.log('Back');
  }
  var backStep = currentStep;
  $('html, body').animate({ scrollTop: $('#step'+backStep).offset().top - body_padding }, 1000);
});

// Next button
$('#next').click(function() {
  if (debug){
    console.log('Next');
  }
  var nextStep = currentStep + 1;
  $('html, body').animate({ scrollTop: $('#step'+nextStep).offset().top - body_padding }, 1000);
});

var checkStep = function(){
  var trigger = false;
  if (access_token != null) {
    // console.log(steps[0]);
    // console.log(steps[0].hasOwnProperty('trigger_endpoint'));
    if (steps[currentStep].trigger_endpoint != '' && steps[currentStep].trigger_check != '' && steps[currentStep].trigger_value != ''){
      // console.log(steps[0]);
      // http://127.0.0.1:5000/foursquare/loggedin/access_token
      // https://api.foursquare.com/v2/users/self?v=20130706&oauth_token=
      
      // If step type is login
      if (steps[currentStep].description == 'login'){
        $.getJSON(steps[currentStep].trigger_endpoint+access_token,
        function(response){
          // Check the trigger vs the value to see if its correct!
          console.log(response.installed);
          var trigger_value;
          if (steps[currentStep].trigger_value == 'true'){
            trigger_value = true;
          } else if (steps[currentStep].trigger_value == 'false'){
            trigger_value = false;
          } else {
            trigger_value = steps[currentStep].trigger_value;
          }
          if (eval(steps[currentStep].trigger_check) == trigger_value){
            trigger = true;
          }
          if (trigger == true){
            $('html, body').delay(3000).animate({ scrollTop: $('#'+steps[currentStep].next_step).offset().top - body_padding }, 1000);
            $('#'+lesson.steps[currentStep].url+' .feedback').css('display','block');
            currentStep = currentStep + 1;
          }
        })
      }
    }

    // If step type is open
    if (steps[currentStep].description == 'open'){
      var width = window.screen.width;
      var height = window.screen.height;
      var challengeFeatures = {
        height: height,
        width: 1000,
        name: 'site',
        center: false
      }
      $("#open").click(function(){
        challengeWindow = $.popupWindow(steps[currentStep].trigger_endpoint, challengeFeatures);
        $('html, body').delay(3000).animate({ scrollTop: $('#'+steps[currentStep].next_step).offset().top - body_padding }, 1000);
        $('#'+steps[currentStep].url+' .feedback').css('display','block');
        currentStep = currentStep + 1;
      });
    }
  }
}

var checkStepInterval = setInterval(checkStep,1000);