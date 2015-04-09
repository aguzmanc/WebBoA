// ---------------------= =---------------------
$(document).on('ready',function()
{
	// --------= MENU HANDLERS =--------
	postprocess_header_links();

	// SECONDARY MENU INSIDE WIDE SECTIONS (right menu)
	$(".ui-section.wide .right-menu li").click(function(ev){
		var item = $(this).data("item");
		$(this).parent().find("li").removeClass("selected");
		$(this).addClass("selected");

		var parent_info = $(this).parent().parent();
		parent_info.find(".descripcion .subinfo").removeClass("selected");
		parent_info.find(".descripcion #subinfo_" + item).addClass("selected");
	});

	// DEFAULT ACTION AT BEGINNING
	handle_parameters_from_querystring();
});
// ---------------------= =---------------------
function handle_parameters_from_querystring()
{
	var item = location.queryString['item'];
	var primary = location.queryString['primary'];

	$(".ui-section").removeClass("selected");

	if(primary === null) { 
		// first section will be shown
		$(".ui-section:first").addClass("selected");
		return;
	}

	var ui_section = $("#ui_" + primary); 

	// check if not exists
	if(ui_section.length == 0) {
		// first section will be shown
		$(".ui-section:first").addClass("selected");
		return;	
	}

	// if exists, show it!
	ui_section.addClass("selected");

	// item handler
	if(item !== null){
		var li = ui_section.find(".first-menu > li#submenu_item_" + item);

		if(li.length > 0)
			li[0].click();
	}
}
// ---------------------= =---------------------
// ---------------------= =---------------------
// ---------------------= =---------------------
// ---------------------= =---------------------
// ---------------------= =---------------------