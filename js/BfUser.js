var BfUser = (function (BfUser)  {
  var debug = true;
  ///// CONSTRUCTION /////
  var name = "";
  var email = "";
  var bfAccessToken = "";
  var signedIn = false;
  // var htcUrl = 'http://howtocity.herokuapp.com';
  var htcUrl = 'http://127.0.0.1:8000';
  var htcApiVer = '/api/v1';

  ///// PUBLIC METHODS /////
  function init(){
    if (debug) console.log("Init BfUser.");
    var userData = _readUserCookie();
    if (userData){
      BfUser.name = userData.name;
      BfUser.email = userData.email;
      BfUser.bfAccessToken = userData.access_token;
      BfUser.signedIn = userData.signedIn;
    }

    _main();
  };

  ///// PRIVATE METHODS /////
  function _main() {
    // Signup clicked, send info to server
    $('#bfSignUp').click(_signUpClicked);
    // SignIn clicked, send info to server
    $('#bfSignIn').click(_signInClicked);
    // SignOut clicked, clear state cookie
    $('#signOutLink').click(_signOutClicked);
    // Setup page based on signin state
    _updatePage();
  };
  // Make a post to server with API access token appended
  function _tokenPost(requestUrl, data, successFunc) {
    $.ajax({
      url: requestUrl,
      type:"POST",
      beforeSend: function(xhr) {
        xhr.setRequestHeader("Authorization", BfUesr.bfAccessToken);
      },
      data:data,
      success:successFunc
    })
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
    $.post(htcUrl + '/signup', newUser, _signedIn)
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
    // _setUserCookie("", "", false, "");
    _updatePage();
  }
  // Set User state based on sign up response
  function _signedUp(response) {
    if (debug) console.log(response);
    // Set User state based on login
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
    if (response.status == 200) {
      BfUser.email = response.email;
      BfUser.bfAccessToken = response.access_token;
      BfUser.signedIn = true;
      BfUser.name = response.name;

      // Set a cookie!
      $.removeCookie('BfUser');
      _setUserCookie(BfUser.name, BfUser.email, BfUser.signedIn, BfUser.bfAccessToken);
      if (debug) console.log($.cookie('BfUser'));

      // TODO: fix this flow
      window.location.replace('index.html')

    }
    else if (response.status == 403){
      $('#feedback h2').addClass('alert alert-danger').html(response.error);
    }
  };

  // Update page to reflect user state
  function _updatePage(){
    if (BfUser.signedIn) {
      $('#signInLink').hide();
      $('#signUpLink').hide();
      $('#bfUserName a').text(BfUser.name);
      $('#bfUserName').show();
      $('#signOutLink').show();
    }
    else {
      $('#signInLink').show();
      $('#signUpLink').show();
      $('#bfUserName').html('<a href="#"></a>');
      $('#bfUserName').hide();
      $('#signOutLink').hide();
    }
  }

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
  

  // Remember the access token of a service connection
  function create_connection(data, successFunc) {
    _tokenPost(htcUrl + '/create_connection', data, successFunc)
  };

  // Remember the most recent step progress
  function record_step(data, successFunc) {
    _tokenPost(htcUrl + '/record_step', data, successFunc)
  };

  //Check to see if user is logged in to service
  function is_logged_in(data, successFunc) {
    _tokenPost(htcUrl + '/logged_in', data, successFunc)
  };

  // Check for new
  function check_for_new(data, successFunc) {
    _tokenPost(htcUrl + '/check_for_new', data, successFunc)
  };

  // Get remembered thing
  function get_remembered_thing(data, successFunc) {
    _tokenPost(htcUrl + '/get_remembered_thing', data, successFunc)
  };

  // Get added data
  function get_added_data(data, successFunc) {
    _tokenPost(htcUrl + '/get_added_data', data, successFunc)
  };

  // Make a post to server with API access token appended
  function _tokenPost(requestUrl, data, successFunc) {
    $.post(requestUrl+'?access_token='+BfUser.bfAccessToken, data, successFunc);
  };
  
  // add public methods to the returned module and return it
  BfUser.init = init;
  BfUser.record_step = record_step;
  BfUser.create_connection = create_connection;
  BfUser.is_logged_in = is_logged_in;
  BfUser.check_for_new = check_for_new;
  BfUser.get_added_data = get_added_data;
  BfUser.get_remembered_thing = get_remembered_thing;

  return BfUser;
}(BfUser || {}));
//Initialize Module
BfUser.init();

