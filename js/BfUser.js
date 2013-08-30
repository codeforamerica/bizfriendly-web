var BfUser = (function (BfUser)  {
  var debug = true;
  ///// CONSTRUCTION /////
  var name = "";
  var email = "";
  var bfAccessToken = "";
  var signedIn = false;
  // var htcUrl = 'https://howtocity.herokuapp.com';
  var htcUrl = 'https://howtocity-staging.herokuapp.com';
  // var htcUrl = 'http://127.0.0.1:8000';
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
        xhr.setRequestHeader("Authorization", BfUser.bfAccessToken);
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
    function isEmail(email) {
      var regex = /^([a-zA-Z0-9_.+-])+\@(([a-zA-Z0-9-])+\.)+([a-zA-Z0-9]{2,4})+$/;
      return regex.test(email);
    }
    if (isEmail($('#signup-email').val())){
      $.post(htcUrl + '/signup', newUser, _signedIn).fail(_badPost);
    } else {
      $('#feedback h2').addClass('alert alert-danger').html('That email doesn\'t look right.');
    }
  }

  function _badPost(response){
    response = $.parseJSON(response.responseText);
    $('#feedback h2').addClass('alert alert-danger').html(response.error);
  }

  // Send sign in info to server on signin click.
  function _signInClicked(event){
    returningUser = {
      email : $('#signin-email').val(),
      password : $('#signin-password').val()
    };
    if (debug) console.log(returningUser);
    $.post(htcUrl + '/signin', returningUser, _signedIn).fail(_badPost);
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
      _setUserCookie(BfUser.name, BfUser.email, BfUser.signedIn, BfUser.bfAccessToken);
      if (debug) console.log($.cookie('BfUser'));

      
      window.location.replace('/')

    }
    else if (response.status == 403){
      $('#feedback h2').addClass('alert alert-danger').html('Email already registered.');
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
      window.location.replace('/')

    }
    else if (response.status == 403){
      console.log(response);
      $('#feedback h2').addClass('alert alert-danger').html(response.error);
    }
  };

  // Update page to reflect user state
  function _updatePage(){
    if (BfUser.signedIn) {
      $('#signInLink').hide();
      $('#signUpLink').hide();
      $('#bfUserName').text(BfUser.name);
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

  // Check for new
  function check_for_new(data, successFunc) {
    _tokenPost(htcUrl + '/check_for_new', data, successFunc)
  };

  // Check if attribute exists
  function check_if_attribute_exists(data, successFunc) {
    _tokenPost(htcUrl + '/check_if_attribute_exists', data, successFunc)
  };

  // Check attribute for value
  function check_attribute_for_value(data, successFunc) {
    _tokenPost(htcUrl + '/check_attribute_for_value', data, successFunc)
  };

  // Get attributes
  function get_attributes(data, successFunc) {
    _tokenPost(htcUrl + '/get_attributes', data, successFunc)
  };

  // add public methods to the returned module and return it
  BfUser.init = init;
  BfUser.record_step = record_step;
  BfUser.create_connection = create_connection;
  BfUser.check_for_new = check_for_new;
  BfUser.check_if_attribute_exists = check_if_attribute_exists;
  BfUser.check_attribute_for_value = check_attribute_for_value;
  BfUser.get_attributes = get_attributes;

  return BfUser;
}(BfUser || {}));
//Initialize Module
BfUser.init();

