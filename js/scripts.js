
	$(function() {
    	var pgurl = window.location.href.substr(window.location.href.lastIndexOf("/")+1);
	    $(".navbar-nav li a").each(function(){
	        if($(this).attr("href") == pgurl)
	        {
	          	$(this).addClass("active");
          	}

			if (pgurl == "teaching-guide.html" || pgurl == "content-requests.html" || "new-category.html" || "new-skill.html" || "lesson-builder.html") {
				$("#teach-header-nav").addClass("active");
			}
			if (pgurl.indexOf("service.html") != -1) {
				$("#learn-header-nav").addClass("active");
			}
	     })
	});
