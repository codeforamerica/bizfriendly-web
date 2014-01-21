var teach = (function (teach) {

  var user_id = false;
  var newSteps = [];
  var currentStep = {};
  var categoryId;
  var categoryName;
  var serviceId;
  var serviceName;
  var lessonId;
  var lessonName;
  var lessonNames = [];
  var stepType;
  var stepText;
  var feedback;
  var openUrl;
  var editingLesson;

  // PUBLIC METHODS
  function init(){
    // Make sure they are logged in
    _checkIfLoggedIn();
    // Check if editing lesson or making new
    lessonId = window.location.search.split('?')[1];
    if (lessonId) { editingLesson = true }
    if (editingLesson) {
      _getExistingLessonData();
    } else {
      _main();
    }
  }

  // PRIVATE METHODS
  function _main(){
    $('.draggable').draggable({ revert: true });
    // Get all the existing categories
    _getCategories();
    // Make lesson name editable
    _editLessonName();
    // Add the first Step
    _addFirstStep();
    // Add the congrats step
    _addCongratsStep();

    // Controls
    $(".back").click(_backStep);
    $('.next').click(_nextStep);
    $('#add-new-step').click(_addNewStep);
    $("#step-close-btn").click(_removeStep);
    $("#preview").click(_previewClicked);
    $("#save-draft").click(_saveDraft);
    $("#submit").click(_submitClicked);
    $(".temp-close-btn").click(_closeClicked);
    $("#step-options-btn").click(_optionsClicked);
    $('li.progress-button').click(_progressClicked);
  }

  function _checkIfLoggedIn(){
    // Check if user is logged in
    // If not, dont let them build a lesson
    // If so, show their name as the author
    if (!BfUser.bfAccessToken){
      $('#teach-main').hide();
      $('.login-required').show();
    } else {
      if (config.debug) console.log('Logged In');
      $("#author-name").text(BfUser.name);
    }
  }

  function _getExistingLessonData(){
    $.getJSON(config.bfUrl+config.bfApiVersion+'/lessons/'+lessonId, function(lesson){
      // Check for owner or admin
      if(BfUser.id != lesson.creator.id){
        $.getJSON(config.bfUrl+'/'+BfUser.id+'/is_admin', function(isAdmin){
          if (!isAdmin.response){
            $('#teach-main').hide();
            $(".login-required").text("Whoa, that is someone elses lesson.");
            $('.login-required').show();
          }
        })
      }

      lessonName = lesson.name;
      $("#lesson-name").text(lessonName);
      newSteps = lesson.steps;
      if (config.debug) console.log(newSteps);
      serviceId = lesson.service_id;
      $.getJSON(config.bfUrl+config.bfApiVersion+'/services/'+serviceId, function(service){
        serviceName = service.name;
        categoryId = service.category_id;
        categoryName = service.category.name;

        $('.draggable').draggable({ revert: true });
        // Get all the existing categories
        _getCategories();
        // Make lesson name editable
        _editLessonName();
        // Order steps
        _orderSteps();
        currentStep = newSteps[0];
        _showCurrentStep();


        // Controls
        $(".back").click(_backStep);
        $('.next').click(_nextStep);
        $('#add-new-step').click(_addNewStep);
        $("#step-close-btn").click(_removeStep);
        $("#preview").click(_previewClicked);
        $("#save-draft").click(_saveDraft);
        $("#submit").click(_submitClicked);
        $(".temp-close-btn").click(_closeClicked);
        $("#step-options-btn").click(_optionsClicked);
        $('li.progress-button').click(_progressClicked);
      });
    });

  }

  function _getCategories(){
    // Get the existing categories
    $.get(config.bfUrl+config.bfApiVersion+'/categories', function(response){
      var categories = response.objects;
      $.each(categories, function(i){
        // Show if catgory is published OR user created it.
        if (categories[i].state == "published" || categories[i].creator_id == BfUser.id){
          $('#category-id').append('<option value='+categories[i].id+'>'+categories[i].name+'</option>');
        }
      })
      $('#category-id').append('<option value="add-new-category">Add new skill</option>');
      if (editingLesson) { $("#category-id").val(categoryId)}
      $('.selectpicker').selectpicker('refresh');
      _watchCategory();
      // // Get all the existing services
      _getServices();
    })
  }

  function _watchCategory(){
    // Add a listener to the category menu.
    // If they choose to add a new category, open that page.
    $("#lesson-form").on("change", "#category-id", function(){
      $("#alert").addClass("hidden");
      // if ($("#category-id").val() == "none") {
      //   $('#service-id').append('<option value="none">Select a web service for your lesson.</option>');
      // }
      if ($("#category-id").val() == "add-new-category"){
        window.open("new-category.html","_self");
      } else {
        categoryId = $("#category-id").val();
        categoryName = $("#category-id :selected").text();
      }
      if (config.debug) console.log("Category Name: " + categoryName);
      _getServices();
    });
  }

  function _getServices(){
    // Get existing services
    $("#service-id").empty();
    $('#service-id').append('<option value="none">Select a web service for your lesson</option>');
    categoryId = $("#category-id").val();
    $.get(config.bfUrl+config.bfApiVersion+'/services', function(response){
      var services = response.objects;
      $.each(services, function(i){
        if (services[i].category_id == categoryId){
          if (services[i].state == "published" || services[i].creator_id == BfUser.id){
            $('#service-id').append('<option value='+services[i].id+'>'+services[i].name+'</option>');
          }
        }
      })

      $('#service-id').append('<option value="add-new-service">Add new service</option>');
      if (editingLesson) {$("#service-id").val(serviceId)};
      $('.selectpicker').selectpicker('refresh');

      // Init the service-name
      serviceName = $('#service-id :selected').text();
      $(".service-name").text(serviceName);
      serviceId = parseInt($("#service-id").val());
      _watchServices();

    })
  }

  function _watchServices(){
    // Add listener to services menu
    // If they choose to add a new one, open that page
    $("#lesson-form").on("change", "#service-id", function(){
      if ($("#service-id").val() == "add-new-service"){
        window.open("new-service.html","_self");
      } else {
        serviceId = $("#service-id").val();
        serviceName = $('#service-id :selected').text();
        $(".service-name").text(serviceName);
      }
      if (config.debug) console.log("Service Name: " + serviceName);
    });
  }

  function _interactiveLessons(){
    var collections = []
    if (serviceName == "Facebook"){
      collections = [ "posts", "pictures", "pages"]
    }
    if (serviceName == "Foursquare"){
      collections = [ "checkins", "lists"]
    }
    if (serviceName == "Trello"){
      collections = [ "boards" ]
    }
    $('#collection-name').empty();

    $('#collection-name').append('<option value="none">What kind of item?</option>');
    $.each(collections, function(i){
      $('#collection-name').append('<option value='+collections[i]+'>'+collections[i]+'</option>');
    })

    $(".selectpicker").selectpicker("refresh");
    _watchInteractiveOptions()
  }

  function _watchInteractiveOptions(){
    $("#options-form").on("change", "#what-to-watch", function(){

      if ($("#what-to-watch").val() != "What is this step watching?"){
        $("#feedback-window").show();
        // Disable open, login, and text-input
        $("#login-element-drag").addClass("disabled").draggable("disable");
        $("#text-entry-drag").addClass("disabled").draggable("disable");
        $("#open-element-drag").addClass("disabled").draggable("disable");
      } else {
        $("#feedback-window").hide();
        // Enable open, login, and text-input
        $("#open-element-drag").removeClass("disabled").draggable("enable");
        $("#login-element-drag").removeClass("disabled").draggable("enable");
        $("#text-entry-drag").removeClass("disabled").draggable("enable");
      }
      

      if ($("#what-to-watch").val() == "A new item"){
        currentStep.step_type = "check_for_new";
      }
    });
    $("#options-form").on("change", "#collection-name", function(){
      if (serviceName == "Facebook"){
        if ($("#collection-name").val() == "pages"){
          currentStep.trigger_endpoint = "https://graph.facebook.com/me/accounts?fields=name&access_token=";
          currentStep.place_in_collection = "last";
          currentStep.trigger_check = "data";
          currentStep.trigger_value = "name";
          currentStep.thing_to_remember = "id";

          // Feedback
          $("#feedback-content .plain").append('<span class="responseDisplay"></span>');
        }
        if ($("#collection-name").val() == "posts"){
          currentStep.trigger_endpoint = "https://graph.facebook.com/me/posts?access_token=";
          currentStep.place_in_collection = "first";
          currentStep.trigger_check = "data";
          currentStep.trigger_value = "message";
          currentStep.thing_to_remember = "id";

          // Feedback
          $("#feedback-content .plain").append('<span class="responseDisplay"></span>');
        }
        if ($("#collection-name").val() == "pictures"){
          currentStep.trigger_endpoint = "https://graph.facebook.com/me/posts?access_token=";
          currentStep.place_in_collection = "first";
          currentStep.trigger_check = "data";
          currentStep.trigger_value = "picture";
          currentStep.thing_to_remember = "id";

          // Feedback
          $("#feedback-content .plain").append('<img class="responseDisplay">');
        }
      }
      if (serviceName == "Foursquare"){
        if ($("#collection-name").val() == "checkins"){
          var timestamp = Math.floor(new Date() / 1000);
          currentStep.trigger_endpoint = 'https://api.foursquare.com/v2/users/self/checkins?afterTimestamp='+timestamp+'&v=20131027&oauth_token=';
          currentStep.place_in_collection = "first";
          currentStep.trigger_check = "response,checkins,items";
          currentStep.trigger_value = "venue,name";
          currentStep.thing_to_remember = "venue,id";

          // Feedback
          $("#feedback-content .plain").append('<span class="responseDisplay"></span>');
        }
        if ($("#collection-name").val() == "lists"){
          currentStep.trigger_endpoint = 'https://api.foursquare.com/v2/users/self/lists?group=created&v=20131027&oauth_token=';
          currentStep.place_in_collection = "second";
          currentStep.trigger_check = "response,lists,items";
          currentStep.trigger_value = "name";
          currentStep.thing_to_remember = "id";

          // Feedback
          $("#feedback-content .plain").append('<span class="responseDisplay"></span>');
        }
      }
      if (serviceName == "Trello"){
        if ($("#collection-name").val() == "boards"){
          currentStep.trigger_endpoint = 'https://api.trello.com/1/member/me/boards?fields=id,name,dateLastView&key=8d1015f4f92871529f1618fa828c2fe8&token=';
          currentStep.place_in_collection = "alphabetical";
          currentStep.trigger_check = "";
          currentStep.trigger_value = "name";
          currentStep.thing_to_remember = "id";

          // Feedback
          $("#feedback-content .plain").append('<span class="responseDisplay"></span>');
        }
        // if ($("#collection-name").val() == "cards"){
        //   currentStep.trigger_endpoint = 'https://trello.com/1/boards/replace_me/cards?key=8d1015f4f92871529f1618fa828c2fe8&token=';
        //   currentStep.place_in_collection = "second";
        //   currentStep.trigger_check = "response,lists,items";
        //   currentStep.trigger_value = "name";
        //   currentStep.thing_to_remember = "id";

        //   // Feedback
        //   $("#feedback-content .plain").append('<span class="responseDisplay"></span>');
        // }
      }
      
      console.log(currentStep);
    });

  }

  function _orderSteps(){
    if (config.debug) console.log('ordering steps');
    newSteps = newSteps.sort(function(a, b){
      if (parseInt(a.step_number) < parseInt(b.step_number)) return -1;
      if (parseInt(a.step_number) > parseInt(b.step_number)) return 1;
      return 0;
    })
  }

  // Make lesson name editable
  function _editLessonName(){
    $('.lesson-editable').editable(function(value, settings) {
      $("#alert").addClass("hidden");
      return(value)
      }, { 
        type: "textarea",
        onblur : "submit",
        rows : 2,
        submit  : 'OK'
    });
  }

  function _addFirstStep(){
    // Create a new step
    currentStep = {
        step_number : 1,
        step_type : "",
        step_text : "",
        creator_id : BfUser.id
      }

    // Save current step
    newSteps.push(currentStep);
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

  // Remove the current step
  function _removeStep(){
    newSteps.splice(currentStep.step_number-1, 1);
    _updateStepNumbers();
    $.each(newSteps, function(i, newStep){
      if (currentStep.step_number == newStep.step_number){
        currentStep = newStep;
      }
    })
    _showCurrentStep();
  }

  function _updateStepNumbers(){
    $.each(newSteps, function(i, newStep){
      newStep.step_number = i+1;
    })
  }

  function _saveCurrentStep(){
    // Save the active step-texts in currentStep
    // TODO: Save feedback too
    $(".temp").remove()
    currentStep.step_text = $("#step-texts").html();
    // Save feedback
    currentStep.feedback = $("#feedback-content").html();
    // Then add it to newSteps
    $.each(newSteps, function(i){
      if (newSteps[i].step_number == currentStep.step_number){
        newSteps[i] = currentStep;
      }
    });
  }

  function _showCurrentStep(){
    if (config.debug) console.log(newSteps);

    // Update all step states
    _updateStepsStates();
    // Update progress bar
    _updateProgressBar();
    // Fill up the step-texts with content
    $("#step-texts").html(currentStep.step_text);
    // Add in saved feedback or clone the prototype
    if (!currentStep.feedback) {
      var $clone = $("#feedback-prototype").clone();
      // Clean it up
      $clone.removeAttr("id").removeClass("hidden");
      $("#feedback-content").html($clone);
    } else {
      $("#feedback-content").html(currentStep.feedback);
    }
    // Only show feedback window if the step type is correct.
    if (!currentStep.step_type || currentStep.step_type == "congrats") {
      $("#feedback-window").hide();
    } else {
      $("#feedback-window").show();
    }
    $('.element-editable').editable(function(value, settings) {
          return (value);
        },{
          type: "textarea",
          rows : 3,
          cols : 27,
          onblur : "submit",
          submit : "OK"
      });
    $(".popover").remove();
    

    // Turn on all step types again
    $("#elements .disabled").removeClass("disabled").draggable("enable");
    $("#what-to-watch").prop("disabled",false).selectpicker("refresh");
    $("#collection-name").prop("disabled",false).selectpicker("refresh");
    if ($("#step-texts .open-element").length != 0){
      $("#login-element-drag").addClass("disabled").draggable("disable");
      $("#text-entry-drag").addClass("disabled").draggable("disable");
      $("#what-to-watch").prop("disabled",true).selectpicker("refresh");
      $("#collection-name").prop("disabled",true).selectpicker("refresh");
    } else if ($("#step-texts .login-element").length != 0){
      $("#open-element-drag").addClass("disabled").draggable("disable");
      $("#text-entry-drag").addClass("disabled").draggable("disable");
      $("#what-to-watch").prop("disabled",true).selectpicker("refresh");
      $("#collection-name").prop("disabled",true).selectpicker("refresh");
    } else if ($("#step-texts .text-entry-element").length != 0){
      $("#open-element-drag").addClass("disabled").draggable("disable");
      $("#login-element-drag").addClass("disabled").draggable("disable");
      $("#what-to-watch").prop("disabled",true).selectpicker("refresh");
      $("#collection-name").prop("disabled",true).selectpicker("refresh");
    }
    
    // Set up non congrats steps
    if (currentStep.step_type != "congrats"){
      // Add close button back to existing steps
      if ($(".step-text.active").find(".temp-close-btn").length == 0) {
        $(".step-text.active").prepend('<img class="temp-close-btn right" src="img/close-btn.png">');
      }

      // Show three new temp texts
      $("#step-close-btn").show();
      while ($("#step-texts").children().length < 3){
        var $clone = $("#droppable-prototype").clone();
        // Clean it up
        $clone.attr("id","").removeClass("hidden").addClass("temp");
        $("#step-texts").append($clone);
      }
      if ($("#feedback-content").children().length == 0){
        // $clone.addClass("active");
        $("#feedback-content").append($clone);
      }
    // Set up congrats step
    } else {
      $("#step-close-btn").hide();
      // Become active when visible. Helps when searching for active elements on other steps.
      $(".step-text:visible").addClass("active");
      // Add text back to empty Congrats step.
      if (!$('#step-texts .element-editable').text()){
        $('#step-texts .element-editable').text("Click to edit text.")
      };
      // Make congrats editable
      $('.element-editable').editable(function(value, settings) {
          return (value);
        },{
          type: "textarea",
          rows : 3,
          cols : 27,
          onblur : "submit",
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
      // Disable draggables
      $("#elements .draggable").addClass("disabled").draggable("disable");
      // Disable advanced options
      $("#what-to-watch").prop("disabled",true).selectpicker("refresh");
      $("#collection-name").prop("disabled",true).selectpicker("refresh");

    }
    if (newSteps.length <= 2){
      $("#step-close-btn").hide();
    }
    // Turn on drop
    _turnOnDrop();
    $(".temp-close-btn").click(_closeClicked);
    $('li.progress-button').click(_progressClicked);

    // Only allow 12 steps
    if (newSteps.length >= 12){
      $("#add-new-step img, #add-new-step p ").hide();
    } else {
      $("#add-new-step img, #add-new-step p").show();
    }
  }

  function _iconClicked(evt){
    $(".congrats-img").attr("src",$(this).attr("src"));
    $(".congrats-img").popover("hide")
  }

  // Update the progress bar
  function _updateProgressBar(){
    if (config.debug) console.log("NewSteps Length: "+newSteps.length);
    // Update teach-dots-number
    $("#teach-dots-amount").empty();
    $(".progress-dots").empty();
    $.each(newSteps, function(i, step){
      $('#teach-dots-amount').append('<li><img src="img/blue-dot.png"></li>');
      $('.progress-dots').append('<li class="step'+newSteps[i].step_number+'_progress progress-button" data-target="'+newSteps[i].step_number+'"></li>');
    })
    $(newSteps).each(function(i){
      $('.step'+newSteps[i].step_number+'_progress').removeClass('unfinished active finished').addClass(newSteps[i].step_state);
      if (newSteps[i].step_number == currentStep.step_number){
        $('.step'+newSteps[i].step_number+'_progress').html('<h2>'+currentStep.step_number+'</h2>');
      } else {
        $('.step'+newSteps[i].step_number+'_progress').html('');
      }
    });
    // Update remaining steps
    var remainingSteps = 12 - newSteps.length;
    $("#remaining-steps").text(remainingSteps);
  }

  function _makeEditable($clone){
    // Make editable
    $clone.children("p").addClass("element-editable");
    $('.element-editable').editable(function(value, settings) {
      return (value);
    },{
      type : "textarea",
      rows : 3,
      cols : 27,
      onblur : "submit",
      submit : "OK"
    });
  }

  function _turnOnDrop(){
    $( ".droppable" ).droppable({
      drop: function( event, ui ) {
        $( this ).children(".temp-text").remove();
        $( this ).removeClass("temp").addClass("active");
        $( this ).removeClass("droppable ui-droppable");

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
          $("#feedback-window").show();
          $("#login-element-drag").addClass("disabled").draggable("disable");
          $("#text-entry-drag").addClass("disabled").draggable("disable");
          $("#what-to-watch").prop("disabled",true).selectpicker("refresh");
          $("#collection-name").prop("disabled",true).selectpicker("refresh");
          var $clone = $("#open-prototype").clone();
          $clone.attr("id","").removeClass("hidden");
          $clone.appendTo( this );
          _makeEditable($clone);

          var content = '<p>What web address to open?</p><input id="open-url" type="url"></input><button id="open-url-submit">OK</button>';
          $('#open').popover({ content: content, html: true, placement: 'right' });

          $("#open").click(function(){
            if (config.debug) console.log("open clicked");

            $("#open-url").val(currentStep.trigger_endpoint);
            $('#open').popover("show");
            $("#open-url-submit").click(function(){
              currentStep.step_type = "open";
              // Ensure there is an http in front of the url.
              var url = $("#open-url").val();
              if (url.indexOf("http") == -1){
                url = "http://" + url;
              }
              currentStep.trigger_endpoint = url;
              $("#open").popover("hide");
            })
          })
          $(".temp-close-btn").click(_closeClicked);
        }

        // If login-element
        if ($(ui.draggable[0]).attr("id") == "login-element-drag"){
          currentStep.step_type = "login";
          $("#feedback-window").show();
          $("#open-element-drag").addClass("disabled").draggable("disable");
          $("#text-entry-drag").addClass("disabled").draggable("disable");
          $("#what-to-watch").prop("disabled",true).selectpicker("refresh");
          $("#collection-name").prop("disabled",true).selectpicker("refresh");
          var $clone = $("#login-prototype").clone();
          $clone.attr("id","").removeClass("hidden");
          $clone.appendTo( this );
          _makeEditable($clone);
        }

        // If text-entry-element
        if ($(ui.draggable[0]).attr("id") == "text-entry-drag"){
          currentStep.step_type = "input";
          $("#open-element-drag").addClass("disabled").draggable("disable");
          $("#login-element-drag").addClass("disabled").draggable("disable");
          $("#what-to-watch").prop("disabled",true).selectpicker("refresh");
          $("#collection-name").prop("disabled",true).selectpicker("refresh");
          var $clone = $("#text-entry-prototype").clone();
          $clone.attr("id","").removeClass("hidden");
          $clone.appendTo( this );
          _makeEditable($clone);
        }

        // If image-element
        if ($(ui.draggable[0]).attr("id") == "image-element-drag"){
          // Clear image upload from prototype
          $("#image-prototype").find(".progress-bar-success").css("width","0px");
          var $clone = $("#image-prototype").clone();
          $clone.attr("id","").removeClass("hidden");
          $clone.appendTo( this );
          $("#fileupload").attr("data-url",config.bfUrl+"/image_upload?instruction");
          _makeEditable($clone);
          $('#fileupload').fileupload({
              dataType: 'json',
              done: function (e, data) {
                // Clean up image element so it doesn't show up on other image-elements
                var url = 'https://bizfriendly-img-uploads.s3.amazonaws.com/'+data.files[0].name;
                $("#img-upload-form").remove();
                $(".image-element:first").append('<img class="uploaded-image" src="'+url+'">');
                $(".image-element:first").removeClass("image-element");
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
              }
          });
        }
      }
    });
  }

  function _colorControllers(){
    $(".orange-square").click(function(evt){
      $(this).parent().parent().prev().attr("style","background-color: #FFC9AE;");
      $(this).parent().parent().prev().popover("destroy");
      $(this).parent().parent().prev().find(".btn-teach").attr("style","color: #ff4000;");
    })
    $(".blue-square").click(function(evt){
      $(this).parent().parent().prev().attr("style","background-color: #C7E4EE;");
      $(this).parent().parent().prev().popover("destroy");
      $(this).parent().parent().prev().find(".btn-teach").attr("style","color: #0F6095;");
    })
    $(".white-square").click(function(evt){
      $(this).parent().parent().prev().attr("style","background-color: #FFFFFF;");
      $(this).parent().parent().prev().popover("destroy");
    })
  }

  // Set the newSteps state
  function _updateStepsStates(){
    $(newSteps).each(function(i, newStep){
      if (currentStep.step_number == newStep.step_number){
        newSteps[i].step_state = "active";
      }
      if (parseInt(currentStep.step_number) > parseInt(newStep.step_number)){
        newSteps[i].step_state = "finished";
      }
      if (parseInt(currentStep.step_number) < parseInt(newStep.step_number)){
        newSteps[i].step_state = "unfinished";
      }
    })
    // Set current-dot
    $("#current-dot").html("<h1>"+currentStep.step_number+"</h1>");
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
    if (config.debug) console.log("close clicked");
    // Erase the thing that this button is within.
    $(".active").popover("hide");
    $(this).parent().remove();
    if ($("#add-droppable").length == 0){
      if ($("#step-texts").height() <= 300){
        $('#teach-instructions').append('<a id="add-droppable"><img src="img/add-btn.png" height="25px">Add another element</a>');
        $("#add-droppable").click(_addDroppableClicked);
      }
    }
    // Turn disabled elements back on
    if ($(this).siblings().attr("class") == "open-element" || $(this).siblings().attr("class") == "login-element") {
      $("#elements .disabled").removeClass("disabled").draggable("enable");
      $("#what-to-watch").prop("disabled",false).selectpicker("refresh");
      $("#collection-name").prop("disabled",false).selectpicker("refresh");
      $("#feedback-window").hide();
    }
    // if ($("#feedback-content .step-text").length == 0){
    //   var $clone = $("#droppable-prototype").clone();
    //   $clone.attr("id","").removeClass("hidden");
    //   $("#feedback-content").append($clone);
    //   _turnOnDrop();

    // }
  }

  function _addDroppableClicked(evt){
    // $clone the prototype
    var $clone = $("#droppable-prototype").clone();
    // Clean it up
    $clone.attr("id","").removeClass("hidden").addClass("temp");
    if (config.debug) console.log($("#step-texts").height());
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
    $(".temp-close-btn").click(_closeClicked);
  }

  function _optionsClicked(){
     _interactiveLessons();
    if ($(".options").hasClass("hidden")){
      $(".options").removeClass("hidden");
    } else {
      $(".options").addClass("hidden");
    }
  }

  // progress circle li element is clicked
  function _progressClicked(evt) {
    console.log("Clicked Step: " + $(this).attr('data-target'));
    _saveCurrentStep();
    currentStep = newSteps[$(this).attr('data-target') - 1];
    _showCurrentStep();
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
      stepText = stepText.replace(new RegExp('<img class="temp-close-btn right" src="img/close-btn.png">', 'g'), "");
      stepText = stepText.replace(/(\r\n|\n|\r)/gm,"");
      stepText = stepText.replace(/\s+/g," ");
      stepText = stepText.replace(new RegExp('Click to edit text.', 'g'),"");
      newSteps[i].step_text = stepText;

      // Clean up feedback
      // feedback = newSteps[i].feedback;
      newSteps[i].feedback = newSteps[i].feedback.replace(new RegExp('disabled="disabled"', 'g'), "");
      newSteps[i].feedback = newSteps[i].feedback.replace(new RegExp('Click to edit text.', 'g'),"");
      // if (config.debug) console.log(newSteps[i].feedback);
    })

  }

  function _previewClicked(evt){
    _saveCurrentStep();
    _cleanUpStepsHTML();
    document.preview.lessonName.value = $("#lesson-name").text();
    document.preview.authorName.value = BfUser.name;
    document.preview.steps.value =JSON.stringify(newSteps);
    document.preview.serviceName.value = serviceName.toLowerCase();
    document.preview.serviceId.value = serviceId;

    var url = 'instructions.html';
    var width = 340;
    var height = window.screen.height;
    var left = window.screen.width - 340;
    var instructionOptions = "height="+height+",width="+width+",left="+left;
    window.open(url,"instructions",instructionOptions);
    _showCurrentStep();
  }

  function _saveDraft(){
    if ($("#terms").prop("checked")){
      if (serviceId) {
        _saveCurrentStep();
        _cleanUpStepsHTML();
        if (editingLesson) {
          _updateLesson("draft");
        } else {
          _checkForLesson("draft");
        }
      } else {
        $("#alert").removeClass("hidden").text("Choose a category and service up top.")
      }
    } else {
      $("#alert").removeClass("hidden").text("You need to agree to the Creative Commons terms.")
    }
  }

  function _submitClicked(){
    if ($("#terms").prop("checked")){
      if (serviceId) {
        _saveCurrentStep();
        _cleanUpStepsHTML();
        if (editingLesson) {
          _updateLesson("submitted");
        } else {
          _checkForLesson("submitted");
        }
      } else {
        $("#alert").removeClass("hidden").text("Choose a category and service up top.")
      }
    } else {
      $("#alert").removeClass("hidden").text("You need to agree to the Creative Commons terms.")
    }
  }

  function _updateLesson(state){
    var updateLesson = {
      service_id : serviceId,
      creator_id : BfUser.id,
      name : $("#lesson-name").text(),
      state : state
    }
    $.ajax({
      type: "PUT",
      contentType: "application/json",
      url: config.bfUrl+config.bfApiVersion+'/lessons/'+lessonId,
      data: JSON.stringify(updateLesson),
      dataType: "json",
      success : function(){
        if (config.debug) {console.log("Lesson updated.")}
        _updateSteps();

        if (state == "draft"){
          $("#draftMessage").show();
          $("#submittedMessage").hide();
        }
        if (state == "submitted"){
          $("#draftMessage").hide();
          $("#submittedMessage").show();
        }

        $(".lesson-name").text($("#lesson-name").text());
        $('#submissionModal').modal();

      },
      error : function(error){
        console.log(error)
      }
    });
  }

  function _updateSteps(){
    // Find all existing steps for this lesson
    // compare them against the edited steps
    // delete any that dont exist any more.
    var filters = [{"name": "lesson_id", "op": "==", "val": lessonId}];
    $.ajax({
      url: config.bfUrl+config.bfApiVersion+'/steps',
      data: {"q": JSON.stringify({"filters": filters}), "single" : true},
      dataType: "json",
      contentType: "application/json",
      success: function(data) { 
        $.each(data.objects, function(i,existingStep){
          var oldStepStillInNewSteps = false;
          $.each(newSteps, function(x,newStep){
            if (newStep.id == existingStep.id){
              oldStepStillInNewSteps = true;
            }
          })
          if (!oldStepStillInNewSteps){
            $.ajax({
              url: config.bfUrl+config.bfApiVersion+'/steps/'+existingStep.id,
              type: "DELETE",
              dataType: "json",
              contentType: "application/json",
              success: function(data) {console.log("DELETED STEP: "+existingStep.id)},
              error: function(error){ console.log(error)}
            });
          }
        })
      },
      error: function(error){console.log(error)}
    });

    $.each(newSteps, function (i){
      // Clean up
      newSteps[i].lesson_id = lessonId;
      delete newSteps[i].step_state; // Not needed
      $.ajax({
        type: "PUT",
        contentType: "application/json",
        url: config.bfUrl+config.bfApiVersion+'/steps/'+newSteps[i].id,
        data: JSON.stringify(newSteps[i]),
        dataType: "json",
        success : function(){
          if (config.debug) console.log("Step updated.")
        },
        error : function(error){
          $.ajax({
            type: "POST",
            contentType: "application/json",
            url: config.bfUrl+config.bfApiVersion+'/steps',
            data: JSON.stringify(newSteps[i]),
            dataType: "json",
            success : function(){
              if (config.debug) console.log("Step posted.")
            },
            error : function(error){
              console.log(error);
            }
          });
        }
      });
    });
  }

  function _checkForLesson(state){
    lessonName = $("#lesson-name").text();
    var filters = [{"name": "name", "op": "==", "val": lessonName}];
    $.ajax({
      url: config.bfUrl+config.bfApiVersion+'/lessons',
      data: {"q": JSON.stringify({"filters": filters}), "single" : true},
      dataType: "json",
      contentType: "application/json",
      success: function(data) {
        // Lesson already exists, give user a warning
        console.log(data);
        if (data.num_results){
          $("#alert").removeClass("hidden").text("A lesson with that name already exists.")
          // $("#lesson-name").popover({ content: "Lesson already exists.", html: true, placement: 'right' });
          // $("#lesson-name").popover("show");
          // $('#lesson-name').on('shown.bs.popover', function () {
          //   $("html").click(function(){
          //     $("#lesson-name").popover("destroy");
          //   })
          // })
        } else {
          // Lesson doesn't exist, post it
          _postLesson(state);
        }
      },
      error : function(error){
        console.log(error);
      }
    });
  }

  function _postLesson(state){
    newLesson = {
      service_id : serviceId,
      creator_id : BfUser.id,
      name : lessonName,
      state : state
    }
    $.ajax({
      type: "POST",
      contentType: "application/json",
      url: config.bfUrl+config.bfApiVersion+'/lessons',
      data: JSON.stringify(newLesson),
      dataType: "json",
      success : function(data){
        console.log("Lesson Posted");
        lessonId = data.id;
        _postSteps();
      },
      error : function(error){
        console.log(error)
      }
    });
  }

  function _postSteps(state){
    $.each(newSteps, function (i){
      // Clean up
      newSteps[i].lesson_id = lessonId;
      delete newSteps[i].step_state; // Not needed
      $.ajax({
        type: "POST",
        contentType: "application/json",
        url: config.bfUrl+config.bfApiVersion+'/steps',
        data: JSON.stringify(newSteps[i]),
        dataType: "json",
        success : function(){
          if (config.debug) console.log("Step posted.")
        },
        error : function(error){
          console.log(error);
        }
      });
    });
  }

  // add public methods to the returned module and return it
  teach.init = init;
  return teach;
}(teach || {}));

// initialize the module
teach.init()