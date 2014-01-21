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
      _showLessonsCreated(profileID);
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
      _showLessonsCreated(BfUser.id);
    }
  }

  function _getUserInfo(userID){
    $.getJSON(config.bfUrl+config.bfApiVersion+'/users/'+userID, function(response){
      $(".user-name").text(response.name);
      $(".location").text(response.location);
      $(".biz-name").text(response.business_name);
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
    // Get # of lessons completed
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

    // Get number of lessons created
    $.getJSON(config.bfUrl+config.bfApiVersion+'/lessons', function(response){
      var numOfLessonsCreated = 0;
      $.each(response.objects, function(i){
        if (response.objects[i].creator_id == userID){
          lessonsCreated.push(response.objects[i]);
        }
      })
      $("#lessons-created").prepend('<span class="activity-number">'+lessonsCreated.length+'</span>');
    });

    // Get number of lessons taught
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

  function _showLessonsCreated(userID){
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

  // add public methods to the returned module and return it
  profile.init = init;
  return profile;
}(profile|| {}));

// initialize the module
profile.init()
