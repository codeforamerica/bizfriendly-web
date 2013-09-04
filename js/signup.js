var signup = (function (signup) {

  // private properties
  var debug = true;
  // var bfUrl = 'https://app.bizfriend.ly';
  // var bfUrl = 'https://app-staging.bizfriend.ly';
  var bfUrl = 'http://127.0.0.1:8000';
  // var bfUrl = 'http://0.0.0.0:5000'
  var bfApiVersion = '/api/v1'
  var newUser = {};

  // PUBLIC METHODS
  // initialize variables and load JSON
  function init(){
    if (debug) console.log('init');
  }

  // PRIVATE METHODS

  $('#bfSignUp').click( function() {
    newUser = {
      name : $('#signup-name').val(),
      email : $('#signup-email').val(),
      password : $('#signup-password').val()
    }
    if (debug) console.log(newUser);
    $.post(bfUrl + '/signup', newUser, _signedUp)
  })

  function _signedUp(response) {
    if (debug) console.log(response);
    // Set User state based on login
    response = $.parseJSON(response)
    if (response.status == 200) {
      email = response.email;
      bfAccessToken = response.access_token;
      loggedIn = true;

      // Set a cookie!
      $.removeCookie('bfAccessToken');
      $.cookie('bfAccessToken', bfAccessToken);

      $('#feedback h2').html('Coooool! You\'re logged in!');
    }
    // Login failed, decide how to respond
    else if (response.status == 403){
      $('#feedback h2').html(response.error);
    }
  }

  // add public methods to the returned module and return it
  signup.init = init;
  return signup;
}(signup || {}));

// initialize the module
signup.init()