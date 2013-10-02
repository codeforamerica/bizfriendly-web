var newCategory = (function (newCategory) {
  // private properties
  

  // PUBLIC METHODS
  // initialize variables and load JSON
  function init(){
    _main()
  }

  // PRIVATE METHODS
  function _main(response){
    // Make sure they are logged in
    _checkIfLoggedIn();
    $("#preview").click(_previewClicked);
    $("#save-draft").click(_saveDraftClicked);
    $("#submit").click(_submitClicked);
  }

  function _checkIfLoggedIn(){
    if (!BfUser.bfAccessToken){
      $('#main').hide();
      $('.login-required').show();
    }
  }

  function _previewClicked(){
    $(".modal-title").text($("#new-skill-name").val())
    $(".modal-body").text($("#new-skill-description").val())
    $('#previewModal').modal()
  }

  function _saveDraftClicked(){
    newCategory = {
      name : $("#new-skill-name").val(),
      description : $("#new-skill-description").val(),
      state : "published",
      creator_id : BfUser.id
    }
    $.ajax({
      type: "POST",
      contentType: "application/json",
      url: config.bfUrl+config.bfApiVersion+'/categories',
      data: JSON.stringify(newCategory),
      dataType: "json",
      success : function(){
        window.location.replace("submission-complete.html");
      },
      error : function(error){
        $(".alert").removeClass("hidden");
      }
    });
  }

  function _submitClicked(){
    newCategory = {
      name : $("#new-skill-name").val(),
      description : $("#new-skill-description").val(),
      state : "published",
      creator_id : BfUser.id
    }
    $.ajax({
      type: "POST",
      contentType: "application/json",
      url: config.bfUrl+config.bfApiVersion+'/categories',
      data: JSON.stringify(newCategory),
      dataType: "json",
      success : function(){
        window.location.replace("submission-complete.html");
      },
      error : function(error){
        $(".alert").removeClass("hidden");
      }
    });
  }

  // add public methods to the returned module and return it
  newCategory.init = init;
  return newCategory;
}(newCategory || {}));

// initialize the module
newCategory.init()
