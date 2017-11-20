/* JS file for the main website scripts */

$(document).ready(function() {
    $(".menu_link").click(function(e) {
        e.preventDefault();
        $('html,body').animate({scrollTop: $($(this).attr('href')).offset().top - 60}, 300);
    });
});