var newService = (function (newService) {
  // private properties
  var editingExisitingService = false;
  var serviceId;

  // PUBLIC METHODS
  // initialize variables and load JSON
  function init(){
    _main()
  }

  // PRIVATE METHODS
  function _main(response){
     // Make sure they are logged in
    _checkIfLoggedIn();
    // Get all the existing categories
    _getCategories();
    _newOrEdit();
    // Controllers
    _iconUpload();
    _imageUpload();
    $("#add-tips").click(_addTipsClicked);
    $("#add-resources").click(_addResourcesClicked);
    $("#preview").click(_previewClicked);
    $("#save-draft").click(function(){
      _submitClicked("draft");
    });
    $("#submit").click(function(){
      _submitClicked("submitted");
    });
    window.onscroll = _fixOldTips;
  }

  function _checkIfLoggedIn(){
    if (!BfUser.bfAccessToken){
      $('#main').hide();
      $('.login-required').show();
    }
  }

  function _getCategories(){
    // Get the existing categories
    $.get(config.bfUrl+config.bfApiVersion+'/categories', function(response){
      $.each(response.objects, function(i){
        $('#category-id').append('<option value='+response.objects[i].id+'>'+response.objects[i].name+'</option>');
      })
      $('#category-id').append('<option value="add-new-category">Add new skill</option>');
    }).done(function(){
      //$('.selectpicker').selectpicker('refresh');
      _watchCategory();
    })
  }

  function _watchCategory(){
    // Add a listener to the category menu.
    // If they choose to add a new category, open that page.
    $("#new-category-form").on("change", "#category-id", function(){
      if ($("#category-id").val() == "add-new-category"){
        window.open("http://bizfriend.ly/new-category.html");
      }
    });
  }

  function _newOrEdit(){
    if (window.location.search.split('?')[1]){
      editingExisitingService = true;
      _getExistingService();
    }

  }

  function _getExistingService(){
    serviceId = window.location.search.split('?')[1];
    $.getJSON(config.bfUrl+config.bfApiVersion+'/services/'+serviceId, function(response){
      if (config.debug) console.log(response);
      $("#new-service-name").val(response.name);
      $("#new-service-url").val(response.url);
      $("#new-service-short-description").val(response.short_description);
      $("#new-service-long-description").val(response.long_description);
      // Parse and display the tips
      $.each(response.tips.split("</li>"), function(i,tip){
        i = i + 1;
        $("#tips"+i).val(tip.replace("<li>",""));
      })
      // Parse and display the additional resources
      $.each(response.additional_resources.split("</a></li>"), function(i,resource){
        i = i + 1;
        $("#additional-resources-name"+i).val(resource.replace(/<li><a href=".*">/,""));
        $("#additional-resources-url"+i).val(resource.replace(/<li><a href="(.*)">.*/,"$1"));
      })

      if (response.icon) {
        $("#uploaded-icon").append("<img src="+response.icon+">");
      }
      $("#video-embed").val(response.media);

      $("#category-id").val(response.category_id);
      categoryIDVariable=response.category_id;
      //$('.selectpicker').selectpicker('refresh');

    });
  }

  function _iconUpload(){
    $("#icon-upload").attr("data-url",config.bfUrl+"/image_upload?icon");
    $('#icon-upload').fileupload({
        dataType: 'json',
        done: function (e, data) {
            $.each(data.result.files, function (index, file) {
                // console.log(index);
                // console.log(file);
                $("#icon-upload-form").remove();
                $("#uploaded-icon").html('<img src="'+file.url+'">');
            });
        },
        progressall: function (e, data) {
          var progress = parseInt(data.loaded / data.total * 100, 10);
          $('#icon-upload-progress .progress-bar').css(
              'width',
              progress + '%'
          );
        },
        error : function(response){
          console.log(response);
          if (response.status != 200){
            response = $.parseJSON(response.responseText);
            $('#icon-upload-form').append(response["message"]).addClass("alert alert-danger");
          }
        }
    });
  }

  function _imageUpload(){
    $("#image-upload").attr("data-url",config.bfUrl+"/image_upload?service");
    $('#image-upload').fileupload({
        dataType: 'json',
        done: function (e, data) {
          var url = 'https://bizfriendly-img-uploads.s3.amazonaws.com/'+data.files[0].name;
          $("#image-upload-form").remove();
          $("#uploaded-image").html('<img src="'+url+'">');
        },
        progressall: function (e, data) {
          var progress = parseInt(data.loaded / data.total * 100, 10);
          $('#image-upload-progress .progress-bar').css(
              'width',
              progress + '%'
          );
        },
        error : function(response){
          console.log(JSON.stringify(response));
          if (response.status != 200){
            response = $.parseJSON(response.responseText);
            $('#image-upload-form').append(response["message"]).addClass("alert alert-danger");
          }
        }
    });
  }

  function _addTipsClicked(){
    if ($("#tips2").hasClass("hidden")){
      $("#tips2").removeClass("hidden");
    } else {
      if ($("#tips3").hasClass("hidden")){
        $("#tips3").removeClass("hidden");
        $("#add-tips").remove();
      }
    }   
  }

  function _addResourcesClicked(){
    if ($("#additional-resources-name2").hasClass("hidden")){
      $("#additional-resources-name2").removeClass("hidden");
      $("#additional-resources-url2").removeClass("hidden");
    } else {
      if ($("#additional-resources-name3").hasClass("hidden")){
        $("#additional-resources-name3").removeClass("hidden");
        $("#additional-resources-url3").removeClass("hidden");
      } else {
          if ($("#additional-resources-name4").hasClass("hidden")){
            $("#additional-resources-name4").removeClass("hidden");
            $("#additional-resources-url4").removeClass("hidden");
          } else {
            if ($("#additional-resources-name5").hasClass("hidden")){
              $("#additional-resources-name5").removeClass("hidden");
              $("#additional-resources-url5").removeClass("hidden");
              $("#add-resources").remove();
            }
          }
      }
    }
  }

  function _getAdditionalResources(){
    var addResourcesHtml = '';
    addResourcesHtml += '<li><a href="'+$("#additional-resources-url1").val()+'">'+$("#additional-resources-name1").val()+'</a></li>';
    if ($("#additional-resources-name2").val()){
      addResourcesHtml += '<li><a href="'+$("#additional-resources-url2").val()+'">'+$("#additional-resources-name2").val()+'</a></li>';
    }
    if ($("#additional-resources-name3").val()){
      addResourcesHtml += '<li><a href="'+$("#additional-resources-url3").val()+'">'+$("#additional-resources-name3").val()+'</a></li>';
    }
    if ($("#additional-resources-name4").val()){
  addResourcesHtml += '<li><a href="'+$("#additional-resources-url4").val()+'">'+$("#additional-resources-name4").val()+'</a></li>';
    }
    if ($("#additional-resources-name5").val()){
      addResourcesHtml += '<li><a href="'+$("#additional-resources-url5").val()+'">'+$("#additional-resources-name5").val()+'</a></li>';
    }
    return (addResourcesHtml);
  }

  function _getTips(){
    var tips = "";
    tips += '<li>'+$("#tips1").val()+'</li>';
    if ($("#tips2").val()){
      tips += '<li>'+$("#tips2").val()+'</li>'; 
    }
    if ($("#tips3").val()){
      tips += '<li>'+$("#tips3").val()+'</li>';
    }
    return (tips);
  }

  function _previewClicked(){
    $("#previewModal .modal-title").text($("#new-service-name").val());
    $("#previewModal .modal-body").append("URL: "+$("#new-service-url").val()+"<br/>");
    $("#previewModal .modal-body").append("Short Description: "+$("#new-service-short-description").val()+"<br/>");
    $("#previewModal .modal-body").append("Long Description: "+$("#new-service-long-description").val()+"<br/>");
    $("#previewModal .modal-body").append("Tips 1: "+$("#tips1").val()+"<br/>");
    if ($("#tips2").val()){
      $("#previewModal .modal-body").append("Tips 2: "+$("#tips2").val()+"<br/>");
    }
    if ($("#tips3").val()){
      $("#previewModal .modal-body").append("Tips 3: "+$("#tips3").val()+"<br/>");
    }
    $("#previewModal .modal-body").append("Additional Resources 1: "+$("#additional-resources-name1").val()+"<br/>");
    $("#previewModal .modal-body").append("Additional Resources URL 1: "+$("#additional-resources-url1").val()+"<br/>");
    if ($("#additional-resources-name2").val()){
      $("#previewModal .modal-body").append("Additional Resources 2: "+$("#additional-resources-name2").val()+"<br/>");
      $("#previewModal .modal-body").append("Additional Resources URL 2: "+$("#additional-resources-url2").val()+"<br/>");
    }
    if ($("#additional-resources-name3").val()){
      $("#previewModal .modal-body").append("Additional Resources 3: "+$("#additional-resources-name3").val()+"<br/>");
      $("#previewModal .modal-body").append("Additional Resources URL 3: "+$("#additional-resources-url3").val()+"<br/>");
    }
    if ($("#additional-resources-name4").val()){
      $("#previewModal .modal-body").append("Additional Resources 4: "+$("#additional-resources-name4").val()+"<br/>");
      $("#previewModal .modal-body").append("Additional Resources URL 4: "+$("#additional-resources-url4").val()+"<br/>");
    }
    if ($("#additional-resources-name5").val()){
      $("#previewModal .modal-body").append("Additional Resources 5: "+$("#additional-resources-name5").val()+"<br/>");
      $("#previewModal .modal-body").append("Additional Resources URL 5: "+$("#additional-resources-url5").val()+"<br/>");
    }
    $("#previewModal .modal-body").append("Uploaded Icon: "+$("#uploaded-icon").html()+"<br/>");
    $("#previewModal .modal-body").append("Uploaded Image: "+$("#uploaded-image").html()+"<br/>");
    $("#previewModal .modal-body").append("Vimeo Embed: "+$("#video-embed").val()+"<br/>");
    
    $('#previewModal').modal()
  }

  function _submitClicked(state){
    // Validate form
    if (!$("#new-service-name").val()) {
      $("#form-alert-name").append("Please enter a name <br>").removeClass("hidden");
    }
    if (!$("#new-service-url").val()) {
      $("#form-alert-name").append(" Please enter a URL <br>").removeClass("hidden");
    }
    if (!$("#new-service-short-description").val()) {
      $("#form-alert-name").append(" Please enter short_description <br>").removeClass("hidden");
    }
    if (!$("#tips1").val()) {
      $("#form-alert-name").append(" Please enter Tips to keep in mind <br>").removeClass("hidden");
    }
    if (!$("#additional-resources-name1").val()) {
      $("#form-alert-name").append(" Please enter additional_resources <br>").removeClass("hidden");
    }
    if (!$("#icon-upload-form").val()) {
      $("#form-alert-name").append(" Please enter service icon <br>").removeClass("hidden");
    }

  else {
      $("#form-alert").hide();
      if (editingExisitingService) {
        _putService(state);
      } else {
        _checkForService(state);
      }
    }
  }

  function _checkForService(state){
    // Post draft lesson
    var filters = [{"name": "name", "op": "==", "val": $("#new-service-name").val()}];
    $.ajax({
      url: config.bfUrl+config.bfApiVersion+'/services',
      data: {"q": JSON.stringify({"filters": filters}), "single" : true},
      dataType: "json",
      contentType: "application/json",
      success: function(data) {
        // Service already exists, give user a warning
        console.log(JSON.stringify(data));
        if (data.num_results){
          $(".alert").removeClass("hidden");
        } else {
          // Lesson doesn't exist, post it
          _postService(state);
        }
      },
      error : function(error){
        console.log(JSON.stringify(error));
      }
    });
  }

  function _postService(state){
    // If no video embed, use an image instead.
    var media = $("#video-embed").val();
    if (!media) {
      if ($("#uploaded-image img").attr('src')){
        media = $("#uploaded-image").html();
      }
    }
    newService = {
      name : $("#new-service-name").val(),
      url : $("#new-service-url").val(),
      icon : $("#uploaded-icon img").attr("src"),
      short_description : $("#new-service-short-description").val(),
      long_description : $("#new-service-long-description").val(),
      additional_resources : _getAdditionalResources(),
      tips : _getTips(),
      media : media,
      state : state,
      creator_id : BfUser.id,
      category_id : $("#category-id").val()
    }
    console.log(JSON.stringify(newService));

    $.ajax({
      type: "POST",
      contentType: "application/json",
      url: config.bfUrl+config.bfApiVersion+'/services',
      data: JSON.stringify(newService),
      dataType: "json",
      success : function(){
        $(".service-name").text($("#new-service-name").val())
        $('#submissionModal').modal()

        // Send an email to admins
        if (newService.state == "submitted"){
          $.post(config.bfUrl+"/new_content_email", newService, function(response){
            if (config.debug) console.log("Email sent to admins.")
            if (config.debug) console.log(response);
          })
        }
        
      },
      error : function(error){
        $(".alert").removeClass("hidden");
        console.log(JSON.stringify(error));
      }
    });
  }

  function _fixOldTips(){
    console.log($("#category-id").val());
    $("#category-id").val(categoryIDVariable);
    if ($("#tips2").val()){
      $("#tips2").removeClass("hidden"); 
    }
    if ($("#tips3").val()){
      $("#tips3").removeClass("hidden");
    }
    $('.selectpicker').selectpicker('refresh');
  }

  function _putService(state){
    // If no video embed, use an image instead.
    var media = $("#video-embed").val();
    if (!media) {
      if ($("#uploaded-image img").attr('src')){
        media = $("#uploaded-image").html();
      }
    }
    existingService = {
      name : $("#new-service-name").val(),
      url : $("#new-service-url").val(),
      icon : $("#uploaded-icon img").attr("src"),
      short_description : $("#new-service-short-description").val(),
      long_description : $("#new-service-long-description").val(),
      additional_resources : _getAdditionalResources(),
      tips : _getTips(),
      media : media,
      state : state,
      creator_id : BfUser.id,
      category_id : $("#category-id").val()
    }
    console.log(JSON.stringify(existingService));

    $.ajax({
      type: "PUT",
      contentType: "application/json",
      url: config.bfUrl+config.bfApiVersion+'/services/'+serviceId,
      data: JSON.stringify(existingService),
      dataType: "json",
      success : function(){
        $(".service-name").text($("#new-service-name").val())
        $('#submissionModal').modal()

        // Send an email to admins
        if (existingService.state == "submitted"){
          $.post(config.bfUrl+"/new_content_email", existingService, function(response){
            if (config.debug) console.log("Email sent to admins.")
            if (config.debug) console.log(response);
          })
        }
        
      },
      error : function(error){
        $(".alert").removeClass("hidden");
        console.log(JSON.stringify(error));
      }
    });
  }

  // add public methods to the returned module and return it
  newService.init = init;
  return newService;
}(newService || {}));

// initialize the module
newService.init()
