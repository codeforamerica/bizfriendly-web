var service = (function (service) {

  var service = {};
  var lessons = [];


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

  function _main(response){
    $('#loading').toggle();
    $('#main').toggle();
    service = response;
    lessons = service.lessons;
    // _makeSummary();
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
    $.each(lessons, function(i){
      var html = '';
      var numberOfLearners;
      // Get number of learners
      var filters = [{"name": "lesson_id", "op": "==", "val": lessons[i].id}];
      $.ajax({
        url: config.bfUrl+config.bfApiVersion+'/userlessons',
        data: {"q": JSON.stringify({"filters": filters})},
        dataType: "json",
        contentType: "application/json",
        success: function(data) {
          numberOfLearners = data.num_results;
        },
        error : function(error){
          console.log(error);
        }
      }).done(function(){
        if (config.debug) console.log(lessons);
        html += '<tr><td><a id="'+lessons[i].id+'" class="orange bold instructions-link">'+lessons[i].name+'</a>';
        html += '<br/><p class="author-name">Created by <span class="author-name'+lessons[i].creator_id+'"></span></p></td>';
        html += '<td>'+numberOfLearners+'</td></tr>';
        $("#tbody").append(html);
        $(".instructions-link").click(_instructionsLinkClicked)
        _getCreatorName(lessons[i].id);
      })
    })
  }

  function _getCreatorName(lessonId){
    $.getJSON(config.bfUrl+config.bfApiVersion+"/lessons/"+lessonId, function(response){
      $('.author-name'+response.creator_id).text(response.creator.name);
    })
  }


  function _instructionsLinkClicked(evt){
    lessonId = $(this).attr("id");
    var url = 'instructions.html?'+lessonId;
    var width = 340;
    var height = window.screen.height;
    var left = window.screen.width - 340;
    var instructionOptions = "height="+height+",width="+width+",left="+left;
    window.open(url,"instructions",instructionOptions);
    $('#instructionsModal').modal()
  }

  // add public methods to the returned module and return it
  service.init = init;
  return service;
}(service || {}));

// initialize the module
service.init()