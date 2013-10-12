var connect = (function (connect) {

  // private properties
  var user_id = BfUser.id;

  // PUBLIC METHODS
  // initialize variables and load JSON
  function init(){
    if (config.debug) console.log('init');
    // Call the API and get that lesson, pass response to _main
    _loading();
    $.getJSON(config.bfUrl+config.bfApiVersion+'/userlessons', _main);
  }

  // PRIVATE METHODS
  function _loading(){
    // console.log('Loading');
    $('#main').toggle();
  }

  function _main(response){
    $('#loading').toggle();
    $('#main').toggle();
    // if (config.debug) console.log(response);
    _checkIfLoggedIn();

    $.each(response.objects, function(i){
      // console.log(response.objects[i]);
      if (response.objects[i].end_dt){
        console.log(response.objects[i]);
        var html = response.objects[i].user.name;
        html += " recently finished ";
        html += '<a href="service.html?'+response.objects[i].lesson.service_id+'">'+response.objects[i].lesson.name+'</a>';
        $("#recent-activity").append(html);
      }
    })
  }

  function _checkIfLoggedIn(){
    // Check if user is logged in
    // If not, dont let them build a lesson
    // If so, show their name as the author
    if (!BfUser.bfAccessToken){
      $('#main').hide();
      $('.login-required').show();
    } else {
      // if (config.debug) console.log('Logged In');
      $(".user-name").text(BfUser.name);
    }
  }

  // add public methods to the returned module and return it
  connect.init = init;
  return connect;
}(connect|| {}));

// initialize the module
connect.init()
