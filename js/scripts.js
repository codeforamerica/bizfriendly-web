
	$(function() {
    	var pgurl = window.location.href.substr(window.location.href.lastIndexOf("/")+1);
	    $(".navbar-nav li a").each(function(){
	        if($(this).attr("href") == pgurl)
	        {
	          	$(this).addClass("active");
          	}

			if (pgurl == "teaching-guide.html" || pgurl == "content-requests.html" || pgurl == "new-category.html" || pgurl == "new-skill.html" || pgurl == "lesson-builder.html" || pgurl == "new-service.html") {
				$("#teach-header-nav").addClass("active");
			}
			if (pgurl.indexOf("service.html?") != -1) {
				$("#learn-header-nav").addClass("active");
			}
	     })
	});
