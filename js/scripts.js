
	$(function() {
    	var pgurl = window.location.href.substr(window.location.href.lastIndexOf("/")+1);

		console.log(pgurl)

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
	$(function () {
    $('.navbar-toggle').click(function () {
        $('.navbar-nav').toggleClass('slide-in');
        $('.side-body').toggleClass('body-slide-in');
        $('#search').removeClass('in').addClass('collapse').slideUp(200);

        /// uncomment code for absolute positioning tweek see top comment in css
        //$('.absolute-wrapper').toggleClass('slide-in');
        
    });
   
   // Remove menu for searching
   $('#search-trigger').click(function () {
        $('.navbar-nav').removeClass('slide-in');
        $('.side-body').removeClass('body-slide-in');

        /// uncomment code for absolute positioning tweek see top comment in css
        //$('.absolute-wrapper').removeClass('slide-in');

    });
});
