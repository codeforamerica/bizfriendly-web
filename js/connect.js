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
    console.log(response);
    var most_recent;
    var user_lesson_count = {};
    var html;
    // Last object with a completed date
    $.each(response.objects, function(i){
      // Get the most recent completed lesson
      if (response.objects[i].end_dt){
        most_recent = response.objects[i];
      }
      // Count how many completed by each user
      if (response.objects[i].user.name in user_lesson_count){
        user_lesson_count[response.objects[i].user.name] = user_lesson_count[response.objects[i].user.name] + 1
      } else {
        user_lesson_count[response.objects[i].user.name] = 1
      }
    })
    // Display most recent lesson
    var recentHtml = most_recent["user"]["name"]
         + ' recently finished <a href="http://staging.bizfriend.ly/lesson.html?'
         + most_recent["lesson"]["id"]
         + '">' + most_recent["lesson"]["name"] + '</a>'
    $("#recent-content").html(recentHtml);
    
    // Display top learners
    if (config.debug) console.log(user_lesson_count);
    for (name in user_lesson_count){
      html += '<tr>'
           + '<td>'+name+'</td>'
           +  '<td>'+user_lesson_count[name]+'</td>'
           + '</tr>';
    }
    $('#top-learners-content table tbody').html(html);

    _showYourLessons();

  }

  function _updateTableForLessonsCompleted(user_lesson_count) {
    // $('#top-learners-content table tbody')
    for (name in user_lesson_count){
      console.log(name);
    }
  }

  function _showYourLessons(){
    // Get the lessons owned by the user
    $.getJSON(config.bfUrl+config.bfApiVersion+'/lessons', function(response){
      $.each(response.objects, function(i){
        if (response.objects[i].creator_id == user_id){
          $('#your-lessons').append('<li>'+response.objects[i].name+'</li>');
        }
      });
    });
  }


  // add public methods to the returned module and return it
  connect.init = init;
  return connect;
}(connect|| {}));

// initialize the module
connect.init()
