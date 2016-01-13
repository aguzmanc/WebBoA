// ---------------------------------------------------------------------------
var MILLISECONDS_TO_AUTOCOLLAPSE_RESERVAS_BOX = 4000;
// ---------------------------------------------------------------------------
var slides = [];
var total_slides = 0;
var current_slide = 0;
var tipo_documento = "DOC_IDENTIFICACION";

var changing_slides_interval = false;
var parallaxLocked = false;
var autoCollapseTimeout;
// ---------------------= =---------------------
$(document).on('ready',function()
{
	// Header first
	initialize_header(false);

	$("#buscador_vuelos .menu").click(click_menu_buscador_vuelos);

	// UI SETUP
	$("#picker_salida").datepicker({ 
		dateFormat: 'dd MM yy',
		numberOfMonths: 2, 
		minDate: 0,
		onSelect:function(selectedDate){
			$( "#picker_regreso" ).datepicker( "option", "minDate", selectedDate );
		}
	});

	$("#picker_regreso, #picker_estado_vuelo").datepicker({ 
		dateFormat: 'dd MM yy',
		numberOfMonths: 2, 
		minDate:0
	});

	// footer UI
	$("#picker_salida_footer").datepicker({ 
		dateFormat: 'dd MM yy',
		numberOfMonths: 2, 
		minDate: 0,
		onSelect:function(selectedDate){
			$( "#picker_regreso_footer" ).datepicker( "option", "minDate", selectedDate );
		}
	});

	$("#picker_regreso_footer").datepicker({ 
		dateFormat: 'dd MM yy',
		numberOfMonths: 2, 
		minDate: 0
	});

	// support for "font-awesome" icon library
	$(".validable .calendar").datepicker("option", "prevText", '<i class="fa fa-arrow-left"></i>');
	$(".validable .calendar").datepicker("option", "nextText", '<i class="fa fa-arrow-right"></i>');
	
	// checkboxes
	$(".checkbox").click(toggle_checkbox);
	$("#cbx_acepto_terminos").click(function(){
		if($(this).hasClass("checked"))
			$("#btn_buscar_check_in").show();
		else
			$("#btn_buscar_check_in").hide();
	});

	// radio buttons
	$(".radio-button").click(toggle_radio_button);

	$("#rbtn_ida, #rbtn_ida_vuelta").click(function() {
		if($("#rbtn_ida").hasClass("checked"))
			$("#lbl_regreso,#picker_regreso").hide();
		else
			$("#lbl_regreso,#picker_regreso").show();
	});

	$(document).mousemove(handleParallaxSliders);

	$("#buscador_vuelos, #ui-datepicker-div").mouseenter(function(){
		parallaxLocked = true;
		$("#buscador_vuelos").removeClass("collapsed").addClass("expanded");
	});

	$("#buscador_vuelos").mouseleave(function(){
		parallaxLocked = false;
		return;

		if(!autoCollapseTimeout)
			autoCollapseTimeout = 
				setTimeout(function(){
					$("#buscador_vuelos").removeClass("expanded")
										 .addClass("collapsed");
					}, MILLISECONDS_TO_AUTOCOLLAPSE_RESERVAS_BOX);
	});

	$("#buscador_vuelos").mousemove(function(){
		if(autoCollapseTimeout) 
			clearTimeout(autoCollapseTimeout);

		autoCollapseTimeout = null;
	});

	// initialize service loading
	$.getJSON(SLIDES_SERVICE_URL, async_receive_slides);

	// handle "BUSCAR" from 'RESERVA DE VUELOS' button
	$("#btn_buscar_vuelos").click(search_reserva_vuelos);

	$("#btn_buscar_check_in").click(search_check_in);

	// automatic collapse of "caja de reservas"
	// autoCollapseTimeout = setTimeout(function(){$("#buscador_vuelos").removeClass("expanded").addClass("collapsed");}, MILLISECONDS_TO_AUTOCOLLAPSE_RESERVAS_BOX);

	// Dialog setup
	$("#simple_dialog .button").click(closeSimpleDialog);

	// locale dialog
	$("#locale_dialog .button").click(validateAndSelectLocaleDialog);

	// showLocaleSettingsDialog();
});
// ---------------------------------------------------------------------------
function click_menu_buscador_vuelos()
{
	var content_id = $(this).data("content");
	var content_div = $("#" + content_id);
	var buscador_vuelos = $("#buscador_vuelos");

	if(content_id=="estado_vuelo") return;

	$("#buscador_vuelos .menu").removeClass("selected");
	$(this).addClass("selected");

	$("#buscador_vuelos .content").hide();
	$("#" + content_id).show();
}
// ---------------------= =---------------------
function async_receive_slides(response)
{
	if("false"==response["success"]) {
		console.log(response["reason"]);
		return;
	}

	slides = response["slides"];

	if(slides.length==0) return;

	for(var i in slides) 
		slides[i].status = "ready";

	$("#slider").css("top","33px");
	$("#slider").html("<img id='slider_0' class='unselected' src='"+slides[0].url+"'>");
	$("#slider img").on('load',load_next_slide_image);
	slides[0].status = "loaded";
	total_slides = 1;

	lbl_val("primary",slides[0]["main_text"]);
	lbl_val("secondary_a",slides[0]["secondary_text_a"]);
	lbl_val("secondary_b",slides[0]["secondary_text_b"]);

	$("#slider_paginator li").click(select_slide_from_paginator);

	change_next_slide();
	changing_slides_interval = setInterval(change_next_slide, 6000);
}
// ---------------------= =---------------------
function load_next_slide_image()
{
	for(var i in slides) {
		if(slides[i]["status"]=="loaded") continue;

		if(slides[i]["status"]=="ready") {
			var img = new Image();
			img.id = "slider_" + i;
			img.class = "unselected";
			img.src = slides[i]["url"];
			$(img).attr("width","100%");

			slides[i]["status"] = "loading";
				
			$(img).on("load",new_slide_ready);	

			break;		
		}
	}
}
// ---------------------= =---------------------
function new_slide_ready(image)
{
	for(var i in slides) {
		if(slides[i]["status"]=="loading") {
			slides[i]["status"] = "loaded";
			total_slides++;

			// add page
			var li = document.createElement("li");
			$(li).attr("data-slide","" + i);
			$("#slider_paginator").append(li);

			$(li).click(select_slide_from_paginator);

			$("#slider_paginator").css("width",(total_slides * 32 ) + "px");
		}
	}

	$("#slider").append(image.target);

	load_next_slide_image();
}
// ---------------------= =---------------------
function change_next_slide()
{
	$("#slider > img").addClass("unselected").removeClass("selected");

	current_slide = (current_slide+1) % total_slides;
	$("#slider > img:nth-child(" + (current_slide+1) + ")").addClass("selected").removeClass("unselected");

	// paginator
	$("#slider_paginator > li").removeClass("selected");
	$("#slider_paginator > li:nth-child("+(current_slide+1)+")").addClass("selected");

	// labels
	lbl_val("primary",slides[current_slide].main_text);
	lbl_val("secondary_a",slides[current_slide].secondary_text_a);
	lbl_val("secondary_b",slides[current_slide].secondary_text_b);

	var valign = "top";
	if("text_valign" in slides[current_slide])
		valign = slides[current_slide].text_valign;

	$(".main-label").removeClass("top").removeClass("bottom").addClass(valign);

	$("#slider img").removeAttr("height"); // IE DUMB FIX!
}
// ---------------------= =---------------------
function select_slide_from_paginator()
{
	if($(this).hasClass("selected")) return; // can't change from current page

	var n = parseInt($(this).data("slide"));

	$("#slider_paginator li").removeClass("selected");
	$("#slider_paginator li:nth-child("+(n+1)+")").addClass("selected");

	current_slide = n-1;
	change_next_slide();

	if(changing_slides_interval)
		clearInterval(changing_slides_interval);

	changing_slides_interval = setInterval(change_next_slide, 6000);
}
// ---------------------= =---------------------
function lbl_val(key, value)
{
	if(value==null) value="";

	$("#lbl_" + key).html(value);
}
// ---------------------= =---------------------
function toggle_checkbox()
{
	if($(this).hasClass("checked"))
		$(this).removeClass("checked");
	else
		$(this).addClass("checked");
}
// ---------------------= =---------------------
function toggle_radio_button()
{
	var group = $(this).data("group");

	$('.radio-button[data-group="'+group+'"]').removeClass("checked");
	$(this).addClass("checked");
}
// ---------------------= =---------------------
function handleParallaxSliders(event)
{
	if(parallaxLocked) return;

	var ratio_y = (event.pageY / $(window).height());
	var ratio_x = (event.pageX / $(window).width());

	$(".main-label").css("margin-top", "-" + parseInt(ratio_y * 150) + "px");
	$("#buscador_vuelos").css("margin-top", "-" + parseInt(ratio_y * 100) + "px");
	$("#slider").css("top", (50 - parseInt(ratio_y * 70)) + "px");
}
// ---------------------= =---------------------
function search_reserva_vuelos()
{
	var select_desde = $("#select_desde");
	var select_hasta = $("#select_hasta");
	var picker_salida = $("#picker_salida");
	var picker_regreso = $("#picker_regreso");
	var select_nro_adultos = $("#select_nro_adultos");
	var select_nro_ninhos = $("#select_nro_ninhos");
	var select_nro_bebes = $("#select_nro_bebes");
	var cbx_flexible_en_fechas = $("#cbx_flexible_en_fechas");
	var select_moneda = $("#select_moneda");

	var rbtn_ida = $("#rbtn_ida");
	var rbtn_ida_vuelta = $("#rbtn_ida_vuelta");

	var parms = {
		desde: select_desde.val(),
		hasta: select_hasta.val(),
		fecha_salida: picker_salida.val(),
		fecha_regreso: picker_regreso.val(),
		solo_ida: rbtn_ida.hasClass("checked"),
		nro_adultos: select_nro_adultos.val(),
		nro_ninhos: select_nro_ninhos.val(),
		nro_bebes: select_nro_bebes.val(),
		flexible_en_fechas: cbx_flexible_en_fechas.hasClass("checked"),
		moneda: select_moneda.val()
	};

	// -----= VALIDATION PROCESS =------
	var valid_form = true
	// origen
	if(parms.desde=="") {
		activate_validation(select_desde);
		valid_form = false;
	}

	// destino
	if(parms.hasta=="") {
		activate_validation(select_hasta);
		valid_form = false;
	}

	// same dates or both without selection
	if(parms.desde == parms.hasta) {
		activate_validation(select_hasta);
		activate_validation(select_desde);
	}

	// fecha de salida
	if(parms.fecha_salida==""){
		activate_validation(picker_salida);
		valid_form = false;
	}

	// fecha_regreso
	if(false == parms.solo_ida && parms.fecha_regreso == false) {
		activate_validation(picker_regreso);
		valid_form = false;
	}

	// check crossed dates
	var raw_date, date_weight;
	if(false == parms.solo_ida){
		raw_date= picker_salida.val().split(" ");
		var date_weight_salida = (366 * parseInt(raw_date[2])) + 
						  		 (31 * parseInt(MONTHS_LANGUAGE_TABLE[raw_date[1]])) + 
						  		 parseInt(raw_date[0]);

		raw_date= picker_regreso.val().split(" ");
		var date_weight_regreso = (366 * parseInt(raw_date[2])) + 
						  		  (31 * parseInt(MONTHS_LANGUAGE_TABLE[raw_date[1]])) + 
						  		  parseInt(raw_date[0]);

		if(date_weight_regreso < date_weight_salida){
			activate_validation(picker_regreso);
			activate_validation(picker_salida);
			valid_form = false;
		}
	}

	// when no valid data, finish here
	if(false == valid_form){
		setTimeout(function() { $(".validable").removeClass("active"); },1500);
		return;
	}

	// -------= AT THIS POINT, DATA SEND BEGINS =-----------
	// --- date formatting ---
	// fecha salida
	raw_date= picker_salida.val().split(" ");
	var FIDA = raw_date[2] + MONTHS_LANGUAGE_TABLE[raw_date[1]] + raw_date[0];

	// fecha_regreso
	var FVUELTA = "";
	if(false == parms.solo_ida){
		raw_date= picker_regreso.val().split(" ");
		FVUELTA = raw_date[2] + MONTHS_LANGUAGE_TABLE[raw_date[1]] + raw_date[0];
	}

	var URL_RESERVA_VUELOS = 'https://www.resiberweb.com/PaxBOAv2/Default.aspx';

	var data = {
		KEY: 'D08D3150-580D-4E6B-83DB-C02158114D9A', // fixed value, must not change
		FIDA: FIDA,
		FVUELTA: FVUELTA,
		MONEDA: parms.moneda,
		ORIGEN: parms.desde,
		DESTINO: parms.hasta,
		ADT: parms.nro_adultos,
		CHD: parms.nro_ninhos,
		INF: parms.nro_bebes,
		IPCLIENT: "",
	};

	var form = $('<form target="_blank" method="POST" action="' + URL_RESERVA_VUELOS + '">');
	$.each(data, function(k,v){
	    form.append('<input type="hidden" name="' + k + '" value="' + v + '">');
	});

	$("#div_submit").html("").append(form); // IE FIX

	form.submit();
}
// ---------------------= =---------------------
function search_check_in()
{
	redirect("web_check_in");
}
// ---------------------= =---------------------
function showSimpleDialog(msg)
{
	if(msg != null)
		$("#simple_dialog .description").html(msg);

	$("#home, #ui_home").addClass("blured");
	$("#dialog_overlay").show();
	$("#simple_dialog").show();
}
// ---------------------= =---------------------
function showLocaleSettingsDialog() 
{
	$("#select_locale_country, #select_locale_language, #select_locale_currency").html("<option value=''>(seleccione opci&oacute;n)</option>");

	// paises
	var select = $("#select_locale_country");
	for(var i=0;i<LocaleConfig.countries.length;i++) {
		var key = LocaleConfig.countries[i].key;
		var value = LocaleConfig.countries[i].value;

		select.append("<option value='"+key+"'>"+value+"</option>");
	}

	select = $("#select_locale_language");
	for(var i=0;i<LocaleConfig.languages.length;i++) {
		var key = LocaleConfig.languages[i].key;
		var value = LocaleConfig.languages[i].value;

		select.append("<option value='"+key+"'>"+value+"</option>");
	}

	select = $("#select_locale_currency");
	for(var i=0;i<LocaleConfig.currencies.length;i++) {
		var key = LocaleConfig.currencies[i].key;
		var value = LocaleConfig.currencies[i].value;

		select.append("<option value='"+key+"'>"+value+"</option>");
	}

	$("#home, #ui_home").addClass("blured");
	$("#dialog_overlay").show();
	$("#locale_settings_dialog").show();
}
// ---------------------= =---------------------
function closeSimpleDialog()
{
	$("#dialog_overlay").hide();
	$("#dialog_overlay .dialog").hide();
	$("#home, #ui_home").removeClass("blured");
}
// ---------------------= =---------------------
function validateAndSelectLocaleDialog() 
{
	var validForm = true;
	var selCountry = $("#select_locale_country");
	var country = selCountry.val();

	var selLanguage = $("#select_locale_language");
	var language = selLanguage.val();

	var selCurrency = $("#select_locale_currency");
	var currency = selCurrency.val();

	if(country=="") {
		validForm = false;
		activate_validation(selCountry);
	}

	if(language=="") {
		validForm = false;
		activate_validation(selLanguage);
	}

	if(currency=="") {
		validForm = false;
		activate_validation(selCurrency);
	}

	// when no valid data, finish here
	if(false == validForm) {
		setTimeout(function() { $(".validable").removeClass("active"); },1500);
		return;
	}

	var sendData = {
		country: country,
		language: language,
		currency: currency
	};

	var dataStr = JSON.stringify(sendData);

	$.ajax({
		url: BoA.urls["change_locale_settings_service"],
		type: 'POST',
		dataType:'json',
		contentType: "application/json; charset=utf-8",
		data: dataStr
	});
}
// ---------------------= =---------------------
// ---------------------= =---------------------