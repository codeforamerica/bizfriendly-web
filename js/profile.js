var profile = (function (profile) {

  // private properties
  var user_id = BfUser.id;
  var user_name = BfUser.name;
  var lessonsCompleted = [];
  var lessonsCreated = [];

  // PUBLIC METHODS
  // initialize variables and load JSON
  function init(){
    if (config.debug) console.log('init');
    // Call the API and get that lesson, pass response to _main
    _loading();
    _main();
    // $.getJSON(config.bfUrl+config.bfApiVersion+'/userlessons', _main);
  }

  // PRIVATE METHODS
  function _loading(){
    // console.log('Loading');
    $('#main').toggle();
  }

  function _main(response){
    $('#loading').toggle();
    $('#main').toggle();
    _checkIfLoggedIn();
    _getActivity();
    _showLessonsCreated();
  }

  function _checkIfLoggedIn(){
    // Check if user is logged in
    // If not, dont let them build a lesson
    // If so, show their name as the author
    if (!BfUser.bfAccessToken){
      $('#main').hide();
      $('.login-required').show();
    } else {
      // if (config.debug) console.log('Logged In');
      $(".user-name").text(BfUser.name);
    }
  }

  function _getActivity(){
    // Get # of lessons completed
    $.getJSON(config.bfUrl+config.bfApiVersion+'/userlessons', function(response){
      console.log(response.objects);
      $.each(response.objects, function(i){
        if (response.objects[i].user.id == BfUser.id){
          if (response.objects[i].end_dt){
            console.log("My completed lessons: "+response.objects[i])
            lessonsCompleted.push(response.objects[i]);
          }
        }
      })
      $("#lessons-complete").prepend('<span class="activity-number">'+lessonsCompleted.length+'</span>');
      _displayLessonsCompleted();
    });
    // Get number of requests
    $.getJSON(config.bfUrl+config.bfApiVersion+'/requests', function(response){
      var numOfRequests = 0;
      $.each(response.objects, function(i){
        if (response.objects[i].creator_id == BfUser.id){
          numOfRequests++;
        }
      })
      $("#requests").prepend('<span class="activity-number">'+numOfRequests+'</span>');
    });

    // Get number of lessons created
    $.getJSON(config.bfUrl+config.bfApiVersion+'/lessons', function(response){
      var numOfLessonsCreated = 0;
      $.each(response.objects, function(i){
        if (response.objects[i].creator_id == BfUser.id){
          lessonsCreated.push(response.objects[i]);
        }
      })
      $("#lessons-created").prepend('<span class="activity-number">'+lessonsCreated.length+'</span>');
    });

    // Get number of lessons taught
    $.getJSON(config.bfUrl+config.bfApiVersion+'/userlessons', function(response){
      var numOfLessonsTaught = 0;
      $.each(response.objects, function(i){
        if (response.objects[i].lesson.creator_id == BfUser.id){
          if (response.objects[i].end_dt){
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
        // console.log(lessonsCompleted[i].lesson.service_id);
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

  function _showLessonsCreated(){
    if (!lessonsCreated){
      html = "<h2>We see you haven't started teaching on BizFriend.ly yet.</h2>"
      html += '<button type="button" href="teach.html" class="btn btn-default">Start Teaching</button>'
      $("#services-created").append(html);
    } else {
      $.getJSON(config.bfUrl+config.bfApiVersion+'/lessons', function(response){
        $.each(response.objects, function(i, lesson){
          if (lesson.creator_id == BfUser.id){
                      console.log(BfUser.id);
          console.log(lesson.creator_id);
            _displayLesson(lesson);
          }
        });
      });
    }
  }

  function _displayLesson(lesson){
    var html = '<div class="row">';
    html += '<div class="col-lg-7"><span class="lesson-name">'+lesson.name+'</span></div>';
    html += '<div class="col-lg-2"><span class="content-type right">Lesson</span></div>';
    html += '<div class="col-lg-2 col-lg-offset-1">';
    html += '<a type="button" href="lesson-builder.html?'+lesson.id+'" class="btn btn-default">Edit</a>';
    html += '</div>';
    html += '</div>';
    $("#"+lesson.state).append(html);
  }


  // add public methods to the returned module and return it
  profile.init = init;
  return profile;
}(profile|| {}));

// initialize the module
profile.init()
