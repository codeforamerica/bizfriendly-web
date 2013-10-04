var profile = (function (profile) {

  // private properties
  var user_id = BfUser.id;
  var user_name = BfUser.name;

  // PUBLIC METHODS
  // initialize variables and load JSON
  function init(){
    if (config.debug) console.log('init');
    // Call the API and get that lesson, pass response to _main
    _loading();
    _main();
    // $.getJSON(config.bfUrl+config.bfApiVersion+'/userlessons', _main);
  }

  // PRIVATE METHODS
  function _loading(){
    // console.log('Loading');
    $('#main').toggle();
  }

  function _main(response){
    $('#loading').toggle();
    $('#main').toggle();
    _checkIfLoggedIn();

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
  profile.init = init;
  return profile;
}(profile|| {}));

// initialize the module
profile.init()
