// ---------------------= =---------------------
/***** CONFIG PARAMETERS *****/
var CACHE_DISABLED = false;
var IGNORED_TARIFAS_BY_FARE_CODE = ["SSENIOR"];
var ALLOWED_TARIFAS_BY_ESTADO = ['A'];
// ---------------------= =---------------------
var searchParameters = {
	origen : "", 
	destino : "", 
	fechaIda : "", 
	fechaVuelta : null
};

var waitingForFlightsData = false;

var currentDateIda = "";
var currentDateVuelta = "";

var todayStr = "";
var rawDatesCache = {ida:null,vuelta:null};

var seleccionVuelo = {
	ida: 			null,
	vuelta: 		null, 

	adulto: 		{
		num: 			0,
		ida:{
			precioBase: 0,
			tasas: 		{}
		},
		vuelta:{
			precioBase: 0,
			tasas: 		{}
		},
		precioTotal: 		0
	},
	ninho: 		{
		num: 			0,
		ida:{
			precioBase: 0,
			tasas: 		{}
		},
		vuelta:{
			precioBase: 0,
			tasas: 		{}
		},
		precioTotal: 	0
	},
	infante:		{
		num: 			0,
		ida:{
			precioBase: 0,
			tasas: 		{}
		},
		vuelta:{
			precioBase: 0,
			tasas: 		{}
		},
		precioTotal: 	0
	},
	// adultosMayores: 0
	precioTotal:    	0
};

var tasasPorPasajero = {
	adulto:  [],
	ninho:   [],
	infante: []
};

var tasas = {ida:{},vuelta:{}};

var allOptions = {};

var currencies = {euro:"&euro;", usd:"USD"};

var cities = {
	LPB: "La Paz",
	CIJ: "Cobija",
	CBB: "Cochabamba",
	MAD: "Madrid",
	VVI: "Santa Cruz",
	SRE: "Sucre",
	TJA: "Tarija",
	TDD: "Trinidad",
	EZE: "Buenos Aires",
	GRU: "Sao Paulo"
};

var airports = {
	LPB: "Aeropuerto Internacional El Alto",
	CIJ: "Aeropuerto Capit&aacute;n Anibal Arab",
	CBB: "Aeropuerto Internacional Jorge Wilstermann",
	MAD: "Aeropuerto Internacional Adolfo Su&aacute;z Madrid-Barajas",
	VVI: "Aeropuerto Internacional Viru Viru",
	SRE: "Aeropuerto Juana Azurduy de Padilla",
	TJA: "Aeropuerto Capitán Oriel Lea Plaza",
	TDD: "Aeropuerto Teniente Jorge Henrich Arauz",
	EZE: "Aeropuerto Internacional Ministro Pistarini",
	GRU: "Aeropuerto Internacional de Guarulhos"
};

var compartmentNames = {"2":"Business","3":"Econ&oacute;mica"};
// ---------------------= =---------------------
/********************************************************* 
 ********************** UI HANDLERS **********************
 **********************************************************/
$(document).on('ready',function()
{
	if($("#ui_reserva_vuelos").data("mode") !="widget"){
		initialize_header(true);
		initialize_ui_sections({anchor_section_headers:false});	
	}

	todayStr = formatCompactDate(new Date()); // today 

	handleInitialRequest();

	/*----------= UI SETUP HANDLERS =-----------*/
	$("#widget_cambiar_vuelo #btn_cambiar_vuelo").click(toggleWidgetCambiarVuelo);
	$("#widget_cambiar_vuelo .form .radio-button").click(toggleRbtnIdaVuelta);
	$("#widget_resumen_reserva td.selector-pax ul li").click(changeNumPassengers);
	$("#btn_borrar_ida").click(deleteIda);
	$("#btn_borrar_vuelta").click(deleteVuelta);
	$("#btn_buscar_vuelo").click(validateSearch);

	// DATE PICKERs SETUP
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
		minDate: 0
	});

	$("#btn_validar_vuelos").click(validateSeleccionVuelo);
	$("#btn_volver_vuelos").click(backToFlightStage);
	$("#btn_validar_pasajeros").click(validatePassengers);

	// BANKS SETUP
	var tblBanks = $("#info_pago_bancos .banks-container");
	tblBanks.find("tbody").html(""); //clear
	var columnsCreated = 0;
	var columnsPerRow = BoA.banks.columnsPerRow;
	var row;

	for(var bankKey in BoA.banks) {
		if(bankKey == 'columnsPerRow') // special value
			continue;

		var bank = BoA.banks[bankKey];

		if(false == bank.enabled) 
			continue;

		if(columnsCreated==0) {
			row = document.createElement("tr");
			tblBanks.find("tbody").append(row);

			// console.log(tblBanks[0]);
		}

		var cell = document.createElement("td");
		row.appendChild(cell);
		$(cell).append("<a href='"+bank.url+"'><div class='bank "+bankKey+"'></div></a>");

		columnsCreated = (columnsCreated+1) % columnsPerRow;
	}

	// WINDOW SETUP
	$(window).resize(checkResultsTableWidth);
	handleScroll();
	$(window).scroll(handleScroll);

	setInterval(checkSearchWidgetAvailability, 200);

	flapperTotal = $("#precio_total").flapper({
		width: 7,
		align: 'right'
	});
}); // init
// ---------------------= =---------------------
function handleScroll(){
	var h = $(this).scrollTop();

	$("#ui_resultados_vuelos .header").css("margin", ((h>50)?(h-50):0)+"px 0 0 0");
	// $("#widget_resumen_reserva").css("margin",((h>145)?(h-35):110)+"px 0 0 0");
}
// ---------------------= =---------------------
function toggleRbtnIdaVuelta()
{
	var par = this.parentNode;
	while(false == $(par).hasClass("form") )
		par = par.parentNode;

	$(par).find(".radio-button").removeClass("checked");
	$(this).addClass("checked");

	if(this.id == "rbtn_ida_vuelta")
		$("#picker_regreso").show();
	else
		$("#picker_regreso").hide();
}
// ---------------------= =---------------------
function changeDay()
{
	deleteIda();
	deleteVuelta();

	var table = this;

	while(false == $(table).is("table")) // find parent table
		table = table.parentNode;

	waitingForFlightsData = true;

	var isSalida = ($(table).data("salida_regreso") == "salida");

	$(table).find(".day-selector").removeClass("selected");

	$(this).addClass("selected");

	var selected_date = $(this).data("date");

	if(isSalida){
		currentDateIda = selected_date;
		fillTableWithLoading($("#tbl_salida")[0]);
	}
	else {
		currentDateVuelta = selected_date;
		fillTableWithLoading($("#tbl_regreso")[0]);
	}

	requestFlights(currentDateIda, currentDateVuelta);
}
// ---------------------= =---------------------
function toggleWidgetCambiarVuelo()
{
	if($(this).hasClass("searching")) return;

	var widget = $(this.parentNode);

	if(widget.hasClass("collapsed")) {
		widget.removeClass("collapsed").addClass("expanded");
	} else {
		widget.removeClass("expanded").addClass("collapsed");
	}
}
// ---------------------= =---------------------
function selectTarifa()
{
	var row = this.parentNode;
	var opcCode = $(row).data("opc_code");
	var opcion = allOptions[opcCode];
	var compartment = parseInt($(this).data("compartment"));

	if($(this).find(".rbtn").hasClass("checked"))
		return;

	var table = row.parentNode;
	while(false == $(table).is("table")) // find parent table
		table = table.parentNode;

	var tipo = $(table).data("tipo");

	if(tipo=="ida") {
		seleccionVuelo.ida = {};
		seleccionVuelo.ida.opcCode = opcCode;
		seleccionVuelo.ida.compartment = compartment;
		$("#empty_ida_slot").css("display","none");
	} else {
		seleccionVuelo.vuelta = {};
		seleccionVuelo.vuelta.opcCode = opcCode;	
		seleccionVuelo.vuelta.compartment = compartment;

		$("#empty_ida_slot").css("display",
			seleccionVuelo.ida == null ? "block":"none");
	}

	$(table).find(".flights-option-row").removeClass("selected");
	$(row).addClass("selected");

	$(table).find(".flight-details").removeClass("expanded").addClass("collapsed");

	$(table).find(".flight-details[data-opc_code='"+opcCode+"']")
		.removeClass("collapsed")
 		.addClass("expanded");

	$(table).find(".rbtn").removeClass("checked");
	$(this).find(".rbtn").addClass("checked");
	
	var tblSeleccion = $("#tbl_seleccion_" + tipo + ", #tbl_seleccion_" + tipo + "_small");

	tblSeleccion.find(".cell-cod-origen-destino h1").html(opcion.origen + " - " + opcion.destino);
	tblSeleccion.find(".cell-duracion").html(formatExpandedTime(opcion.duracionVuelo) + " vuelo");
	
	$("#tbl_seleccion_" + tipo).find(".cell-fecha").html(formatExpandedDate(opcion.vuelos[0].fecha));
	$("#tbl_seleccion_" + tipo + "_small").find(".cell-fecha").html(formatShortDate(opcion.vuelos[0].fecha));

	$("#tbl_seleccion_" + tipo).find(".cell-hora span").html("Salida:<br>" + formatTime(opcion.horaSalida));
	$("#tbl_seleccion_" + tipo + "_small").find(".cell-hora span").html(formatTime(opcion.horaSalida));

	$("#tbl_seleccion_" + tipo).css("display","block");
	$("#tbl_seleccion_" + tipo).addClass("changed");

	$("#overlay_"+tipo).css("display","block");
	$("#btn_borrar_ida").attr("data-opc_code",opcCode);

	$("#div_empty_vuelo").css("display","none");

	updateAllPrices();

	checkCompleteSeleccionVuelo();

	setTimeout(function() {
		tblSeleccion.removeClass("changed");
	},100);
}
// ---------------------= =---------------------
function validateSearch()
{
	var selectOrigen = $("#select_origen");
	var selectDestino = $("#select_destino");
	var rbtnIda = $("#rbtn_ida");
	var rbtnIdaVuelta = $("#rbtn_ida_vuelta");
	var pickerSalida = $("#picker_salida");
	var pickerRegreso = $("#picker_regreso");

	var parms = {
		origen: selectOrigen.val(),
		destino: selectDestino.val(),
		fechaIda: pickerSalida.val(),
		fechaVuelta: pickerRegreso.val(),
		solo_ida: rbtnIda.hasClass("checked")
	};

	// -----= VALIDATION PROCESS =------
	var valid_form = true;

	// origen
	if(parms.origen=="") {
		activate_validation(selectOrigen);
		valid_form = false;
	}

	if(parms.destino=="") {
		activate_validation(selectDestino);
		valid_form = false;
	}

	// same dates or both without selection
	if(parms.origen == parms.destino) {
		activate_validation(selectOrigen);
		activate_validation(selectDestino);

		valid_form = false;
	}

	// fecha de salida (ida)
	if(parms.fechaIda == "") {
		activate_validation(pickerSalida);
		valid_form = false;
	}

	if(false == parms.solo_ida && parms.fechaVuelta=="") {
		activate_validation(pickerRegreso);
		valid_form = false;
	}

	// when no valid data, finish here
	if(false == valid_form){
		setTimeout(function() { $(".validable").removeClass("active"); },1500);
		return;
	}

	// -------= AT THIS POINT, A NEW REQUEST BEGINS =-----------
	searchParameters.origen = parms.origen;
	searchParameters.destino = parms.destino;

	// fecha salida
	var rawDate = pickerSalida.val().split(" ");
	searchParameters.fechaIda = rawDate[2] +""+ MONTHS_LANGUAGE_TABLE[rawDate[1]] +""+ rawDate[0];
	
	// fecha retorno
	if(parms.solo_ida){
		searchParameters.fechaVuelta = null
	} else {
		rawDate = pickerRegreso.val().split(" ");
		searchParameters.fechaVuelta = rawDate[2] +""+ MONTHS_LANGUAGE_TABLE[rawDate[1]] +""+ rawDate[0];
	}

	requestSearchParameters(searchParameters);

	$("#widget_cambiar_vuelo").removeClass("expanded").addClass("collapsed");
	// remover vuelos seleccionados
	deleteIda();
	deleteVuelta();
}
// ---------------------= =---------------------
function checkCompleteSeleccionVuelo()
{
	var btn = $("#btn_validar_vuelos");

	if(seleccionVuelo.ida == null || 
	  (seleccionVuelo.adulto.num == 0 && seleccionVuelo.ninho.num==0 && seleccionVuelo.infante.num==0 ))
		btn.hide();
	else
		btn.show();
}
// ---------------------= =---------------------
function deleteIda()
{
	if(seleccionVuelo.ida == null)
		return;

	var opcCode = seleccionVuelo.ida.opcCode;
	seleccionVuelo.ida = null;

	$("#tbl_seleccion_ida").css("display","none");
	$("#overlay_ida").css("display","none");

	if(seleccionVuelo.vuelta != null) {
		$("#empty_ida_slot").css("display","block");
	} else {
		$("#div_empty_vuelo").css("display","block");
	}

	var row = $("#tbl_salida .flights-option-row[data-opc_code='"+opcCode+"']");
	row.removeClass("selected");
	row.find(".rbtn").removeClass("checked");

	var rowDetails = $("#tbl_salida .flight-details[data-opc_code='"+opcCode+"']");
	rowDetails.removeClass("expanded").addClass("collapsed");

	updateAllPrices();

	checkCompleteSeleccionVuelo();
}
// ---------------------= =---------------------
function deleteVuelta()
{
	if(seleccionVuelo.vuelta == null)
		return;

	var opcCode = seleccionVuelo.vuelta.opcCode;
	seleccionVuelo.vuelta = null;

	$("#tbl_seleccion_vuelta").css("display","none");
	$("#overlay_vuelta").css("display","none");

	if(seleccionVuelo.ida == null) {
		$("#empty_ida_slot").css("display","none");
		$("#div_empty_vuelo").css("display","block");
	}

	// update rows
	var row = $("#tbl_regreso .flights-option-row[data-opc_code='"+opcCode+"']");
	row.removeClass("selected");
	row.find(".rbtn").removeClass("checked");

	var rowDetails = $("#tbl_regreso .flight-details[data-opc_code='"+opcCode+"']");
	rowDetails.removeClass("expanded").addClass("collapsed");

	updateAllPrices();
	
	checkCompleteSeleccionVuelo();
}
// ---------------------= =---------------------
function changeNumPassengers()
{
	var ul = $(this.parentNode);
	var count = parseInt($(this).data("count"));

	var tipo = $(this.parentNode).data("tipo");

	var counting = ["one","two","three","four","five","six","seven","eight"];

	if(ul.hasClass("active")) {
		ul.removeClass("active");
		var row = $(ul[0].parentNode.parentNode);

		// when change
		if(false == $(this).hasClass("selected")) {
			ul.find("li").attr("class","");
			$(this).addClass("selected");

			// previous options list
			var prev = $(this);
			for(var i=0;i<8;i++){
				prev = prev.prev();
				if(prev.length==0) break;
				prev.addClass("minus-" + counting[i]);
			}

			// next options list
			var next = $(this);
			for(var i=0;i<8;i++){
				next = next.next();
				if(next.length==0) break;
				next.addClass("plus-" + counting[i]);
			}

			// change row status
			if(count==0)
				row.addClass("inactive");
			else
				row.removeClass("inactive");

			// calculo de precio a pagar
			seleccionVuelo[tipo].num = count;
			updatePriceByTipo(tipo,true);
			checkCompleteSeleccionVuelo();

			ul.parent().find("span").html($(this).html());
		}
	}else {
		if(false == $(this).hasClass("selected"))
			return;

		$(this.parentNode).addClass("active");
	}
}
// ---------------------= =---------------------
function validateSeleccionVuelo()
{
	/* PREPARE AND SEND DATA */
	var sendData = prepareSeleccionVueloToSend();

	var dataStr = JSON.stringify(sendData);

	$.ajax({
		url: BoA.urls["validate_flight_selection_service"],
		type: 'POST',
		dataType:'json',
		contentType: "application/json; charset=utf-8",
		success: asyncValidateSeleccionVuelo,
		data: dataStr
	});

	$("#loading_compra").show();
	$("#btn_validar_vuelos").hide();
}
// ---------------------= =---------------------
function validatePassengers()
{
	// validate here!!!
	var divPersonas = $("#div_formulario_personas .persona");

	var pasajeros = [];
	var isAllValid = true;
	for(var i=0;i<divPersonas.length;i++) {
		var divPersona = $(divPersonas[i]);
		var persona = {
			nombres : "",
			apellidos : "",
			tipoDocumento : "",
			nroDocumento  : "",
			telefono : "",
			nroViajeroFrecuente: ""
		};

		var tipo = divPersona.attr("data-tipo");

		var isValid = true;

		// nombres
		var tbxNombres = divPersona.find(".nombres");
		if($.trim(tbxNombres.val())=="") {
			isValid = false;
			tbxNombres.parent().addClass("active");
		} else {
			persona["nombres"] = tbxNombres.val();
		}

		// apellidos
		var tbxApellidos = divPersona.find(".apellidos");
		if($.trim(tbxApellidos.val())=="") {
			isValid = false;
			tbxApellidos.parent().addClass('active');
		} else {
			persona["apellidos"] = tbxApellidos.val();
		}

		// tipo de documento
		var selectTipoDocumento = divPersona.find(".tipo-documento");
		if(selectTipoDocumento.val()=="NONE") {
			isValid = false;
			selectTipoDocumento.parent().addClass('active');
		} else {
			persona["tipoDocumento"] = selectTipoDocumento.val();
		}

		var tbxNroDocumento = divPersona.find(".nro-documento");
		if($.trim(tbxNroDocumento.val()) == "") {
			isValid = false;
			tbxNroDocumento.parent().addClass('active');
		} else {
			persona["nroDocumento"] = tbxNroDocumento.val();
		}

		persona["telefono"] = divPersona.find(".telefono").val();
		persona["nroViajeroFrecuente"] = divPersona.find(".nro-viajero-frecuente").val();

		if(tipo=="infante" || tipo=="ninho") {
			var pickerNacimiento = divPersona.find(".nacimiento");
			console.log(pickerNacimiento.val());
			if($.trim(pickerNacimiento.val())=="" ) {
				isValid = false;
				pickerNacimiento.parent().addClass('active');
			} else {
				var rawDate = pickerNacimiento.val().split(" ");	
				persona["nacimiento"] = rawDate[2] +""+ MONTHS_LANGUAGE_TABLE[rawDate[1]] +""+ rawDate[0];
			}
		}

		if(isValid)
			pasajeros.push(persona);
		else {
			divPersona.addClass("invalid");
			setTimeout(function() {
				$("#div_formulario_personas .persona").removeClass("invalid");
				$("#div_formulario_personas .persona .validable").removeClass("active");
			}, 2000);
			isAllValid = false;
		}
	}

	if(isAllValid) { 
		/* PREPARE AND SEND DATA */
		var sendData = {
			seleccionVuelo: prepareSeleccionVueloToSend(),
			pasajeros : pasajeros 
		};

		var dataStr = JSON.stringify(sendData);

		$.ajax({
			url: BoA.urls["register_passengers_service"],
			type: 'POST',
			dataType:'json',
			contentType: "application/json; charset=utf-8",
			success: asyncRegisterPassengers,
			data: dataStr
		});
	}
}
// ---------------------= =---------------------
function asyncRegisterPassengers(response)
{
	$("#info_registro_pasajeros").removeClass("active");
	$("#info_pago_bancos").addClass("active");

	$("#stage_registro").removeClass("active");
	$("#stage_compra").addClass("active");
}
// ---------------------= =---------------------
function asyncValidateSeleccionVuelo(response)
{
	if(response["success"] == true) {
		// continuando compra
		var form = $("#div_formulario_personas");
		form.html("");

		var numPx = 1;
		for(var key in {adulto:null,ninho:null,infante:null}) // weirdo and fast :P
			for(var i=0;i<seleccionVuelo[key].num;i++)
				form.append(buildRegistroPersona(key,numPx++));

		form.find(".calendar").datepicker({ 
			dateFormat: 'dd MM yy',
			numberOfMonths: 1, 
			maxDate: 0,
			changeYear:true
		});

		$("#info_resultados_vuelos").removeClass("active");
		$("#info_registro_pasajeros").addClass("active");

		$("#stage_seleccion").removeClass("active");
		$("#stage_registro").addClass("active");

		$("#widget_resumen_reserva").addClass("read-only");

		$("#tbl_seleccion_ida").hide();
		$("#tbl_seleccion_vuelta").hide();
		$("#tbl_seleccion_ida_small").show();

		if(seleccionVuelo.vuelta != null)
			$("#tbl_seleccion_vuelta_small").show();

		window.scrollTo(0,0); // scroll hacia arriba

		$("#btn_cambiar_vuelo").hide();
		$("#btn_volver_vuelos").show();

		$("#loading_compra").hide();
		$("#btn_validar_pasajeros").show();
	}
}
// ---------------------= =---------------------
function backToFlightStage() 
{
	$("#info_resultados_vuelos").addClass("active");
	$("#info_registro_pasajeros").removeClass("active");

	$("#stage_seleccion").addClass("active");
	$("#stage_registro").removeClass("active");

	$("#btn_cambiar_vuelo").show();
	$("#btn_volver_vuelos").hide();

	$("#widget_resumen_reserva").removeClass("read-only");

	$("#tbl_seleccion_ida").show();
	if(seleccionVuelo.vuelta != null)
		$("#tbl_seleccion_vuelta").show();

	$("#tbl_seleccion_ida_small").hide();
	$("#tbl_seleccion_vuelta_small").hide();

	$("#btn_validar_pasajeros").hide();
	$("#btn_validar_vuelos").show();

	window.scrollTo(0,0); // scroll hacia arriba
}
// ---------------------= =---------------------
function focusOnPersona()
{
	var curr = $(this);
	while(false == curr.hasClass("persona"))
		curr = curr.parent();

	$("#div_formulario_personas .persona").addClass("inactive");
	curr.removeClass("inactive");
}
// ---------------------= =---------------------
function checkSearchWidgetAvailability()
{
	if(waitingForFlightsData){
		$("#widget_cambiar_vuelo .btn-expand").addClass("searching");
		$("#widget_cambiar_vuelo .form").hide();
	}
	else{
		$("#widget_cambiar_vuelo .btn-expand").removeClass("searching");
		$("#widget_cambiar_vuelo .form").show();
	}
}
// ---------------------= =---------------------
/* cambio en fila de detalles de resultados segun ancho */
function checkResultsTableWidth()
{
	var w = $("#tbl_salida").width();
	if(w < 700)
		$("#tbl_salida .expandable .detail, #tbl_regreso .expandable .detail").removeClass("stretched");
	else
		$("#tbl_salida .expandable .detail, #tbl_regreso .expandable .detail").addClass("stretched");
}

/******************************************************** 
 ********************** ASYNC HANDLERS ******************
 ********************************************************/
// ---------------------= =---------------------
function asyncReceiveDates(response)
{
	// fix to .NET dumbest encoding ever (possible bug here in future)
	response = $.parseJSON(response.CalendarResult).ResultCalendar; 
	
	// construir selector de fechas para vuelos de ida y vuelta
	currentDateIda = response["fechaIdaConsultada"];
	rawDatesCache.ida = response["calendarioOW"]["OW_Ida"]["salidas"]["salida"];

	if(searchParameters.fechaVuelta != null){
		currentDateVuelta = response["fechaVueltaConsultada"];
		rawDatesCache.vuelta = response["calendarioOW"]["OW_Vuelta"]["salidas"]["salida"];
	}
	else{
		currentDatevuelta = null;
		rawDatesCache.vuelta = null;
	}

	// (las fechas de ida y vuelta deben estar establecidas 
	//	antes de construir el selector de fechas)
	buildDatesSelector(
		response["calendarioOW"]["OW_Ida"]["salidas"]["salida"],
		response["fechaIdaConsultada"], 
		$("#tbl_days_selector_salida"),
		true // isIda
	);

	// construir selector de fechas para vuelos de vuelta
	if(searchParameters.fechaVuelta != null) {
		buildDatesSelector(
			response["calendarioOW"]["OW_Vuelta"]["salidas"]["salida"],
			response["fechaVueltaConsultada"], 
			$("#tbl_days_selector_regreso"),
			false
		);
	} 

	waitingForFlightsData = true;

	requestFlights(currentDateIda, currentDateVuelta);
}
// ---------------------= =---------------------
function asyncReceiveFlights(response)
{
	if(waitingForFlightsData == false) // response ya fue procesado
		return;

	response = $.parseJSON(response.AvailabilityPlusValuationsShortResult);

	if(response.ResultInfoOrError != null) {
		fillTableWithMessage($("#tbl_salida")[0], response.ResultInfoOrError.messageError);
		waitingForFlightsData = false; // mutex data

		return;
	}

	// el verdadero response esta mas adentro ¬¬
	response = response['ResultAvailabilityPlusValuationsShort']; 

	var fechaIdaConsultada = response["fechaIdaConsultada"];
	var fechaVueltaConsultada = response["fechaVueltaConsultada"];
	
	if(fechaIdaConsultada != currentDateIda &&
	   fechaVueltaConsultada != currentDateVuelta)
		return; // cuando response no es de las fechas esperadas

	waitingForFlightsData = false; // mutex data

	// process tasas
	var taxes = translateTaxes(response);

	tasasPorPasajero = taxes.byPassenger;
	tasas = taxes.byTax;

	// parse percentaje per passengers
	var porcentajesPorPasajero = translatePercentsByPax(response["porcentajeTipoPasajero"]["PorcentajeTipoPasajero"]);

	var rawTarifas = response["vuelosYTarifas"]["Tarifas"]["TarifaPersoCombinabilityIdaVueltaShort"]["TarifasPersoCombinabilityID"]["TarifaPersoCombinabilityID"];

	allOptions = {}; // reset before translating

	var dataIda = translateFlights(
		response["vuelosYTarifas"]["Vuelos"]["ida"]["vuelos"]["vuelo"], 
		rawTarifas, 
		fechaIdaConsultada,
		porcentajesPorPasajero);

	// reconstruir tabla de fechas (ida)
	buildDatesSelector(rawDatesCache.ida, searchParameters.fechaIda, $("#tbl_days_selector_salida"), true);
	// construir tabla de vuelos
	buildFlightsTable("tbl_salida", dataIda.flightOptions, dataIda.compartments);

	if(currentDateVuelta != null) {
		console.log(response);	
		var dataVuelta = translateFlights(
			response["vuelosYTarifas"]["Vuelos"]["vuelta"]["vuelos"]["vuelo"],
			rawTarifas, 
			fechaIdaConsultada,
			porcentajesPorPasajero);

		// reconstruir tabla de fechas (vuelta)
		buildDatesSelector(rawDatesCache.vuelta, searchParameters.fechaVuelta, $("#tbl_days_selector_regreso"), false);
		// construir tabla de vuelos
		buildFlightsTable("tbl_regreso", dataVuelta.flightOptions, dataIda.compartments);
	}

	checkResultsTableWidth(); // acomodar tablas segun tamaño
}

/***************************************************** 
 *************** UI BUILDING FUNCTIONS ***************
 *****************************************************/
function buildDatesSelector(rawDates, requestedDateStr, table, isIda)
{
	var tarifasByDate = { };

	// mine some data first
	for(var i=0;i<rawDates.length;i++){
		var rawDate = rawDates[i];
		var tarifaStr = rawDate["tarifas"]["tarifaCalen"]["importe"];

		tarifasByDate[rawDate["fecha"]] = tarifaStr;
	}

	requestedDate = compactToJSDate(requestedDateStr);

	table.find("tr.months").html(""); // clean months row
	table.find("tr.days td").remove(); // clean dates row

	var monthsInDays = {};

	// check for 3 days after, and 3 days before
	// if it does not exist, complete with "none" instead of the price
	for(var i=-3;i<=3;i++) {
		// same process for days after
		var d = new Date(requestedDate);
		d.setDate(requestedDate.getDate() + i);

		var mm = "" + (d.getMonth()+1);
		if(false == (mm in monthsInDays))
			monthsInDays[mm] = 1;
		else
			monthsInDays[mm]++;

		var dateStr = d.getFullYear() + ("00" + (d.getMonth() + 1)).slice(-2) + (("00" + d.getDate()).slice(-2));

		var cell = document.createElement("td");

		$(cell).addClass("day-selector").data("date", dateStr);

		$(cell).html("<h2>" + WEEKDAYS_2_CHARS_LANGUAGE_TABLE[d.getDay()] + 
			"<span>" + (("00" + d.getDate()).slice(-2)) + "</span></h2>");

		var inRange = true;

		// evitar mostrar fechas cruzadas (de ida y vuelta)
		if(currentDateVuelta != null) { 
			var otherDate = compactToJSDate(isIda ? currentDateVuelta:currentDateIda);
			if(isIda)
				inRange = (d <= otherDate);
			else
				inRange = (d >= otherDate);
		}

		if(false == inRange) {
			$(cell).css("display","none"); // no mostrar fechas cruzadas
		}
		else if(false == (dateStr in tarifasByDate)) {
			$(cell).addClass("no-flights")
				   .append("<h3>No hay<br>vuelos</h3>");
		} else {
			$(cell).append("<h3>" + tarifasByDate[dateStr] + "&nbsp;" + HTML_CURRENCIES[CURRENCY] +"</h3>");
		}

		if(dateStr == (isIda?currentDateIda:currentDateVuelta))
			$(cell).addClass("selected");

		table.find("tr.days").append(cell);
	}

	// build months data
	var monthsRow = table.find("tr.months");
	for(var key in monthsInDays) {
		var td = $(document.createElement("td"));
		td.attr("colspan",monthsInDays[key])
		  .css("width",(100 * (monthsInDays[key]/7.0))+"%")
		  .addClass("month")
		  .html("<h3>" + MONTHS_2_CHARS_LANGUAGE_TABLE[parseInt(key)] + "</h3>");
		monthsRow.append(td);
	}

	table.prepend(monthsRow);

	table.find("tr.days td.day-selector:not(.no-flights)").click(changeDay);
}
// ---------------------= =---------------------
function buildFlightsTable(tableName, flightOptions, compartments)
{
	var table = $("#"+tableName)[0];

	$(table).find("tr").not(":first").remove(); // clear table results

	if(flightOptions.length == 0){
		$(table).append("<tr><td colspan='10'><h2 class='empty-msg'>No hay vuelos disponibles</h2></td></tr>");
		return;
	}

	// limpiar y añadir cabecera
	$(table).find("tr").remove();
	$(table).append(buildCompartmentsHeader(table, compartments));

	// agrupar por numero de opcion
	for(var key in flightOptions) {
		var opcion = flightOptions[key];
		var row = buildFlightOptionRow(opcion, compartments);
		table.appendChild(row);

		for(var i=0;i<opcion.vuelos.length;i++) {
			var vuelo = opcion.vuelos[i];

			var detail = buildFlightDetailRow(opcion, vuelo);

			table.appendChild(detail);
		}
	}
}
// ---------------------= =---------------------
function buildFlightOptionRow(opc, compartments)
{
	var row = document.createElement("tr");
	$(row).addClass("flights-option-row");
	var vuelosStr = "";

	$(row).attr("data-opc_code",opc.code);

	// salida, llegada y duración
	var cell = document.createElement("td");

	var iconSalida = (opc.horaSalida.hh >= 5 && opc.horaSalida.hh <= 12) ? "am" : 
		((opc.horaSalida.hh <= 18) ? "pm" : "night");

	var iconLlegada = (opc.horaLlegada.hh >= 5 && opc.horaLlegada.hh <= 12) ? "am" : 
		((opc.horaLlegada.hh <= 18) ? "pm" : "night");

	var strDuracion = 
		"<div class='icon-dia-noche salida " + iconSalida + "'></div>" + 
		formatTime(opc.horaSalida) + "&nbsp;&nbsp;-&nbsp;&nbsp;" +
		formatTime(opc.horaLlegada) +
		"<div class='icon-dia-noche llegada " + iconLlegada + "'></div>" + 
		"<br>";

	if(opc.vuelos.length == 1)
		strDuracion += "<span>Duraci&oacute;n: <label>"+formatExpandedTime(opc.duracionVuelo)+"</label></span>";
	else
		strDuracion += 
			"<span>Duraci&oacute;n en Vuelo: <label>"+formatExpandedTime(opc.duracionVuelo)+"</label></span><br>" +
			"<span>Duraci&oacute;n Total: <label>" + formatExpandedTime(opc.duracionTotal) + "</label></span>";

	$(cell).html(strDuracion);

	row.appendChild(cell);

	// tarifas por compartimiento
	for(var i=0;i<compartments.length;i++) {
		var tarifa = opc.tarifas[compartments[i]];

		if(tarifa == null) 
			continue; // it should have, but it doesn't :S

		cell = document.createElement("td");
		$(cell).addClass("tarifa");
		$(cell).html("<div class='rbtn'><div></div></div>" + tarifa.monto + " " + HTML_CURRENCIES[CURRENCY]);
		$(cell).click(selectTarifa);
		$(cell).attr("data-compartment", tarifa.compart);
		row.appendChild(cell);	
	}

	return row;
}
// ---------------------= =---------------------
function buildFlightDetailRow(opc, flight) 
{
	/*** FILA DE DETALLES ***/
	row = document.createElement("tr");

	$(row).attr("data-opc_code",opc.code)
	      .attr("data-num_vuelo",flight.numVuelo)
		  .addClass("flight-details").addClass("collapsed")
	 	  .html("<td colspan='10' class='cell-details'><div class='expandable'></div><div class='separator'></div></td>");

	var expandable = $(row).find(".expandable");

	for(var m=0;m<2;m++) {
		var isSalida = (m==0);
		var timeStr = formatTime(isSalida?flight.horaSalida:flight.horaLlegada);

		var detail = document.createElement("table");
		$(detail).addClass("detail")
			     .addClass(isSalida?"left":"right")
				 .attr("cellspacing","0")
				 .attr("cellpadding","0")
				 .append("<tr><td class='icon-cell' rowspan='2'><div class='icon-"+(isSalida?"salida":"llegada")+"'></div></td><td class='time-cell'>"+timeStr+"<br>Hrs.</td><td class='airport-cell'>"+ airports[flight[isSalida?"origen":"destino"]]+"</td></tr>")
				 .append("<tr><td class='ciudad-cell'>"+cities[flight[isSalida?"origen":"destino"]]+"</td><td class='duracion-cell'>" +(isSalida?("Duraci&oacute;n: "+ formatExpandedTime(flight.duracion)):"")+ "</td></tr>");

		expandable.append(detail);
	}

	return row;
}
// ---------------------= =---------------------
function buildCompartmentsHeader(table, compartments) 
{
	var row = document.createElement("tr");
	$(row).html("<th>Salida - Llegada</th>");
	for(var i=0;i<compartments.length;i++) {
		$(row).append("<th class='class-group compartment-header'>"+compartmentNames[compartments[i]]+"</th>");
	}
	return row;
}
// ---------------------= =---------------------
function fillTableWithLoading(table)
{
	$(table).find("tr").not(":first").remove(); // clear table results

	var row = document.createElement("tr");
	$(row).html("<td colspan='20' class='loading-cell'><div class='loading'></div></td>");

	table.appendChild(row);
}
// ---------------------= =---------------------
function fillTableWithMessage(table, message)
{
	$(table).find("tr").not(":first").remove(); // clear table results

	var row = document.createElement("tr");
	$(row).html("<td colspan='20' class='message'>"+message+"</td>");

	table.appendChild(row);
}
/******************************************************* 
 *************** LOGIC HANDLER FUNCTIONS ***************
 *******************************************************/
// ---------------------= =---------------------
function handleInitialRequest()
{
	// searchParameters.origen = location.queryString['origen'];
	// searchParameters.destino = location.queryString['destino'];
	// searchParameters.fechaIda = location.queryString['fecha_ida'];
	// searchParameters.fechaVuelta = location.queryString['fecha_vuelta'];

	// origen
	// if(searchParameters.origen == null)

	searchParameters.origen = BoA.defaultConsultaVuelos.origen;
	searchParameters.destino = BoA.defaultConsultaVuelos.destino;
	searchParameters.fechaIda = BoA.defaultConsultaVuelos.fechaIda;
	searchParameters.fechaVuelta = BoA.defaultConsultaVuelos.fechaVuelta;

	$("#select_origen").val(searchParameters.origen);
	$("#select_destino").val(searchParameters.destino);

	$('#picker_salida').datepicker("setDate", 
		compactToJSDate(searchParameters.fechaIda)
	);

	//continuar aqui, poniendo la fecha en date pickers

	// console.log(searchParameters.fechaIda);

	// $('#picker_salida').datepicker("setDate", new Date() );

	requestSearchParameters(searchParameters);
}
// ---------------------= =---------------------
function requestSearchParameters(parms)
{
	// Clear cache data first
	currentDateIda = null;
	currentDateVuelta = null;

	// setup labels
	var origen = parms.origen;
	var destino = parms.destino;
	var cityOrigen = cities[origen];
	var cityDestino = cities[destino];

	$("#lbl_info_salida").html("Ida: "+cityOrigen+"("+origen+") - "+cityDestino+"("+destino+")");

	// regreso
	if(parms.fechaVuelta != null) {
 		$("#lbl_info_regreso, #tbl_dayselector_regreso, #tbl_regreso").show();
		$("#lbl_info_regreso").html("Retorno: "+cityDestino+"("+destino+") - "+cityOrigen+"("+origen+")");
	} else {
		$("#lbl_info_regreso, #tbl_dayselector_regreso, #tbl_regreso").hide();
		$("#lbl_info_regreso").hide();
	}

	//  cambiar aspecto de celdas a segundo plano
	$("#tbl_days_selector_salida .day-selector, #tbl_days_selector_regreso .day-selector")
		.removeClass("no-flights")
		.removeClass("selected")
		.addClass("faded")
		.html("");

	// añadir animacion de loading
	$("#tbl_days_selector_salida .day-selector:nth-child(4), #tbl_days_selector_regreso .day-selector:nth-child(4)")
		.addClass("loading-cell")
		.html("<div class='loading'></div>");

	fillTableWithLoading($("#tbl_salida")[0]);
	if(parms.fechaVuelta != null)
		fillTableWithLoading($("#tbl_regreso")[0]);

	$("#widget_cambiar_vuelo .btn-expand").addClass("searching");

	var currentTimeStr = formatCompactTime(new Date());

	var data = {
		tokenAv 		: SERVICE_CREDENTIALS_KEY, 
		language 		: "ES",
		currency 		: CODE_CURRENCIES[CURRENCY],
		locationType 	: "N",
		location 		: "BO",
		from 			: parms.origen,
		to 				: parms.destino,
		rateType		: "1",
		departing 		: parms.fechaIda,
		returning 		: (parms.fechaVuelta == null ? "" : parms.fechaVuelta),
		days 			: "7",
		ratesMax		: "1",
		sites			: "1",
		compartment 	: "0", 
		classes 		: "",
		clientDate 		: todayStr,
		clientHour 		: currentTimeStr,
		forBook			: "1",
		forRelease 		: "1",
		ipAddress 		: "127.0.0.1", 
		xmlOrJson 		: false  // false=json ; true=xml 
	};

	var dataStr = JSON.stringify(data);

	$.ajax({
		url: BoA.urls["nearest_dates_service"],
		type: 'POST',
		dataType:'json',
		contentType: "application/json; charset=utf-8",
		success: asyncReceiveDates,
		data: dataStr
	});
}
// ---------------------= =---------------------
function requestFlights(dateIda, dateVuelta)
{
	// now!
	var now = new Date();
	var currentTimeStr = ("00" + (now.getHours())).slice(-2) + "" + ("00" + (now.getMinutes())).slice(-2);

	var data = {
		tokenAv 		: SERVICE_CREDENTIALS_KEY,
		language 		: "ES",
		currency 		: CODE_CURRENCIES[CURRENCY],
		locationType 	: "N",
		location 		: "BO",
		bringAv			: "1",
		bringRates		: "3",
		surcharges 		: true,
		directionality  : "0",

		departing 		: dateIda,
		returning 		: (dateVuelta==null?"":dateVuelta),
		sites 			: "1",
		compartment 	: "0",
		classes 		: "",
		classesState 	: "",
		clientDate 		: todayStr,
		clientHour 		: currentTimeStr,
		forRelease 		: "1",

		cat19Discounts	: "true",
		specialDiscounts: null,
		book 			: "1",
		booking 		: "",
		bookingHour		: "",
		responseType 	: "1",
		releasingTime 	: "1",
		ipAddress 		: "127.0.0.1", // xD
		xmlOrJson 		: "false", // false is Json

		from: searchParameters.origen,
		to: searchParameters.destino
	};

	var dataStr = JSON.stringify(data);

	$.ajax({
		url: BoA.urls["flights_schedule_service"],
		type: 'POST',
		dataType:'json',
		contentType: "application/json; charset=utf-8",
		success: asyncReceiveFlights,
		data: dataStr
	});
}
// ---------------------= =---------------------
function updatePriceByTipo(tipo, changeFlapper)
{
	var precio = -1;
	var num = seleccionVuelo[tipo].num;

	if(seleccionVuelo.ida != null) {
		/* CALCULOS PARA IDA */
		var opcionIda = allOptions[seleccionVuelo.ida.opcCode];
		
		var tarifa = opcionIda.tarifas[seleccionVuelo.ida.compartment];

		seleccionVuelo[tipo].num = num;
		seleccionVuelo[tipo].ida.precioBase = tarifa.monto * tarifa.porcentajes[tipo];

		seleccionVuelo[tipo].ida.tasas = {}; // reset
		for(var i=0;i<tasasPorPasajero[tipo].length;i++) {
			var keyTasa = tasasPorPasajero[tipo][i];
			var tasa = tasas[keyTasa];

			// algunas tasas solo existen de vuelta
			if(tasa.ida != null) {
				seleccionVuelo[tipo].ida.tasas[keyTasa] = 
				seleccionVuelo[tipo].ida.precioBase * (tasa.ida.porcentaje/100.0) + tasa.ida.fijo;		
			}
		}

		// tasa BO se calcula de forma distinta
		// BO = (Neto + QM) * %
		if('BO' in seleccionVuelo[tipo].ida.tasas &&
		   'QM' in seleccionVuelo[tipo].ida.tasas) {
		  	seleccionVuelo[tipo].ida.tasas['BO'] = 
				(seleccionVuelo[tipo].ida.precioBase + seleccionVuelo[tipo].ida.tasas['QM']) * 
				(tasas['BO'].ida.porcentaje/100.0);
		}

		/* CALCULOS PARA VUELTA */
		if(seleccionVuelo.vuelta != null) {
			var opcionVuelta = allOptions[seleccionVuelo.vuelta.opcCode];
			tarifa = opcionVuelta.tarifas[seleccionVuelo.vuelta.compartment];

			seleccionVuelo[tipo].vuelta.precioBase = tarifa.monto * tarifa.porcentajes[tipo];

			seleccionVuelo[tipo].vuelta.tasas = {}; // reset
			for(var i=0;i<tasasPorPasajero[tipo].length;i++) {
				var keyTasa = tasasPorPasajero[tipo][i];
				var tasa = tasas[keyTasa];

				// algunas tasas solo existen de ida
				if(tasa.vuelta != null) {
					seleccionVuelo[tipo].vuelta.tasas[keyTasa] = 
						seleccionVuelo[tipo].vuelta.precioBase * (tasa.vuelta.porcentaje/100.0) + tasa.vuelta.fijo;
				}
			}

			// tasa BO se calcula de forma distinta
			// BO = (Neto + QM) * %
			if('BO' in seleccionVuelo[tipo].vuelta.tasas &&
			   'QM' in seleccionVuelo[tipo].vuelta.tasas) {
			  	seleccionVuelo[tipo].vuelta.tasas['BO'] = 
					(seleccionVuelo[tipo].vuelta.precioBase + seleccionVuelo[tipo].vuelta.tasas['QM']) * 
					(tasas['BO'].vuelta.porcentaje/100.0);
			}
		}

		/* CALCULO DE PRECIO TOTAL */
		seleccionVuelo[tipo].precioTotal = seleccionVuelo[tipo].ida.precioBase;
		for(var keyTasa in seleccionVuelo[tipo].ida.tasas)  // ida
			seleccionVuelo[tipo].precioTotal += seleccionVuelo[tipo].ida.tasas[keyTasa];

		if(seleccionVuelo.vuelta != null) {
			seleccionVuelo[tipo].precioTotal += seleccionVuelo[tipo].vuelta.precioBase;
			for(var keyTasa in seleccionVuelo[tipo].vuelta.tasas)  // vuelta
				seleccionVuelo[tipo].precioTotal += seleccionVuelo[tipo].vuelta.tasas[keyTasa];	
		}

		// Redondeo al subtotal y total
		seleccionVuelo[tipo].precioTotal = parseInt(formatCurrencyQuantity(seleccionVuelo[tipo].precioTotal,false,0));
		seleccionVuelo[tipo].precioTotal *= seleccionVuelo[tipo].num;

		seleccionVuelo.precioTotal = 
			seleccionVuelo.adulto.precioTotal + 
			seleccionVuelo.ninho.precioTotal + 
			seleccionVuelo.infante.precioTotal;
	}else {
		seleccionVuelo.precioTotal = -1;
	}

	var span = $("#precio_" + tipo);

	if(seleccionVuelo.ida != null)  {
		span.html(formatCurrencyQuantity(seleccionVuelo[tipo].precioTotal, true, 0));
		span.parent().parent().addClass("calculated");

		buildDetailPrices(seleccionVuelo[tipo], tipo);

		if(changeFlapper)
			flapperTotal.val(formatCurrencyQuantity(seleccionVuelo.precioTotal,false,0)).change();
	}
	else{
		span.html("?");
		span.parent().parent().removeClass("calculated");

		if(changeFlapper)
			flapperTotal.val("???????").change();
	}
}
// ---------------------= =---------------------
function updateAllPrices()
{
	updatePriceByTipo("adulto",  false);
	updatePriceByTipo("ninho",   false);
	updatePriceByTipo("infante", false);

	if(seleccionVuelo.ida != null)
		flapperTotal.val(formatCurrencyQuantity(seleccionVuelo.precioTotal,false,0)).change();
	else
		flapperTotal.val("???????").change();
}
// ---------------------= =---------------------
function buildDetailPrices(info, tipo)
{
	var titles = {adulto:"ADULTO",ninho:"NI&Ntilde;O",infante:"INFANTE"};

	var tooltip = $("#tooltip_" + tipo);

	tooltip.html("");
	var tbl = document.createElement("table");
	tooltip.append(tbl);
	$(tbl).attr("cellpadding","0").attr("cellspacing",0);
	tbl.appendChild(document.createElement("tbody"));

	tbl = $(tbl).find("tbody"); 

	tbl.append("<tr><th colspan='3'><h1>"+titles[tipo]+"</h1></th></tr>");
	tbl.append("<tr><th class='subtitle' colspan='3'><div>Ida</div></th></tr>");
	tbl.append("<tr><th><h3>Precio Base</h3></th><td class='currency'>"+HTML_CURRENCIES[CURRENCY]+"</td><td class='qty'>"+formatCurrencyQuantity(info.ida.precioBase,false,0)+"</td></tr>");

	for(var keyTasa in info.ida.tasas) {
		var tr = document.createElement("tr");
		$(tr).append("<th>"+keyTasa+"</th>")
		     .append("<td></td>")
		     .append("<td class='qty'>"+formatCurrencyQuantity(info.ida.tasas[keyTasa],false,0)+"</td>");
		     
		tbl.append(tr);
		tbl.append("<tr><td class='detail' colspan='3'>"+tasas[keyTasa].nombre+"</tr>");
	}

	if(seleccionVuelo.vuelta != null) {
		tbl.append("<tr><th class='subtitle' colspan='3'><div>Vuelta</div></th></tr>");
		tbl.append("<tr><th><h3>Precio Base</h3></th><td class='currency'>Bs.</td><td class='qty'>"+formatCurrencyQuantity(info.vuelta.precioBase,false,2)+"</td></tr>");

		for(var keyTasa in info.vuelta.tasas) {
			var tr = document.createElement("tr");
			$(tr).append("<th>"+keyTasa+"</th>")
			     .append("<td></td>")
			     .append("<td class='qty'>"+formatCurrencyQuantity(info.vuelta.tasas[keyTasa],false,0)+"</td>");
			     
			tbl.append(tr);
			tbl.append("<tr><td class='detail' colspan='3'>"+tasas[keyTasa].nombre+"</tr>");
		}		
	}

	var subtotal = info.ida.precioBase;
	for(var key in info.ida.tasas)
		subtotal += info.ida.tasas[key];
	if(seleccionVuelo.vuelta != null) {
		subtotal += info.vuelta.precioBase;
		for(var key in info.vuelta.tasas)
			subtotal += info.vuelta.tasas[key];
	}

	// just for UI purposes 
	var fakeSubtotal = parseInt(formatCurrencyQuantity(subtotal,false,0));
	var fakeTotal = parseInt(formatCurrencyQuantity(info.num * fakeSubtotal,false,0));

	tbl.append("<tr><td class='cell-separator' colspan='3'><div></div></td></tr>")
	   .append("<tr><th><h3>Subtotal</h3></th><td class='currency'>"+HTML_CURRENCIES[CURRENCY]+"</td><td class='qty'>"+fakeSubtotal+"</td></tr>")
	   .append("<tr><td></td><td></td><td class='qty'><h3>x "+info.num+"</h3></td></tr>")
	   .append("<tr><td class='cell-separator' colspan='3'><div></div></td></tr>")
	   .append("<tr><th><h3>TOTAL</h3></th><td class='currency'>"+HTML_CURRENCIES[CURRENCY]+"</td><td class='qty'>"+fakeTotal+"</td></tr>");
}
// ---------------------= =---------------------
function buildRegistroPersona(tipo, numPx)
{
	var namesByTipo = {adulto:"ADULTO",ninho:"NI&Ntilde;O",infante:"INFANTE"};

	var isAdulto = (tipo=='adulto');

	var persona = document.createElement("div");
	$(persona).addClass("persona")
			  .addClass("inactive")
			  .attr("data-tipo",tipo)
			  .append("<div class='left-label'><label class='lbl-tipo'>"+namesByTipo[tipo]+"</label><label class='nro-pasajero'>PASAJERO "+numPx+"</label><div class='icon-pasajero "+tipo+"'></div></div>")
			  .append("<div class='form'><table cellpadding='0' cellspacing='0'></table></div>");

    var tbl = $(persona).find(".form table");

    tbl.append("<tr><th style='width:25%'>NOMBRES</th><th style='width:25%'>APELLIDOS</th><th style='width:25%'>TIPO DE DOCUMENTO</th><th style='width:25%'># DE DOCUMENTO</th></tr>")
	   .append("<tr>" + 
	   				"<td><div class='validable'><input type='text' id='tbx_px"+numPx+"_nombres' class='nombres'></div></td>"+
	   				"<td><div class='validable'><input type='text' id='tbx_px"+numPx+"_apellidos' class='apellidos'></div></td>" +
	   				"<td>" +
						"<div class='validable'><select id='select_px"+numPx+"_tipo_documento' class='tipo-documento'>" +
							"<option value='NONE'>Tipo de Documento</option>" +
			                "<option value='CI'>CI</option>" +
			                "<option value='PASAPORTE'>PASAPORTE</option>" +
			                "<option value='DNI'>DNI</option>" +
						"</select></div>" +
					"</td>" +
					"<td><div class='validable'><input type='text' id='tbx_px"+numPx+"_documento' class='nro-documento'></div></td>" +
					
				"</tr>")
		.append("<tr><th>TEL&Eacute;FONO</th><th colspan='2'>"+(isAdulto?"EMAIL":"FECHA NACIMIENTO")+"</th><th class='disabled'># VIAJERO FRECUENTE</th></tr>")
		.append(
			"<tr>" +
				"<td><input type='text' id='tbx_px"+numPx+"_telefono' class='telefono'></td>" +
				"<td colspan='"+(isAdulto?'2':'1')+"'>" +
					(isAdulto?
						"<input type='text' id='tbx_px"+numPx+"_email' class='email'>" :
						"<div class='validable'><input type='text' id='picker_px"+numPx+"_nacimiento' class='calendar nacimiento' text='(Ingrese fecha de nacimiento)' onkeypress='return false;'></div>"		
					) +
				"</td>" +
				(isAdulto?"":"<td></td>") +
				"<td><input readonly type='text' id='tbx_px"+numPx+"_px_frecuente' class='nro-viajero-frecuente'></td>" +
			"</tr>"
		)
	  	.append("<tr><td colspan='4'><span class='disabled'>&iquest;No eres viajero frecuente?<a href='#''>REG&Iacute;STRATE</a></span></td></tr>");

	$(persona).find("input").focusin(focusOnPersona);

	return persona;
}
// ---------------------= =---------------------
// ---------------------= =---------------------
// ---------------------= =---------------------
function translateTaxes(fromResponse) 
{
	var rawTaxesByPx = fromResponse['tasaTipoPasajero']['TasaTipoPasajero'];
	var rawIdaTaxes = fromResponse['tasaIda']['tasa'];
	var rawVueltaTaxes;
	if(fromResponse['tasaVuelta'] == null)  // podria no existir
		rawVueltaTaxes = null;
	else
		rawVueltaTaxes = fromResponse['tasaVuelta']['tasa']

	var to = {
		byPassenger: {},
		byTax : {}
	};

	var keyEquiv = {
		"Adulto" : "adulto",
		"Niño"	 : "ninho",
		"Infante": "infante"
	};

	for(var i=0;i<rawTaxesByPx.length;i++) {
		var rawTax = rawTaxesByPx[i];

		var taxKey = rawTax['tipoTasa'];
		var taxName = rawTax['tasa'];
		var pxKey = keyEquiv[rawTax['tipoPasajero']];

		if(false == (taxKey in to.byTax)) {
			to.byTax[taxKey] = { // adding new tax
				nombre: taxName
			};
		}

		if(false == (pxKey in to.byPassenger))
			to.byPassenger[pxKey] = [];

		if(to.byPassenger[pxKey].indexOf(taxKey) == -1) // add to list if not exists
			to.byPassenger[pxKey].push(taxKey);
	}

	// tasas ida
	for(var i=0;i<rawIdaTaxes.length;i++) {
		var rawTax = rawIdaTaxes[i];
		var taxKey = rawTax['tipo_tasa']['#text'];

		to.byTax[taxKey].ida = { fijo: 0.0, porcentaje: 0.0 };	 // adding

		if('importe' in rawTax){
			to.byTax[taxKey].ida.fijo = parseFloat(rawTax['importe']['#text']);
		} else if('pcje' in rawTax){
			to.byTax[taxKey].ida.porcentaje = parseFloat(rawTax['pcje']['#text']);
		}
	}

	// tasas vuelta
	if(rawVueltaTaxes != null) {
		for(var i=0;i<rawVueltaTaxes.length;i++) {
			var rawTax = rawVueltaTaxes[i];
			var taxKey = rawTax['tipo_tasa']['#text'];

			to.byTax[taxKey].vuelta = { fijo: 0.0, porcentaje: 0.0 }; // adding

			if('importe' in rawTax){
				to.byTax[taxKey].vuelta.fijo = parseFloat(rawTax['importe']['#text']);
			} else if('pcje' in rawTax){
				to.byTax[taxKey].vuelta.porcentaje = parseFloat(rawTax['pcje']['#text']);
			}
		}
	}

	return to;
}
// ---------------------= =---------------------
function translatePercentsByPax(from)
{
	var to = {};

	var keyEquiv = {
		"Adulto" : "adulto",
		"Niño"	 : "ninho",
		"Infante": "infante"
	};

	for(var i=0;i<from.length;i++) {
		var rawPercent = from[i];

		if(false === (rawPercent.clase in to)) {
			to[rawPercent.clase] = {
				adulto: 0,
				ninho: 0,
				infante: 0
			};
		}

		var keyPx = keyEquiv[rawPercent['tipoPasajero']];

		to[rawPercent.clase][keyPx] 
			= (parseInt(rawPercent['porcentaje'])/100.0);
	}

	return to;
}
// ---------------------= =---------------------
function translateFlights(rawFlights, rawTarifas, date, paxPercentsByClass)
{
	if(rawFlights == null)
		return null;

	// when there is only one result, the response is an object, not an array, 
	// so it must be translated
	if(rawFlights.constructor !== Array) {
		var obj = rawFlights;
		rawFlights = [];
		rawFlights.push(obj);
	}

	var ratesByClass = {};
	var fareCodesByClass = {};

	for(var i=0;i<rawTarifas.length;i++) {
		var rawTarifa = rawTarifas[i];

		if(rawTarifa["clases"] != null 
			&& rawTarifa["fare_code"] != null
			&& rawTarifa["fare_code"] != "SSENIOR" // exception rule (hardcoded :S )
		  ) 
		{
			ratesByClass[rawTarifa["clases"]] = rawTarifa["importe"];
			fareCodesByClass[rawTarifa["clases"]] = rawTarifa["fare_code"];
		}
	}

	var to = {
		flights:[],
		flightOptions:{},
		compartments:[]
	};

	// Traducir datos del servicio
	for(var i=0;i<rawFlights.length;i++) {
		var rawFlight = rawFlights[i];

		var flight = {
			numVuelo 		: rawFlight["num_vuelo"],
			horaSalida 		: {hh:0,mm:0},
			horaLlegada 	: {hh:0,mm:0},
			duracion 		: {hrs:0,mins:0},
			operador 		: "BoA",
			tarifas 		: {}, // por compartimiento
			origen 			: rawFlight["origen"],
			destino 		: rawFlight["destino"],
			tipoAvion		: rawFlight["tipo_avion"],
			fecha 			: date,
			numOpcion 		: parseInt(rawFlight["num_opcion"])
		};

		// Formateo de horas
		flight.horaSalida.hh = parseInt(rawFlight["hora_salida"].substr(0,2));
		flight.horaSalida.mm = parseInt(rawFlight["hora_salida"].substr(2,2));

		flight.horaLlegada.hh = parseInt(rawFlight["hora_llegada"].substr(0,2));
		flight.horaLlegada.mm = parseInt(rawFlight["hora_llegada"].substr(2,2));

		flight.duracion.hrs = rawFlight["tiempo_vuelo"].substr(0,2);
		flight.duracion.mins = rawFlight["tiempo_vuelo"].substr(3,2);

		// buscar mejor tarifa por clase
		var rawClasses = rawFlight["clases"]["clase"];

		for(var k=0;k<rawClasses.length;k++) {
			if(rawClasses[k]["estado"] != "A") // solo tomar en cuenta estado A
				continue;

			var flightClass = rawClasses[k]["cls"];

			if(false==(flightClass in ratesByClass)) 
				continue;

			if(false==(flightClass in paxPercentsByClass)) // parche!
				continue;

			var rateValue = parseInt(ratesByClass[flightClass]);
			var compartmentKey = rawClasses[k]["compart"];

			// Tabla para mantener un orden unico de compartimientos al mostrar
			if(to.compartments.indexOf(compartmentKey) == -1) // no encontrado
				to.compartments.push(compartmentKey);

			// elegir la tarifa mas baja por compartimiento
			if(compartmentKey in flight.tarifas) {
				if(rateValue < flight.tarifas[compartmentKey].monto) {
					flight.tarifas[compartmentKey].monto = rateValue;
					flight.tarifas[compartmentKey].clase = flightClass;
					flight.tarifas[compartmentKey].fareCode = fareCodesByClass[flightClass];
				}
			} else {
				flight.tarifas[compartmentKey] = { // crear nuevo
					clase: 	 flightClass,
					monto: 	 rateValue,
					compart: compartmentKey,
					index: 	 to.compartments.indexOf(compartmentKey),
					fareCode : fareCodesByClass[flightClass]
				};
			}
		}

		// añadir porcentajes por pasajero por tasa y tipo
		for(var compartmentKey in flight.tarifas) {
			var cls = flight.tarifas[compartmentKey].clase;

			flight.tarifas[compartmentKey]['porcentajes'] = paxPercentsByClass[cls];
		}

		// procesamiento de las opciones
		if(typeof(to.flightOptions["opcion_" + flight.numOpcion]) === 'undefined') { // primera escala
			to.flightOptions["opcion_" + flight.numOpcion] = {
				numOpcion 		: flight.numOpcion,
				vuelos 			: [],
				duracionVuelo	: {hrs:0,mins:0},
				duracionTotal	: {hrs:0,mins:0},
				horaSalida 		: null,
				horaLlegada 	: null,
				origen 			: "",
				destino 		: "",
				// los vuelos de una misma opcion deberian tener las mismas tarifas
				tarifas     	: flight.tarifas,
				code 			: generateRandomCode(10)
			};

		} else { // segunda escala, tercera, etc.
			// parche para error en servicio (datos no completos)
			if(flight.origen == null) { 
				// el origen es el destino del ultimo vuelo
				var opc = flightOptions["opcion_" + flight.numOpcion];
				flight.origen = opc.vuelos[opc.vuelos.length-1].destino;
			}
		}

		to.flightOptions["opcion_" + flight.numOpcion].vuelos.push(flight);

		to.flights.push(flight);
	} // flights

	// completar datos de opciones con informacion de sus vuelos
	for(var i in to.flightOptions) {
		var opc = to.flightOptions[i];
		opc.origen = opc.vuelos[0].origen;
		opc.destino = opc.vuelos[opc.vuelos.length-1].destino;

		opc.horaSalida = opc.vuelos[0].horaSalida;
		opc.horaLlegada = opc.vuelos[opc.vuelos.length-1].horaLlegada;

		// calcular duracion total
		var minsVuelo = 0;
		var minsTotal = 0;

		for(var k=0;k<opc.vuelos.length;k++) {
			minsVuelo += parseInt(opc.vuelos[k].duracion.hrs)*60 
				 	   + parseInt(opc.vuelos[k].duracion.mins);

			if(k>0){ // es el segundo vuelo o mayor
				minsTotal += calculateMinutesDifference(
					opc.vuelos[k-1].horaLlegada, 
					opc.vuelos[k].horaSalida);
			}
		}

		minsTotal += minsVuelo;

		opc.duracionVuelo.hrs = parseInt(minsVuelo/60);
		opc.duracionVuelo.mins = minsVuelo % 60;

		opc.duracionTotal.hrs = parseInt(minsTotal/60);
		opc.duracionTotal.mins = minsTotal % 60;

		allOptions[opc.code] = opc;
	}

	return to;
}
// ---------------------= =---------------------
function prepareSeleccionVueloToSend()
{
	var packedSeleccionVuelo = { };
	packedSeleccionVuelo.adulto = translateSeleccionVueloForService(seleccionVuelo.adulto);
	packedSeleccionVuelo.ninho = translateSeleccionVueloForService(seleccionVuelo.ninho);
	packedSeleccionVuelo.infante = translateSeleccionVueloForService(seleccionVuelo.infante);
	packedSeleccionVuelo.vuelosIda = [];

	var vuelos = allOptions[seleccionVuelo.ida.opcCode].vuelos;

	for(var i=0;i<vuelos.length;i++) { 
		var vuelo = vuelos[i]; 
		packedSeleccionVuelo.vuelosIda.push(
			{
				horaSalida: ("00"+vuelo.horaSalida.hh).slice(-2) + ("00"+vuelo.horaSalida.mm).slice(-2),
				horaLlegada: ("00"+vuelo.horaLlegada.hh).slice(-2) + ("00"+vuelo.horaLlegada.mm).slice(-2),
				numVuelo: vuelo.numVuelo,
				tipoAvion: vuelo.tipoAvion,
				fechaSalida: vuelo.fecha,
				fareCode: vuelo.tarifas[seleccionVuelo.ida.compartment].fareCode,
				origen: vuelo.origen,
				destino: vuelo.destino
			}
		);
	}


	if(seleccionVuelo.vuelta != null) {
		packedSeleccionVuelo.vuelosVuelta = [];
		vuelos = allOptions[seleccionVuelo.vuelta.opcCode].vuelos;

		for(var i=0;i<vuelos.length;i++) { 
			var vuelo = vuelos[i];
			packedSeleccionVuelo.vuelosVuelta.push(
				{
					horaSalida: ("00" + vuelo.horaSalida.hh).slice(-2) + ("00"+vuelo.horaSalida.mm).slice(-2),
					horaLlegada: ("00" + vuelo.horaLlegada.hh).slice(-2) + ("00"+vuelo.horaLlegada.mm).slice(-2),
					numVuelo: vuelo.numVuelo,
					tipoAvion: vuelo.tipoAvion,
					fechaSalida: vuelo.fecha,
					fareCode: vuelo.tarifas[seleccionVuelo.vuelta.compartment].fareCode,
					origen: vuelo.origen,
					destino: vuelo.destino
				}
			);
		}
	}

	return packedSeleccionVuelo;
}
// ---------------------= =---------------------
function translateSeleccionVueloForService(sel) 
{
	return {
		num: 			sel.num,
		precioTotal: 	sel.precioTotal,
		ida: 			translateSeleccionVueloDetailForService(sel.ida),
		vuelta: 		translateSeleccionVueloDetailForService(sel.vuelta)
	};
}
// ---------------------= =---------------------
function translateSeleccionVueloDetailForService(detail)
{
	if(detail.precioBase == null) // it might be a empty object
		return {};

	var tasas = [];
	for(var k in detail.tasas) 
		tasas.push({key:k, value:detail.tasas[k]});

	return {
		precioBase	: detail.precioBase,
		tasas 		: tasas
	}
}
// ---------------------= =---------------------
// ---------------------= =---------------------
// ---------------------= =---------------------
