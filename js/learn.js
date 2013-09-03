var learn = (function (learn) {

  // private properties
  // var debug = true;
  var debug = false;
  var bfUrl = 'https://app.bizfriend.ly';
  // var bfUrl = 'https://app-staging.bizfriend.ly';
  // var bfUrl = 'http://127.0.0.1:8000';
  var bfApiVersion = '/api/v1'
  var categories = [];
  var featuredCategory = 'promote';
  var selectedCategory = 'featured';

  // PUBLIC METHODS
  // initialize variables and load JSON
  function init(){
    if (debug) console.log('init');
    // Call the API and get that lesson, pass response to _main
    _loading();
    $.getJSON(bfUrl+bfApiVersion+'/categories', _main);
  }

  // PRIVATE METHODS
  function _loading(){
    // console.log('Loading');
    $('#main').toggle();
  }

  function _main(response){
    $('#loading').toggle();
    $('#main').toggle();
    categories = response.objects;
    $(categories).each(function(i){
      if (debug) console.log(categories[i]);
      // Fill up the sidemenu
      $('#sidemenu ul').append('<li id="'+categories[i].url+'">'+categories[i].name+'</li>');
      // Style selected category
      $('#'+selectedCategory).addClass('active');
    })
    // Show Featured Lessons - 'promote'
    _showLessonsFor(selectedCategory);
    $('#sidemenu li').on('click', _sidemenuClicked);
  }

  function _showLessonsFor(selectedCategory){
    if (selectedCategory == 'featured')
      selectedCategory = featuredCategory;
    
    var categoryJSON = _findCategoryByUrl(selectedCategory, categories);

    _updateTableForCategory(categoryJSON);
  }

  function _updateTableForCategory(category) {
    var html, $tbody = $('#mainmenu table tbody');

    $('#mainmenu .category-name').html(category.name);
    $('#mainmenu .category-description').html(category.description);

    $tbody.html('');
    $(category.lessons).each(function(x){
      var lesson = category.lessons[x];
      html += '<tr>';
      if (lesson.third_party_service == 'facebook'){
        html += '<td><a href="lesson.html?'+lesson.id+'"><img src="img/fb_lesson_icon.gif"><p class="lesson-name">'+lesson.name+'</p></a>'+lesson.short_description+'</td>';
      }
      else if (lesson.third_party_service == 'foursquare'){
        html += '<td><a href="lesson.html?'+lesson.id+'"><img src="img/foursquare.gif"><p class="lesson-name">'+lesson.name+'</p></a>'+lesson.short_description+'</td>';
      }
      else if (lesson.third_party_service == 'trello'){
        html += '<td><a href="lesson.html?'+lesson.id+'"><img src="img/trello.gif"><p class="lesson-name">'+lesson.name+'</p></a>'+lesson.short_description+'</td>';
      }
      else {
        html += '<td><a href="lesson.html?'+lesson.id+'"><p class="lesson-name">'+lesson.name+'</p></a>'+lesson.short_description+'</td>';
      }

      html += '<td>'+lesson.time_estimate+'</td>'
           +  '<td>'+lesson.difficulty+'</td>'
           // +  '<td>5 stars</td>'
           + '</tr>';
    });
    $tbody.html(html);
  }

  function _findCategoryByUrl(needle, haystack) {
    var response;
    $(haystack).each(function(i){
      if (haystack[i].url == needle) {
        response = haystack[i];
        return;
      }
    });
    return response;
  }

  function _sidemenuClicked(evt){
    $("#sidemenu li").removeClass('active');

    selectedCategory = evt.target.id;
    $('#'+selectedCategory).addClass('active');
    
    _showLessonsFor(selectedCategory);
  }

  // add public methods to the returned module and return it
  learn.init = init;
  return learn;
}(learn || {}));

// initialize the module
learn.init()
