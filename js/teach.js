var teach = (function (teach) {

  var user_id = false;
  var newSteps = [];
  var newStep = {};
  var currentStep = {};

  // PUBLIC METHODS
  function init(){
    if (config.debug) console.log('init');
    _main();
  }

  // PRIVATE METHODS
  function _main(){
    $('.selectpicker').selectpicker();
    _dragAndDrop();
    _checkIfLoggedIn();
    _getCategories();
    _getServices();
    _addNewStep();
    console.log(newSteps);
    // _getLessons();
    $("#left").click(_backStep);
    $('#right').click(_nextStep);
    $('#add-new-step').click(_addNewStep);
    _setLessonName();
    $(".close").click(_closeClicked);
    // $('#new-lesson-btn').click(_postNewLesson);
    // $('#new-step-btn').click(_postNewStep);
  }

  function _dragAndDrop(){
    $('.draggable').draggable({ revert: true });
    $( ".blank-droppable" ).droppable({
      drop: function( event, ui ) {
        $(this).children(":not(.close)").remove();
        $(ui.draggable[0]).attr('style','position:relative;');
        $( this ).append($(ui.draggable[0]).clone().addClass("element-editable"));
        $('.element-editable').editable(function(value, settings) { 
          return (value);
        });
      }
    });
  }

  function _checkIfLoggedIn(){
    if (!BfUser.bfAccessToken){
      $('#lesson-form').hide();
      $('.login-required').show();
    } else {
      if (config.debug) console.log('Logged In');
      $(".author-name").text(BfUser.name);
      _getUserId();
    }
  }

  function _getUserId(){
    var filters = [{"name": "name", "op": "==", "val": BfUser.name}];
    $.ajax({
      url: config.bfUrl+config.bfApiVersion+'/users',
      data: {"q": JSON.stringify({"filters": filters}), "single" : true},
      dataType: "json",
      contentType: "application/json",
      success: function(data) { 
        user_id = data.objects[0].id; 
      }
    });
  }

  function _getCategories(){
    $.get(config.bfUrl+config.bfApiVersion+'/categories', function(response){
      $.each(response.objects, function(i){
        $('#category-id').append('<option value='+response.objects[i].id+'>'+response.objects[i].name+'</option>');
      })
      // $('#category-id').append('<option value="newSkill"><a href="/" target="_blank">Add a New Skill</a></option>');
      $('.selectpicker').selectpicker('refresh');
    })
  }

  function _getServices(){
    $.get(config.bfUrl+config.bfApiVersion+'/services', function(response){
      $.each(response.objects, function(i){
        $('#services').append('<option value='+response.objects[i].name+'>'+response.objects[i].name+'</option>');
      })
      $('.selectpicker').selectpicker('refresh');
    })
  }

  // Set the newSteps state
  function _updateStepsStates(){
    if (config.debug) console.log('updating newSteps states');
    $(newSteps).each(function(i){
      if (currentStep.step_number == newSteps[i].step_number){
        newSteps[i].step_state = "active";
      }
      if (currentStep.step_number > newSteps[i].step_number){
        newSteps[i].step_state = "finished";
      }
      if (currentStep.step_number < newSteps[i].step_number){
        newSteps[i].step_state = "unfinished";
      }
    })
    // Set current-dot
    $("#current-dot").html("<h2>"+currentStep.step_number+"</h2>");
  }

  // Update the progress bar
  function _updateProgressBar(){
    if (config.debug) console.log('updating progress bar');
    $(newSteps).each(function(i){
      $('.step'+newSteps[i].step_number+'_progress').removeClass('unfinished active finished').addClass(newSteps[i].step_state);
      if (newSteps[i].step_number == currentStep.step_number){
        $('.step'+newSteps[i].step_number+'_progress').html('<h2>'+currentStep.step_number+'</h2>');
      } else {
        $('.step'+newSteps[i].step_number+'_progress').html('');
      }
    })
  }

  function _getLessons(){
    $.get(config.bfUrl+config.bfApiVersion+'/lessons', function(response){
      $.each(response.objects, function(i){
        $('#lesson-id').append('<option value='+response.objects[i].id+'>'+response.objects[i].name+'</option>');
      })
      $('.selectpicker').selectpicker('refresh');
    })
  }

  function _nextStep(evt){
    // Save the current step in an array
    $.each(newSteps, function(i){
      if (newSteps[i].step_number == newStep.step_number){
        newSteps[i] = newStep;
      }
    })
    _updateStepsStates();
  }

  function _addNewStep(evt){
    currentStep = {
      step_number : newSteps.length + 1,
      step_type : "",
      step_action : "",
      step_text : "",
      feedback : "",
      step_state : ""
    }
    // Save the current step in an array
    var stepExists = false;
    $.each(newSteps, function(i){
      if (newSteps[i].step_number == currentStep.step_number){
        stepExists == i;
      }
    });
    if (stepExists){
      newSteps[stepExists] = currentStep;
    } else {
      newSteps.push(currentStep);
      $('.progress-dots').append('<li class="step'+currentStep.step_number+'_progress progress-button" data-target="'+currentStep.step_number+'"></li>');
    }
    _updateStepsStates();
    _updateProgressBar();
    console.log(newSteps);
  }

  function _backStep(evt){
    if (currentStep.step_number > 1) {
      currentStep = newSteps[currentStep.step_number - 2];
    _updateStepsStates();
    _updateProgressBar();
    }
  }

  function _nextStep(evt){
    if (currentStep.step_number < newSteps.length){
      currentStep = newSteps[currentStep.step_number];
      _updateStepsStates();
      _updateProgressBar();
    }
  }

  function _setLessonName(){
    $('.lesson-editable').editable(function(value, settings) { 
      lessonName = value;
      return (value);
      }, { 
         submit  : 'OK'
    });
  }

  function _closeClicked(evt){
    // Erase the thing that this button is within.
    $(this).parent().remove();
    if ($("#add-droppable").length == 0){
      $('#teach-instructions').append('<a id="add-droppable">Add another element</a>');
      $("#add-droppable").click(_addDroppableClicked);
    }
    }

  function _addDroppableClicked(evt){
      var blankDroppable = '<div class="blank-droppable">';
      blankDroppable += '<button type="button" class="close" aria-hidden="true">&times;</button>';
      blankDroppable += '<p class="temp-text">Drag elements here to create your step.</p>';
      blankDroppable += '</div>';
      if ($("#add-droppable").length == 0){
        $('#teach-instructions').append(blankDroppable);
      } else {
        $(blankDroppable).insertBefore("#add-droppable");
      }
      _dragAndDrop();
      if ($(".blank-droppable").length == 3){
        $("#add-droppable").remove();
      }
      $(".close").click(_closeClicked);
    }

  function _postNewLesson(evt){
    additional_resources = '<li>'+$('#additional-resources1').val()+'</li>';
    if ($('#additional-resources2').val()){
      additional_resources += '<li>'+$('#additional-resources2').val()+'</li>';
    }
    if ($('#additional-resources3').val()){
      additional_resources += '<li>'+$('#additional-resources3').val()+'</li>';
    }
    tips = '<li>'+$('#tips1').val()+'</li>';
    if ($('#tips2').val()){
      tips += '<li>'+$('#tips2').val()+'</li>';
    }
    if ($('#tips3').val()){
      tips += '<li>'+$('#tips3').val()+'</li>';
    }
    newLesson = {
      category_id : parseInt($('#category-id').val()),
      name : $('#name').val(),
      short_description : $('#short-description').val(),
      long_description : $('#long-description').val(),
      time_estimate : $('#time-estimate').val(),
      difficulty: $('#difficulty').val(),
      additional_resources : additional_resources,
      tips : tips, 
      state : "published",
      creator_id : user_id
    }
    $.ajax({
      type: "POST",
      contentType: "application/json",
      url: config.bfUrl+config.bfApiVersion+'/lessons',
      data: JSON.stringify(newLesson),
      dataType: "json",
      success : function(response, textStatus, jqxhr){
        if (jqxhr.status == 201){
          $('#lesson-feedback h2').addClass('alert alert-success').html('Lesson Added. Now add steps.');
          $('#lesson-id').empty();
          _getLessons();
        }
      },
      error : function(response, textStatus, jqxhr){
        $('#lesson-feedback h2').addClass('alert alert-danger').html('Nope.');
      }
    });
  }

  function _postNewStep(evt){
    newStep = {
      lesson_id : parseInt($('#lesson-id').val()),
      name : $('#step-name').val(),
      step_type : $('#step-type').val(),
      step_number : parseInt($('#step-number').val()),
      step_text : $('#step-text').val(),
      trigger_endpoint: $('#trigger-endpoint').val(),
      trigger_check: $('#trigger-check').val(),
      trigger_value: $('#trigger-value').val(),
      thing_to_remember: $('#thing-to-remember').val(),
      feedback: $('#step-feedback').val(),
      next_step_number: parseInt($('#next-step-number').val())
    }
    if (newStep.step_type == 'open') {
      newStep.step_text += '<button type="button" class="open btn btn-default btn-block">'+$('#open-btn-text').val()+'</button>'
    }
    $.ajax({
      type: "POST",
      contentType: "application/json",
      url: config.bfUrl+config.bfApiVersion+'/steps',
      data: JSON.stringify(newStep),
      dataType: "json",
      success : function(response, textStatus, jqxhr){
        if (jqxhr.status == 201){
          $('#step-feedback h2').addClass('alert alert-success').html('Step Added. Add another step.');
        }
      },
      error : function(response, textStatus, jqxhr){
        $('#step-feedback h2').addClass('alert alert-danger').html('Nope.');
      }
    });
  }

  // add public methods to the returned module and return it
  teach.init = init;
  return teach;
}(teach || {}));

// initialize the module
teach.init()