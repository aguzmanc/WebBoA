// ---------------------= =---------------------
var initial_parameters = {
	origen:"",destino:"",fecha_salida:""
};

var dates_cache_salida = {};
var dates_cache_regreso = {};
var tarifasCache = {};

var dates_loading_salida = [];
var dates_loading_regreso = [];

var current_date_salida = "";
var current_date_regreso = "";

var todayStr = "";

// configuration
var currencies = {euro:"&euro;", usd:"USD"};

var cities = {
	LPB: "La Paz",
	CBB: "Cochabamba",
	MAD: "Madrid",
	VVI: "Santa Cruz",
	SRE: "Sucre",
	TJA: "Tarija",
	TRI: "Trinidad",
	EZE: "Buenos Aires",
	GRU: "Sao Paulo"
};

var airports = {
	LPB: "Aeropuerto Internacional El Alto",
	CBB: "Aeropuerto Internacional Jorge Wilstermann",
	MAD: "",
	VVI: "",
	SRE: "",
	TJA: "",
	TRI: "",
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

}); // init

// ---------------------= =---------------------
function handle_initial_request()
{
	initial_parameters.origen = location.queryString['origen'];
	initial_parameters.destino = location.queryString['destino'];
	initial_parameters.fecha_salida = location.queryString['salida'];

	// origen
	if(initial_parameters.origen == null)
		initial_parameters.origen = "CBB";

	// destino
	if(initial_parameters.destino == null)
		initial_parameters.destino = "VVI";

	// salida
	if(initial_parameters.fecha_salida == null) {
		initial_parameters.fecha_salida = todayStr;
	}

	current_date_salida = initial_parameters.fecha_salida;

	// setup labels
	var origen = initial_parameters.origen;
	var destino = initial_parameters.destino;
	var cityOrigen = cities[origen];
	var cityDestino = cities[destino];

	$("#lbl_info_salida").html("Ida: "+cityOrigen+"("+origen+") - "+cityDestino+"("+destino+")");

	// regreso
	var fecha_regreso = location.queryString['regreso'];
	if(fecha_regreso != null) {
		initial_parameters['fecha_regreso'] = fecha_regreso;
		current_date_regreso = initial_parameters.fecha_regreso;

		$("#lbl_info_regreso").show().html("Retorno: "+cityDestino+"("+destino+") - "+cityOrigen+"("+origen+")");
	} else {
		$("#lbl_info_regreso, #tbl_dayselector_regreso, #tbl_regreso").hide();
	}

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
		from 			: initial_parameters.origen,
		to 				: initial_parameters.destino,
		rateType		: "1",
		departing 		: initial_parameters.fecha_salida,
		returning 		: (initial_parameters.fecha_regreso == null ? "" : initial_parameters.fecha_regreso),
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

	$("#tbl_days_selector_salida, #tbl_days_selector_regreso")
		.find("tr")
		.html("<td colspan='20' class='loading-cell'><div class='loading'></div></td>");

	$("#tbl_salida .tarifa").click(select_tarifa);
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

		from 			: initial_parameters.origen,
		to 				: initial_parameters.destino,

		departing 		: isSalida?date:"",
		returning 		: isSalida?"":date,
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

	get_flights_for_date(initial_parameters.fecha_salida, true);

	if(initial_parameters.fecha_regreso != null){
		build_dates_selector(
			response["calendarioOW"]["OW_Vuelta"]["salidas"]["salida"],
			response["fechaVueltaConsultada"], 
			$("#tbl_days_selector_regreso")
		);

		get_flights_for_date(initial_parameters.fecha_regreso, false);
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

	var fechaConsultada = response["fecha"+(isSalida?"Ida":"Vuelta")+"Consultada"];

	var datesCache = isSalida ? dates_cache_salida : dates_cache_regreso;
	var datesLoading = isSalida? dates_loading_salida : dates_loading_regreso;

	// removes from date loading
	datesLoading.splice(datesLoading.indexOf(fechaConsultada), 1);

	var flights = response["vuelosYTarifas"]["Vuelos"][isSalida?"ida":"vuelta"]["vuelos"]["vuelo"];	
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
			var timeA = [raw_flight["hora_salida"].substr(0,2), flight["hora_salida"].substr(2,2)];
			var timeB = [raw_flight["hora_llegada"].substr(0,2), flight["hora_llegada"].substr(2,2)];

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
					flight.tarifas[compartment_key]['tarifa'] = tarifa;
					flight.tarifas[compartment_key]['clase'] = flightClass;
					flight.tarifas[compartment_key]['nombre'] = compartment_names[compartment_key];
				} else {
					if(tarifa < flight.tarifas[compartment_key]['tarifa']) {
						flight.tarifas[compartment_key]['tarifa'] = tarifa;
						flight.tarifas[compartment_key]['clase'] = flightClass;
						flight.tarifas[compartment_key]['nombre'] = compartment_names[compartment_key];
					}
				}
			}

			// datos de origen y destino
			flight.ciudad_origen = cities[flight["origen"]];
			flight.ciudad_destino = cities[flight["destino"]];
			flight.aeropuerto_origen = airports[flight["origen"]];
			flight.aeropuerto_destino = airports[flight["destino"]];

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
			var flight = raw_flights[i];

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
			for(var k=0;k<compartment_idx++;k++) {
				var tarifa=-1;
				for(var compartment_key in flight.tarifas){
					tarifa = flight.tarifas[compartment_key];
					if(tarifa.compartment_idx == k)
						break;
				}

				cell = document.createElement("td");
				$(cell).addClass("tarifa");
				$(cell).html("<div class='rbtn'><div></div></div>" + tarifa + " " + HTML_CURRENCIES[CURRENCY]);
				row.appendChild(cell);	
			}

			table.appendChild(row);
		}

		//-----------
		// for(var i=0;i<raw_flights.length; i++) {
		// 	var flight = raw_flights[i];

		// 	var row = document.createElement("tr");
		// 	// numero vuelo
		// 	$(row).addClass("flight-row").attr("data-num_vuelo",flight.num_vuelo);
			
		// 	// salida,llegada y duración
		// 	var cell = document.createElement("td");
		// 	$(cell).html(flight.hora_salida+"&nbsp;&nbsp;-&nbsp;&nbsp;"+flight.hora_llegada+"<br>" + 
		// 		"<span>Duraci&oacute;n: "+flight.duracion+"</span>");
		// 	row.appendChild(cell);

		// 	// Operado por
		// 	$(row).append("<td>"+flight.operador+"</td>");

		// 	// remove all headers for previous compartments
		// 	$(table).find("tr:first-child th.compartment-header").remove();

		// 	for(var compartment in compartment_names){
		// 		if(compartment in bestTarifasByCompartment){
		// 			$(table).find("tr:first-child")
		// 				.append("<th class='class-group compartment-header'>"+compartment_names[compartment]+"</th>");

		// 			cell = document.createElement("td");
		// 			$(cell).addClass("tarifa")
		// 				   .html("<div class='rbtn'><div></div></div>" + bestTarifasByCompartment[compartment] + " " + HTML_CURRENCIES[CURRENCY]);
		// 			$(cell).click(select_tarifa);
		// 			row.appendChild(cell);	
		// 		}
		// 	}

		// 	table.appendChild(row);

		// 	row = document.createElement("tr");
		// 	$(row).addClass("flight-details").addClass("collapsed").html("<td colspan='10' class='cell-details'><div class='expandable'></div></td>");

		// 	var tbl;
		// 	for(var m=0;m<2;m++) {
		// 		var isSalida = (m==0);
		// 		tbl = document.createElement("table");
		// 		$(tbl).attr("cellpadding","0").attr("cellspacing","0");

		// 		if(isSalida)
		// 			$(tbl).css("float","left"); // if first

		// 		var timeStr = isSalida?(timeA[0]+":"+timeA[1]):(timeB[0]+":"+timeB[1]);

		// 		$(tbl).append("<tr><td rowspan='2'><div class='icon-"+(isSalida?"salida":"regreso")+"'></div></td><td>"+timeStr+"</td></tr>");
		// 		$(tbl).append("<tr><td>Hrs.</td></tr>");
		// 		$(tbl).append("<tr><td colspan='2'><label " + (isSalida?"":"style='visibility:hidden'") +">Duraci&oacute;n: &nbsp"+durationTimeExp+"</label></td></tr>");
		// 		$(tbl).append("<tr><td colspan='2'><h2>"+cities[flight[isSalida?"origen":"destino"]]+"</h2></td></tr>");
		// 		$(tbl).append("<tr><td colspan='2'><label>"+airports[flight[isSalida?"origen":"destino"]]+"</label></td></tr>");

		// 		$(row).find(".expandable").append(tbl);
		// 	}

		// 	table.appendChild(row);
		// }
	}
}
// ---------------------= =---------------------
function fill_table_with_loading(table, flights)
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
	if($(row).hasClass("selected")) return;

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

	// -------= AT THIS POINT, DATA SEND BEGINS (redirect) =-----------
	var data = {
		origen: parms.origen,
		destino: parms.destino
	};

	// fecha salida
	raw_date = picker_salida.val().split(" ");
	data["salida"] = raw_date[2] +""+ MONTHS_LANGUAGE_TABLE[raw_date[1]] +""+ raw_date[0];

	// fecha retornos
	if(false == parms.solo_ida) {
		raw_date = picker_regreso.val().split(" ");
		data["regreso"] = raw_date[2] +""+ MONTHS_LANGUAGE_TABLE[raw_date[1]] +""+ raw_date[0];
	}

	var results_url = urls["flight_schedule_results"];

	results_url = results_url + "?origen=" + data.origen+"&destino=" + data.destino
		+ "&salida=" + data.salida 
		+ (parms.solo_ida?"":("&regreso=" + data.regreso));

	var btn = $("#btn_redirect");
	btn.attr("href",results_url)
	   .attr("target","_self");

	btn[0].click();
}
// ---------------------= =---------------------
// ---------------------= =---------------------
