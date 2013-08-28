var lesson = (function (lesson) {

  // private properties
  var debug = true;
  // var htcUrl = 'http://howtocity.herokuapp.com'
  // var htcUrl = 'http://howtocity-staging.herokuapp.com';
  var htcUrl = 'http://127.0.0.1:8000'
  var htcApiVer = '/api/v1'
  var lesson = {};

  // PUBLIC METHODS
  // initialize variables and load JSON
  function init(){
    if (debug) console.log('init');
    lessonId = window.location.search.split('?')[1];
    // Call the API and get that lesson
    _loading();
    $.getJSON(htcUrl+htcApiVer+'/lessons/'+lessonId, _main);
  }

  // PRIVATE METHODS
  function _loading(){
    // console.log('Loading');
    $('#main').toggle();
  }

  function _main(response){
    $('#loading').toggle();
    $('#main').toggle();
    lesson = response;
    _makeSummary();
    _checkIfLoggedIn();
  }

  function _makeSummary(){
    if (lesson.third_party_service == 'facebook'){
      $('#main-video').html('<iframe src="http://player.vimeo.com/video/72059276" width="610" height="340" frameborder="0" webkitAllowFullScreen mozallowfullscreen allowFullScreen></iframe>');
    }
    if (lesson.third_party_service == 'foursquare'){
      $('#main-video').html('<iframe src="http://player.vimeo.com/video/72066312" width="610" height="340" frameborder="0" webkitAllowFullScreen mozallowfullscreen allowFullScreen></iframe>');
    }
    $('#main #main-text .lesson-name').html(lesson.name);
    $('#main #main-text .lesson-description').html(lesson.long_description);
    $('#additional_resources ul').html(lesson.additional_resources);
    $('#tips ul').html(lesson.tips);
    $('#main #main-text a').click(_instructionsLinkClicked);
  }

  function _checkIfLoggedIn(){
    if (!BfUser.bfAccessToken){
      $('#main-text .btn').hide();
      $('.login-required').show();
    }
  }

  function _instructionsLinkClicked(evt){
    var url = 'instructions.html?'+lessonId;
    var width = 340;
    var height = window.screen.height;
    var left = window.screen.width - 340;
    var instructionOptions = "height="+height+",width="+width+",left="+left;
    window.open(url,"instructions",instructionOptions);
  }
  // add public methods to the returned module and return it
  lesson.init = init;
  return lesson;
}(lesson || {}));

// initialize the module
lesson.init()