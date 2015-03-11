var MIN_PAGE_WIDTH = 1034;

var INFO_PAGE_LINK_ADDRESS = "info_page.html";
// ---------------------------------------------------------------------------
$(document).on('ready',function()
{
	$("header #language_selector .content .sel-button").click(function(){
		$("header #language_selector").removeClass("collapsed").addClass("expanded");
	});

	// 'call center' menu adjust
	adjust_call_center($(window).innerWidth);
	$(window).resize(function(ev) {
		adjust_call_center(this.innerWidth);
	});

	$("#menu_locations li").click(click_menu_locations);
	$("#menu_languages li").click(click_menu_languages);
});
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
// ---------------------------------------------------------------------------
// ---------------------------------------------------------------------------