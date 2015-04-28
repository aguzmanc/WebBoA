// ---------------------= =---------------------
var initial_parameters = {
	desde:"",hasta:"",fecha_salida:""
};

var dates_cache = {};

var dates_loading = [];

var current_date_salida = "";
var current_date_regreso = "";

var todayStr = "";

// configuration
var currencies = {euro:"&euro;", usd:"USD"};
var clases = ["economica"];
// ---------------------= =---------------------
$(document).on('ready',function()
{
	initialize_header(true);

	initialize_ui_sections({anchor_section_headers:false});

	$("#widget_cambiar_vuelo .btn-expand").click(toggle_widget_cambiar_vuelo);

	var today = new Date();
	var mm = ("00" + (today.getMonth()+1)).slice(-2);
	var dd = ("00" + (today.getDate())).slice(-2);
	todayStr = today.getFullYear() + "" + mm + "" + dd;

	handle_initial_request();
});
// ---------------------= =---------------------
function handle_initial_request()
{
	initial_parameters.desde = location.queryString['desde'];
	initial_parameters.hasta = location.queryString['hasta'];
	initial_parameters.fecha_salida = location.queryString['salida'];

	// desde
	if(initial_parameters.desde == null)
		initial_parameters.desde = "CBBA";

	// hasta
	if(initial_parameters.hasta == null)
		initial_parameters.hasta = "SCZ";

	// salida
	if(initial_parameters.fecha_salida == null) {
		initial_parameters.fecha_salida = todayStr;
	}

	current_date_salida = initial_parameters.fecha_salida;

	request_nearest_dates(initial_parameters.fecha_salida, true, async_receive_salida_dates);

	// regreso
	var fecha_regreso = location.queryString['regreso'];
	if(fecha_regreso != null) {
		initial_parameters['fecha_regreso'] = fecha_regreso;
		current_date_regreso = initial_parameters.fecha_regreso;

		request_nearest_dates(initial_parameters.fecha_regreso, false, async_receive_regreso_dates);
	}
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

	get_for_date(selected_date, isSalida);
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
function get_for_date(date, isSalida)
{
	var table = $("#tbl_" + (isSalida ? "salida" : "regreso"))[0];
	var currentDate = (isSalida?current_date_salida:current_date_regreso);
	var isCurrentDateSelected = (currentDate == date);
	var existsInCache = (("f_" + date) in dates_cache);
	var hasBeenRequested = ($.inArray(date, dates_loading) != -1);

	if(existsInCache) {
		if(isCurrentDateSelected) {
			fill_table(table, dates_cache["f_" + date]);
		}
	}else{
		if(false == hasBeenRequested)
			request_flights(date, isSalida ? async_receive_salida_flights : async_receive_regreso_flights);

		if(isCurrentDateSelected)
			fill_table_with_loading(table);
	}
}
// ---------------------= =---------------------
function request_flights(date, results_callback) 
{
	dates_loading.push(date);

	$.ajax({
		url: "content/fake_services/flights.php",
		type: 'post',
		dataType:'json',
		success: results_callback,
		data: {
			desde: initial_parameters.desde,
			hasta: initial_parameters.hasta,
			fecha: date // T.O.D.O.  translate to actual service parms
		} 
	});
}
// ---------------------= =---------------------
function request_nearest_dates(date, isSalida, results_callback)
{
	var now = new Date();
	var hh = ("00" + (now.getHours())).slice(-2);
	var mm = ("00" + (now.getMinutes())).slice(-2);

	var currentTimeStr = hh+""+mm;

	$.ajax({
		url: "content/fake_services/nearest_dates.json",
		type: 'post',
		dataType:'json',
		success: results_callback,
		data: {
			credentials 	: "{ae7419a1-dbd2-4ea9-9335-2baa08ba78b4}{59331f3e-a518-4e1e-85ca-8df59d14a420}", // x( 
			language 		: "ES",
			currency 		: CODE_CURRENCIES[CURRENCY],
			locationType 	: "N",
			location 		: "BOLIVIA",
			bringAv 		: "1",
			bringRates 		: "2",
			surcharges 		: "0",
			directionality 	: "0",
			from 			: initial_parameters.desde,
			to 				: initial_parameters.hasta,
			departing 		: initial_parameters.fecha_salida,
			returning 		: (initial_parameters.fecha_regreso == null ? "" : initial_parameters.fecha_regreso),
			sites			: "1",
			compartment 	: "0", 
			classes 		: "",
			classesState 	: "T",
			clientDate 		: todayStr,
			clientHour 		: currentTimeStr,
			forRelease 		: "1",
			cat19Discounts  : "", 
			specialDiscounts: "",
			booking 		: "",
			ipAddress 		: "127.0.0.1", /*****xD*****/
			xmlOrJson 		: false  // false=json ; true=xml 
		} 
	});
}
// ---------------------= =---------------------
function async_receive_salida_dates(response) 
{
	receive_nearest_dates(response, true);

	$("#tbl_days_selector_salida").find(".day-selector:not(.no-flights)").click(change_day);

	get_for_date(initial_parameters.fecha_salida, true);
}
// ---------------------= =---------------------
function async_receive_regreso_dates(response) 
{
	receive_nearest_dates(response, false);

	$("#tbl_days_selector_regreso").find(".day-selector:not(.no-flights)").click(change_day);

	get_for_date(initial_parameters.fecha_regreso, false);
}
// ---------------------= =---------------------
function receive_nearest_dates(response, isSalida)
{
	var rawDates = response["ResultCalendar"]["calendarioOW"]["OW_Ida"]["salidas"]["salida"];

	var tarifasByDate = { };

	// mine some data first
	for(var i=0;i<rawDates.length;i++){
		var rawDate = rawDates[i];
		var tarifaStr = rawDate["tarifas"]["tarifaCalen"]["importe"];
		tarifaStr = tarifaStr.substr(0,tarifaStr.indexOf("."));

		tarifasByDate[rawDate["fecha"]] = tarifaStr;
	}

	var requestedDateStr = response["ResultCalendar"]["fechaIdaConsultada"];

	requestedDate = new Date(requestedDateStr.substr(0,4),
							 requestedDateStr.substr(4,2),
							 requestedDateStr.substr(6,2), 0,0,0,0);

	var tbl = $("#tbl_days_selector_" + (isSalida?"salida":"regreso"));
	tbl.find("tr td").remove();

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

		tbl.find("tr").append(cell);
	}

	// select middle date
	tbl.find("tr td:nth-child(4)").addClass("selected");
}
// ---------------------= =---------------------
function async_receive_salida_flights(response)
{
	// removes from date loading
	dates_loading.splice(dates_loading.indexOf(response.requested_date), 1);

	// add to cache
	dates_cache["f_" + response.requested_date] = response.flights;

	if(current_date_salida == response.requested_date){
		fill_table($("#tbl_salida")[0], response.flights);
	}
}
// ---------------------= =---------------------
function async_receive_regreso_flights(response) 
{
	// removes from date loading
	dates_loading.splice(dates_loading.indexOf(response.requested_date), 1);

	// add to cache
	dates_cache["f_" + response.requested_date] = response.flights;

	if(current_date_regreso == response.requested_date){
		fill_table($("#tbl_regreso")[0], response.flights);
	}
}
// ---------------------= =---------------------
function fill_table(table, flights)
{
	$(table).find("tr").not(":first").remove(); // clear table results

	if(flights.length == 0){
		$(table).append("<tr><td colspan='10'><h2 class='empty-msg'>No hay vuelos disponibles</h2></td></tr>");
	} else {
		for(var i=0;i<flights.length; i++) {
			var flight = flights[i];
			var row = document.createElement("tr");
			
			// salida - llegada
			var cell = document.createElement("td");

			var timeA = [flight.salida.substr(0,2), flight.salida.substr(2,2)];
			var timeB = [flight.llegada.substr(0,2), flight.llegada.substr(2,2)];
			var totalMinutesA = parseInt(timeA[0]) * 60 + parseInt(timeA[1]);
			var totalMinutesB = parseInt(timeB[0]) * 60 + parseInt(timeB[1]);
			var totalMinutes = totalMinutesB - totalMinutesA;

			var durationTime = parseInt(totalMinutes/60) + "h " + (totalMinutes%60) + "m";

			$(cell).html(timeA[0]+":"+timeA[1]+"&nbsp;&nbsp;-&nbsp;&nbsp;"+timeB[0]+":"+timeB[1]+"<br><span>Duraci&oacute;n: "+durationTime+"</span>");
			row.appendChild(cell);

			// Operado por
			$(row).append("<td>BoA</td>")

			// cells for every kind of service (clase)
			for(var k=0;k<clases.length;k++) {
				var clase = clases[k];
				cell = document.createElement("td");
				if(flight[clase]=="none")
					$(cell).addClass("disabled").html("<span>No disponible</span>");
				else
					$(cell).html(flight[clase] + " " + HTML_CURRENCIES[CURRENCY]);
				row.appendChild(cell);	
			}

			table.appendChild(row);
		}
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
// ---------------------= =---------------------
// ---------------------= =---------------------