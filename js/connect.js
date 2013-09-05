var connect = (function (connect) {

  // private properties
  // var debug = true;
  var debug = false;
  // var bfUrl = 'https://app.bizfriend.ly';
  // var bfUrl = 'https://app-staging.bizfriend.ly';
  var bfUrl = 'http://127.0.0.1:8000';
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
    // Last object with a
    $.each(response.objects, function(i){
      if (response.objects[i].end_dt){
        most_recent = response.objects[i];
      }
    })
    $("#recent-content").html(most_recent["user"]["name"]+' recently finished '+most_recent["lesson"]["name"]);
  }


  // add public methods to the returned module and return it
  connect.init = init;
  return connect;
}(connect|| {}));

// initialize the module
connect.init()
