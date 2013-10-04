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
    _checkOnCategory("draft");
  }

  function _submitClicked(){
    _checkOnCategory("published");
  }

  function _checkOnCategory(state){
    var filters = [{"name": "name", "op": "==", "val": $("#new-skill-name").text()}];
    $.ajax({
      url: config.bfUrl+config.bfApiVersion+'/categories',
      data: {"q": JSON.stringify({"filters": filters}), "single" : true},
      dataType: "json",
      contentType: "application/json",
      success: function(data) {
        // Service already exists, give user a warning
        if (data.num_results){
          $(".alert").removeClass("hidden");
        } else {
          // Lesson doesn't exist, post it
          _postCategory(state);
        }
      },
      error : function(error){
        console.log(error);
      }
    });
  }

  function _postCategory(state){
    newCategory = {
      name : $("#new-skill-name").val(),
      description : $("#new-skill-description").val(),
      state : state,
      creator_id : BfUser.id
    }
    $.ajax({
      type: "POST",
      contentType: "application/json",
      url: config.bfUrl+config.bfApiVersion+'/categories',
      data: JSON.stringify(newCategory),
      dataType: "json",
      success : function(){
        $(".skill-name").text($("#new-skill-name").val())
        $('#submissionModal').modal()
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
