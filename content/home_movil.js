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
		minDate: 0
	});

	$("#buscador_vuelos li.menu").click(changeMainTab);

	// checkboxes
	$(".checkbox").click(toggleCheckbox);
	$("#cbx_acepto_terminos").click(function(){
		if($(this).hasClass("checked"))
			$("#btn_buscar_check_in").show();
		else
			$("#btn_buscar_check_in").hide();
	});

	$("#btn_buscar_check_in").click(function(){
		console.log()
		redirect("web_check_in");
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
function changeMainTab()
{
	var idContent = $(this).data("content");
	$("#buscador_vuelos .content, #buscador_vuelos li.menu").removeClass("selected");

	$("#buscador_vuelos #" + idContent).addClass("selected");
	$(this).addClass("selected");
}
/* --------------------------------------------------------------------------- */
function toggleRadioButton()
{
	var group = $(this).data("group");

	$('.radio-button[data-group="'+group+'"]').removeClass("checked");
	$(this).addClass("checked");
}
/* --------------------------------------------------------------------------- */
function toggleCheckbox()
{
	if($(this).hasClass("checked"))
		$(this).removeClass("checked");
	else
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