var MIN_PAGE_WIDTH = 1034;

var INFO_PAGE_LINK_ADDRESS = "info_page.html";
// ---------------------------------------------------------------------------
function initialize_header(is_info_page)
{
	postprocess_header_links();

	// MENU ITEMS
	$(".secondary-menu li a").click(is_info_page?click_menu_item:click_menu_item_from_outside);

	// LANGUAGE SELECTOR
	$("header #language_selector .content .sel-button").click(function() {
		$("header #language_selector").removeClass("collapsed").addClass("expanded");
	});

	// LOCATION SELECTOR
	$("header #localizer .content .sel-button").click(function() {
		$("header #localizer").removeClass("collapsed").addClass("expanded");
	});

	$("header #localizer li").click(function(){
		$("header #localizer").removeClass("expanded").addClass("collapsed");

		$("header #localizer li").removeClass("selected");
		$(this).addClass("selected");

		$("header #localizer .sel-button").html(this.innerText);

		handle_change_location($(this).data("location"));
	});

	// 'call center' menu adjust
	adjust_call_center($(window).innerWidth);
	$(window).resize(function(ev) {
		adjust_call_center(this.innerWidth);
	});

	$("#menu_locations li").click(click_menu_locations);
	$("#menu_languages li").click(click_menu_languages);
}
// ---------------------------------------------------------------------------
function postprocess_header_links() 
{
	// postprocess header links to include anchor tags
	var header_options = $("header .secondary-menu li");
	for(var i=0;i<header_options.length;i++) {
		var li = header_options[i];
		if($(li).hasClass("disabled")) continue;
		var item = $(li).data("item");
		if(item=="") continue;
		if(typeof item == "undefined") continue;

		var isPrimary = $(li).hasClass("primary");

		var href = INFO_PAGE_LINK_ADDRESS;

		if(isPrimary) {
			href = href + "?primary=" + item;
		} else{
			href = href + "?item=" + item;

			// finding its primary
			var liIterator = li;
			do {
				var prev = $(liIterator).prev();
				if(prev.length==0){
					console.log("ERROR, ITEM PRIMARIO NO ENCONTRADO"); // should never happen :S
					break;
				}

				liIterator = prev[0];
			} while(false == $(liIterator).hasClass("primary"));

			href = href + "&primary=" + $(liIterator).data("item");
		}

		var anchor = document.createElement("a");
		$(anchor).attr("href",href);

		$(anchor).html($(li).html());
		$(li).html("");
		li.appendChild(anchor);
	}
}
// ---------------------------------------------------------------------------
function adjust_call_center(window_width)
{
	if(window_width <= MIN_PAGE_WIDTH)
		$(".header-menu").removeClass("floating")
					   .addClass("fixed");
	else 
		$(".header-menu").removeClass("fixed")
					   .addClass("floating");
}
// ---------------------------------------------------------------------------
function click_menu_locations()
{
	$("#menu_locations li").removeClass("selected");
	$(this).addClass("selected");

	$("#menu_locations li").css("display","none");
	setTimeout(function(){$("#menu_locations li").attr("style","");},500);

	var locations = {bolivia:"BOLIVIA",bsas:"BS. AIRES", madrid:"MADRID", saopaulo:"SAO PAULO",salta:"SALTA",miami:"MIAMI"};

	var location = $(this).data("location");

	$("#menu_locations > h2 > strong").html(locations[location]);

	$("#menu_locations .flag")
		.removeClass("bolivia")
		.removeClass("bsas")
		.removeClass("madrid")
		.removeClass("miami")
		.removeClass("saopaulo")
		.removeClass("salta")
		.addClass(location);
}
// ---------------------------------------------------------------------------
function click_menu_languages()
{
	$("#menu_languages li").removeClass("selected");
	$(this).addClass("selected");

	$("#menu_languages li").css("display","none");

	setTimeout(function(){$("#menu_languages li").attr("style","");},500);

	var language = $(this).data("language");
	var languages = {ES:"ESPA&Ntilde;OL", EN:"ENGLISH", PT:"PORTUGU&Ecirc;S"};

	$("#menu_languages > h2 > strong").html(languages[language]);
}
// ---------------------------------------------------------------------------
function click_menu_item(ev)
{
	ev.preventDefault();

	var href = $(this).attr("href");
	var btn = $("#btn_redirect");
	var li = this.parentNode;
	var isLink = $(li).data("is_link");
	var action = $(li).data("action");

	// redirects if is direct link
	if(isLink) {
		btn.attr("target","_blank");
		btn.attr("href",href);
		btn[0].click();
		return;
	}

	if(action=="none") return;

	var item = $(li).data("item");

	// hides menu when clicked
	$(".secondary-menu-container").css("display","none");
	setTimeout(function(){$(".secondary-menu-container").attr("style","");},200);

	// set sky state
	var sky_state = $(this.parentNode).data("sky");
	if(typeof sky_state === 'undefined')
		sky_state = "afternoon";
	sky.changeState(sky_state);

	var primary = "";
	var isPrimary = $(li).hasClass("primary");

	// search for primary data item
	if(isPrimary)
		primary = item;
	else{
		// buscando primario
		do {
			var prev = $(li).prev();
			if(prev.length==0){
				console.log("ERROR, PRIMARIO DE ITEM NO ENCONTRADO");
				return;
			}

			li = prev[0];
		} while(false == $(li).hasClass("primary"));

		primary =  $(li).data("item");
	}

	var qs_primary = location.queryString['primary'];
	if(qs_primary == null)
		qs_primary = "politica_equipaje";

	href = INFO_PAGE_LINK_ADDRESS;
	btn.attr("target","_top");

	if(isPrimary) {
		if(primary == qs_primary) 
			$("#ui_" + primary + " .first-menu li:first-child").click();
		else{
			href = href + "?primary=" + primary;
			btn.attr("href",href);
			btn[0].click();
			return;
		}
	}else {
		if(primary == qs_primary)
			$("#ui_" + primary + " .first-menu li#submenu_item_" + item).click();
		else{
			href = href + "?primary=" + primary + "&item=" + item;
			btn.attr("href",href);
			btn[0].click();
			return;
		}
	}
}
// ---------------------------------------------------------------------------
function click_menu_item_from_outside(ev)
{
	ev.preventDefault();

	var href = $(this).attr("href");
	var btn = $("#btn_redirect");
	var li = this.parentNode;
	var isLink = $(li).data("is_link");
	var action = $(li).data("action");

	if(isLink) {
		btn.attr("target","_blank");
		btn.attr("href",href);
		btn[0].click();
		return;
	}

	if(action=="none") return;

	var item = $(li).data("item");

	if($(li).hasClass("primary")){
		href = INFO_PAGE_LINK_ADDRESS + "?primary=" + item;
		btn.attr("href",href);
		btn[0].click();
	}else{
		href = INFO_PAGE_LINK_ADDRESS + "?item=" + item;

		// buscando primario
		do {
			var prev = $(li).prev();
			if(prev.length==0){
				console.log("ERROR, PRIMARIO DE ITEM NO ENCONTRADO");
				return;
			}

			li = prev[0];
		} while(false == $(li).hasClass("primary"));

		href = href + "&primary=" + $(li).data("item");

		btn.attr("href",href);
		btn[0].click();
	}
}
// ---------------------------------------------------------------------------