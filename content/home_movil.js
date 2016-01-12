 /*--------------------------------------------------------------------------- */
$(document).on('ready',function()
{
	// menus
	$("#btn_menu").click(toggleMainMenu);
	$("#main_menu > li").click(clickMenuItem);
	$("#main_menu > li > ul > li > span").click(toggleInnerMenu);

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

	// menus
	$("#buscador_vuelos li.menu").click(changeMainTab);

	$("#main_menu > li > ul > li, #main_menu .collapsible li").click(handleHeaderMenuItem);

	$("#menu_overlay").click(function(){
		$("#main_menu").attr("data-level","first"); // force
		$("#btn_menu").click();
	});
	
	// checkboxes
	$(".checkbox").click(toggleCheckbox);
	$("#cbx_acepto_terminos").click(function(){
		if($(this).hasClass("checked"))
			$("#btn_buscar_check_in").show();
		else
			$("#btn_buscar_check_in").hide();
	});

	// Web check in
	$("#btn_buscar_check_in").click(function(){
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

		if(level=="first"){
			menu.removeClass("active");
			$("#ui_home, img.slide").removeClass("blured");
			$("#menu_overlay").hide();
		}
		else if(level == "second") {
			menu.attr("data-level","first");
			menu.find("li").removeClass("selected");
		}
	}
	else{
		menu.addClass("active");
		$("#ui_home, img.slide").addClass("blured");
		$("#menu_overlay").show();
	}
}
/* --------------------------------------------------------------------------- */
function clickMenuItem() 
{
	$(this.parentNode).find("li").removeClass("selected");

	$(this).addClass("selected");

	$("#main_menu").attr("data-level","second");
}
/* --------------------------------------------------------------------------- */
function toggleInnerMenu() 
{
	var li = $(this.parentNode);
	var isActive = li.hasClass("active");

	var ul = li.parent();
	ul.find("li").removeClass("active");

	if(isActive)
		li.removeClass("active")
	else
		li.addClass("active");
}
/* --------------------------------------------------------------------------- */
function changeMainTab()
{
	if($(this).hasClass("disabled"))
		return;

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
function handleHeaderMenuItem()
{
	var link = $(this).data("link");
	if(link != null) { 
		redirect(link);
		return;
	}

	var li = $(this);
	if(li.hasClass("collapsible"))
		return;

	var ul = li.parent();

	var primaryParm, itemParm;

	if(ul.hasClass("inner-menu")) {
		primaryParm = ul.parent().data("primary");
		itemParm = li.data("item");

		redirect_with_parms("info_movil", "?primary="+primaryParm+"&item="+itemParm);
	} else {
		primaryParm = li.data("primary");

		redirect_with_parms("info_movil", "?primary="+primaryParm);
	}
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