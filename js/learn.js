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

        var html = '<div class="category col-md-offset-1 col-lg-offset-1 col-lg-10"> \
        <a name="'+categories[i].id+'"></a> \
        <h2 class="orange">'+categories[i].name+'</h2> \
        <p>'+categories[i].description+'</p> \
        <div class="row">';

        var services = categories[i].services;
        $.each(services, function(x){
          if (services[x].state == "published"){
            if (config.debug) console.log("SERVICE STATE: "+services[x].state);
            // TODO: WHEN MORE THAN 4, ADD A NEW ROW
            // if (x % 4 == 0) {
            //   html += '</div><div class="row">';
            // }
              html += '<div class="col-sm-3 col-md-3 col-lg-3"> \
                        <div class="service-header"> \
                          <img src="'+services[x].icon+'" class="left"> \
                          <a class="service-link" href="service.html?'+services[x].id+'">'+services[x].name+'</a><br/> \
                        </div> \
                        <br/> \
                        <p class="service-description">'+services[x].short_description+'</p> \
                      </div>';
          }
        })
        html += '<div id="teach-callout" class="col-xs-10 col-sm-3 col-md-3 col-lg-3"> \
                  <div class="row"> \
                    <div class="col-xs-3 col-sm-3 col-md-3 col-lg-3"> \
                      <img src="img/teach_gray.png"> \
                    </div> \
                    <div class="col-xs-9 col-sm-9 col-md-9 col-lg-9"> \
                      <p>Already '+categories[i].name+'?</p><br/> \
                      <p><a href="teach.html">Help teach other business owners!</a></p> \
                    </div> \
                  </div> \
                </div> \
              </div> \
            </div> \
            <hr class="col-lg-offset-1 col-lg-10">';
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
