var service = (function (service) {

  var service = {};

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
    _makeSummary();
    _checkIfLoggedIn();
  }

  function _makeSummary(){
    if (service.third_party_service == 'facebook'){
      $('#main-video').html('<iframe src="http://player.vimeo.com/video/72059276" width="610" height="340" frameborder="0" webkitAllowFullScreen mozallowfullscreen allowFullScreen></iframe>');
    }
    if (service.third_party_service == 'foursquare'){
      $('#main-video').html('<iframe src="http://player.vimeo.com/video/72066312" width="610" height="340" frameborder="0" webkitAllowFullScreen mozallowfullscreen allowFullScreen></iframe>');
    }
    else {
      $('#main-video').html('<img width="610" height="340" src="img/promo_vid.png">');
    }
    $('#main #main-text .service-name').html(service.name);
    $('#main #main-text .service-description').html(service.long_description);
    $('#additional_resources ul').html(service.additional_resources);
    $('#tips ul').html(service.tips);
    $.each(lessons, function(i){
      $("#main-text").append('<a id="'+lessons[i].id+'" class="btn btn-primary btn-lrg">'+lessons[i].name+'</a>"');
    });
    $('#main #main-text a').click(_instructionsLinkClicked);
  }

  function _checkIfLoggedIn(){
    if (!BfUser.bfAccessToken){
      $('#main-text .btn').hide();
      $('.login-required').show();
    }
  }

  function _instructionsLinkClicked(evt){
    var url = 'instructions.html?'+this.id;
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