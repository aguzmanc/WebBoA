// ---------------------= =---------------------
function redirect(url_key)
{
	var url = urls[url_key];

	var btn = $("#btn_redirect");

	btn.attr("href",url);
	btn[0].click();
}
// ---------------------= =---------------------
function redirect_with_parms(url_key, parms)
{
	var url = urls[url_key] + parms;

	var btn = $("#btn_redirect");

	btn.attr("href",url);
	btn[0].click();
}

/********************************************************* 
 ******************** FORMAT UTILITIES *******************
 **********************************************************/
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
/* formats custom time {hrs,mins} to expanded format eg: 
   {hrs:9,mins:30} -> 9 hrs. 30 mins */
function formatExpandedTime(time)
{
	var str = 
		(time.hrs == 0 ? "" : (time.hrs + " hrs. " )) + 
		(time.mins == 0 ? "" : (time.mins + " mins."));

	return str;
}
// ---------------------= =---------------------
/* from JS date to very long format: 
   ej: (9/10/15) -> Viernes, 09 de Octubre de 2015 */
function formatExpandedDate(date) 
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
	// safe copy before making calculations
	var ini = {hh:timeIni.hh, mm:timeIni.mm};
	var fin = {hh:timeFin.hh, mm:timeFin.mm};

	if(ini.hh > fin.hh)
		ini.hh += 24;

	return (fin.hh - fin.hh) * 60 + (fin.mm - ini.mm);
}
// ---------------------= =---------------------
function formatCurrencyQuantity(quantity, includeCurrency, digits)
{
	var digitFactor = 1;
	var zeroes = "";
	for(var i=0;i<digits;i++){
		digitFactor *= 10;
		zeroes += "0";
	}

	var mult = quantity * digitFactor;

	var str = "";
	if(includeCurrency)
		str = HTML_CURRENCIES[CURRENCY] + "&nbsp;";

	var decimalPart = (zeroes + parseInt(mult%digitFactor)).slice(-digits);

	return  str + parseInt(mult/digitFactor) + "." + decimalPart;
}
// ---------------------= =---------------------
// ---------------------= =---------------------
/* formats JS date to YYYYMMDD ej: 20150827 */
function formatCompactDate(date)
{
	var mm = ("00" + (date.getMonth()+1)).slice(-2);
	var dd = ("00" + (date.getDate())).slice(-2);
	return date.getFullYear() + "" + mm + "" + dd;
}
// ---------------------= =---------------------
/* formats JS date to hhmm ej: (21:30 pm) -> 2130 */
function formatCompactTime(dateTime)
{
	var hh = fillWithLeadingZeros(dateTime.getHours(), 2);
	var mm = fillWithLeadingZeros(dateTime.getMinutes(), 2);

	return hh+""+mm;
}
// ---------------------= =---------------------
/* converts compart date '20150926' to JS Date (26, sep, 2015) */
function compactToJSDate(date)
{
	var yyyy = parseInt(date.substr(0,4));
	var mm = parseInt(date.substr(4,2))-1;
	var dd = parseInt(date.substr(6,2));

	return new Date(yyyy,mm,dd);
}
// ---------------------= =---------------------
function fillWithLeadingZeros(quantity, length)
{
	return (Array(length+1).join("0") + quantity).slice(-length);
}
// ---------------------= =---------------------
// ---------------------= VALIDATION =---------------------
/* Used with "validable" class as parent of ui_element  */ 
function activate_validation(ui_element) 
{
	ui_element.parent().addClass("active");
}
// ---------------------= QUERY STRING PARAMETERS =---------------------
location.queryString = {};
location.search.substr(1).split("&").forEach(function (pair) {
    if (pair === "") return;
    var parts = pair.split("=");
    location.queryString[parts[0]] = parts[1] &&
        decodeURIComponent(parts[1].replace(/\+/g, " "));
});

// function get_parameter_by_name(name) {
//     name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
//     var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
//         results = regex.exec(location.search);
//     return results === null ? null : decodeURIComponent(results[1].replace(/\+/g, " "));
// }
// ---------------------= =---------------------
// ---------------------= =---------------------