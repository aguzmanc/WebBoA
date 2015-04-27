// ---------------------= =---------------------
var HEADER_SCROLL_THRESHOLD = 170;
var HEADER_SCROLL_THRESHOLD_FOR_MENU = 170;
// ---------------------= =---------------------
// $(document).on('ready',function()
// {
// 	initialize_header(false);

// 	initialize_ui_sections({anchor_section_headers:false});

// 	// DEFAULT ACTION AT BEGINNING
// 	handle_section_parameters_from_querystring();
// });
// ---------------------= =---------------------
function initialize_ui_sections(parms)
{
	// ------------= SECTION MENU =----------------
	$(".ui-section .first-menu > li").click(click_first_menu);

	// ------------= DESPLEGABLES =----------------
	$(".ui-section .descripcion .desplegable .title").click(function() {
		var desplegable = this.parentNode;

		if($(desplegable).hasClass("collapsed"))
			$(desplegable).removeClass("collapsed");
		else
			$(desplegable).addClass("collapsed");
	});

	// by default all subtitles are collapsed
	$(".ui-section .desplegable").addClass("collapsed");

	// SECONDARY MENU INSIDE WIDE SECTIONS (right menu)
	$(".ui-section.wide .right-menu li").click(function(ev){
		var item = $(this).data("item");
		$(this).parent().find("li").removeClass("selected");
		$(this).addClass("selected");

		var parent_info = $(this).parent().parent();
		parent_info.find(".descripcion .subinfo").removeClass("selected");
		parent_info.find(".descripcion #subinfo_" + item).addClass("selected");
	});

	// --------= ANCHOR ELEMENTS WHEN SCROLL DOWN =--------
	if(parms.anchor_section_headers == true)
	{
		$(document).scroll(function() {
			var pos = $(document).scrollTop();

			if(pos > HEADER_SCROLL_THRESHOLD) {
				$(".ui-section .header").removeClass("active");
				$(".ui-section .header-fixed").addClass("active");
				$(".ui-section .header, .ui-section .first-menu, .ui-section .info, .ui-section .gradient").addClass("fixed");
			}
			else {
				$(".ui-section .header").addClass("active");
				$(".ui-section .header-fixed").removeClass("active");
				$(".ui-section .header, .ui-section .first-menu, .ui-section .info, .ui-section .gradient").removeClass("fixed");
			}

			if(pos > HEADER_SCROLL_THRESHOLD_FOR_MENU)
				$(".ui-section .first-menu").addClass("fixed");
			else
				$(".ui-section .first-menu").removeClass("fixed");
		});
	}
}
// ---------------------= =---------------------
function handle_section_parameters_from_querystring()
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
var first_menu_data = {
	node:null,
	nodeInfo:null
};

function click_first_menu(ev)
{
	// parameters
	var scrollOffset = 0;
	var scrollOffsetStr = $(this.parentNode).data("scroll_offset");
	if(scrollOffsetStr != null)
		scrollOffset = parseInt(scrollOffsetStr);

	var isLink = $(this).data("is_link");
	if(isLink != null){
		ev.preventDefault();

		var href = "";

		if($(ev.target).is("a"))
			href = $(ev.target).attr("href");
		else 
			href = $(this).find("a").attr("href");

		var btn = $("#btn_redirect").attr("target","_blank").attr("href",href);
		btn[0].click();

		return;
	}

	$('html, body').animate({scrollTop : scrollOffset},300);

	var target = $(ev.target);
	var isLabel = target.is("label") && $(ev.target.parentNode.parentNode).hasClass("first-menu");
	var isSmallIcon = target.hasClass("icon") && target.hasClass("small");
	var isLi = target.is("li") && $(ev.target.parentNode).hasClass("first-menu");

	if(false==isLabel && false==isSmallIcon && false==isLi)  
		return;

	var info_name = $(this).data("info");

	first_menu_data.node = this;
	first_menu_data.nodeInfo = $(".ui-section #info_" + info_name);

	var timeToCollapse=0;
	if($(this.parentNode).hasClass("fixed"))
		timeToCollapse = 500;

	setTimeout(function(){
		$(".ui-section .info").removeClass("selected");
		first_menu_data.nodeInfo.addClass("selected");

		var t = first_menu_data.node;

		$(t.parentNode.parentNode).addClass("selected");
		$(t.parentNode.parentNode).find(".first-menu > li").removeClass("selected");
		$(t).addClass("selected");		
	},timeToCollapse);
}
// ---------------------= =---------------------
// ---------------------= =---------------------
// ---------------------= =---------------------
// ---------------------= =---------------------