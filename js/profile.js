var profile = (function (profile) {

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
    _editProfile();
  }

  // PRIVATE METHODS
  function _loading(){
    // console.log('Loading');
    $('#main').toggle();
  }

  function _main(response){
    $('#loading').toggle();
    $('#main').toggle();

    // Who's profile?
    profileID = window.location.search.split('?')[1];
    // If id included in url, then show the public profile of that user
    if (profileID){
      _getUserInfo(profileID);
      _getActivity(profileID);
      _getContentCreated(profileID);
      // Hide draft and submitted lessons
      if (profileID != BfUser.id) {
        $("#draft").hide();
        $("#submitted").hide();
      }
    } else {
    // If not, show logged in users private profile
      _checkIfLoggedIn();
      _getUserInfo(BfUser.id);
      _getActivity(BfUser.id);
      _getContentCreated(BfUser.id);
    }
  }

  function _getUserInfo(userID){
    // Display the user profile info 
    $.getJSON(config.bfUrl+config.bfApiVersion+'/users/'+userID, function(response){
      $(".user-name").append(response.name);
      $(".location").text(response.location);
      $(".biz-name").text(response.business_name);
      $("#profile-li").attr("href",response.linkedin);
      $("#profile-gplus").attr("href",response.gplus);
      $("#profile-fb").attr("href",response.facebook);
      $("#profile-twitter").attr("href",response.twitter);
      $("#profile-site").attr("href",response.business_url);
      $(".profile-description").text(response.description);
    });
  }

  function _checkIfLoggedIn(){
    // Check if user is logged in
    if (!BfUser.bfAccessToken){
      $('#main').hide();
      $('.login-required').show();
    }
  }

  function _getActivity(userID){
    // Display number of lessons completed in the profile activity.
    $.getJSON(config.bfUrl+config.bfApiVersion+'/userlessons', function(response){
      $.each(response.objects, function(i,userLesson){
        if (userLesson.user.id == userID){
          if (userLesson.completed){
            lessonsCompleted.push(userLesson);
          }
        }
      })
      $("#lessons-complete").prepend('<span class="activity-number">'+lessonsCompleted.length+'</span>');
      _displayLessonsCompleted();
    });

    // Display number of lessons created in the profile activity.
    $.getJSON(config.bfUrl+config.bfApiVersion+'/lessons', function(response){
      var numOfLessonsCreated = 0;
      $.each(response.objects, function(i){
        if (response.objects[i].creator_id == userID){
          lessonsCreated.push(response.objects[i]);
        }
      })
      $("#lessons-created").prepend('<span class="activity-number">'+lessonsCreated.length+'</span>');
    });

    // Display number of lessons taught in the profile activity.
    $.getJSON(config.bfUrl+config.bfApiVersion+'/userlessons', function(response){
      var numOfLessonsTaught = 0;
      $.each(response.objects, function(i,userLesson){
        if (userLesson.lesson.creator_id == userID){
          if (userLesson.completed){
            numOfLessonsTaught++;
          }
        }
      })
      $("#lessons-taught").prepend('<span class="activity-number">'+numOfLessonsTaught+'</span>');
    });
  }

  function _displayLessonsCompleted(){
    // Display specific lessons completed in the learning section
    if (!lessonsCompleted){
      html = "<h2>We see you haven't started learning on BizFriend.ly yet.</h2>"
      html += "<p>Find a skill to start learning today.</p>"
      html += '<button type="button" href="learn.html" class="btn btn-default">Start Learning</button>'
      $("#services-learned").append(html);
    } else {
      $.each(lessonsCompleted, function(i){
        var html ="";
        url = config.bfUrl+config.bfApiVersion+'/services/'+lessonsCompleted[i].lesson.service_id;
        $.getJSON(url, function(response){
          html += '<div class="service-learned">';
          html += '<a href="/service.html?'+response.id+'" class="service-name">'+response.name+'</a>';
          $.each(lessonsCompleted, function(x){
            if (lessonsCompleted[x].lesson.service_id == response.id){
              html += '<br/><img src="img/green-check.png">';
              html += '<span class="lesson-name">'+lessonsCompleted[x].lesson.name+'</span>';
              html += '<span class="pull-right">'+moment(lessonsCompleted[x].end_dt).format("MMM Do YY")+'</span>';
            }
          })
          html += '</div>';
          $("#services-learned").append(html);
        })
      });
    }
  }

  function _getContentCreated(userID){
    // Gather all the content created by user
    if (!lessonsCreated){
      html = "<h2>We see you haven't started teaching on BizFriend.ly yet.</h2>"
      html += '<button type="button" href="teach.html" class="btn btn-default">Start Teaching</button>'
      $("#services-created").append(html);
    } else {
      $.getJSON(config.bfUrl+config.bfApiVersion+'/categories', function(response){
        $.each(response.objects, function(i, category){
          if (category.creator_id == userID){
            _displayContent(category, "skill"); // Called skill on web site.
          }
        });
      });
      $.getJSON(config.bfUrl+config.bfApiVersion+'/services', function(response){
        $.each(response.objects, function(i, service){
          if (service.creator_id == userID){
            _displayContent(service, "service");
          }
        });
      });
      $.getJSON(config.bfUrl+config.bfApiVersion+'/lessons', function(response){
        $.each(response.objects, function(i, lesson){
          if (lesson.creator_id == userID){
            _displayContent(lesson, "lesson");
          }
        });
      });
    }
  }

  function _displayContent(content, content_type){
    // Display the content in the teaching section.
    var html = '<div class="row">';
    html += '<div class="col-lg-7"><span class="content-name">'+content.name+'</span></div>';
    html += '<div class="col-lg-2"><span class="content-type right">'+content_type+'</span></div>';
    html += '<div class="col-lg-2 col-lg-offset-1">';
    // If its your profile, show edit buttons
    if (!profileID || profileID == BfUser.id) {
      if (content_type == "lesson"){
        html += '<a type="button" href="lesson-builder.html?'+content.id+'" class="btn btn-default">Edit</a>';
      } else if (content_type == "service") {
        html += '<a type="button" href="new-service.html?'+content.id+'" class="btn btn-default">Edit</a>';
      } else if (content_type == "skill") {
        html += '<a type="button" href="new-category.html?'+content.id+'" class="btn btn-default">Edit</a>';
      }
    };
    html += '</div>';
    html += '</div>';
    $("#"+content.state).append(html);
  }

  function _editProfile(){
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
      if (!$("#form-name").val()) {
          delete updatedUser.name;
      }
      if (!$("#form-location").val()) {
        delete updatedUser.location;
      }
      if (!$("#form-biz-name").val()) {
        delete updatedUser.business_name;
      }
      if (!$("#form-url").val()) {
        delete updatedUser.business_url;
      }
      if (!$("#form-description").val()) {
        delete updatedUser.description;
      }
      if (!$("#form-linkedin").val()) {
        delete updatedUser.linkedin;
      }
      if (!$("#form-gplus").val()) {
        delete updatedUser.gplus;
      }
      if (!$("#form-facebook").val()) {
        delete updatedUser.facebook;
      }
      if (!$("#form-twitter").val()) {
        delete updatedUser.twitter;
      }
      $.ajax({
        type: "PUT",
        contentType: "application/json",
        url: config.bfUrl+config.bfApiVersion+'/users/'+BfUser.id,
        data: JSON.stringify(updatedUser),
        dataType: "json",
        success : function(){
          $("#form-alert").text("Great!").addClass("alert-success").removeClass("alert-danger").removeClass("hidden");
          if ($("#form-name").val()) {
            $(".user-name").text("Hi, " + $("#form-name").val());
            $("#bfUserName").text($("#form-name").val());
            BfUser.name = $("#form-name").val();
          }
          if ($("#form-location").val()) {
            $(".location").text($("#form-location").val());
          }
          if ($("#form-biz-name").val()) {
            $(".biz-name").text($("#form-biz-name").val());
          }
          if ($("#form-linkedin").val()) {
            $("#profile-li").attr("href",$("#form-linkedin").val());
          }
          if ($("#form-gplus").val()) {
            $("#profile-gplus").attr("href",$("#form-gplus").val());
          }
          if ($("#form-facebook").val()) {
            $("#profile-fb").attr("href",$("#form-facebook").val());
          }
          if ($("#form-twitter").val()) {
            $("#profile-twitter").attr("href",$("#form-twitter").val());
          }
          if ($("#form-description").val()) {
            $(".profile-description").text($("#form-description").val());
          }
        },
        error : function(error){
          $("#form-alert").text(error).removeClass("hidden");
        }
      });
    });
  }

  // add public methods to the returned module and return it
  profile.init = init;
  return profile;
}(profile|| {}));

// initialize the module
profile.init()
