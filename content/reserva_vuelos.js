// ---------------------= =---------------------
/***** CONFIG PARAMETERS *****/
var CACHE_DISABLED = false;
// ---------------------= =---------------------
var searchParameters = {
	origen:"", destino:"", fechaSalida:"", fechaRegreso:null
};

var datesCacheSalida = {};
var datesCacheRegreso = {};
var tarifasCache = {};

var pendingTablesBuild = { // usado para habilitar/deshabilitar widget de busqueda
	salida:false,
	retorno:false
}; 
var datesLoadingSalida = [];
var datesLoadingRegreso = [];

var currentDateSalida = "";
var currentDateRegreso = "";

var todayStr = "";

var seleccionVuelo = {
	ida: 			null,
	vuelta: 		null,
	adulto: 		{
		num: 			0,
		precioUnitario: 0,
		precioTotal: 	0
	},
	ninho: 		{
		num: 			0,
		precioUnitario: 0,
		precioTotal: 	0
	},
	infante:		{
		num: 			0,
		precioUnitario: 0,
		precioTotal: 	0
	},
	// adultosMayores: 0
	precioTotal:    0
};

var flightsByNum = {};
var allOptions = {};

// configuration
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
	initialize_header(true);

	initialize_ui_sections({anchor_section_headers:false});

	todayStr = formatCompactDate(new Date()); // today 

	handleInitialRequest();

	/*----------= UI SETUP HANDLERS =-----------*/
	$("#widget_cambiar_vuelo .btn-expand").click(toggleWidgetCambiarVuelo);
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
		// , defaultDate: new Date()
	});

	$("#picker_regreso, #picker_estado_vuelo").datepicker({ 
		dateFormat: 'dd MM yy',
		numberOfMonths: 2, 
		minDate:0
	});

	// WINDOW SETUP
	$(window).resize(checkResultsTableWidth);
	$(window).scroll(handleScroll);

	setInterval(checkSearchWidgetAvailability, 200);

	flapperTotal = $("#precio_total").flapper({
		width:6,
		align:'right'
	});
	
}); // init
// ---------------------= =---------------------
function handleScroll(){
	var h = $(this).scrollTop();
	var widget = $("#widget_resumen_reserva");
	if(h > 150)
		widget.css("margin",(h-150)+"px 0 0 0");
	else
		widget.css("margin","0");
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
	var table = this;

	while(false == $(table).is("table")) // find parent table
		table = table.parentNode;

	if(table.id == "tbl_days_selector_salida")
		pendingTablesBuild.salida = true;
	else if(table.id == "tbl_days_selector_regreso")
		pendingTablesBuild.regreso = true;

	$(table).find(".day-selector").removeClass("selected");

	$(this).addClass("selected");

	var isSalida = ($(table).data("salida_regreso") == "salida");

	var selected_date = $(this).data("date");

	if(isSalida)
		currentDateSalida = selected_date;
	else 
		currentDateRegreso = selected_date;

	getFlightsForDate(selected_date, isSalida);
}
// ---------------------= =---------------------
function toggleWidgetCambiarVuelo()
{
	if($(this).hasClass("searching")) return;

	var widget = $(this.parentNode);

	if(widget.hasClass("collapsed")){
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
	var tarifa = parseInt($(this).data("tarifa"));

	if($(this).find(".rbtn").hasClass("checked"))
		return;

	var table = row.parentNode;
	while(false == $(table).is("table")) // find parent table
		table = table.parentNode;

	var tipo = $(table).data("tipo");

	if(tipo=="ida") {
		seleccionVuelo.ida = {};
		seleccionVuelo.ida.opcCode = opcCode;
		seleccionVuelo.ida.tarifa = tarifa;
		$("#empty_ida_slot").css("display","none");
	} else {
		seleccionVuelo.vuelta = {};
		seleccionVuelo.vuelta.opcCode = opcCode;	
		seleccionVuelo.vuelta.tarifa = tarifa;

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
	
	var tblSeleccion = $("#tbl_seleccion_" + tipo);

	tblSeleccion.find(".cell-cod-origen-destino h1").html(opcion.origen + " - " + opcion.destino);

	tblSeleccion.find(".cell-duracion").html("Duraci&oacute;n:<br>" + formatExpandedTime(opcion.duracionVuelo) );

	tblSeleccion.find(".cell-fecha").html(formatExpandedDate(opcion.vuelos[0].fecha));
	tblSeleccion.find(".cell-hora span").html("Salida:<br>" + formatTime(opcion.horaSalida));
	tblSeleccion.css("display","block");
	tblSeleccion.addClass("changed");

	$("#overlay_"+tipo).css("display","block");
	$("#btn_borrar_ida").attr("data-opc_code",opcCode);

	$("#div_empty_vuelo").css("display","none");

	updateAllPrices();

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
		fechaSalida: pickerSalida.val(),
		fechaRegreso: pickerRegreso.val(),
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

	// fecha de salida
	if(parms.fechaSalida=="") {
		activate_validation(pickerSalida);
		valid_form = false;
	}

	if(false == parms.solo_ida && parms.fechaRegreso=="") {
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
	searchParameters.fechaSalida = rawDate[2] +""+ MONTHS_LANGUAGE_TABLE[rawDate[1]] +""+ rawDate[0];
	
	// fecha retorno
	if(parms.solo_ida){
		searchParameters.fechaRegreso = null
	} else {
		rawDate = pickerRegreso.val().split(" ");
		searchParameters.fechaRegreso = rawDate[2] +""+ MONTHS_LANGUAGE_TABLE[rawDate[1]] +""+ rawDate[0];
	}

	requestSearchParameters(searchParameters);

	$("#widget_cambiar_vuelo").removeClass("expanded").addClass("collapsed");
}
// ---------------------= =---------------------
function deleteIda()
{
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
}
// ---------------------= =---------------------
function deleteVuelta()
{
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
}
// ---------------------= =---------------------
function changeNumPassengers()
{
	var ul = $(this.parentNode);
	var count = parseInt($(this).data("count"));

	var tipo = $(this.parentNode).data("tipo");

	var counting = ["one","two","three","four","five","six","seven","eight"];

	if(ul.hasClass("active")){
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
		}
	}else {
		if(false == $(this).hasClass("selected"))
			return;

		$(this.parentNode).addClass("active");
	}
}
// ---------------------= =---------------------
function checkSearchWidgetAvailability()
{
	if(pendingTablesBuild.salida == false && pendingTablesBuild.regreso == false)
		$("#widget_cambiar_vuelo .btn-expand").removeClass("searching");
	else
		$("#widget_cambiar_vuelo .btn-expand").addClass("searching");
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
	// start build info to UI
	buildDatesSelector(
		response["calendarioOW"]["OW_Ida"]["salidas"]["salida"],
		response["fechaIdaConsultada"], 
		$("#tbl_days_selector_salida")
	);

	pendingTablesBuild.salida = true;

	getFlightsForDate(searchParameters.fechaSalida, true);

	if(searchParameters.fechaRegreso != null){
		buildDatesSelector(
			response["calendarioOW"]["OW_Vuelta"]["salidas"]["salida"],
			response["fechaVueltaConsultada"], 
			$("#tbl_days_selector_regreso")
		);

		pendingTablesBuild.regreso = true;

		getFlightsForDate(searchParameters.fechaRegreso, false);
	}else{
		pendingTablesBuild.regreso = false;
	}
}
// ---------------------= =---------------------
function asyncReceiveSalidaFlights(response)
{
	receiveFlights(true, response);
}
// ---------------------= =---------------------
function asyncReceiveRegresoFlights(response) 
{
	receiveFlights(false, response);
}
// ---------------------= =---------------------
function receiveFlights(isSalida, response)
{
	response = $.parseJSON(response.AvailabilityPlusValuationsShortResult);

	if(response.ResultInfoOrError != null){
		fillTableWithMessage($("#tbl_" + (isSalida?"salida":"regreso"))[0], response.ResultInfoOrError.messageError);

		return;
	}

	// should not be so complicated =/
	response = response.ResultAvailabilityPlusValuationsShort; 

	var fechaConsultada = response["fechaIdaConsultada"];

	var datesCache = isSalida ? datesCacheSalida : datesCacheRegreso;
	var datesLoading = isSalida? datesLoadingSalida : datesLoadingRegreso;

	// removes from date loading
	datesLoading.splice(datesLoading.indexOf(fechaConsultada), 1);

	var flights = response["vuelosYTarifas"]["Vuelos"]["ida"]["vuelos"]["vuelo"];

	// when there is only one result, the response is an object, not an array, 
	// so it must be translated
	if(flights.constructor !== Array) {
		var obj = flights;
		flights = [];
		flights.push(obj);
	}

	var tarifas = response["vuelosYTarifas"]["Tarifas"]["TarifaPersoCombinabilityIdaVueltaShort"]["TarifasPersoCombinabilityID"]["TarifaPersoCombinabilityID"];

	// add to cache
	datesCache["f_" + fechaConsultada] = flights;
	tarifasCache["f_" + fechaConsultada] = tarifas;

	if((isSalida?currentDateSalida:currentDateRegreso) == fechaConsultada) 
		fillTable($("#tbl_" + (isSalida?"salida":"regreso"))[0], flights, tarifas, fechaConsultada);
}

/***************************************************** 
 *************** UI BUILDING FUNCTIONS ***************
 *****************************************************/
function buildDatesSelector(rawDates, requestedDateStr, table)
{
	var tarifasByDate = { };

	// mine some data first
	for(var i=0;i<rawDates.length;i++){
		var rawDate = rawDates[i];
		var tarifaStr = rawDate["tarifas"]["tarifaCalen"]["importe"];

		tarifasByDate[rawDate["fecha"]] = tarifaStr;
	}

	requestedDate = new Date(requestedDateStr.substr(0,4),
							 requestedDateStr.substr(4,2),
							 requestedDateStr.substr(6,2), 0,0,0,0);
	
	table.find("tr td").remove(); // clean

	// check for 3 days after, and 3 days before
	// if it does not exist, complete with "none" instead of the price
	for(var i=-3;i<=3;i++){
		// same process for days after
		var d = new Date(requestedDate);
		d.setDate(requestedDate.getDate() + i);

		var dateStr = d.getFullYear() + ("00" + (d.getMonth()) ).slice(-2) + (("00" + d.getDate()).slice(-2));

		var cell = document.createElement("td");

		$(cell).addClass("day-selector").data("date", dateStr);

		$(cell).html("<h2>" + WEEKDAYS_2_CHARS_LANGUAGE_TABLE[d.getDay()] + 
			"<span>" + (("00" + d.getDate()).slice(-2)) + "</span></h2>");

		if(dateStr in tarifasByDate) {
			$(cell).append("<h3>" + tarifasByDate[dateStr] + "&nbsp;" + HTML_CURRENCIES[CURRENCY] +"</h3>");
		}
		else {
			$(cell).addClass("no-flights")
				   .append("<h3>No hay<br>vuelos</h3>");
		}

		table.find("tr").append(cell);
	}

	// select middle date
	table.find("tr td:nth-child(4)").addClass("selected");

	table.find(".day-selector:not(.no-flights)").click(changeDay);
}
// ---------------------= =---------------------
function buildFlightOptionRow(opc, compartments)
{
	var row = document.createElement("tr");
	$(row).addClass("flights-option-row");
	var vuelosStr = "";

	$(row).attr("data-opc_code",opc.code);

	// salida,llegada y duración
	var cell = document.createElement("td");

	var strDuracion = formatTime(opc.horaSalida)+"&nbsp;&nbsp;-&nbsp;&nbsp;"+formatTime(opc.horaLlegada)+"<br>";

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
		var tarifa = opc.tarifas[compartments[i]]

		cell = document.createElement("td");
		$(cell).addClass("tarifa");
		$(cell).html("<div class='rbtn'><div></div></div>" + tarifa.monto + " " + HTML_CURRENCIES[CURRENCY]);
		$(cell).click(selectTarifa);
		$(cell).attr("data-tarifa",tarifa.monto);
		row.appendChild(cell);	
	}

	return row;
}
// ---------------------= =---------------------
function buildFlightDetailRow(opc, flight) {
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
function fillTable(table, rawFlights, rawTarifas, date)
{
	if(table.id == "tbl_salida")
		pendingTablesBuild.salida = false;
	else if(table.id == "tbl_regreso")
		pendingTablesBuild.regreso = false;

	var tarifas = {};
	for(var i=0;i<rawTarifas.length;i++) {
		var rawTarifa = rawTarifas[i];
		tarifas[rawTarifa["clases"]] = rawTarifa["importe"];
	}

	$(table).find("tr").not(":first").remove(); // clear table results

	if(rawFlights.length == 0){
		$(table).append("<tr><td colspan='10'><h2 class='empty-msg'>No hay vuelos disponibles</h2></td></tr>");
	} else {
		var flights = [];
		var opcionesVuelo = [];
		var allCompartments = [];
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
				var flightClass = rawClasses[k]["cls"];

				if(false==(flightClass in tarifas)) 
					continue;

				var monto = parseInt(tarifas[flightClass]);
				var compartment = rawClasses[k]["compart"];

				// Tabla para mantener un orden unico de compartimientos al mostrar
				if(allCompartments.indexOf(compartment) == -1) // no encontrado
					allCompartments.push(compartment);

				// elegir la tarifa mas baja por compartimiento
				if(compartment in flight.tarifas) {
					if(monto < flight.tarifas[compartment].monto){
						flight.tarifas[compartment].monto = monto;
						flight.tarifas[compartment].clase = flightClass;
					}
				} else {
					flight.tarifas[compartment] = {
						clase: 	 flightClass,
						monto: 	 monto,
						compart: compartment,
						index: 	 allCompartments.indexOf(compartment)
					};
				}
			}

			flights.push(flight);
			flightsByNum[flight.numVuelo] = flight;

			// procesamiento de las opciones
			if(typeof(opcionesVuelo[flight.numOpcion]) === 'undefined') { // primera escala
				opcionesVuelo[flight.numOpcion] = {
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
					code 			: generateRandomCode(10),
					tarifasByPax	: {
						adulto: {tasa: 1.0, constante:0},
						ninho: {tasa:  0.8, constante:20},
						infante: {tasa: 0, constante:30}
					}
				};

				// allOptions[opcionesVuelo[flight.numOpcion].code] = opcionesVuelo[flight.numOpcion];
			} else { // segunda escala, tercera, etc.
				// parche para error en servicio (datos no completos)
				if(flight.origen == null) { 
					// el origen es el destino del ultimo vuelo
					var opc = opcionesVuelo[flight.numOpcion];
					flight.origen = opc.vuelos[opc.vuelos.length-1].destino;
				}
			}

			opcionesVuelo[flight.numOpcion].vuelos.push(flight);
		} // flights

		// completar datos de opciones con informacion de sus vuelos
		for(var i in opcionesVuelo){
			var opc = opcionesVuelo[i];
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
			opc.duracionVuelo.mins = minsVuelo%60;

			opc.duracionTotal.hrs = parseInt(minsTotal/60);
			opc.duracionTotal.mins = minsTotal%60;

			allOptions[opc.code] = opc;
		}

		// limpiar y añadir cabecera
		$(table).find("tr").remove();
		$(table).append(buildCompartmentsHeader(table,allCompartments));

		// agrupar por numero de opcion
		for(var key in opcionesVuelo) {
			var opcion = opcionesVuelo[key];
			var row = buildFlightOptionRow(opcion, allCompartments);
			table.appendChild(row);

			for(var i=0;i<opcion.vuelos.length;i++) {
				var vuelo = opcion.vuelos[i];

				var detail = buildFlightDetailRow(opcion, vuelo);

				table.appendChild(detail);
			}
		}

		checkResultsTableWidth(); // acomodar tablas segun tamaño
	}
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
	searchParameters.origen = location.queryString['origen'];
	searchParameters.destino = location.queryString['destino'];
	searchParameters.fechaSalida = location.queryString['salida'];
	searchParameters.fechaRegreso = location.queryString['regreso'];

	// origen
	if(searchParameters.origen == null)
		searchParameters.origen = "CBB";

	// destino
	if(searchParameters.destino == null)
		searchParameters.destino = "VVI";

	// salida
	if(searchParameters.fechaSalida == null) {
		searchParameters.fechaSalida = todayStr;
	}

	$("#select_origen").val(searchParameters.origen);
	$("#select_destino").val(searchParameters.destino);

	console.log(compactToJSDate(searchParameters.fechaSalida));

	$('#picker_salida').datepicker("setDate", 
		compactToJSDate(searchParameters.fechaSalida)
	);

	//continuar aqui, poniendo la fecha en date pickers

	// console.log(searchParameters.fechaSalida);

	// $('#picker_salida').datepicker("setDate", new Date() );

	requestSearchParameters(searchParameters);
}
// ---------------------= =---------------------
function requestSearchParameters(parms)
{
	// Clear cache data first
	datesCacheSalida = {};
	datesCacheRegreso = {};
	tarifasCache = {};
	datesLoadingSalida = [];
	datesLoadingRegreso = [];
	currentDateSalida = "";
	currentDateRegreso = "";

	// start processing dates
	currentDateSalida = parms.fechaSalida;
	if(parms.fechaRegreso != null)
		currentDateRegreso = parms.fechaRegreso;

	// setup labels
	var origen = parms.origen;
	var destino = parms.destino;
	var cityOrigen = cities[origen];
	var cityDestino = cities[destino];

	$("#lbl_info_salida").html("Ida: "+cityOrigen+"("+origen+") - "+cityDestino+"("+destino+")");

	// regreso
	if(parms.fechaRegreso != null) {
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
	if(parms.fechaRegreso != null){
		fillTableWithLoading($("#tbl_regreso")[0]);
	}

	$("#widget_cambiar_vuelo .btn-expand").addClass("searching");

	var currentTimeStr = formatCompactTime(new Date());

	var data = {
		credentials 	: SERVICE_CREDENTIALS_KEY, 
		language 		: "ES",
		currency 		: CODE_CURRENCIES[CURRENCY],
		locationType 	: "N",
		location 		: "BO",
		from 			: parms.origen,
		to 				: parms.destino,
		rateType		: "1",
		departing 		: parms.fechaSalida,
		returning 		: (parms.fechaRegreso == null ? "" : parms.fechaRegreso),
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
		url: urls["nearest_dates_service"],
		type: 'POST',
		dataType:'json',
		contentType: "application/json; charset=utf-8",
		success: asyncReceiveDates,
		data: dataStr
	});
}
// ---------------------= =---------------------
function getFlightsForDate(date, isSalida)
{
	var table = $("#tbl_" + (isSalida ? "salida" : "regreso"))[0];

	var currentDate = (isSalida?currentDateSalida:currentDateRegreso);
	var isCurrentDateSelected = (currentDate == date);

	var datesCache = (isSalida?datesCacheSalida:datesCacheRegreso);
	var datesLoading = isSalida?datesLoadingSalida:datesLoadingRegreso;

	var existsInCache = (("f_" + date) in datesCache );
	var hasBeenRequested = ($.inArray(date, datesLoading) != -1);

	if(existsInCache && false == CACHE_DISABLED) {
		if(isCurrentDateSelected) {
			fillTable(table, datesCache["f_" + date], tarifasCache["f_" + date], date);
		}
	}else{
		if(false == hasBeenRequested)
			requestFlights(date, isSalida ? asyncReceiveSalidaFlights : asyncReceiveRegresoFlights, isSalida);

		if(isCurrentDateSelected)
			fillTableWithLoading(table);
	}
}
// ---------------------= =---------------------
function requestFlights(date, results_callback, isSalida) 
{
	if(isSalida)
		datesLoadingSalida.push(date);
	else
		datesLoadingRegreso.push(date);

	var now = new Date();
	var hh = ("00" + (now.getHours())).slice(-2);
	var mm = ("00" + (now.getMinutes())).slice(-2);

	var currentTimeStr = hh + "" + mm;

	var data = {
		credentials 	: SERVICE_CREDENTIALS_KEY,
		language 		: "ES",
		currency 		: CODE_CURRENCIES[CURRENCY],
		locationType 	: "N",
		location 		: "BO",
		bringAv			: "1",
		bringRates		: "3",
		surcharges 		: true,
		directionality  : "0",

		departing 		: date,
		returning 		: "",
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
		ipAddress 		: "127.0.0.1",
		xmlOrJson 		: "false"
	};

	if(isSalida){
		data["from"] = searchParameters.origen;
		data["to"] = searchParameters.destino;
	}
	else{
		data["to"] = searchParameters.origen;
		data["from"] = searchParameters.destino;
	}

	var dataStr = JSON.stringify(data);

	$.ajax({
		url: urls["flights_schedule_service"],
		type: 'POST',
		dataType:'json',
		contentType: "application/json; charset=utf-8",
		success: results_callback,
		data: dataStr
	});
}
// ---------------------= =---------------------
function updatePriceByTipo(tipo, changeFlapper)
{
	var precio = -1;
	var num = seleccionVuelo[tipo].num;

	if(seleccionVuelo.ida != null) {
		var opcionIda = allOptions[seleccionVuelo.ida.opcCode];
		
		var tarifaByPax = opcionIda.tarifasByPax[tipo];
		var tarifa = seleccionVuelo.ida.tarifa;

		var precio = tarifa * tarifaByPax.tasa + tarifaByPax.constante;

		if(seleccionVuelo.vuelta != null) {
			var opcionVuelta = allOptions[seleccionVuelo.vuelta.opcCode];
			tarifa = seleccionVuelo.vuelta.tarifa;
			tarifaByPax = opcionVuelta.tarifasByPax[tipo];

			precio += tarifa * tarifaByPax.tasa + tarifaByPax.constante;
		}

		seleccionVuelo[tipo].num = num;
		seleccionVuelo[tipo].precio = precio;
		seleccionVuelo[tipo].precioTotal = num * precio;	

		seleccionVuelo.precioTotal = 
			seleccionVuelo.adulto.precioTotal + 
			seleccionVuelo.ninho.precioTotal + 
			seleccionVuelo.infante.precioTotal; 
	}else {
		seleccionVuelo.precioTotal = -1;
	}

	var span = $("#precio_" + tipo);

	if(seleccionVuelo.ida != null)  {
		span.html(formatCurrencyQuantity(seleccionVuelo[tipo].precioTotal));

		if(changeFlapper)
			flapperTotal.val(seleccionVuelo.precioTotal).change();
	}
	else{
		span.html("?");

		if(changeFlapper)
			flapperTotal.val("???????").change();
	}
}
// ---------------------= =---------------------
function updateAllPrices()
{
	updatePriceByTipo("adulto",false);
	updatePriceByTipo("ninho",false);
	updatePriceByTipo("infante",false);

	if(seleccionVuelo.ida != null)
		flapperTotal.val(seleccionVuelo.precioTotal).change();
	else
		flapperTotal.val("???????").change();
}
// ---------------------= =---------------------
// ---------------------= =---------------------
// ---------------------= =---------------------
// ---------------------= =---------------------
// ---------------------= =---------------------
