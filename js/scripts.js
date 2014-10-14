
	$(function() {
    	var pgurl = window.location.href.substr(window.location.href.lastIndexOf("/")+1);
	    $(".navbar-nav li a").each(function(){
	        if($(this).attr("href") == pgurl)
	        {
	          	$(this).addClass("active");
          	}

          	if (pgurl == "teaching-guide.html" || pgurl == "content-requests.html")
          		$("#teach").addClass("active");
	     })
	});