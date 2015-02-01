var editProfile = (function (editProfile) {

  // private properties
  var user_id = BfUser.id;
  var user_name = BfUser.name;
  var lessonsCompleted = [];
  var lessonsCreated = [];
  var profileID;

  // PUBLIC METHODS
  // initialize variables and load JSON
  function init(){
    if (config.debug) console.log('init');
    _loading();
    _main();
  }

  // PRIVATE METHODS
  function _loading(){
    // console.log('Loading');
    $('#main').toggle();
  }

  function _main(){
    $('#loading').toggle();
    $('#main').toggle();
    _checkIfLoggedIn();
    _getUserInfo(BfUser.id);
    _editProfileForm();
  }

  function _checkIfLoggedIn(){
    // Check if user is logged in
    if (!BfUser.bfAccessToken){
      $('#main').hide();
      $('.login-required').show();
    }
  }

  function _getUserInfo(userID){
    // Display the user profile info 
    $.getJSON(config.bfUrl+config.bfApiVersion+'/users/'+userID, function(response){
      $(".user-name").append(response.name);
      if (response.location) {
        $(".location").text(response.location);
      } 
      if (response.business_name) {
        $(".biz-name").text(response.business_name);
      }
      if (response.description) {
        $(".profile-description").text(response.description);
      }
      if (response.linkedin) {
        $("#profile-li").attr("href",response.linkedin);
      } else {
        $("#profile-li").hide();
      }
      if (response.gplus) {
        $("#profile-gplus").attr("href",response.gplus);
      } else {
        $("#profile-gplus").hide();
      }
      if (response.facebook) {
        $("#profile-fb").attr("href",response.facebook);
      } else {
        $("#profile-fb").hide();
      }
      if (response.twitter) {
        $("#profile-twitter").attr("href",response.twitter);
      } else {
        $("#profile-twitter").hide();
      }
      if (response.business_url) {
        $("#profile-site").attr("href",response.business_url);
      } else {
        $("#profile-site").hide();
      }

      // Fill form with current info
      $("#form-name").val(response.name);
      $("#form-biz-name").val(response.business_name);
      $("#form-location").val(response.location);
      $("#form-linkedin").val(response.linkedin);
      $("#form-gplus").val(response.gplus);
      $("#form-fb").val(response.fb);
      $("#form-twitter").val(response.twitter);
      $("#form-site").val(response.site);
      $("#form-description").val(response.description);
    });
  }

  function _editProfileForm(){
    // Submit edited profile info
    $("#submit").click(function(evt){
      updatedUser = {
        name : $("#form-name").val(),
        location : $("#form-location").val(),
        business_name : $("#form-biz-name").val(),
        business_url : $("#form-url").val(),
        description : $("#form-description").val(),
        linkedin : $("#form-linkedin").val(),
        gplus : $("#form-gplus").val(),
        facebook : $("#form-facebook").val(),
        twitter : $("#form-twitter").val()
      }
      // Clean up updatedUser
      // if (!$("#form-name").val()) {
      //     delete updatedUser.name;
      // }
      // if (!$("#form-location").val()) {
      //   delete updatedUser.location;
      // }
      // if (!$("#form-biz-name").val()) {
      //   delete updatedUser.business_name;
      // }
      // if (!$("#form-url").val()) {
      //   delete updatedUser.business_url;
      // }
      // if (!$("#form-description").val()) {
      //   delete updatedUser.description;
      // }
      // if (!$("#form-linkedin").val()) {
      //   delete updatedUser.linkedin;
      // }
      // if (!$("#form-gplus").val()) {
      //   delete updatedUser.gplus;
      // }
      // if (!$("#form-facebook").val()) {
      //   delete updatedUser.facebook;
      // }
      // if (!$("#form-twitter").val()) {
      //   delete updatedUser.twitter;
      // }
      $.ajax({
        type: "PUT",
        contentType: "application/json",
        url: config.bfUrl+config.bfApiVersion+'/users/'+BfUser.id,
        data: JSON.stringify(updatedUser),
        dataType: "json",
        success : function(){
          // $("#form-alert").text("Great!").addClass("alert-success").removeClass("alert-danger").removeClass("hidden");
          // if ($("#form-name").val()) {
          //   $(".user-name").text("Hi, " + $("#form-name").val());
          //   $("#bfUserName").text($("#form-name").val());
          //   BfUser.name = $("#form-name").val();
          // }
          // if ($("#form-location").val()) {
          //   $(".location").text($("#form-location").val());
          // }
          // if ($("#form-biz-name").val()) {
          //   $(".biz-name").text($("#form-biz-name").val());
          // }
          // if ($("#form-linkedin").val()) {
          //   $("#profile-li").attr("href",$("#form-linkedin").val());
          // }
          // if ($("#form-gplus").val()) {
          //   $("#profile-gplus").attr("href",$("#form-gplus").val());
          // }
          // if ($("#form-facebook").val()) {
          //   $("#profile-fb").attr("href",$("#form-facebook").val());
          // }
          // if ($("#form-twitter").val()) {
          //   $("#profile-twitter").attr("href",$("#form-twitter").val());
          // }
          // if ($("#form-description").val()) {
          //   $(".profile-description").text($("#form-description").val());
          // }
          window.location.href="profile.html";
        },
        error : function(error){
          $("#form-alert").text(error).removeClass("hidden");
        }
      });
    });
  }

  // add public methods to the returned module and return it
  editProfile.init = init;
  return editProfile;
}(editProfile|| {}));

// initialize the module
editProfile.init()