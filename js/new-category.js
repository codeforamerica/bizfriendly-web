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
    $("#save-draft").click(function(){
      _submitClicked("draft")
    });
    $("#submit").click(function(){
      _submitClicked("submitted")
    });
  }

  function _checkIfLoggedIn(){
    if (!BfUser.bfAccessToken){
      $('#main').hide();
      $('.login-required').show();
    }
  }

  function _previewClicked(){
    $("#previewModal .modal-title").text($("#new-skill-name").val());
    $("#previewModal .modal-body").text($("#new-skill-description").val());
    $('#previewModal').modal();
  }

  function _submitClicked(state){
    // Validate form
    if (!$("#new-skill-description").val()) {
      $("#form-alert").text("Please enter a description for your new skill.").removeClass("hidden");
    }
    if (!$("#new-skill-name").val()) {
      $("#form-alert").text("Please enter a name for your new skill.").removeClass("hidden");
    }
    if ($("#new-skill-name").val() && $("#new-skill-description").val())
    {
      $("#form-alert").hide();
      _checkOnCategory(state);
    }
  }

  function _checkOnCategory(state){
    var filters = [{"name": "name", "op": "==", "val": $("#new-skill-name").val()}];
    $.ajax({
      url: config.bfUrl+config.bfApiVersion+'/categories',
      data: {"q": JSON.stringify({"filters": filters}), "single" : true},
      dataType: "json",
      contentType: "application/json",
      success: function(data) {
        // Service already exists, give user a warning
        if (data.num_results){
          $("#form-alert").text("A category with that name already exists").removeClass("hidden");
        } else {
          // Lesson doesn't exist, post it
          _postCategory(state);
        }
      },
      error : function(error){
        $("#form-alert").text(error).removeClass("hidden");
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
        $("#submissionModal .skill-name").text($("#new-skill-name").val());
        $('#submissionModal').modal();

        // Send an email to admins
        if (newCategory.state == "submitted"){
          $.post(config.bfUrl+"/new_content_email", newCategory, function(response){
            if (config.debug) console.log("Email sent to admins.")
            if (config.debug) console.log(response);
          })
        }
        
      },
      error : function(error){
        $("#form-alert").text(error).removeClass("hidden");
      }
    });

  }

  // add public methods to the returned module and return it
  newCategory.init = init;
  return newCategory;
}(newCategory || {}));

// initialize the module
newCategory.init()
