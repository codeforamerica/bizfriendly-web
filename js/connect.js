var connect = (function (connect) {

  // private properties
  var user_id = false;

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

    _getUserId();
    
  }

  function _updateTableForLessonsCompleted(user_lesson_count) {
    // $('#top-learners-content table tbody')
    for (name in user_lesson_count){
      console.log(name);
    }
  }

  function _getUserId(){
    var filters = [{"name": "name", "op": "==", "val": BfUser.name}];
    $.ajax({
      url: 'http://127.0.0.1:8000/api/v1/users',
      data: {"q": JSON.stringify({"filters": filters}), "single" : true},
      dataType: "json",
      contentType: "application/json",
      success: function(data) { 
        user_id = data.objects[0].id; 
        console.log(data.objects[0].id);
        _showYourLessons();
      }
    });
  }

  function _showYourLessons(){
    // Get the lessons owned by the user
    $.getJSON(config.bfUrl+config.bfApiVersion+'/lessons', function(response){
      console.log(response.objects);
      console.log(user_id);
      $.each(response.objects, function(i){
        if (response.objects[i].creator_id == user_id){
          console.log('Hello');
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
