// ---------------------= =---------------------
var current_parameters = {
	origen:"",destino:"",fecha_salida:"",fecha_regreso:null
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
	CIJ: "",
	CBB: "Aeropuerto Internacional Jorge Wilstermann",
	MAD: "",
	VVI: "",
	SRE: "",
	TJA: "",
	TDD: "",
	EZE: "",
	GRU: ""
};

var compartment_names = {"compart_2":"Business","compart_3":"Econ&oacute;mica"};
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

	setInterval(checkSearchWidgetAvailability, 200);
}); // init

// ---------------------= =---------------------
function handle_initial_request()
{
	current_parameters.origen = location.queryString['origen'];
	current_parameters.destino = location.queryString['destino'];
	current_parameters.fecha_salida = location.queryString['salida'];
	current_parameters.fecha_regreso = location.queryString['regreso'];

	// origen
	if(current_parameters.origen == null)
		current_parameters.origen = "CBB";

	// destino
	if(current_parameters.destino == null)
		current_parameters.destino = "VVI";

	// salida
	if(current_parameters.fecha_salida == null) {
		current_parameters.fecha_salida = todayStr;
	}

	request_search_parameters(current_parameters);
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

	// $("#tbl_days_selector_salida, #tbl_days_selector_regreso")
	// 	.find("tr")
	// 	.html("<td colspan='20' class='loading-cell'><div class='loading'></div></td>");

	$("#tbl_days_selector_salida .day-selector, #tbl_days_selector_regreso .day-selector")
		.removeClass("no-flights")
		.removeClass("selected")
		.addClass("faded")
		.html("");

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
			fill_table(table, datesCache["f_" + date], tarifasCache["f_" + date]);
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
		data["from"] = current_parameters.origen;
		data["to"] = current_parameters.destino;
	}
	else{
		data["to"] = current_parameters.origen;
		data["from"] = current_parameters.destino;
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

	get_flights_for_date(current_parameters.fecha_salida, true);

	if(current_parameters.fecha_regreso != null){
		build_dates_selector(
			response["calendarioOW"]["OW_Vuelta"]["salidas"]["salida"],
			response["fechaVueltaConsultada"], 
			$("#tbl_days_selector_regreso")
		);

		pendingTablesBuild.regreso = true;

		get_flights_for_date(current_parameters.fecha_regreso, false);
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
	// should not be so complicated =/
	response = $.parseJSON(response.AvailabilityPlusValuationsShortResult).ResultAvailabilityPlusValuationsShort; 

	var fechaConsultada = response["fechaIdaConsultada"];

	var datesCache = isSalida ? dates_cache_salida : dates_cache_regreso;
	var datesLoading = isSalida? dates_loading_salida : dates_loading_regreso;

	// removes from date loading
	datesLoading.splice(datesLoading.indexOf(fechaConsultada), 1);

	var flights = response["vuelosYTarifas"]["Vuelos"]["ida"]["vuelos"]["vuelo"];

	// when there is only one result, the response is an object, not an array, 
	// so it must be translated
	if(flights.constructor !== Array){
		var obj = flights;
		flights = [];
		flights.push(obj);
	}

	var tarifas = response["vuelosYTarifas"]["Tarifas"]["TarifaPersoCombinabilityIdaVueltaShort"]["TarifasPersoCombinabilityID"]["TarifaPersoCombinabilityID"];

	// add to cache
	datesCache["f_" + fechaConsultada] = flights;
	tarifasCache["f_" + fechaConsultada] = tarifas;

	if((isSalida?current_date_salida:current_date_regreso) == fechaConsultada) 
		fill_table($("#tbl_" + (isSalida?"salida":"regreso"))[0], flights, tarifas);
}
// ---------------------= =---------------------
function fill_table(table, raw_flights, rawTarifas)
{
	if(table.id == "tbl_salida")
		pendingTablesBuild.salida = false;
	else if(table.id == "tbl_regreso")
		pendingTablesBuild.regreso = false;

	var tarifas = {};
	for(var i=0;i<rawTarifas.length;i++) {
		var raw_tarifa = rawTarifas[i];
		tarifas[raw_tarifa["clases"]] = raw_tarifa["importe"];
	}

	$(table).find("tr").not(":first").remove(); // clear table results

	if(raw_flights.length == 0){
		$(table).append("<tr><td colspan='10'><h2 class='empty-msg'>No hay vuelos disponibles</h2></td></tr>");
	} else {
		var flights = [];
		var compartments = [];
		var compartment_idx = 0;
		// translate raw data of services to easy usable json data
		for(var i=0;i<raw_flights.length;i++) {
			var flight = {
				num_vuelo:"",
				hora_salida:"",
				hora_llegada:"",
				duracion: "",
				duracion_ext: "",
				operador:"",
				tarifas:{}, // by compartment
				ciudad_origen:"",
				ciudad_destino:"",
				aeropuerto_origen:"",
				aeropuerto_destino:""
			};

			var raw_flight = raw_flights[i];

			// numero de vuelo
			flight.num_vuelo = raw_flight["num_vuelo"];

			// calcular tiempo de vuelo, y formatear para lectura
			var timeA = [raw_flight["hora_salida"].substr(0,2), raw_flight["hora_salida"].substr(2,2)];
			var timeB = [raw_flight["hora_llegada"].substr(0,2), raw_flight["hora_llegada"].substr(2,2)];

			flight.hora_salida = timeA[0]+":"+timeA[1];
			flight.hora_llegada = timeB[0]+":"+timeB[1];

			var totalMinutesA = parseInt(timeA[0]) * 60 + parseInt(timeA[1]);
			var totalMinutesB = parseInt(timeB[0]) * 60 + parseInt(timeB[1]);
			var totalMinutes = totalMinutesB - totalMinutesA;

			var h = parseInt(totalMinutes/60);
			var m = parseInt(totalMinutes%60);

			flight.duracion = (h==0?"":(h+" h ")) + m==0?"":(m+" m");
			flight.duracion_ext = (h==0?"":(h+" hrs. ")) + m==0?"":(m+" min.");
			flight.operador = "BoA";

			// buscar mejor tarifa por clase
			var rawClasses = raw_flight["clases"]["clase"];

			for(var k=0;k<rawClasses.length;k++) {
				var flightClass = rawClasses[k]["cls"];

				if(false==(flightClass in tarifas)) 
					continue;

				var tarifa = parseInt(tarifas[flightClass]);

				var compartment_key = "compart_" + rawClasses[k]["compart"];

				// check general compartment table value
				if(false == (compartment_key in compartments)) {
					compartments[compartment_key] = {};
					compartments[compartment_key].nombre = compartment_names[compartment_key];
					compartments[compartment_key].idx = compartment_idx++;
				}

				// then check for the compartments in tarifas of flight
				if(false == (compartment_key in flight.tarifas)) { // first occurrence of compartment in flight
					flight.tarifas[compartment_key] = {};
					flight.tarifas[compartment_key]['cantidad'] = tarifa;
					flight.tarifas[compartment_key]['clase'] = flightClass;
					flight.tarifas[compartment_key]['nombre'] = compartment_names[compartment_key];
				} else {
					if(tarifa < flight.tarifas[compartment_key]['tarifa']) {
						flight.tarifas[compartment_key]['cantidad'] = tarifa;
						flight.tarifas[compartment_key]['clase'] = flightClass;
						flight.tarifas[compartment_key]['nombre'] = compartment_names[compartment_key];
					}
				}
			}

			// datos de origen y destino
			flight.ciudad_origen = cities[raw_flight["origen"]];
			flight.ciudad_destino = cities[raw_flight["destino"]];
			flight.aeropuerto_origen = airports[raw_flight["origen"]];
			flight.aeropuerto_destino = airports[raw_flight["destino"]];

			flights.push(flight);
		}

		// --- setup cabecera
		// remove all headers for previous compartments
		$(table).find("tr:first-child th.compartment-header").remove();
		// add compartment in header by its index
		for(var i=0;i<compartment_idx;i++){
			for(var key in compartments){
				if(i==compartments[key].idx){
					$(table).find("tr:first-child")
						.append("<th class='class-group compartment-header'>"+compartment_names[key]+"</th>");
					break;
				}
			}
		}

		// -- mostrar datos
		for(var i=0;i<flights.length;i++) {
			var flight = flights[i];

			var row = document.createElement("tr");
			$(row).addClass("flight-row")
			// numero de vuelo
			$(row).attr("data-num_vuelo", flight.num_vuelo);

			// salida,llegada y duración
			var cell = document.createElement("td");
			$(cell).html(flight.hora_salida+"&nbsp;&nbsp;-&nbsp;&nbsp;"+flight.hora_llegada+"<br>" + 
				"<span>Duraci&oacute;n: "+flight.duracion+"</span>");
			row.appendChild(cell);

			// Operado por
			$(row).append("<td>"+flight.operador+"</td>");

			// tarifas por compartimiento
			for(var k=0;k<compartment_idx;k++) {
				var tarifa=-1;

				for(var compartment_key in compartments) { 
					if(compartments[compartment_key].idx == k){
						tarifa = flight.tarifas[compartment_key].cantidad;
						break;
					}
				}

				cell = document.createElement("td");
				$(cell).addClass("tarifa");
				$(cell).html("<div class='rbtn'><div></div></div>" + tarifa + " " + HTML_CURRENCIES[CURRENCY]);
				$(cell).click(select_tarifa);
				row.appendChild(cell);	
			}

			table.appendChild(row);

			// fila de detalles
			row = document.createElement("tr");
			$(row).addClass("flight-details").addClass("collapsed")
				.html("<td colspan='10' class='cell-details'><div class='expandable'><table style='width:100%'><tr class='details-row'></tr></table></div></td>");

			var tbl;
			for(var m=0;m<2;m++) {
				var isSalida = (m==0);
				tbl = document.createElement("table");
				$(tbl).attr("cellpadding","0").attr("cellspacing","0");
				$(tbl).addClass("detail");
				$(tbl).css("width","100%");

				var timeStr = isSalida?flight.hora_salida:flight.hora_llegada;

				$(tbl).append("<tr><td class='icon-cell' rowspan='2'><div class='icon-"+(isSalida?"salida":"regreso")+"'></div></td><td class='time-cell'>"+timeStr+"</td></tr>");
				$(tbl).append("<tr><td class='hrs-cell'>Hrs.</td></tr>");
				$(tbl).append("<tr><td colspan='2'><label " + (isSalida?"":"style='visibility:hidden'") +">Duraci&oacute;n: &nbsp"+flight.duracion_ext+"</label></td></tr>");
				$(tbl).append("<tr><td colspan='2'><h2>"+flight["ciudad_"+(isSalida?"origen":"destino")]+"</h2></td></tr>");
				$(tbl).append("<tr><td colspan='2'><label>"+flight["aeropuerto_"+(isSalida?"origen":"destino")]+"</label></td></tr>");

				var innerCell = document.createElement("td");
				$(innerCell).css("width","48%");
				$(innerCell).append(tbl);
				$(row).find(".expandable .details-row").append(innerCell);

				if(isSalida) {
					$(row).find(".expandable .details-row").append("<td style='width:4%'></td>");
				}
			}

			table.appendChild(row);
		}
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
function select_tarifa()
{
	var row = this.parentNode;

	if($(this).find(".rbtn").hasClass("checked"))
		return;

	var table = row.parentNode;
	while(false == $(table).is("table")) // find parent table
		table = table.parentNode;

	$(table).find(".flight-row").removeClass("selected")
	$(row).addClass("selected");

	$(table).find(".flight-details").removeClass("expanded").addClass("collapsed");
	var details = $(row).next();
	details.removeClass("collapsed").addClass("expanded");

	$(table).find(".rbtn").removeClass("checked");
	$(this).find(".rbtn").addClass("checked");
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
	current_parameters.origen = parms.origen;
	current_parameters.destino = parms.destino;

	// fecha salida
	var raw_date = picker_salida.val().split(" ");
	current_parameters.fecha_salida = raw_date[2] +""+ MONTHS_LANGUAGE_TABLE[raw_date[1]] +""+ raw_date[0];
	
	// fecha retorno
	if(parms.solo_ida){
		current_parameters.fecha_regreso = null
	} else {
		raw_date = picker_regreso.val().split(" ");
		current_parameters.fecha_regreso = raw_date[2] +""+ MONTHS_LANGUAGE_TABLE[raw_date[1]] +""+ raw_date[0];
	}

	request_search_parameters(current_parameters);

	$("#widget_cambiar_vuelo").removeClass("expanded").addClass("collapsed");
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
// ---------------------= =---------------------
// ---------------------= =---------------------
// ---------------------= =---------------------
