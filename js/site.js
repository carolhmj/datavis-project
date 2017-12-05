/* JS file for the main website scripts */

$(document).ready(function() {
    $(".nav-link").click(function(e) {
        e.preventDefault();
        if ($(this).hasClass("reset")) {
            dc.filterAll();
            dc.redrawAll();
        }
        else {
            $('html,body').animate({scrollTop: $($(this).attr('href')).offset().top - 70}, 300);
            $(".nav-item").removeClass("active");
            $(this).parent().addClass("active");
        }
    });
});