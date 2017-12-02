/* JS file for the main website scripts */

$(document).ready(function() {
    $(".nav-link").click(function(e) {
        e.preventDefault();
        $('html,body').animate({scrollTop: $($(this).attr('href')).offset().top - 70}, 300);
    });
    $("#happinessFactorsContainer").css("margin-left",$("#happinessFactors").height() - 80);
    $(".dc-legend").attr("transform", "translate(50px, "+$("#happinessFactors").height() +"px)");
});