// ---------------------= =---------------------
var MENU_ICONS_SCROLL_THRESHOLD = 141;
var HEADER_SCROLL_THRESHOLD = 170;
var HEADER_SCROLL_THRESHOLD_FOR_MENU = 170;
// ---------------------= =---------------------
var mouse={left:false,right:false};
var mousePos={x:0.0,y:0.0};
var movements = {up:false,down:false,right:false,left:false};

var graphicsEngine = null;

var imagesLoaded = [0,0];
var imageNames = ['textures','bg_header_color'];

var sky;

function preLoadImage(name,index)
{
	var img = new Image();
	img.src = 'content/images/'+name+'.png';
	img.onload = function(){imagesLoaded[index]=1;};
}

var loadImagesInterval;
function checkLoaded()
{
	var allLoaded = true;
	var i,length=imagesLoaded.length;
	for(i=0;i<length;i++)
		if(imagesLoaded[i]==0){
			allLoaded = false;
			break;
		}

	if(allLoaded){
		clearInterval(loadImagesInterval);
		graphicsEngine.start();	
	}
}

$(document).on('ready',function()
{
	initializeCloudsBackground();

	// --------= MENU HANDLERS =--------
	// $("header > ul > li").click(set_main_state);
	postprocess_header_links();

	$(".secondary-menu li a").click(click_menu_item);

	$(".ui-section .first-menu > li").click(click_first_menu);

	// close on 'CERRAR' button
	$(".dialog .btn-cerrar").click(function(){
		$(".dialog-overlay").hide();
		$(".dialog").hide();
		$(".dialog-close-out").hide();
	});

	// close clicking outside
	$(".dialog-overlay").click(function(ev) {
		if( ev.target !== this ) 
       		return;

		$(".dialog-overlay").hide();
		$(".dialog").hide();
		$(".dialog-close-out").hide();
	});

	$("header #localizer .content .sel-button").click(function(){
		$("header #localizer").removeClass("collapsed").addClass("expanded");
	});

	$("header #localizer li").click(function(){
		$("header #localizer").removeClass("expanded").addClass("collapsed");

		$("header #localizer li").removeClass("selected");
		$(this).addClass("selected");

		$("header #localizer .sel-button").html(this.innerText);

		handle_change_location($(this).data("location"));
	});

	$(".ui-section .descripcion .desplegable .title").click(function(){
		var desplegable = this.parentNode;

		if($(desplegable).hasClass("collapsed"))
			$(desplegable).removeClass("collapsed");
		else
			$(desplegable).addClass("collapsed");
	});

	$(document).scroll(function(){
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

	$(".ui-section .desplegable").addClass("collapsed");

	// --------= BUTTON HANDLERS =--------
	$("#btn_ir_a_documentacion_requerida").click(function(){
		$("#subtitle_mascotas_documentacion").removeClass("collapsed");

		setTimeout(function(){
			$('html, body').animate({
        		scrollTop: $("#subtitle_mascotas_documentacion").offset().top 
    		}, 0);	
		},100);
	});

	// $("#btn_go_to_check_in").click(function(){
	// 	var btn = $("#btn_redirect");
	// 	btn.attr("href",urls['home']+"#checkin");
	// 	btn[0].click();
	// });

	// DEFAULT ACTION AT BEGINNING
	handle_parameters_from_querystring();
});
// ---------------------= =---------------------
function initializeCloudsBackground()
{
	// preLoadImages
	var i,l = imageNames.length;
	for(i=0;i<l;i++)
		preLoadImage(imageNames[i],i);

	loadImagesInterval = setInterval(checkLoaded,200);

	var w = $(document).width();
	var h = $(document).height();

	graphicsEngine = getEngine();
	graphicsEngine.initialize('clouds_canvas');
	graphicsEngine.setSize(w,h);

	$(window).resize(function(ev) {
		graphicsEngine.setSize(this.innerWidth, this.innerHeight);		
	});

	sky = new Sky();
	graphicsEngine.addElement(sky);

	$(window).blur(function(){graphicsEngine.pause();});
	$(window).focus(function(){graphicsEngine.resume();});
	$(document).on('mousemove',function(ev){graphicsEngine.mouseMove(ev);});
}
// ---------------------= =---------------------
function set_main_state()
{
	var state = $(this).data("state");
	var is_link = $(this).data("is_link");

	if(typeof is_link !== 'undefined') {
		var url = $(this).data("url");
		redirect(url);
		return;
	}

	// change sky
	switch(state){
		case "home":
			redirect("home");
			return;
			break;

		case "day":
		case "afternoon":
		case "night":
			sky.changeState(state);
		break;

		default:return;
	}

	// change main information
	$(".ui-section").hide();
	var section=$(this).data("section");
	$("#ui_" + section).show()
}
// ---------------------= =---------------------
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

	if(isPrimary){
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
// ---------------------= =---------------------
var first_menu_data = {
	node:null,
	nodeInfo:null
};

function click_first_menu(ev)
{
	$('html, body').animate({scrollTop : 0},300);

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
		first_menu_data.nodeInfo.addClass("selected")

		var t = first_menu_data.node;

		$(t.parentNode.parentNode).addClass("selected");
		$(t.parentNode.parentNode).find(".first-menu > li").removeClass("selected");
		$(t).addClass("selected");		
		// $(t.parentNode).css("width","50px");

		//setTimeout(function(){$(first_menu_data.node.parentNode).css("width","");},550); // trick to avoid width value holding
	},timeToCollapse);
}
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