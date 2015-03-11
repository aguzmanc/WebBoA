// ---------------------------------------------------------------------------
var urls = {
	home : "home.html",
	info_page : "info_page.html",
	clientes_frecuentes : "http://www.clientesfrecuentes.com",
	correo_corporativo: "http://www.boa.bo/correocorporativo",
	intranet: "http://www.boa.bo/intranet",
	agencias_viajes: "http://www.boa.bo/agencias_viajes",
	facebook: "http://www.facebook.com/bolivianaDeAviacion",
	twitter: "http://www.twitter.com/BoABolivia",
	instagram: "http://i.instagram.com/boa_bolivia",
	youtube: "http://www.youtube.com/user/BoADigital",
	direcciones_oficinas: "http://www.boa.bo/direcciones_oficinas",
	chat: "http://www.boa.bo/chat",
	revista_destinos: "http://www.destinos.com.bo",
	charter_contacto: "mailto:ventasweb@boa.bo",
	menu_internacional: "http://www.boa.bo/menu_internacional.pdf",
	info_madrid: "http://www.minetur.gob.es/turismo/es-ES/Paginas/IndexTurismo.aspx",
	info_salta: "http://www.turismo.gov.ar/",
	info_bs_as: "http://www.turismo.gov.ar/",
	info_sao_paulo: "http://www.turismo.gov.br/turismo/home.html",
	info_miami: "http://www.miamibeachfl.gov/tcd/",
	info_turismo_bolivia: "http://www.minculturas.gob.bo",
	contrato_transporte: "content/docs/contrato_transporte.pdf",
	preguntas_frecuentes: "content/docs/preguntas_frecuentes.pdf",
	animales_cabina: "content/docs/animales_en_cabina.pdf",
	animales_equipaje: "content/docs/animales_en_equipaje.pdf",
	autoridades: "content/docs/autoridades.pdf",
	personal: "content/docs/personal.pdf",
	mn_creacion_boa: "content/docs/marco_normativo_creacion_boa.pdf",
	mn_designacion_gg: "content/docs/marco_normativo_designacion_gerencia_general.pdf",
	mn_ds_29482: "content/docs/marco_normativo_ds_29482.pdf",
	mn_ley_aeronautica_civil: "content/docs/marco_normativo_ley_aeronautica_civil.pdf",
	mn_manual_procesos: "content/docs/marco_normativo_manual_procesos.pdf",
	info_gestion: "content/docs/estadisticas_gestion.pdf",
	convocatorias: "http://sms.obairlines.bo/webboa/menupublicaciones.htm"
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