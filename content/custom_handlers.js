// ---------------------------------------------------------------------------
var CURRENCY = "bs"; // "euro", "bs" , "usd" 
var HTML_CURRENCIES = {bs:"Bs.",euro:"&euro;",usd:"USD"};
var CODE_CURRENCIES = {bs:"BOB",euro:"EU",usd:"USD"};
var SERVICE_CREDENTIALS_KEY = "z+bwQzMVBklGZ42xI45QYdeI6V+zHjjfSyULJMWKgH0G2qkasgs+LaGvZYYLe9s+ABTKCPa3RNdiLGlb3wBMWnrYqDusuEvZtrT5kZK+PYjodw11Skn4GuEa/vBjimiJIHskXyu0UociT0HglEoORow3WSwyaHUu0tdZEfahPHdOHcfEkRelOw==";
// ---------------------------------------------------------------------------
var BoA = {
	urls : {
		home : "home.html",
		info_page : "info_page.html",
		facebook: "http://www.facebook.com/bolivianaDeAviacion",
		twitter: "http://www.twitter.com/BoABolivia",
		instagram: "http://i.instagram.com/boa_bolivia",
		youtube: "http://www.youtube.com/user/BoADigital",
		revista_destinos: "http://www.destinos.com.bo",
		ventas_web: "mailto:ventasweb@boa.bo",
		info_madrid: "http://www.minetur.gob.es/turismo/es-ES/Paginas/IndexTurismo.aspx",
		info_salta: "http://www.turismo.gov.ar/",
		info_bs_as: "http://www.turismo.gov.ar/",
		info_sao_paulo: "http://www.turismo.gov.br/turismo/home.html",
		info_miami: "http://www.miamibeachfl.gov/tcd/",
		info_turismo_bolivia: "http://www.minculturas.gob.bo",
		contrato_transporte: "content/docs/contrato_transporte.pdf",
		convocatorias: "http://sms.obairlines.bo/webboa/menupublicaciones.htm",
		/* RESULTADOS DE HORARIOS DE VUELOS */
		flight_schedule_results : "http://localhost/reserva_vuelos.html",
		/* MAPAS DE OFICINAS */
		office_maps : "http://localhost",
		/* BOA EN REDES SOCIALES */
		social_networks: "http://localhost",
		/* CALL CENTER */
		call_center: "http://localhost", 

		/* SERVICES */
		// nearest_dates_service: "http://localhost/content/fake_services/nearest_dates.php",
		nearest_dates_service: "http://skbpruebas.cloudapp.net/Services/BasicReservationService.svc/Calendar",
		flights_schedule_service: "http://skbpruebas.cloudapp.net/Services/BasicReservationService.svc/AvailabilityPlusValuationsShort",
		validate_flight_selection_service: "http://localhost/content/fake_services/validate_flight_selection_service.php",
		register_passengers_service: "http://localhost/content/fake_services/register_passengers_service.php"
	}, 

	defaultConsultaVuelos :{
		origen: 'CBB',
		destino: 'MAD',
		fechaIda : formatCompactDate(new Date()), // today 
		fechaVuelta: null, //"20151217", // example, (not recommended)
		adulto: 1,
		infante: 0,
		ninho: 0
	},

	// Configuracion de bancos
	banks : {
		columnsPerRow: 3, // Cambiar este tamaño de acuerdo a la grilla

		bcp: {
			visible: true,
			enabled: true,
			url: "http://www.kittenwar.com"
		}, 
		bnb: {
			visible: true,
			enabled: true,
			url: "http://www.kittenwar.com"
		},
		economico: {
			visible: true,
			enabled: false,
			url: "http://www.kittenwar.com"
		},
		fassil: {
			visible: true,
			enabled: false,
			url: "http://www.kittenwar.com"
		},
		fie: {
			visible: true,
			enabled: true,
			url: "http://www.kittenwar.com"
		},
		ganadero: {
			visible: true,
			enabled: true,
			url: "http://www.kittenwar.com"
		},
		masterCard: {
			visible: true,
			enabled: true,
			url: "http://www.kittenwar.com"
		},
		prodem: {
			visible: true,
			enabled: true,
			url: "http://www.kittenwar.com"
		},
		union: {
			visible: true,
			enabled: true,
			url: "http://www.kittenwar.com"
		},
		visa: {
			visible: true,
			enabled: true,
			url: "http://www.kittenwar.com"
		}
	}, 

	// Configuracion de Widget (compra)
	widgetReservas :{
		enableCompraStage: true,
		redirectUrlPxRegisterFinished: "http://www.kittenwar.com"		
	}
};
// ---------------------------------------------------------------------------
function handle_reserva_vuelos(parameters)
{
	console.log("desde:" + parameters.desde);
	console.log("hasta:" + parameters.hasta);

	console.log(parameters.salida);
	if(parameters.salida!=null){
		console.log("salida.dd:" + parameters.salida.dd);
		console.log("salida.mm:" + parameters.salida.mm);
		console.log("salida.yyyy:" + parameters.salida.yyyy);
	}

	console.log(parameters.solo_ida);

	if(parameters.solo_ida == false){
		if(parameters.regreso!=null){
			console.log("regreso.dd:" + parameters.regreso.dd);
			console.log("regreso.mm:" + parameters.regreso.mm);
			console.log("regreso.yyyy:" + parameters.regreso.yyyy);
		}
	}

	console.log(parameters.is_senior);
	console.log(parameters.nro_adultos);
	console.log(parameters.nro_ninhos);
	console.log(parameters.nro_bebes);
	console.log(parameters.flexible_en_fechas);
}
// ---------------------------------------------------------------------------
function handle_change_language(language)
{
	console.log("NUEVO LENGUAJE: " + language);
}
// ---------------------------------------------------------------------------
function handle_web_check_in(parameters)
{
	console.log(parameters);
}
// ---------------------------------------------------------------------------
function handle_buscar_estado_vuelo(parameters)
{
	console.log(parameters);
}
// ---------------------------------------------------------------------------
// ---------------------------------------------------------------------------
// ---------------------------------------------------------------------------
// ---------------------------------------------------------------------------
// ---------------------------------------------------------------------------
// ---------------------------------------------------------------------------
// ---------------------------------------------------------------------------
// ---------------------------------------------------------------------------
// ---------------------------------------------------------------------------
// ---------------------------------------------------------------------------
// ---------------------------------------------------------------------------
// ---------------------------------------------------------------------------
// ---------------------------------------------------------------------------
// ---------------------------------------------------------------------------
// ---------------------------------------------------------------------------
// ---------------------------------------------------------------------------
// ---------------------------------------------------------------------------