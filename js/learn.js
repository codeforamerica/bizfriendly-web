var learn = (function (learn) {

  // private properties
  var debug = true;
  var htcUrl = 'http://howtocity.herokuapp.com'
  // var htcUrl = 'http://127.0.0.1:8000'
  var htcApiVer = '/api/v1'
  var categories = [];
  var featuredCategory = 'promote';
  var selectedCategory = 'featured';

  // PUBLIC METHODS
  // initialize variables and load JSON
  function init(){
    if (debug) console.log('init');
    // Call the API and get that lesson
    $.getJSON(htcUrl+htcApiVer+'/categories', _main);
  }

  // PRIVATE METHODS
  function _main(response){
    categories = response.objects;
    $(categories).each(function(i){
      if (debug) console.log(categories[i]);
      // Fill up the sidemenu
      $('#sidemenu ul').append('<li id="'+categories[i].url+'">'+categories[i].name+'</li>');
      // Style selected category
      $('#'+selectedCategory).addClass('active');
    })
    // Show Featured Lessons
    _showLesson(selectedCategory);
    $('#sidemenu li').click(_sidemenuClicked);
  }

  function _showLesson(selectedCategory){
    if (selectedCategory == 'featured'){
      selectedCategory = featuredCategory;
    }
    // console.log(categories);
    $(categories).each(function(i){
      if (selectedCategory == categories[i].url){
        $('#mainmenu .category-name').html(categories[i].name);
        $('#mainmenu .category-description').html(categories[i].description);
        $('#mainmenu table tbody').html('');
        $(categories[i].lessons).each(function(x){
          $('#mainmenu table tbody').append('<tr>');
          if (categories[i].lessons[x].url == 'facebook')
          {
            $('#mainmenu table tbody').append('<td><a href="lesson.html?'+categories[i].lessons[x].id+'"><img src="img/fb_lesson_icon.gif"><h4>'+categories[i].lessons[x].name+'</h4></a>'+categories[i].lessons[x].description+'</td>');
          }
          else {
            $('#mainmenu table tbody').append('<td><a href="lesson.html?'+categories[i].lessons[x].id+'"><h4>'+categories[i].lessons[x].name+'</h4></a>'+categories[i].lessons[x].description+'</td>');
          }  
          $('#mainmenu table tbody').append('<td>10 hours</td>');
          $('#mainmenu table tbody').append('<td>Expert</td>');
          $('#mainmenu table tbody').append('<td>5 stars</td>');
          $('#mainmenu table tbody').append('</tr>');
        });
      }
    });
  }

  function _sidemenuClicked(evt){
    console.log(evt.target.id);
    $( "#sidemenu li" ).each(function(i) {
      if ($(this).hasClass('active')){
        $(this).removeClass('active');
      }
    });
    $('#'+evt.target.id).addClass('active');
    selectedCategory = evt.target.id;
    _showLesson(selectedCategory);
  }

  // add public methods to the returned module and return it
  learn.init = init;
  return learn;
}(learn || {}));

// initialize the module
learn.init()