var learn = (function (learn) {
  // private properties
  var categories = [];
  var featuredCategory = 'promote';
  var selectedCategory = 'featured';

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
      if (config.debug) console.log(categories[i]);
      // Fill up the sidemenu
      $('#sidemenu ul').append('<li id="'+categories[i].url+'">'+categories[i].name+'</li>');
      // Style selected category
      $('#'+selectedCategory).addClass('active');
    })
    // Show Featured Services - 'promote'
    _showServicesFor(selectedCategory);
    $('#sidemenu li').on('click', _sidemenuClicked);
  }

  function _showServicesFor(selectedCategory){
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
    $(category.services).each(function(x){
      var service = category.services[x];
      // Only show published services in the main menu.
      if (service.state == 'published'){
        html += '<tr>';
        if (service.icon){
          html += '<td><a href="service.html?'+service.id+'"><img src="img/'+service.icon+'"><p class="lesson-name">'+service.name+'</p></a>'+service.short_description+'</td>';
        }
        else {
          html += '<td><a href="service.html?'+service.id+'"><p class="lesson-name">'+service.name+'</p></a>'+service.short_description+'</td>';
        }
        html += '</tr>';
      }
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
    
    _showServicesFor(selectedCategory);
  }

  // add public methods to the returned module and return it
  learn.init = init;
  return learn;
}(learn || {}));

// initialize the module
learn.init()
