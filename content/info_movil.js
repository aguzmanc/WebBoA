--------------------------------------------------------------------------- */
$(document).on('ready',function()
{
	initializeMobileSections();
});
/*--------------------------------------------------------------------------- */
function initializeMobileSections()
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
/*--------------------------------------------------------------------------- */
/*--------------------------------------------------------------------------- */
/*--------------------------------------------------------------------------- */
/*--------------------------------------------------------------------------- */
/*--------------------------------------------------------------------------- */
/*--------------------------------------------------------------------------- */
/*--------------------------------------------------------------------------- */
/*--------------------------------------------------------------------------- 