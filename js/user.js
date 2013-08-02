function User (userData) {
  ///// CONSTRUCTION /////
  var email = userData.email
  var bfAccessToken = userData.bfAccessToken
  var loggedIn = userData.loggedIn
  // var htcUrl = 'http://howtocity.herokuapp.com';
  var htcUrl = 'http://127.0.0.1:8000';
  var htcApiVer = '/api/v1';

  $('#login-form').submit( function() {
    $.post(htcUrl + '/login', $(this).serialize(), _login)
  })

  $('#signup-form').submit( function() {
    $.post(htcUrl + '/signup', $(this).serialize(), _login)
  })

  ///// PUBLIC METHODS /////

  // Remember the access token of a service connection
  var save_connection = function(serviceName, serviceToken) {
    var connection = {service: serviceName, service_access: serviceToken}
    // TODO: What to do with no return function?
    _token_post(htcUrl + '/create_connection', connection, function() {return true;})
  }

  // Remember the most recent step progress
  var save_step = function(data) {
    _token_post(htcUrl + '/record_step', data, function() {return true;})
  }

  //Check to see if user is logged in to service
  var is_logged_in = function (data, successFunc) {
    _token_post(htcUrl + '/logged_in', data, successFunc)
  }

  // Check for new
  var check_for_new = function(data, successFunc) {
    _token_post(htcUrl + '/check_for_new', data, successFunc)
  }

  // Get remembered thing
  var get_remembered_thing = function(data, successFunc) {
    _token_post(htcUrl + '/get_remembered_thing', data, successFunc)
  }

  // Get added data
  var get_added_data = function(data, successFunc) {
    _token_post(htcUrl + '/get_added_data', data, successFunc)
  }

  ///// PRIVATE METHODS /////
  var _token_post = function(requestUrl, data, successFunc) {
    $.post(requestUrl+'?access_token='+self.bfAccessToken, data, successFunc);
  }

  // Set User state based on login
  var _login = function(response) {
    response = $.json.parse(response)
    if (response.status == 200) {
      email = response.email
      bfAccessToken = response.bfAccessToken
      loggedIn = true

      var user_data = {email: email,
        bfAccessToken: bfAccessToken,
        loggedIn: loggedIn}
      $.cookie('bf_user', user_data)
    }
    // Login failed, decide how to respond
    else {    }
  }
  
};

/////GLOBAL/////
$.function(){
  $.cookie.json = true;
  var userCookie = $.cookie('bf_user');
  if (userCookie == undefined) {
    userCookie = {email: "", bfAccessToken: "", loggedIn: false}
  }
  var cur_user = new User(userCookie)
  cur_user.token_post
}


