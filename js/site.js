/* JS file for the main website scripts */

$(document).ready(function() {
    $(".nav-link").click(function(e) {
        e.preventDefault();
        $('html,body').animate({scrollTop: $($(this).attr('href')).offset().top - 70}, 300);
    });
});