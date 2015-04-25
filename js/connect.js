var connect = (function (connect) {

  // private properties
  var user_id = BfUser.id;
  var numOfTeachers;

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
    // $('#main').toggle();
  }

  function _main(response){
    // $('#loading').toggle();
    // $('#main').toggle();
    _checkIfLoggedIn();
    // Get top learners
    _getTopLearners(response);
    // Get Top Teachers
    _getTopTeachers(response);
    // Get latest activity
    _getLatestActivity(response);
  }

  function _checkIfLoggedIn(){
    if (!BfUser.bfAccessToken){
      $("#profile-info").hide();
    } else {
      _getUserInfo(BfUser.id);
    }
  }

  function _getUserInfo(userID){
    $.getJSON(config.bfUrl+config.bfApiVersion+'/users/'+userID, function(response){
      $(".user-name").append(response.name);
      if (response.location) {
        $(".location").text(response.location);
      }
      if (response.business_name) {
        $(".biz-name").text(response.business_name);
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
      if (response.description == null) {
        $(".profile-description").html('You should <a href="edit-profile.html">add a description</a> to your profile!');
      } else {
        $(".profile-description").text(response.description);
      }
    });
  }

  function _getTopLearners(response){
    var userLessonCounts = [];
    // Build an object of user ids and counts of lessons completed.
    $.each(response.objects, function(i,userLesson){
      var userLessonCount = {};
      // If user isn't in the list yet, add them.
      var inList = false;
      $.each(userLessonCounts, function(i){
        if (userLessonCounts[i].user.id == userLesson.user.id) {
          // If they've finished a lesson, then plus one to the count.
          if (userLesson.completed){
            userLessonCounts[i].count += 1;
          }
          inList = true;
        }
      });
      if (!inList) {
        userLessonCount.user = userLesson.user;
        userLessonCount.count = 0;
        userLessonCounts.push(userLessonCount);
      }
    });
    // Sort
    userLessonCounts.sort(function(a,b){
      if (a.count > b.count) return -1;
      if (a.count < b.count) return 1;
      return 0;
    })
    // Add to page
    var html = "";
    $.each(userLessonCounts, function(i,userLessonCount){
      if (i < 5){ // Top five learners
        html += '<br/><div class="row">';
        html += '<div class="col-sm-4 col-md-5 col-lg-3 center">';
        html += '<p class="orange bold">'+userLessonCount.count;
        html += '<br/>lessons</p>';
        html += '</div>';
        html += '<div class="col-sm-8 col-md-7 col-lg-9">';
        html += '<a href="profile.html?'+userLessonCount.user.id+'">'+userLessonCount.user.name+'</a><br/>';
        if (userLessonCount.user.business_name) {
          html += userLessonCount.user.business_name;
        }
        html += '</div>';
        html += '</div>';
        html += '<hr style= margin: 1em 0 2em;>';
      }
    })
    // Add to the page
    $("#top-learners").append(html);
  }

  function _getTopTeachers(response){
    teacherCounts = {};
    var numberOfTeachers = 0;
    $.each(response.objects, function(i,userLesson){
      // If teacher isn't in the object, add it
      if (!teacherCounts[userLesson.lesson.creator_id]){
        teacherCounts[userLesson.lesson.creator_id] = 0;
        numberOfTeachers += 1;
      }
      if (userLesson.completed){
        teacherCounts[userLesson.lesson.creator_id] += 1
      }
    })
    // Get names of teachers
    namedCounts = [];
    $.each(teacherCounts, function(id,count){
      $.getJSON(config.bfUrl+config.bfApiVersion+'/users/'+id, function(response){
        namedCount = {};
        namedCount["id"] = response.id;
        namedCount["name"] = response.name;
        namedCount["business_name"] = response.business_name;
        namedCount["count"] = count;
        namedCounts.push(namedCount);
        numberOfTeachers -= 1;
        if (numberOfTeachers <= 1){
          // Sort
          namedCounts = namedCounts.sort(function(a,b){
            if (a.count > b.count) return -1;
            if (a.count < b.count) return 1;
            return 0;
          })
          // Add to the page
          var html = "";
          $.each(namedCounts, function(i,namedCount){
            if (i < 5){ // Top five learners
              console.log(namedCount);
              html += '<br/><div class="row">';
              html += '<div class="col-sm-3 col-md-3 col-lg-3 center">';
              html += '<p class="orange bold">'+namedCount.count;
              html += '<br/>lessons</p>';
              html += '</div>';
              html += '<div class="col-sm-9 col-md-9 col-lg-9">';
              html += '<a href="profile.html?'+namedCount.id+'">'+namedCount.name+'</a><br/>';
              if (namedCount.business_name) {
                html += namedCount.business_name;
              }
              html += '</div>';
              html += '</div>';
              html += '<hr style= margin: 1em 0 2em;>';
            }
          })
          $("#top-teachers").append(html);
        }
      });
    });

  }

  function _getLatestActivity(response){
    var completedLessons = []
    // Get finished lessons
    $.each(response.objects, function(i,userLesson){
      if (userLesson.completed){
        completedLessons.push(userLesson);
      }
    });
    // Sort by time
    completedLessons = completedLessons.sort(function(a,b){
      // Remove some millisecond precision for IE9 support
      var aEndDate = Date.parse(a.end_dt.slice(0,-3));
      var bEndDate = Date.parse(b.end_dt.slice(0,-3));
      if (aEndDate > bEndDate) return -1;
      if (aEndDate < bEndDate) return 1;
      return 0;
    });
    // Add to page
    var html = ""
    $.each(completedLessons, function(i,userLesson){
      if (i < 10){
        html += '<br/><p><a href="profile.html?'+userLesson.user.id+'">'+userLesson.user.name+'</a>';
        html += " recently finished ";
        html += '<a href="service.html?'+userLesson.lesson.service_id+'">'+userLesson.lesson.name+'</a></p>';
        html += '<hr style= margin: 1em 0 2em;>';
      }
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
