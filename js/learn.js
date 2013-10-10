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
      if (categories[i].state == "published"){
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
          if (services[i].state == "published"){
            // TODO: WHEN MORE THAN 4, ADD A NEW ROW
            if (x % 4 == 0) {
              html += '<br/>'
            }
              html += '<div class="col-lg-3">';
            // } else if {
              // html += '<div class="col-offset-1 col-lg-2">';
            // }
            html += '<div class="service-header">'
            html += '<img src="'+services[x].icon+'" class="left">';
            html += '<a class="service-link" href="service.html?'+services[x].id+'">'+services[x].name+'</a><br/>';
            html += '</div>';
            html += '<br/>';
            html += '<p class="service-description">'+services[x].short_description+'</p>';
            html += '</div>';
          }
        })
        html += '</div>';
        
        html += '</div>';
        html += '<hr class="col-offset-1 col-lg-10">';
      }

      $("#categories").append(html);
    })
  }

  // add public methods to the returned module and return it
  learn.init = init;
  return learn;
}(learn || {}));

// initialize the module
learn.init()
