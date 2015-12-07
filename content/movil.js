/* --------------------------------------------------------------------------- */
$(document).on('ready',function()
{
	// menus
	$("#btn_menu").click(toggleMainMenu);
	$("#main_menu > li").click(clickMenuItem);

	// radio buttons
	$(".radio-button").click(toggleRadioButton);
	
	$("#rbtn_ida, #rbtn_ida_vuelta").click(function() {
		if($("#rbtn_ida").hasClass("checked"))
			$("#lbl_regreso,#picker_regreso").hide();
		else
			$("#lbl_regreso,#picker_regreso").show();
	});

	// date pickers
	$("#picker_salida").datepicker({ 
		dateFormat: 'dd MM yy',
		numberOfMonths: 1, 
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

	// support for "font-awesome" icon library
	$(".validable .calendar").datepicker("option", "prevText", '<i class="fa fa-arrow-left"></i>');
	$(".validable .calendar").datepicker("option", "nextText", '<i class="fa fa-arrow-right"></i>');
});
/* --------------------------------------------------------------------------- */
function toggleMainMenu() 
{
	var menu = $("#main_menu");

	if(menu.hasClass("active")) {
		var level = menu.attr("data-level");

		if(level=="first")
			menu.removeClass("active");
		else if(level == "second") {
			menu.attr("data-level","first")
			menu.find("li").removeClass("selected");
		}
	}
	else
		menu.addClass("active");
}
/* --------------------------------------------------------------------------- */
function clickMenuItem() 
{
	$(this.parentNode).find("li").removeClass("selected");

	$(this).addClass("selected");

	$("#main_menu").attr("data-level","second");
}
/* --------------------------------------------------------------------------- */
function toggleRadioButton()
{
	var group = $(this).data("group");

	$('.radio-button[data-group="'+group+'"]').removeClass("checked");
	$(this).addClass("checked");
}
/* --------------------------------------------------------------------------- */
/* --------------------------------------------------------------------------- */
/* --------------------------------------------------------------------------- */
/* --------------------------------------------------------------------------- */
/* --------------------------------------------------------------------------- */
/* --------------------------------------------------------------------------- */
/* --------------------------------------------------------------------------- */
/* --------------------------------------------------------------------------- */
/* --------------------------------------------------------------------------- */
/* --------------------------------------------------------------------------- */
/* --------------------------------------------------------------------------- */
/* --------------------------------------------------------------------------- */
/* --------------------------------------------------------------------------- */
/* --------------------------------------------------------------------------- */
/* --------------------------------------------------------------------------- */
/* --------------------------------------------------------------------------- */
/* --------------------------------------------------------------------------- */
/* --------------------------------------------------------------------------- */