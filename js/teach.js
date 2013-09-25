var teach = (function (teach) {

  var user_id = false;
  var newSteps = [];

  // PUBLIC METHODS
  function init(){
    if (config.debug) console.log('init');
    _main();
  }

  // PRIVATE METHODS
  function _main(){
    $('.selectpicker').selectpicker();
    _checkIfLoggedIn();
    _getCategories();
    _getThirdPartyServices();
    // _getLessons();
    $('#right').click(_nextStep);
    $('#new-lesson-btn').click(_postNewLesson);
    $('#new-step-btn').click(_postNewStep);
  }

  function _checkIfLoggedIn(){
    if (!BfUser.bfAccessToken){
      $('#lesson-form').hide();
      $('.login-required').show();
    } else {
      if (config.debug) console.log('Logged In');
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
      $('.selectpicker').selectpicker('refresh');
    })
  }

  function _getThirdPartyServices(){
    $.get(config.bfUrl+config.bfApiVersion+'/lessons', function(response){
      $.each(response.objects, function(i){
        $('#third-party-service').append('<option value='+response.objects[i].third_party_service+'>'+response.objects[i].third_party_service+'</option>');
      })
      $('.selectpicker').selectpicker('refresh');
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