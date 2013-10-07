var edit = (function (edit) {

  var user_id = false;
  var newSteps = [];
  var currentStep = {};
  var categoryId;
  var categoryName;
  var serviceId;
  var serviceName;
  var lessonId = window.location.search.split('?')[1];
  var lessonName;
  var lessonNames = [];
  var stepType;
  var stepText;
  var openUrl;

  // PUBLIC METHODS
  function init(){
    _main();
  }

  // PRIVATE METHODS
  function _main(){
    $('.draggable').draggable({ revert: true });
    // Make sure they are logged in
    _checkIfLoggedIn();
    // Get info about lesson
    _getLessonInfo();
    // Get all the existing categories
    // _getCategories();

    // // Add the first Step
    // _addFirstStep();
    // // Add the congrats step
    // _addCongratsStep();

    // Controls
    $("#back").click(_backStep);
    $('#next').click(_nextStep);
    $('#add-new-step').click(_addNewStep);
    $("#preview").click(_previewClicked);
    $("#save-draft").click(_saveDraft);
    $("#submit").click(_submitClicked);
    $(".close").click(_closeClicked);
    $("#step-options-btn").click(_optionsClicked);
  }

  function _checkIfLoggedIn(){
    // Check if user is logged in
    // If not, dont let them build a lesson
    // If so, show their name as the author
    if (!BfUser.bfAccessToken){
      $('#teach-main').hide();
      $('.login-required').show();
    } else {
      // if (config.debug) console.log('Logged In');
      $(".author-name").text(BfUser.name);
    }
  }

  function _getLessonInfo(){
    $.getJSON(config.bfUrl+config.bfApiVersion+'/lessons/'+lessonId, function(response){
      serviceId = response.service_id;
      newSteps = response.steps;
      lessonName = response.name;
      $("#lesson-name").text(lessonName);
      $.getJSON(config.bfUrl+config.bfApiVersion+'/services/'+serviceId, function(response){
        categoryId = response.category_id;
        serviceName = response.name;
        $("#service-name").text(serviceName);
        $.getJSON(config.bfUrl+config.bfApiVersion+'/categories/'+categoryId, function(response){
          categoryName = response.name;
          $("#category-name").text(categoryName);
        });
      });

      // Show first lesson
      _orderSteps()
      // _addCloseButtonsBack();
      currentStep = newSteps[0];
      _makeProgressBar();
      _showCurrentStep()
    });
  }

  function _orderSteps(){
    if (config.debug) console.log('ordering steps');
    newSteps = newSteps.sort(function(a, b){
      if (a.step_number < b.step_number) return -1;
      if (a.step_number > b.step_number) return 1;
      return 0;
    })
  }



  // Make progress bar
  function _makeProgressBar(){
    if (config.debug) console.log('making progress bar');
    $(newSteps).each(function(i){
        $('.progress-dots').append('<li class="step'+newSteps[i].step_number+'_progress progress-button" data-target="'+newSteps[i].step_number+'"></li>');
    });
    // Todo: Need to account for 12 possible steps
    // var widthPercent = '';
    // widthPercent = 100/steps.length+'%';
    // $('.progress-dots li').attr('width',widthPercent);
  }

  function _addNewStep(){
    _saveCurrentStep();
    // Create a new step
    currentStep = {
      step_number : newSteps.length,
      step_type : "",
      step_text : "",
      step_state : "active",
      creator_id : BfUser.id
    }
    // Keep congrats at the last step
    if (newSteps[newSteps.length-1].step_type == "congrats"){
      newSteps[newSteps.length-1].step_number = newSteps.length + 1;
      newSteps[newSteps.length-1].step_state = "unfinished";
    }
    // Add new blank step as second to last position
    newSteps.splice(newSteps.length-1, 0, currentStep)
    // Show new step
    _showCurrentStep();
  }

  function _saveCurrentStep(){
    // Save the active step-texts in currentStep
    // TODO: Save feedback too
    stepText = "";
    $.each($("#step-texts .active"), function(i){
      stepText += $("#step-texts .active")[i].outerHTML;
    })
    currentStep.step_text = stepText;
    // Then add it to newSteps
    $.each(newSteps, function(i){
      if (newSteps[i].step_number == currentStep.step_number){
        newSteps[i] = currentStep;
      }
    });
  }

  function _showCurrentStep(){
    console.log(currentStep);
    // Update all step states
    _updateStepsStates();
    // console.log(newSteps);
    // Update progress bar
    _updateProgressBar();

    $("#step-texts").html(currentStep.step_text);

    if (currentStep.step_type != "congrats"){
      // Add close button back in
      $(".close").remove();
      $(".step-text").prepend('<button type="button" class="close" aria-hidden="true">x</button>');
    
      // Turn on all step types again
      $("#elements li").removeClass("disabled").draggable("enable");
      $("#login-element-drag").removeClass("disabled").draggable("enable");
      $("#text-entry-drag").removeClass("disabled").draggable("enable");

      if (currentStep.step_type == "open"){
        $("#login-element-drag").addClass("disabled").draggable("disable");
        $("#text-entry-drag").addClass("disabled").draggable("disable");
      } else if (currentStep.step_type == "login"){
        $("#open-element-drag").addClass("disabled").draggable("disable");
        $("#text-entry-drag").addClass("disabled").draggable("disable");
      } else if (currentStep.step_type == "input"){
        $("#open-element-drag").addClass("disabled").draggable("disable");
        $("#login-element-drag").addClass("disabled").draggable("disable");
      }

      // Add droppables in
      while ($("#step-texts").children().length < 3){
        var $clone = $("#droppable-prototype").clone();
        // Clean it up
        $clone.attr("id","").removeClass("hidden");
        $("#step-texts").append($clone);
      }

    } else {
      // Can't add any more elements on congrats step
      $("#elements li").addClass("disabled").draggable("disable");

      // Make congrats editable
      $('.element-editable').editable(function(value, settings) {
          return (value);
        },{
          type: "textarea",
          rows : 2,
          submit : "OK"
      });
      // Add congrats-icon
      var content = $("#congrats-popover").html();
      $(".congrats-img").popover({ content: content, html: true, placement: 'right' });
      $('.congrats-img').on('shown.bs.popover', function () {
        // Turn on controllers
        $(".star-icon").click(_iconClicked);
        $(".flag-icon").click(_iconClicked);
        $(".heart-icon").click(_iconClicked);
        $(".thumbs-up-icon").click(_iconClicked);
      }) 
      $(".congrats-img").popover("show");
    }
    // Turn on drop
    _turnOnDrop();
    $(".close").click(_closeClicked);
  }

  function _iconClicked(evt){
    $(".congrats-img").attr("src",$(this).attr("src"));
    $(".congrats-img").popover("hide")
  }

  // Update the progress bar
  function _updateProgressBar(){
    // Check number of dots
    if ($(".progress-dots li").length < newSteps.length){
      $('.progress-dots').append('<li class="step'+newSteps[newSteps.length-1].step_number+'_progress progress-button" data-target="'+newSteps[newSteps.length-1].step_number+'"></li>');
    }
    $(newSteps).each(function(i){
      $('.step'+newSteps[i].step_number+'_progress').removeClass('unfinished active finished').addClass(newSteps[i].step_state);
      if (newSteps[i].step_number == currentStep.step_number){
        $('.step'+newSteps[i].step_number+'_progress').html('<h2>'+currentStep.step_number+'</h2>');
      } else {
        $('.step'+newSteps[i].step_number+'_progress').html('');
      }
    })
  }

  function _makeEditable($clone){
    // Make editable
    $clone.children("p").addClass("element-editable");
    $('.element-editable').editable(function(value, settings) {
      return (value);
    },{
      type : "textarea",
      rows : 3,
      submit : "OK"
    });
  }

  function _turnOnDrop(){
    $( ".droppable" ).droppable({
      drop: function( event, ui ) {
        $( this ).children(".temp-text").remove();
        $( this ).removeClass("temp").addClass("active");
        $( this ).removeClass("droppable ui-droppable");

        // Height of step-texts
        if ($("#step-texts").height() >= 350){
          $(".temp")[0].remove();
        }

        // Add colorPopover
        var content = $("#popover").html();
        $(this).popover({ content: content, html: true, placement: 'right' });
        // Have to repeat for inadvertant popups
        $(this).on('shown.bs.popover', function () {
          _colorControllers();
        })
        $(this).popover("show");
        
        // If text-element
        if ($(ui.draggable[0]).attr("id") == "text-element-drag"){
          var $clone = $("#text-prototype").clone();
          $clone.attr("id","").removeClass("hidden");
          $clone.appendTo( this );
          _makeEditable($clone);
        }
        // If open-element
        if ($(ui.draggable[0]).attr("id") == "open-element-drag"){
          currentStep.step_type = "open";
          $("#login-element-drag").addClass("disabled").draggable("disable");
          $("#text-entry-drag").addClass("disabled").draggable("disable");

          var $clone = $("#open-prototype").clone();
          $clone.attr("id","").removeClass("hidden");
          $clone.appendTo( this );
          _makeEditable($clone);

          $("#open").click(function(){
            console.log("open clicked");

            var content = '<p>What web address to open?</p><input id="open-url" type="url"></input><button id="open-url-submit">OK</button>';
            $('#open').popover({ content: content, html: true, placement: 'right' });
            $('#open').popover("show");
            $("#open-url-submit").click(function(){
              currentStep.step_type = "open";
              currentStep.trigger_endpoint = $("#open-url").val();
              $("#open").popover("hide");
            })
          })
        }

        // If login-element
        if ($(ui.draggable[0]).attr("id") == "login-element-drag"){
          $("#open-element-drag").addClass("disabled").draggable("disable");
          $("#text-entry-drag").addClass("disabled").draggable("disable");
          var $clone = $("#login-prototype").clone();
          $clone.attr("id","").removeClass("hidden");
          $clone.appendTo( this );
          _makeEditable($clone);
        }

        // If text-entry-element
        if ($(ui.draggable[0]).attr("id") == "text-entry-drag"){
          $("#open-element-drag").addClass("disabled").draggable("disable");
          $("#login-element-drag").addClass("disabled").draggable("disable");
          var $clone = $("#text-entry-prototype").clone();
          $clone.attr("id","").removeClass("hidden");
          $clone.appendTo( this );
          _makeEditable($clone);
        }

        // If image-element
        if ($(ui.draggable[0]).attr("id") == "image-element-drag"){
          var $clone = $("#image-prototype").clone();
          $clone.attr("id","").removeClass("hidden");
          $clone.appendTo( this );
          $("#fileupload").attr("data-url",config.bfUrl+"/image_upload");
          _makeEditable($clone);
          $('#fileupload').fileupload({
              dataType: 'json',
              done: function (e, data) {
                  $.each(data.result.files, function (index, file) {
                      // console.log(index);
                      // console.log(file);
                      $("#img-upload-form").remove();
                      $(".image-element").append('<img src="'+file.url+'">');
                  });
              },
              progressall: function (e, data) {
                var progress = parseInt(data.loaded / data.total * 100, 10);
                $('#progress .progress-bar').css(
                    'width',
                    progress + '%'
                );
              },
              error : function(response){
                response = $.parseJSON(response.responseText);
                $('#img-upload-form').append(response["message"]);
                // console.log(response.responseText);
              }
          });
        }
      }
    });
  }

  function _colorControllers(){
    $(".orange-square").click(function(evt){
      $(this).parent().parent().prev().css("background-color","#ff4000");
      $(this).parent().parent().prev().popover("destroy");
    })
    $(".blue-square").click(function(evt){
      $(this).parent().parent().prev().css("background-color","#74BBD4");
      $(this).parent().parent().prev().popover("destroy");
    })
    $(".white-square").click(function(evt){
      $(this).parent().parent().prev().css("background-color","#FFFFFF");
      $(this).parent().parent().prev().popover("destroy");
    })
  }

  // Set the newSteps state
  function _updateStepsStates(){
    if (config.debug) console.log(currentStep.step_number);
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

  function _backStep(evt){
    _saveCurrentStep();
    if (currentStep.step_number > 1) {
      currentStep = newSteps[currentStep.step_number - 2];
      _showCurrentStep();
    }
  }

  function _nextStep(evt){
    _saveCurrentStep();
    if (currentStep.step_number < newSteps.length){
      currentStep = newSteps[currentStep.step_number];
      _showCurrentStep();
    }
  }

  function _closeClicked(evt){
    console.log("close clicked");
    // Erase the thing that this button is within.
    $(".active").popover("hide");
    $(this).parent().remove();
    if ($("#add-droppable").length == 0){
      if ($("#step-texts").height() <= 300){
        $('#teach-instructions').append('<a id="add-droppable">Add another element</a>');
        $("#add-droppable").click(_addDroppableClicked);
      }
    }
    // Turn disabled elements back on
    if ($(this).siblings().attr("class") == "open-element" || $(this).siblings().attr("class") == "login-element") {
      $("#elements ul li").removeClass("disabled").draggable("enable");
    }
  }

  function _addDroppableClicked(evt){
    // $clone the prototype
    var $clone = $("#droppable-prototype").clone();
    // Clean it up
    $clone.attr("id","").removeClass("hidden");
    console.log($("#step-texts").height());
    if ($("#step-texts").height() <= 300){
      $("#step-texts").append($clone);
      if ($("#step-texts").height() >= 300){
        $("#add-droppable").remove();
      }
    } else {
      $("#add-droppable").remove();
    }
    _turnOnDrop();
    // If there are three (and the hidden prototype) then dont add more
    if ($(".droppable").length == 4){
      $("#add-droppable").remove();
    }
    $(".close").click(_closeClicked);
  }

  function _optionsClicked(){
    console.log("WHAT");
    $("#step-options-list").removeClass("hidden");
  }

  function _addCongratsStep(){
    // Create a new step
    currentStep = {
      step_number : 2,
      step_type : "",
      step_text : "",
      creator_id : BfUser.id
    }
    // Add it to the list
    newSteps.push(currentStep);
    // Add the congratulations step
    var $clone = $("#congrats-prototype").clone();
    // Clean it up
    $clone.removeAttr("id").removeClass("hidden");
    $("#step-texts").empty();
    $("#step-texts").append($clone);
    currentStep.step_type = "congrats";
    _saveCurrentStep();

    // Go back to first step
    currentStep = newSteps[0];
    _showCurrentStep();
  }

  function _cleanUpStepsHTML(){
    stepText = "";
    $.each(newSteps, function(i){
      stepText = newSteps[i].step_text;
      stepText = stepText.replace(new RegExp('<button type="button" class="close" aria-hidden="true">x</button>', 'g'), "");
      stepText = stepText.replace(/(\r\n|\n|\r)/gm,"");
      stepText = stepText.replace(/\s+/g," ");
      newSteps[i].step_text = stepText;
    })
  }

  function _previewClicked(evt){
    _saveCurrentStep();
    _cleanUpStepsHTML();
    document.preview.lessonName.value = $("#lesson-name").text();
    document.preview.steps.value =JSON.stringify(newSteps);
    var url = 'preview-instructions.html';
    var width = 340;
    var height = window.screen.height;
    var left = window.screen.width - 340;
    var instructionOptions = "height="+height+",width="+width+",left="+left;
    window.open(url,"instructions",instructionOptions);
  }

  function _saveDraft(){
    _saveCurrentStep();
    _cleanUpStepsHTML()
    _putLesson("draft");
  }

  function _submitClicked(){
    _saveCurrentStep();
    _cleanUpStepsHTML()
    _putLesson("submitted");
  }

  function _putLesson(state){
    existingLesson = {
      state : state
    }
    $.ajax({
      type: "PUT",
      contentType: "application/json",
      url: config.bfUrl+config.bfApiVersion+'/lessons/'+lessonId,
      data: JSON.stringify(existingLesson),
      dataType: "json",
      success : function(){
        _putSteps();
      },
      error : function(error){
        console.log(error)
      }
    });
  }

  function _putSteps(){
    $.each(newSteps, function (i){
      // Clean up
      delete newSteps[i].step_state; // Not needed
      console.log(JSON.stringify(newSteps[i]));
      $.ajax({
        type: "PUT",
        contentType: "application/json",
        url: config.bfUrl+config.bfApiVersion+'/steps/'+newSteps[i].id,
        data: JSON.stringify(newSteps[i]),
        dataType: "json",
        success : function(){
          console.log("Step put.")
        },
        error : function(error){
          console.log(error);
        }
      });
    });
    $(".lesson-name").text($("#lesson-name").text());;
    $('#submissionModal').modal();
  }

  // add public methods to the returned module and return it
  edit.init = init;
  return edit;
}(edit || {}));

// initialize the module
window.onload = edit.init()