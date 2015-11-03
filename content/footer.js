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

	$("footer #icon_facebook").click(function() { redirect('facebook');});
	$("footer #icon_youtube").click(function() { redirect('youtube');});
	$("footer #icon_twitter").click(function() { redirect('twitter');});

	$("#rbtn_ida_footer, #rbtn_ida_vuelta_footer").click(function() {
		var visibility = $("#rbtn_ida_footer").hasClass("checked") ? "hidden":"visible";
		$("#lbl_regreso_footer,#picker_regreso_footer").css("visibility",visibility);
	});

	$("#btn_buscar_itinerario").click(validar_busqueda_itinerario);
	$("footer #horarios").click(toggleFooterTooltip);
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
function validar_busqueda_itinerario()
{
	var select_origen = $("#select_origen_footer");
	var select_destino = $("#select_destino_footer");
	var picker_salida = $("#picker_salida_footer");
	var picker_regreso = $("#picker_regreso_footer");
	var rbtn_ida = $("#rbtn_ida_footer");

	var parms = {
		origen: select_origen.val(),
		destino: select_destino.val(),
		fecha_salida: picker_salida.val(),
		fecha_regreso: picker_regreso.val(),
		solo_ida: rbtn_ida.hasClass("checked")
	};

	var raw_date;
	// -----= VALIDATION PROCESS =------
	var valid_form = true;

	// origen
	if(parms.origen=="") {
		activate_validation(select_origen);
		valid_form = false;
	}

	if(parms.destino=="") {
		activate_validation(select_destino);
		valid_form = false;
	}

	// same dates or both without selection
	if(parms.origen == parms.destino) {
		activate_validation(select_origen);
		activate_validation(select_destino);

		valid_form = false;
	}

	// fecha de salida
	if(parms.fecha_salida=="") {
		activate_validation(picker_salida);
		valid_form = false;
	}

	if(false == parms.solo_ida && parms.fecha_regreso=="") {
		activate_validation(picker_regreso);
		valid_form = false;
	}

	// when no valid data, finish here
	if(false == valid_form){
		setTimeout(function() { $(".validable").removeClass("active"); },1500);
		return;
	}

	// -------= AT THIS POINT, DATA SEND BEGINS =-----------
	var data = {
		desde: parms.origen,
		hasta: parms.destino
	};
	
	// --- date formatting ---
	// fecha salida
	raw_date = picker_salida.val().split(" ");

	data["salida"] = raw_date[0] + '' + MONTHS_LANGUAGE_TABLE[raw_date[1]] + '' + raw_date[2];

	if(false == parms.solo_ida){
		raw_date = picker_regreso.val().split(" ");
		data["regreso"] = raw_date[0] + '' + MONTHS_LANGUAGE_TABLE[raw_date[1]] + '' + raw_date[2];
	}

	var RESULTS_URL = BoA.urls["flight_schedule_results"];

	var form = $('<form target="_blank" method="GET" action="' + RESULTS_URL + '">');
	$.each(data, function(k,v){
	    form.append('<input type="hidden" name="' + k + '" value="' + v + '">');
	});

	$("#div_submit").html("").append(form); // IE FIX

	form.submit();

	$("footer #horarios").removeClass("active");
}
// ---------------------------------------------------------------------------
function toggleFooterTooltip(ev)
{
	if(ev.target != this) return;

	var isActive = $(this).hasClass("active");
	$("footer .tooltip").removeClass("active");
	
	if(isActive == false)
		$(this).addClass("active");
}
// ---------------------------------------------------------------------------