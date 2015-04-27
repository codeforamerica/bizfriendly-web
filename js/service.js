var service = (function (service) {

  var service = {};
  var lessons = [];
  var lessonCompleted;


  // PUBLIC METHODS
  // initialize variables and load JSON
  function init(){
    if (config.debug) console.log('init');
    serviceId = window.location.search.split('?')[1];
    // Call the API and get that service
    _loading();
    $.getJSON(config.bfUrl+config.bfApiVersion+'/services/'+serviceId, _main);
  }

  // PRIVATE METHODS
  function _loading(){
    // console.log('Loading');
    $('#main').toggle();
  }

  function _alphabetize(a, b) {
    // Pass to Array.sort() method as a comparison function for categories, based on the 'name' property.
    return (a.name < b.name) ? -1 : ((a.name > b.name) ? 1 : 0);
  }

  function _main(response){
    $('#loading').toggle();
    $('#main').toggle();
    service = response;
    lessons = service.lessons;
    lessons.sort(_alphabetize);
    _checkIfLoggedIn();
    _showService();
  }

  function _checkIfLoggedIn(){
    if (!BfUser.bfAccessToken){
      $('#main-text .btn').hide();
      $('.login-required').show();
    }
  }

  function _showService(){
    if (config.debug) console.log(service);
    $("#service-icon").attr("src",service.icon);
    $("#service-name").text(service.name);
    $("#service-description").html(service.long_description);
    $("#tips").html(service.tips)
    $("#additional-resources").html(service.additional_resources);
    $("#tips").html(service.tips)
    $("#service-media").html(service.media);
    _lessonTable();
    $("#teach-callout .service-name").text(service.name);
  }

  function _lessonTable(){
    // Fill up table tbody
    var html = '';
    var requests = [];
    var numberOfLearners;
    
    var prepareAjax = function() {
      $.each(lessons, function(i, lesson){
        if (lesson.state == "published"){
          lessonCompleted = false;
          // Get number of learners
          var filters = [{"name": "lesson_id", "op": "==", "val": lesson.id}];

          var xhr = $.ajax({
                      url: config.bfUrl+config.bfApiVersion+'/userlessons',
                      data: {"q": JSON.stringify({"filters": filters})},
                      dataType: "json",
                      contentType: "application/json",
                      error : function(error){
                                console.log(error);
                              }
                      })
          requests.push(xhr);
        }
      })
      return requests;
    }
    // When each AJAX request is completed check if complete, add to the DOM 
    $.when.apply($, prepareAjax()).done(function(){
      var results = []; 
      for (var i=0; i < arguments.length; i++) {
        var html = '<tr><td>';
        //for services that have only one lesson need to have the appropriate lesson pointer
        if (arguments[i].hasOwnProperty('objects')) {
          var lessonSelector = arguments[i];
        } else {
          var lessonSelector = arguments[i][0];
        }
        var isCompleted = _checkIfLessonCompleted(lessonSelector.objects);
        if (isCompleted) {
          html += '<img src="img/green-check.png">';
        }
        var lessonId = lessonSelector.objects[0].lesson_id;
        html += '<a id="'+lessonId+'" class="orange bold instructions-link">'+lessonSelector.objects[0].lesson.name+'</a>';
        html += '<br/><p class="author-name">Created by <span class="author-name'+lessonSelector.objects[0].lesson.creator_id+'"></span></p></td>';
        html += '<td>'+ lessonSelector.num_results+'</td></tr>';
        results.push(html);
        $("#tbody").append(html);
        _getCreatorName(lessonId);
        $("#"+lessonId).click(_instructionsLinkClicked);
      }
    });
  }

  function _checkIfLessonCompleted(userLessonsArray) {
    var completed = false;
    for (var user in userLessonsArray) {
      if (userLessonsArray[user]['user_id'] === BfUser.id && userLessonsArray[user]['completed'] === true) {
        completed = true;
      }
    }
    return completed;
  }

  function _getCreatorName(lessonId){
    $.getJSON(config.bfUrl+config.bfApiVersion+"/lessons/"+lessonId, function(response){
      $('.author-name'+response.creator_id).text(response.creator.name);
    })
  }

  function _instructionsLinkClicked(evt){
    // Open the lesson and the modal.
    $('#instructionsModal').modal()
    // 10 seconds later the modal closes.
    setTimeout(function(){
      $('#instructionsModal').modal('hide')
    },10000);
    lessonId = $(this).attr("id");
    var url = 'instructions.html?'+lessonId;
    var width = 340;
    var height = window.screen.height;
    var left = window.screen.width - 340;
    var instructionOptions = "height="+height+",width="+width+",left="+left;
    window.open(url,"instructions",instructionOptions);
  }

  // add public methods to the returned module and return it
  service.init = init;
  return service;
}(service || {}));

// initialize the module
service.init()
