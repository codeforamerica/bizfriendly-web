var lesson = (function (lesson) {

  // private properties
  var debug = true;
  var htcUrl = 'http://howtocity.herokuapp.com'
  // var htcUrl = 'http://127.0.0.1:8000'
  var htcApiVer = '/api/v1'
  var lesson = {};

  // PUBLIC METHODS
  // initialize variables and load JSON
  function init(){
    if (debug) console.log('init');
    lessonId = window.location.search.split('?')[1];
    // Call the API and get that lesson
    $.getJSON(htcUrl+htcApiVer+'/lessons/'+lessonId, _main);
  }

  // PRIVATE METHODS
  function _main(response){
    lesson = response;
    _makeSummary();
  }

  function _makeSummary(){
    $('#main #summary h3').html(lesson.name);
    $('#main #summary p').html(lesson.description);
    $('#main #summary a').click(_instructionsLinkClicked);
  }

  function _instructionsLinkClicked(evt){
    var width = window.screen.width;
    var height = window.screen.height;
    var instructionSiteFeatures = {
      height: height,
      // width: width,
      width: width - 1000,
      left: 1000,
      name: 'instructions',
      center: false,
    }
    var instructionsWindow = $.popupWindow('instructions.html?'+lessonId, instructionSiteFeatures);
  }

  // add public methods to the returned module and return it
  lesson.init = init;
  return lesson;
}(lesson || {}));

// initialize the module
lesson.init()