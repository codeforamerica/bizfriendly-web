var signin = (function (signin) {

  // private properties
  var debug = true;
  // var bfUrl = 'https://app.bizfriend.ly';
  var bfUrl = 'https://app-staging.bizfriend.ly';
  // var bfUrl = 'http://127.0.0.1:8000';
  // var bfUrl = 'http://0.0.0.0:5000'
  var bfApiVersion = '/api/v1'
  var returningUser = {};
  
  // PUBLIC METHODS
  // initialize variables and load JSON
  function init(){
    if (debug) console.log('init');
  }

  // PRIVATE METHODS
  $('#bfsignin').click( function() {
    returningUser = {
      email : $('#signin-email').val(),
      password : $('#signin-password').val()
    }
    if (debug) console.log(returningUser);
    $.post(bfUrl + '/signin', returningUser, _signedIn);
  })

  function _signedIn(response){
    console.log(response);
  }

  // add public methods to the returned module and return it
  signin.init = init;
  return signin;
}(signin || {}));

// initialize the module
signin.init()