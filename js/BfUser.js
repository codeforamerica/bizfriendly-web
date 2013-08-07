var BfUser = (function (BfUser)  {
  var debug = true;
  ///// CONSTRUCTION /////
  // var userData = _readUserCookie()
  var name = "";
  var email = "";
  var bfAccessToken = "";
  var signedIn = false;
  // var htcUrl = 'http://howtocity.herokuapp.com';
  var htcUrl = 'http://127.0.0.1:8000';
  var htcApiVer = '/api/v1';

  ///// PUBLIC METHODS /////
  function init(){
    console.log("Init BfUser.");
    var userData = _readUserCookie();
    BfUser.name = userData.name;
    BfUser.email = userData.email;
    BfUser.bfAccessToken = userData.access_token;
    BfUser.signedIn = userData.signedIn;
    console.log(BfUser);

    _main();
  };

  // Remember the access token of a service connection
  function save_connection(serviceName, serviceToken) {
    var connection = {service: serviceName, service_access: serviceToken}
    // TODO: What to do with no return function?
    _token_post(htcUrl + '/create_connection', connection, function() {return true;})
  };

  // Remember the most recent step progress
  function save_step(data) {
    _token_post(htcUrl + '/record_step', data, function() {return true;})
  };

  //Check to see if user is logged in to service
  function is_logged_in(data, successFunc) {
    _token_post(htcUrl + '/logged_in', data, successFunc)
  };

  // Check for new
  function check_for_new(data, successFunc) {
    _token_post(htcUrl + '/check_for_new', data, successFunc)
  };

  // Get remembered thing
  function get_remembered_thing(data, successFunc) {
    _token_post(htcUrl + '/get_remembered_thing', data, successFunc)
  };

  // Get added data
  function get_added_data(data, successFunc) {
    _token_post(htcUrl + '/get_added_data', data, successFunc)
  };

  ///// PRIVATE METHODS /////
  function _main() {
    // Signup clicked, send info to server
    $('#bfSignUp').click(_signUpClicked);
    // SignIn clicked, send info to server
    $('#bfSignIn').click(_signInClicked);
    // SignOut clicked, clear state cookie
    $('#bfSignOut').click(_signOutClicked);
    // Setup page based on signin state
    _updatePage();
  };
  // Make a post to server with API access token appended
  function _token_post(requestUrl, data, successFunc) {
    $.post(requestUrl+'?access_token='+BfUser.bfAccessToken, data, successFunc);
  };
  // Read the user state cookie: return json
  function _readUserCookie(){
    // Pull data out of cookie
    $.cookie.json = true;
    var cookieData = $.cookie('BfUser');
    // Cookie doesn't exist, create it
    if (cookieData == undefined) {
      _setUserCookie("", "", false, "");
    }
    return cookieData;
  };
  // Set the user state cookie
  function _setUserCookie(name, email, status, access_token){
    $.cookie.json = true;
    var setData = {name: name, email: email, signedIn: status, 
      access_token: access_token};
    $.cookie('BfUser', setData, {expires:7, path: '/'});
    return true;
  };
  // Update page to reflect user state
  function _updatePage(){
    if (BfUser.signedIn) {
      $('#signInLink').hide();
      $('.bfUserName').text(BfUser.name);
      $('#signOutLink').show();
    }
    else {
      $('#signInLink').show();
      $('#signOutLink').hide();
    }
  }
  // Send sign up info to server on signup click.
  function _signUpClicked(event){
    if (debug) console.log("Submitting signup info.")
    newUser = {
        name : $('#signup-name').val(),
        email : $('#signup-email').val(),
        password : $('#signup-password').val()
      }
      if (debug) console.log(newUser);
      $.post(htcUrl + '/signup', newUser, _signedUp)
    }
  // Send sign in info to server on signin click.
  function _signInClicked(event){
    returningUser = {
      email : $('#signin-email').val(),
      password : $('#signin-password').val()
    };
    if (debug) console.log(returningUser);
    $.post(htcUrl + '/signin', returningUser, _signedIn);
  }
  // Sign out clicked, clear user state/cookie
  function _signOutClicked(event){
    BfUser.email = "";
    BfUser.name = "";
    BfUser.signedIn = false;
    BfUser.access_token = "";
    $.removeCookie('BfUser');
    _setUserCookie("", "", false, "");
    _updatePage();
  }
  // Set User state based on sign up response
  function _signedUp(response) {
    if (debug) console.log(response);
    // Set User state based on login
    response = $.parseJSON(response);
    if (response.status == 200) {
      BfUser.email = response.email;
      BfUser.bfAccessToken = response.access_token;
      BfUser.signedIn = true;
      BfUser.name = response.name;

      // Set a cookie!
      $.removeCookie('BfUser');
      _setUserCookie(name, email, signedIn, bfAccessToken);
      console.log($.cookie('BfUser'));

      $('#feedback h2').html('Coooool! You\'re logged in!');
      _updatePage();
      // TODO: fix this flow
      window.location.replace('learn.html')
    }
    // Login failed, decide how to respond
    else if (response.status == 403){
      $('#feedback h2').html(response.error);
    }
  };
  //Set User state based on sign in response
  function _signedIn(response){
    if (debug) console.log(response);
    response = $.parseJSON(response);
    if (response.status == 200) {
      BfUser.email = response.email;
      BfUser.bfAccessToken = response.access_token;
      BfUser.signedIn = true;
      BfUser.name = response.name;

      // Set a cookie!
      $.removeCookie('BfUser');
      _setUserCookie(BfUser.name, BfUser.email, BfUser.signedIn, BfUser.bfAccessToken);
      console.log($.cookie('BfUser'));

      $('#feedback h2').html('Coooool! You\'re logged in!');
      _updatePage();
      // TODO: fix this flow
      window.location.replace('learn.html')

    }
    else if (response.status == 403){
      $('#feedback h2').html(response.error);
    }
  };

  // add public methods to the returned module and return it
  BfUser.init = init;
  BfUser.save_step = save_step;
  BfUser.save_connection = save_connection;
  BfUser.is_logged_in = is_logged_in;
  BfUser.check_for_new = check_for_new;
  BfUser.get_added_data = get_added_data;
  BfUser.get_remembered_thing = get_remembered_thing;

  return BfUser;
}(BfUser || {}));
//Initialize Module
BfUser.init();
console.log(BfUser);

