var FOOTER_ICONS_ANIMATION_FREQ = 10000; // every 10 seconds

var footerIconsAnimationInterval;
// ---------------------------------------------------------------------------
$(document).on('ready',function()
{
	animateFooterIcons();
	footerIconsAnimationInterval = setInterval(animateFooterIcons, FOOTER_ICONS_ANIMATION_FREQ);	

	$("#footer_buscador_vuelos .tooltip").on('mouseenter',function(){
		clearInterval(footerIconsAnimationInterval);
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
		$("#footer_buscador_vuelos #" + id).addClass("animating");	
	},1000);

	setTimeout(function(){
		$("#footer_buscador_vuelos #" + id).removeClass("animating");	
	},1350);
}
// ---------------------------------------------------------------------------
// ---------------------------------------------------------------------------
// ---------------------------------------------------------------------------