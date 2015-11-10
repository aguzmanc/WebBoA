// ---------------------= =---------------------
var MENU_ICONS_SCROLL_THRESHOLD = 141;

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

	initialize_header(true);

	initialize_ui_sections({anchor_section_headers:true});

	// --------= BUTTON HANDLERS =--------
	$("#btn_ir_a_documentacion_requerida").click(function(){
		$("#subtitle_mascotas_documentacion").removeClass("collapsed");

		setTimeout(function(){
			$('html, body').animate({
        		scrollTop: $("#subtitle_mascotas_documentacion").offset().top 
    		}, 0);	
		},100);
	});

	// DEFAULT ACTION AT BEGINNING
	handle_section_parameters_from_querystring();
});
// ---------------------= =---------------------
function initializeCloudsBackground()
{
	// preLoadImages
	var i,l = imageNames.length;
	for(i=0;i<l;i++)
		preLoadImage(imageNames[i],i);

	loadImagesInterval = setInterval(checkLoaded,200);

	var w = $(window).width();
	var h = $(window).height();

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

// ---------------------= =---------------------

// ---------------------= =---------------------
// ---------------------= =---------------------
// ---------------------= =---------------------
// ---------------------= =---------------------