// ---------------------------------------------------------------------------
var CURRENCY = "bs"; // "euro", "bs" , "usd" 
var HTML_CURRENCIES = {bs:"Bs.",euro:"&euro;",usd:"USD"};
var CODE_CURRENCIES = {bs:"BOB",euro:"EU",usd:"USD"};
// ---------------------------------------------------------------------------
var urls = {
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
	flight_schedule_results : "http://localhost",
	/* MAPAS DE OFICINAS */
	office_maps : "http://localhost",
	/* BOA EN REDES SOCIALES */
	social_networks: "http://localhost",
	/* CALL CENTER */
	call_center: "http://localhost"
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