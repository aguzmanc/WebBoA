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