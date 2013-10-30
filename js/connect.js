var connect = (function (connect) {

  // private properties
  var user_id = BfUser.id;

  // PUBLIC METHODS
  // initialize variables and load JSON
  function init(){
    if (config.debug) console.log('init');
    // Call the API and get that lesson, pass response to _main
    _loading();
    $.getJSON(config.bfUrl+config.bfApiVersion+'/userlessons', _main);
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
    // Get top learners
    _getTopLearners(response);
    // Get Top Teachers
    _getTopTeachers(response);
    // Get latest activity
    _getLatestActivity(response);
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

  function _getTopLearners(response){
    var userCounts = {};
    var userNames = {};
    // Build an object of user ids and counts of lessons completed.
    $.each(response.objects, function(i,userLesson){
      // If user isn't in the list yet, add them.
      if (!userCounts[userLesson.user.id]) {
        userCounts[userLesson.user.id] = 0;
      }
      // If they've finished a lesson, then plus one to the count.
      if (userLesson.end_dt){
        userCounts[userLesson.user.id] += 1;
      }
      // Build an object of user ids and names
      if(!userNames[userLesson.user.id]){
        userNames[userLesson.user.id] = userLesson.user.name;
      }
    });
    // Match names to the userids
    var namedCounts = []
    $.each(userCounts,function(userId,completedLessonsCount){
      var nameCount = {}
      nameCount["name"] = userNames[userId];
      nameCount["count"] = userCounts[userId];
      namedCounts.push(nameCount);
    })
    // Sort
    namedCounts.sort(function(a,b){
      if (a.count > b.count) return -1;
      if (a.count < b.count) return 1;
      return 0;
    })
    // Add to page
    var html = "";
    $.each(namedCounts, function(i,namedCount){
      if (i < 5){ // Top five learners
        html += '<p><a>'+namedCount.name+'</a>';
        html += " has taken "+namedCount.count+" lessons.</p>";
        // html += '<hr/>';
      }
    })
    // Add to the page
    $("#top-learners").append(html);
  }

  function _getTopTeachers(response){
    teacherCounts = {};
    $.each(response.objects, function(i,userLesson){
      // If teacher isn't in the object, add it
      if (!teacherCounts[userLesson.lesson.creator_id]){
        teacherCounts[userLesson.lesson.creator_id] = 0;
      }
      if (userLesson.end_dt){
        teacherCounts[userLesson.lesson.creator_id] += 1
      }
    })
    console.log(teacherCounts);
    // Get names of teachers
    // var html = ""
    var namedCounts = [];

    $.each(teacherCounts, function(id,count){
      console.log(id, count);
      var namedCount = {}
      $.getJSON(config.bfUrl+config.bfApiVersion+'/users/'+id, function(response){
        namedCount["name"] = response.name;
        namedCount["count"] = count;
        namedCounts.push(namedCount)
        // Sort
        namedCounts.sort(function(a,b){
          if (a.count > b.count) return -1;
          if (a.count < b.count) return 1;
          return 0;
        })
        // Add to the page
        console.log(namedCounts);
        var html = "";
        $.each(namedCounts, function(i,namedCount){
          if (i < 5){ // Top five learners
            html += '<p><a>'+namedCount.name+'</a>';
            html += " has taught "+namedCount.count+" lessons.</p>";
            // html += '<hr/>';
          }
        })
        // Add to the page
        $("#top-teachers").append(html);
      })
    })
  }

  function _getLatestActivity(response){
    var recentlyCompletedLessons = []
    // Get finished lessons
    $.each(response.objects, function(i,userLesson){
      if (userLesson.end_dt){
        recentlyCompletedLessons.push(userLesson);
      }
    });
    // Sort by time
    recentlyCompletedLessons.sort(function(a,b){
      if (a.end_dt > b.end_dt) return -1;
      if (a.end_dt < b.end_dt) return 1;
      return 0;
    })
    // Add to page
    var html = ""
    $.each(recentlyCompletedLessons, function(i,userLesson){
      html += '<p><a>'+userLesson.user.name+'</a>';
      html += " recently finished ";
      html += '<a href="service.html?'+userLesson.lesson.service_id+'">'+userLesson.lesson.name+'</a></p>';
      // html += '<hr/>';
    })
    // Add to the page
    $("#latest-activity").append(html);
  }

  // add public methods to the returned module and return it
  connect.init = init;
  return connect;
}(connect|| {}));

// initialize the module
connect.init()
