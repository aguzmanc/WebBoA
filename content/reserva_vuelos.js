// ---------------------= =---------------------
var searchParameters = {
	origen:"", destino:"", fecha_salida:"", fecha_regreso:null
};

var dates_cache_salida = {};
var dates_cache_regreso = {};
var tarifasCache = {};
var pendingTablesBuild = { // usado para habilitar/deshabilitar widget de busqueda
	salida:false,
	retorno:false
}; 

var dates_loading_salida = [];
var dates_loading_regreso = [];

var current_date_salida = "";
var current_date_regreso = "";

var todayStr = "";

var seleccionVuelo = {
	ida:{
		vuelos: 		[],
		adultos: 		0,
		infantes: 		0,
		bebes: 			0,
		adultosMayores: 0
	},
	vuelta:{
		vuelos: 		[],
		adultos: 		0,
		infantes: 		0,
		bebes: 			0,
		adultosMayores: 0
	}
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
$(document).on('ready',function()
{
	initialize_header(true);

	initialize_ui_sections({anchor_section_headers:false});

	var today = new Date();
	var mm = ("00" + (today.getMonth()+1)).slice(-2);
	var dd = ("00" + (today.getDate())).slice(-2);
	todayStr = today.getFullYear() + "" + mm + "" + dd;

	handle_initial_request();

	/*----------= UI SETUP - WIDGET CAMBIAR VUELO =-----------*/
	$("#widget_cambiar_vuelo .btn-expand").click(toggle_widget_cambiar_vuelo);

	$("#widget_cambiar_vuelo .form .radio-button").click(toggle_rbtn_ida_vuelta);

	// BUSCAR NUEVO VUELO
	$("#btn_buscar_vuelo").click(validate_search);

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

	$("#widget_resumen_reserva td.selector-pax ul li").click(changeNumPassengers);

	setInterval(checkSearchWidgetAvailability, 200);

	// cambio en fila de detalles de resultados segun ancho
	$(window).resize(checkResultsTableWidth);

	$(window).scroll(handleScroll);
}); // init


// ---------------------= =---------------------
function handle_initial_request()
{
	searchParameters.origen = location.queryString['origen'];
	searchParameters.destino = location.queryString['destino'];
	searchParameters.fecha_salida = location.queryString['salida'];
	searchParameters.fecha_regreso = location.queryString['regreso'];

	// origen
	if(searchParameters.origen == null)
		searchParameters.origen = "CBB";

	// destino
	if(searchParameters.destino == null)
		searchParameters.destino = "VVI";

	// salida
	if(searchParameters.fecha_salida == null) {
		searchParameters.fecha_salida = todayStr;
	}

	request_search_parameters(searchParameters);
}
// ---------------------= =---------------------
function request_search_parameters(parms)
{
	// Clear cache data first
	dates_cache_salida = {};
	dates_cache_regreso = {};
	tarifasCache = {};
	dates_loading_salida = [];
	dates_loading_regreso = [];
	current_date_salida = "";
	current_date_regreso = "";

	// start processing dates
	current_date_salida = parms.fecha_salida;
	if(parms.fecha_regreso != null)
		current_date_regreso = parms.fecha_regreso;

	// setup labels
	var origen = parms.origen;
	var destino = parms.destino;
	var cityOrigen = cities[origen];
	var cityDestino = cities[destino];

	$("#lbl_info_salida").html("Ida: "+cityOrigen+"("+origen+") - "+cityDestino+"("+destino+")");

	// regreso
	if(parms.fecha_regreso != null) {
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

	fill_table_with_loading($("#tbl_salida")[0]);
	if(parms.fecha_regreso != null){
		fill_table_with_loading($("#tbl_regreso")[0]);
	}

	$("#widget_cambiar_vuelo .btn-expand").addClass("searching");

	var now = new Date();
	var hh = ("00" + (now.getHours())).slice(-2);
	var mm = ("00" + (now.getMinutes())).slice(-2);

	var currentTimeStr = hh+""+mm;

	var data = {
		credentials 	: SERVICE_CREDENTIALS_KEY, 
		language 		: "ES",
		currency 		: CODE_CURRENCIES[CURRENCY],
		locationType 	: "N",
		location 		: "BO",
		from 			: parms.origen,
		to 				: parms.destino,
		rateType		: "1",
		departing 		: parms.fecha_salida,
		returning 		: (parms.fecha_regreso == null ? "" : parms.fecha_regreso),
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
		success: async_receive_dates,
		data: dataStr
	});
}
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
function toggle_rbtn_ida_vuelta()
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
function change_day()
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
		current_date_salida = selected_date;
	else 
		current_date_regreso = selected_date;

	get_flights_for_date(selected_date, isSalida);
}
// ---------------------= =---------------------
function toggle_widget_cambiar_vuelo()
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
function get_flights_for_date(date, isSalida)
{
	var table = $("#tbl_" + (isSalida ? "salida" : "regreso"))[0];

	var currentDate = (isSalida?current_date_salida:current_date_regreso);
	var isCurrentDateSelected = (currentDate == date);

	var datesCache = (isSalida?dates_cache_salida:dates_cache_regreso);
	var datesLoading = isSalida?dates_loading_salida:dates_loading_regreso;

	var existsInCache = (("f_" + date) in datesCache );
	var hasBeenRequested = ($.inArray(date, datesLoading) != -1);

	if(existsInCache) {
		if(isCurrentDateSelected) {
			fill_table(table, datesCache["f_" + date], tarifasCache["f_" + date], date);
		}
	}else{
		if(false == hasBeenRequested)
			request_flights(date, isSalida ? async_receive_salida_flights : async_receive_regreso_flights, isSalida);

		if(isCurrentDateSelected)
			fill_table_with_loading(table);
	}
}
// ---------------------= =---------------------
function request_flights(date, results_callback, isSalida) 
{
	if(isSalida)
		dates_loading_salida.push(date);
	else
		dates_loading_regreso.push(date);

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
function async_receive_dates(response) 
{
	// fix to .NET dumbest encoding ever (possible bug here in future)
	response = $.parseJSON(response.CalendarResult).ResultCalendar; 
	// start build info to UI
	build_dates_selector(
		response["calendarioOW"]["OW_Ida"]["salidas"]["salida"],
		response["fechaIdaConsultada"], 
		$("#tbl_days_selector_salida")
	);

	pendingTablesBuild.salida = true;

	get_flights_for_date(searchParameters.fecha_salida, true);

	if(searchParameters.fecha_regreso != null){
		build_dates_selector(
			response["calendarioOW"]["OW_Vuelta"]["salidas"]["salida"],
			response["fechaVueltaConsultada"], 
			$("#tbl_days_selector_regreso")
		);

		pendingTablesBuild.regreso = true;

		get_flights_for_date(searchParameters.fecha_regreso, false);
	}else{
		pendingTablesBuild.regreso = false;
	}
}
// ---------------------= =---------------------
function build_dates_selector(rawDates, requestedDateStr, table)
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

		if(dateStr in tarifasByDate){
			$(cell).append("<h3>" + tarifasByDate[dateStr] + "&nbsp;" + HTML_CURRENCIES[CURRENCY] +"</h3>");
		}
		else{
			$(cell).addClass("no-flights")
				   .append("<h3>No hay<br>vuelos</h3>");
		}

		table.find("tr").append(cell);
	}

	// select middle date
	table.find("tr td:nth-child(4)").addClass("selected");

	table.find(".day-selector:not(.no-flights)").click(change_day);
}
// ---------------------= =---------------------
function build_flight_option_row(opc, compartments)
{
	var row = document.createElement("tr");
	$(row).addClass("flights-option-row");
	var vuelosStr = "";

	$(row).attr("data-opc_code",opc.code);

	// salida,llegada y duración
	var cell = document.createElement("td");

	var strDuracion = formatTime(opc.horaSalida)+"&nbsp;&nbsp;-&nbsp;&nbsp;"+formatTime(opc.horaLlegada)+"<br>";

	if(opc.vuelos.length == 1)
		strDuracion += "<span>Duraci&oacute;n: <label>"+formatDuracion(opc.duracionVuelo)+"</label></span>";
	else
		strDuracion += 
			"<span>Duraci&oacute;n en Vuelo: <label>"+formatDuracion(opc.duracionVuelo)+"</label></span><br>" +
			"<span>Duraci&oacute;n Total: <label>" + formatDuracion(opc.duracionTotal) + "</label></span>";

	$(cell).html(strDuracion);

	row.appendChild(cell);

	// tarifas por compartimiento
	for(var i=0;i<compartments.length;i++) {
		var tarifa = opc.tarifas[compartments[i]]

		cell = document.createElement("td");
		$(cell).addClass("tarifa");
		$(cell).html("<div class='rbtn'><div></div></div>" + tarifa.monto + " " + HTML_CURRENCIES[CURRENCY]);
		$(cell).click(select_tarifa);
		$(cell).attr("data-tarifa",tarifa.monto);
		row.appendChild(cell);	
	}

	return row;
}

function build_flight_detail_row(opc, flight) {
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
				 .append("<tr><td class='ciudad-cell'>"+cities[flight[isSalida?"origen":"destino"]]+"</td><td class='duracion-cell'>" +(isSalida?("Duraci&oacute;n: "+ formatDuracion(flight.duracion)):"")+ "</td></tr>");

		expandable.append(detail);
	}

	return row;
}
// ---------------------= =---------------------
function build_compartments_header(table, compartments) 
{
	var row = document.createElement("tr");
	$(row).html("<th>Salida - Llegada</th>");
	for(var i=0;i<compartments.length;i++) {
		$(row).append("<th class='class-group compartment-header'>"+compartmentNames[compartments[i]]+"</th>");
	}
	return row;
}
// ---------------------= =---------------------
function async_receive_salida_flights(response)
{
	receive_flights(true, response);
}
// ---------------------= =---------------------
function async_receive_regreso_flights(response) 
{
	receive_flights(false, response);
}
// ---------------------= =---------------------
function receive_flights(isSalida, response)
{
	response = $.parseJSON(response.AvailabilityPlusValuationsShortResult);

	if(response.ResultInfoOrError != null){
		fill_table_with_message($("#tbl_" + (isSalida?"salida":"regreso"))[0], response.ResultInfoOrError.messageError);

		return;
	}

	// should not be so complicated =/
	response = response.ResultAvailabilityPlusValuationsShort; 

	var fechaConsultada = response["fechaIdaConsultada"];

	var datesCache = isSalida ? dates_cache_salida : dates_cache_regreso;
	var datesLoading = isSalida? dates_loading_salida : dates_loading_regreso;

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

	if((isSalida?current_date_salida:current_date_regreso) == fechaConsultada) 
		fill_table($("#tbl_" + (isSalida?"salida":"regreso"))[0], flights, tarifas, fechaConsultada);
}
// ---------------------= =---------------------
function fill_table(table, rawFlights, rawTarifas, date)
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
					code 			: generateRandomCode(10)
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
					console.log(opc.vuelos[k-1].horaLlegada);
					console.log(opc.vuelos[k].horaSalida);
					
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
		$(table).append(build_compartments_header(table,allCompartments));

		// agrupar por numero de opcion
		for(var key in opcionesVuelo) {
			var opcion = opcionesVuelo[key];
			var row = build_flight_option_row(opcion, allCompartments);
			table.appendChild(row);

			for(var i=0;i<opcion.vuelos.length;i++) {
				var vuelo = opc.vuelos[i];

				var detail = build_flight_detail_row(opcion, vuelo);
				table.appendChild(detail);
			}
		}

		checkResultsTableWidth(); // acomodar tablas segun tamaño
	}
}
// ---------------------= =---------------------
function fill_table_with_loading(table)
{
	$(table).find("tr").not(":first").remove(); // clear table results

	var row = document.createElement("tr");
	$(row).html("<td colspan='20' class='loading-cell'><div class='loading'></div></td>");

	table.appendChild(row);
}
// ---------------------= =---------------------
function fill_table_with_message(table, message)
{
	$(table).find("tr").not(":first").remove(); // clear table results

	var row = document.createElement("tr");
	$(row).html("<td colspan='20' class='message'>"+message+"</td>");

	table.appendChild(row);
}
// ---------------------= =---------------------
function select_tarifa()
{
	var row = this.parentNode;
	var opcCode = $(row).data("opc_code");
	var opcion = allOptions[opcCode];

	if($(this).find(".rbtn").hasClass("checked"))
		return;

	var table = row.parentNode;
	while(false == $(table).is("table")) // find parent table
		table = table.parentNode;

	$(table).find(".flights-option-row").removeClass("selected");
	$(row).addClass("selected");

	$(table).find(".flight-details").removeClass("expanded").addClass("collapsed");

	$(table).find(".flight-details[data-opc_code='"+opcCode+"']")
		.removeClass("collapsed")
 		.addClass("expanded");

	$(table).find(".rbtn").removeClass("checked");
	$(this).find(".rbtn").addClass("checked");

	seleccionVuelo.ida.vuelos = opcion.vuelos;

	var tipo = $(table).data("tipo");
	var tblSeleccion = $("#tbl_seleccion_" + tipo);

	tblSeleccion.find(".cell-cod-origen-destino h1").html(opcion.origen + " - " + opcion.destino);

	tblSeleccion.find(".cell-duracion").html("Duraci&oacute;n:<br>" + formatDuracion(opcion.duracionVuelo) );

	tblSeleccion.find(".cell-fecha").html(formatDate(opcion.vuelos[0].fecha));
	tblSeleccion.find(".cell-hora span").html("Salida:<br>" + formatTime(opcion.horaSalida));
	tblSeleccion.css("display","block");
	tblSeleccion.addClass("changed");

	setTimeout(function() {
		tblSeleccion.removeClass("changed");
	},100);

	$("#div_empty_vuelo").css("display","none");
}
// ---------------------= =---------------------
function validate_search()
{
	var select_origen = $("#select_origen");
	var select_destino = $("#select_destino");
	var rbtn_ida = $("#rbtn_ida");
	var rbtn_ida_vuelta = $("#rbtn_ida_vuelta");
	var picker_salida = $("#picker_salida");
	var picker_regreso = $("#picker_regreso");

	var parms = {
		origen: select_origen.val(),
		destino: select_destino.val(),
		fecha_salida: picker_salida.val(),
		fecha_regreso: picker_regreso.val(),
		solo_ida: rbtn_ida.hasClass("checked")
	};

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

	// -------= AT THIS POINT, A NEW REQUEST BEGINS =-----------
	searchParameters.origen = parms.origen;
	searchParameters.destino = parms.destino;

	// fecha salida
	var raw_date = picker_salida.val().split(" ");
	searchParameters.fecha_salida = raw_date[2] +""+ MONTHS_LANGUAGE_TABLE[raw_date[1]] +""+ raw_date[0];
	
	// fecha retorno
	if(parms.solo_ida){
		searchParameters.fecha_regreso = null
	} else {
		raw_date = picker_regreso.val().split(" ");
		searchParameters.fecha_regreso = raw_date[2] +""+ MONTHS_LANGUAGE_TABLE[raw_date[1]] +""+ raw_date[0];
	}

	request_search_parameters(searchParameters);

	$("#widget_cambiar_vuelo").removeClass("expanded").addClass("collapsed");
}
// ---------------------= =---------------------
function changeNumPassengers()
{
	var ul = $(this.parentNode);
	var count = parseInt($(this).data("count"));

	var counting = ["one","two","three","four","five","six","seven","eight"];

	if(ul.hasClass("active")){
		ul.removeClass("active");
		var row = $(ul[0].parentNode.parentNode);

		if(false == $(this).hasClass("selected")) {
			ul.find("li").attr("class","");
			$(this).addClass("selected");

			// previous options
			var prev = $(this);
			for(var i=0;i<8;i++){
				prev = prev.prev();
				if(prev.length==0) break;
				prev.addClass("minus-" + counting[i]);
			}

			// next options
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
// ---------------------= =---------------------
function generateRandomCode(length) {
	var code = "";
	var chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
	for(var i=0;i<length;i++) {
		var r = parseInt(Math.random() * 100000) % chars.length;
		code += chars.substr(r,1);
	}

	return code;
}
// ---------------------= =---------------------
function formatDuracion(duracion)
{
	var str = 
		(duracion.hrs == 0 ? "" : (duracion.hrs + " hrs. " )) + 
		(duracion.mins == 0 ? "" : (duracion.mins + " mins."));

	return str;
}
// ---------------------= =---------------------
function formatDate(date) 
{
	var yyyy = parseInt(date.substr(0,4)),
	    mm = parseInt(date.substr(4,2))-1, // months are indexed from zero in Date object
	    dd = parseInt(date.substr(6,2));

	var d = new Date(yyyy, mm, dd, 0,0,0,0);

	var formatted = WEEKDAYS_LONG_2_CHARS_LANGUAGE_TABLE[d.getDay()] + ", " + dd + " de " + 
		MONTHS_2_CHARS_LANGUAGE_TABLE[mm+1];

	return formatted;
}
// ---------------------= =---------------------
function formatTime(time)
{
	var str = 
		(("00"+time.hh).slice(-2)) + ":" +
		(("00"+time.mm).slice(-2));

	return str;
}
// ---------------------= =---------------------
function calculateMinutesDifference(timeIni, timeFin)
{
	if(timeIni.hh > timeFin.hh)
		timeIni.hh += 24;

	return (timeFin.hh - timeIni.hh) * 60 + (timeFin.mm - timeIni.mm);
}
