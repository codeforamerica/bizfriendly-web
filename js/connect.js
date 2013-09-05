var connect = (function (connect) {

  // private properties
  // var debug = true;
  var debug = false;
  // var bfUrl = 'https://app.bizfriend.ly';
  // var bfUrl = 'https://app-staging.bizfriend.ly';
  var bfUrl = 'https://howtocity-staging.herokuapp.com'
  // var bfUrl = 'http://127.0.0.1:8000';
  // var bfUrl = 'http://0.0.0.0:5000'
  var bfApiVersion = '/api/v1'

  // PUBLIC METHODS
  // initialize variables and load JSON
  function init(){
    if (debug) console.log('init');
    // Call the API and get that lesson, pass response to _main
    _loading();
    $.getJSON(bfUrl+bfApiVersion+'/userlessons', _main);
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
         + ' recently finished <a href="http://bizfriend.ly/lesson.html?'
         + most_recent["lesson"]["id"]
         + '">' + most_recent["lesson"]["name"] + '</a>'
    $("#recent-content").html(recentHtml);
    
    // Display top learners
    if (debug) console.log(user_lesson_count);
    for (name in user_lesson_count){
      html += '<tr>'
           + '<td>'+name+'</td>'
           +  '<td>'+user_lesson_count[name]+'</td>'
           + '</tr>';
    }
    $('#top-learners-content table tbody').html(html);
  }

  function _updateTableForLessonsCompleted(user_lesson_count) {
    // $('#top-learners-content table tbody')
    for (name in user_lesson_count){
      console.log(name);
    }
  }


  // add public methods to the returned module and return it
  connect.init = init;
  return connect;
}(connect|| {}));

// initialize the module
connect.init()
