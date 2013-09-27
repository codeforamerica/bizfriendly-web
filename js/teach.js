var teach = (function (teach) {

  var user_id = false;
  var newSteps = [];
  var currentStep = {};
  var categoryId;
  var categoryName;
  var serviceId;
  var serviceName;
  var stepType;
  var stepText;

  // PUBLIC METHODS
  function init(){
    if (config.debug) console.log('init');
    _main();
  }

  // PRIVATE METHODS
  function _main(){
    // Make sure they are logged in
    _checkIfLoggedIn();
    // Get all the existing categories
    _getCategories();
    // Get all the existing services
    _getServices();
    // Turn on the drag and drop functionailty
    _dragAndDrop();
    // Add the first Step and show it
    _addNewStep();
    $("#left").click(_backStep);
    $('#right').click(_nextStep);
    // Add a new step to the list
    $('#add-new-step').click(_addNewStep);
    _setLessonName();
    $(".close").click(_closeClicked);
    $("#preview").click(_previewClicked);
    // $('#new-lesson-btn').click(_postNewLesson);
    // $('#new-step-btn').click(_postNewStep);
  }

  function _checkIfLoggedIn(){
    if (!BfUser.bfAccessToken){
      $('#teach-main').hide();
      $('.login-required').show();
    } else {
      if (config.debug) console.log('Logged In');
      $(".author-name").text(BfUser.name);
      _getUserId();
    }
  }

  function _dragAndDrop(){
    $('.draggable').draggable({ revert: true });
    $( ".droppable" ).droppable({
      drop: function( event, ui ) {
        $( this ).children(".temp-text").remove();
        $( this ).removeClass("temp").addClass("active");
        $( this ).removeClass("droppable ui-droppable");

        // If text-element
        if ($(ui.draggable[0]).attr("id") == "text-element-drag"){
          var clone = $("#text-prototype").clone();
          clone.attr("id","").removeClass("hidden");
          clone.appendTo( this );
          // _makeEditable(clone);
          // Make editable
          clone.children("p").addClass("element-editable");
          $('.element-editable').editable(function(value, settings) {
            type : "textarea" 
            return (value);
          });
        }
        // If open-element
        if ($(ui.draggable[0]).attr("id") == "open-element-drag"){
          $("#login-element-drag").addClass("disabled").draggable("disable");

          var clone = $("#open-prototype").clone();
          clone.attr("id","").removeClass("hidden");
          clone.appendTo( this );
          // Make editable
          clone.children("p").addClass("element-editable");
          $('.element-editable').editable(function(value, settings) {
            type : "textarea" 
            return (value);
          });
        }

        // If login-element
        if ($(ui.draggable[0]).attr("id") == "login-element-drag"){
          $("#open-element-drag").addClass("disabled").draggable("disable");
          var clone = $("#login-prototype").clone();
          clone.attr("id","").removeClass("hidden");
          clone.appendTo( this );
          // Make editable
          clone.children("p").addClass("element-editable");
          $('.element-editable').editable(function(value, settings) {
            type : "textarea" 
            return (value);
          });
        }

        // If text-entry-element
        if ($(ui.draggable[0]).attr("id") == "text-entry-element-drag"){
          var clone = $("#text-entry-prototype").clone();
          clone.attr("id","").removeClass("hidden");
          clone.appendTo( this );
          // Make editable
          clone.children("p").addClass("element-editable");
          $('.element-editable').editable(function(value, settings) {
            type : "textarea" 
            return (value);
          });
        }

        // If image-element
        if ($(ui.draggable[0]).attr("id") == "image-element-drag"){
          var clone = $("#image-prototype").clone();
          clone.attr("id","").removeClass("hidden");
          clone.appendTo( this );
          // Make editable
          clone.children("p").addClass("element-editable");
          $('.element-editable').editable(function(value, settings) {
            type : "textarea" 
            return (value);
          });
        }
      }
    });
  }

  function _makeEditable(clone){
    clone.add

  }

  function _addNewStep(evt){
    currentStep = {
      step_number : newSteps.length + 1,
      step_type : "",
      step_text : "",
      feedback : ""
    }
    
    // _cleanUpStepText();

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
    if (config.debug) console.log(newSteps);
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
      $('#category-id').append('<option value="add-new-category">Add new category</option>');
      $('.selectpicker').selectpicker('refresh');
      _watchCategory();
    })
  }

  function _watchCategory(){
    $("#lesson-form").on("change", "#category-id", function(){
      if ($("#category-id").val() == "add-new-category"){
        window.open("http://bizfriend.ly/add-new-category.html");
      } else {
        categoryId = $("#category-id").val();
        categoryName = $("#category-id :selected").text();
      }
      if (config.debug) console.log("Category ID: " + categoryId);
    });
  }

  function _getServices(){
    $.get(config.bfUrl+config.bfApiVersion+'/services', function(response){
      $(".service-name").text(serviceName); // Init the service-name
      $.each(response.objects, function(i){
        $('#service-id').append('<option value='+response.objects[i].id+'>'+response.objects[i].name+'</option>');
      })
      $('#service-id').append('<option value="add-new-service">Add new service</option>');
      $('.selectpicker').selectpicker('refresh');
      // Init the service-name
      serviceName = $('#service-id :selected').text();
      $(".service-name").text(serviceName);
      _watchServices();
    })
  }

  function _watchServices(){
    $("#lesson-form").on("change", "#service-id", function(){
      if ($("#service-id").val() == "add-new-service"){
        window.open("http://bizfriend.ly/add-new-service.html");
      } else {
        serviceId = $("#service-id").val();
        serviceName = $('#service-id :selected').text();
        $(".service-name").text(serviceName);
      }
      if (config.debug) console.log("Service ID: " + serviceId);
    });
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

  function _cleanUpStepText(){
    // Clean up step text
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
    // Turn disabled elements back on
    if ($(this).siblings().attr("class") == "open-element" || $(this).siblings().attr("class") == "login-element") {
      $("#elements ul li").removeClass("disabled").draggable("enable");

    }
  }

  function _addDroppableClicked(evt){
    // Clone the prototype
    var clone = $("#droppable-prototype").clone();
    // Clean it up
    clone.attr("id","").removeClass("hidden");
    $("#step-texts").append(clone);
    _dragAndDrop();
    // If there are three (and the hidden prototype) then dont add more
    if ($(".droppable").length == 4){
      $("#add-droppable").remove();
    }
    $(".close").click(_closeClicked);
  }

  function _previewClicked(evt){
    lessonName = $("#lesson-name").text();
    console.log(lessonName);
    newSteps[currentStep.step_number - 1].step_text = $("#step-text").html();
    console.log(newSteps);

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