var FOOTER_ICONS_ANIMATION_FREQ = 10000; // every 10 seconds

var footerIconsAnimationInterval;
// ---------------------------------------------------------------------------
$(document).on('ready',function()
{
	animateFooterIcons();
	footerIconsAnimationInterval = setInterval(animateFooterIcons, FOOTER_ICONS_ANIMATION_FREQ);	

	$("footer .tooltip").on('mouseenter',function(){
		clearInterval(footerIconsAnimationInterval);
	});

	$("footer #icon_facebook").click(function() {
		$("#btn_redirect").attr("target","_blank")
						  .attr("href","https://www.facebook.com/bolivianaDeAviacion")[0].click();
	});

	$("footer #icon_youtube").click(function() {
		$("#btn_redirect").attr("target","_blank")
						  .attr("href","https://www.youtube.com/bolivianaDeAviacion")[0].click();
	});

	$("footer #icon_twitter").click(function() {
		$("#btn_redirect").attr("target","_blank")
						  .attr("href","https://twitter.com/BoABolivia")[0].click();
	});
});
// ---------------------------------------------------------------------------
function animateFooterIcons()
{
	animateTooltip("contacto_asistencia");
	setTimeout(function(){animateTooltip("horarios")},100);
	setTimeout(function(){animateTooltip("reservas")},200);
}
// ---------------------------------------------------------------------------
function animateTooltip(id)
{
	setTimeout(function(){
		$("footer #" + id).addClass("animating");	
	},1000);

	setTimeout(function(){
		$("footer #" + id).removeClass("animating");	
	},1350);
}
// ---------------------------------------------------------------------------
// ---------------------------------------------------------------------------
// ---------------------------------------------------------------------------