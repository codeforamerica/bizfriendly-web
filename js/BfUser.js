var BfUser = (function (BfUser)  {
  ///// CONSTRUCTION /////
  var name = "";
  var email = "";
  var bfAccessToken = "";
  var signedIn = false;
  ///// PUBLIC METHODS /////
  function init(){

    if (config.debug) console.log("Init BfUser.");

    // if "signout=true" is present in the URL, clear the cookie
    if (_getURLParameter('signout') == 'true')
    {
      _clearUserCookie();
    }
    else
    {
      var userData = _readUserCookie();
      if (userData){
        BfUser.id = userData.id;
        BfUser.name = userData.name;
        BfUser.email = userData.email;
        BfUser.bfAccessToken = userData.access_token;
        BfUser.signedIn = userData.signedIn;

        if (userData.access_token){
          $("#signup-form").removeClass('alert-danger').addClass('alert alert-success').html("You're already signed up! <a href='signup.html?signout=true'>Need to create another account?</a>");
        }
      }
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
    // A password reset is requested
    $('#request-password-reset-btn').click(_requestPasswordResetClicked);
    // The password is reset
    $('#password-reset-btn').click(_passwordResetClicked);
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
      _setUserCookie("", "", "", false, "");
    }
    return cookieData;
  };
  // Set the user state cookie
  function _setUserCookie(id, name, email, status, access_token){
    $.cookie.json = true;
    var setData = {id: id, name: name, email: email, signedIn: status,
      access_token: access_token};
    $.cookie('BfUser', setData, {expires:7, path: '/'});
    return true;
  };
  // Clears the user state cookie
  function _clearUserCookie()
  {
    BfUser.id = "";
    BfUser.email = "";
    BfUser.name = "";
    BfUser.signedIn = false;
    BfUser.access_token = "";
    // set cleared cookie values in case cookie isn't removed
    _setUserCookie(BfUser.id, BfUser.name, BfUser.email, BfUser.signedIn, BfUser.bfAccessToken);
    $.removeCookie('BfUser');
  }

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

  function _badPost(response){
    response = $.parseJSON(response.responseText);
    console.log(response.error);
    $('#alert h2').addClass('alert alert-danger').html(response.error);
  }

  // Send sign up info to server on signup click.
  function _signUpClicked(event){
    if (config.debug) console.log("Submitting signup info.")
      newUser = {
        name : $('#name').val(),
        email : $('#email').val(),
        password : $('#password').val()
    }
    if (config.debug) console.log(newUser);
    $.post(config.bfUrl + '/signup', newUser, _signedUp).fail(_badPost);
  }

  // Send sign in info to server on signin click.
  function _signInClicked(event){
    returningUser = {
      email : $('#email').val(),
      password : $('#password').val()
    };
    if (config.debug) console.log(returningUser);
    $.post(config.bfUrl + '/signin', returningUser, _signedIn).fail(_badPost);
  }

  // Sign out clicked, clear user state/cookie
  function _signOutClicked(event){
    _clearUserCookie();
    _updatePage();
    window.open("signin.html", "_self");
  }

  // A password reset is requested
  function _requestPasswordResetClicked(response){
    var email = {"email" : $('#reset-email').val()}
    $.post(config.bfUrl+'/request_password_reset',email, function(response){
      console.log(response);
      response = $.parseJSON(response);
      console.log(response.message);
      if (response.message == "Queued. Thank you."){
        $('#alert h2').removeClass('alert-danger').addClass('alert alert-success').text("Check your email.");
      }
    }).fail(_badPost);
  }

  // THe new password is sent in
  function _passwordResetClicked(response){
    var postData = {
      "email" : $('#reset-email').val(),
      "password" : $('#reset-password-field').val(),
      "resetToken" : window.location.search.split('?')[1]
    }
    $.post(config.bfUrl+'/password_reset', postData, function(response){
      console.log(response);
      console.log(response.status);
      if (response.status == 200){
        $('#alert h2').removeClass('alert-danger').addClass('alert alert-success').text("Password reset.");
      }
    }).fail(_badPost);
  }

  // SignedUp successful
  function _signedUp(response){
    if (config.debug) console.log(response);
    BfUser.id = response.id;
    BfUser.email = response.email
    BfUser.bfAccessToken = response.access_token;
    BfUser.signedIn = true;
    BfUser.name = response.name;

    // Set a cookie!
    $.removeCookie('BfUser');
    _setUserCookie(BfUser.id, BfUser.name, BfUser.email, BfUser.signedIn, BfUser.bfAccessToken);
    if (config.debug) console.log($.cookie('BfUser'));

    // disable input fields and button when successfully signed up
    $('#signup-form input').attr("disabled", "disabled");
    $('#bfSignUp').attr("disabled", "disabled");

    _updatePage();
    $('#alert h2').addClass('alert alert-success').html("Great. You're all signed up.");
  };

  //Set User state based on sign in response
  function _signedIn(response){
    if (config.debug) console.log(response);
    BfUser.id = response.id;
    BfUser.email = response.email
    BfUser.bfAccessToken = response.access_token;
    BfUser.signedIn = true;
    BfUser.name = response.name;

    // Set a cookie!
    $.removeCookie('BfUser');
    _setUserCookie(BfUser.id, BfUser.name, BfUser.email, BfUser.signedIn, BfUser.bfAccessToken);
    if (config.debug) console.log($.cookie('BfUser'));

    // disable input fields and button when successfully signed up
    $('#signin-form input').attr("disabled", "disabled");
    $('#bfSignIn').attr("disabled", "disabled");

    _updatePage();
    $('#alert h2').addClass('alert alert-success').html("Great. You're signed in. <a href='signin.html?signout=true'>Sign in under a different account?</a>");
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
      _setUserCookie("", "", "", false, "");
    }
    return cookieData;
  };

  // Remember the access token of a service connection
  function create_connection(data, successFunc) {
    _tokenPost(config.bfUrl + '/create_connection', data, successFunc)
  };

  // Remember the most recent step progress
  function record_step(data, successFunc) {
    _tokenPost(config.bfUrl + '/record_step', data, successFunc)
  };

  // Check for new
  function check_for_new(data, successFunc) {
    _tokenPost(config.bfUrl + '/check_for_new', data, successFunc)
  };

  // Check if attribute exists
  function check_if_attribute_exists(data, successFunc) {
    _tokenPost(config.bfUrl + '/check_if_attribute_exists', data, successFunc)
  };

  // Check attribute for value
  function check_attribute_for_value(data, successFunc) {
    _tokenPost(config.bfUrl + '/check_attribute_for_value', data, successFunc)
  };

  // Check attribute for update
  function check_attribute_for_update(data, successFunc) {
    _tokenPost(config.bfUrl + '/check_attribute_for_update', data, successFunc)
  };

  // Get attributes
  function get_attributes(data, successFunc) {
    _tokenPost(config.bfUrl + '/get_attributes', data, successFunc)
  };

  // Get attributes
  function postRating(data, successFunc) {
    _tokenPost(config.bfUrl + '/post_rating', data, successFunc)
  };

  // Retrieve a URL parameter
  // @param name [String] The parameter name to retrieve.
  function _getURLParameter(name) {
    return decodeURI(
        (RegExp(name + '=' + '(.+?)(&|$)').exec(location.search)||[,null])[1]
    );
  }

  // add public methods to the returned module and return it
  BfUser.init = init;
  BfUser.record_step = record_step;
  BfUser.create_connection = create_connection;
  BfUser.check_for_new = check_for_new;
  BfUser.check_if_attribute_exists = check_if_attribute_exists;
  BfUser.check_attribute_for_value = check_attribute_for_value;
  BfUser.check_attribute_for_update = check_attribute_for_update;
  BfUser.get_attributes = get_attributes;
  BfUser.postRating = postRating;

  return BfUser;
}(BfUser || {}));
//Initialize Module
BfUser.init();

