var learn = (function (learn) {
  // private properties
  var categories = [];
  // var featuredCategory;
  var selectedCategory = 1;

  // PUBLIC METHODS
  // initialize variables and load JSON
  function init(){
    if (config.debug) console.log('init');
    // Call the API and get that lesson, pass response to _main
    _loading();
    $.getJSON(config.bfUrl+config.bfApiVersion+'/categories', _main);
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
      if (config.debug) console.log(categories[i].name);
      if (i % 2 == 0){
        $("#category-left").append('<a href="#'+categories[i].id+'">'+categories[i].name+'</p>')
      } else {
        $("#category-right").append('<a href="#'+categories[i].id+'">'+categories[i].name+'</p>')
      }

      var html = '<div class="category col-offset-1 col-lg-7">';
      html += '<a name="'+categories[i].id+'"></a>';
      html += '<h2 class="orange">'+categories[i].name+'</h2>';
      html += '<p>'+categories[i].description+'</p>';
      var services = categories[i].services
      html += '<div class="row">';
      $.each(services, function(x){
        if (x % 4 == 0) {
          html += '<br/>'
        }
          html += '<div class="col-lg-3">';
        // } else if {
          // html += '<div class="col-offset-1 col-lg-2">';
        // }
        html += '<img src="img/'+services[x].icon+'" class="left">';
        html += '<p class="orange bold">'+services[x].name+'</p><br/>';
        html += services[x].short_description;
        html += '</div>';
        
      })
      html += '</div>';
      
      html += '</div>';

      $("#categories").append(html);
      
      // Fill up the sidemenu
      // $('#sidemenu ul').append('<li id="'+categories[i].id+'">'+categories[i].name+'</li>');
      // Style selected category
      // $('#'+selectedCategory).addClass('active');
    })
    // Show Featured Services - 'promote'
    // _showServicesFor(selectedCategory);
    // $('#sidemenu li').on('click', _sidemenuClicked);
  }

  function _showServicesFor(selectedCategory){
    if (selectedCategory == 'featured'){
      selectedCategory = featuredCategory;
    }
    var categoryJSON = _findCategoryById(selectedCategory, categories);
    _updateTableForCategory(categoryJSON);
  }

  function _updateTableForCategory(category) {
    var html, $tbody = $('#mainmenu table tbody');
    $('#mainmenu .category-name').html(category.name);
    $('#mainmenu .category-description').html(category.description);

    $tbody.html('');
    $(category.services).each(function(x){
      var service = category.services[x];
        html += '<tr>';
        if (service.icon){
          html += '<td><a href="service.html?'+service.id+'"><img src="img/'+service.icon+'"><p class="lesson-name">'+service.name+'</p></a>'+service.short_description+'</td>';
        }
        else {
          html += '<td><a href="service.html?'+service.id+'"><p class="lesson-name">'+service.name+'</p></a>'+service.short_description+'</td>';
        }
        html += '</tr>';
    });
    $tbody.html(html);
  }

  function _findCategoryById(needle, haystack) {
    console.log(needle, haystack);
    var response;
    $(haystack).each(function(i){
      if (haystack[i].id == needle) {
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
    
    _showServicesFor(selectedCategory);
  }

  // add public methods to the returned module and return it
  learn.init = init;
  return learn;
}(learn || {}));

// initialize the module
learn.init()
