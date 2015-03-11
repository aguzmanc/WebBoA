var SINGLETON_ENGINE = null;
var FRAME_FREQUENCY = 33; // in milliseconds
// ---------------------= =---------------------
function Engine()
{
	// ---= MEMBERS =---
	this.canvas = null;
	this.context = null;
	this.processFrameInterval = null;
	// Collection of various types of objects
	this._elements = []; 

	this._farClouds = [];
	this._mediumClouds = [];
	this._closeClouds = [];

	this.canvasWidth = 300;
	this.canvasHeight = 300;

	this.isPaused = true;

	this.mouse = {pos:{x:0,y:0}};

	this.worldVector = {x:0.0,y:0.0};
	this.camera = {
		min:{
			x:- this.canvasWidth/2,
			y:- this.canvasHeight/2},
		max:{
			x:this.canvasWidth/2,
			y:this.canvasHeight/2}
	};

	this.bgColor = '';

	// ---= METHODS =---
	this.initialize = prototypeEngine_initialize;
	this.update = prototypeEngine_update;
	this.addElement = prototypeEngine_addElement;
	this.removeElement = prototypeEngine_removeElement;
	this.drawBackground = prototypeEngine_drawBackground;

	this.setSize = prototypeEngine_setSize;

	this.addCloud = prototypeEngine_addCloud;

	this.start = prototypeEngine_start;
	this.pause = prototypeEngine_pause;
	this.resume = prototypeEngine_resume;

	this.mouseMove = prototypeEngine_mouseMove;
}
// ---------------------= =---------------------
// Singleton instance of engine
function getEngine()
{
	if(SINGLETON_ENGINE === null)
		SINGLETON_ENGINE = new Engine();

	return SINGLETON_ENGINE;
}
// ---------------------= =---------------------
function prototypeEngine_initialize(canvas_id)
{
	this.canvas = document.getElementById(canvas_id);
	// this.canvas.width = this.canvasWidth;
	// this.canvas.height = this.canvasHeight;

	this.context = this.canvas.getContext('2d');
}
// ---------------------= =---------------------
function prototypeEngine_update()
{
	var currentTime = getTime();
	var diff = currentTime - this._lastTime;
	this._lastTime = currentTime;

	if(this.isPaused) return;

	var i,length;

	// -------= ------------------- =-------
	// -------= UPDATE AND DISPOSE ALL ELEMENTS =-------
	// -------= ------------------- =-------
	length = this._elements.length;
	for(i=length-1;i>=0;i--){
		if(this._elements[i].isDead())
			this._elements.splice(i,1); // delete from list
		else
			this._elements[i].update(diff);
	}

	// DISPOSE EXTRA ELEMENTS 
	disposeDeadElements(this._farClouds);
	disposeDeadElements(this._mediumClouds);
	disposeDeadElements(this._closeClouds);

	// UPDATE CAMERA
	this.camera.min.x = this.worldVector.x - this.canvasWidth/2;
	this.camera.max.x = this.worldVector.x + this.canvasWidth/2;
	this.camera.min.y = this.worldVector.y - this.canvasHeight/2;
	this.camera.max.y = this.worldVector.y + this.canvasHeight/2;

	// -------= ----------------- =-------
	// -------= DRAW ALL ELEMENTS =-------
	// -------= ----------------- =-------

	// -------= ADJUST GLOBAL WORLD COORDINATES (y pointing up) =-------
	this.context.save();
	this.context.translate(0,this.canvasHeight);
	this.context.scale(1.0,-1.0);

	// background
	this.context.fillStyle = this.bgColor;
	this.context.fillRect(0,0, this.canvasWidth, this.canvasHeight);

	// ADJUST (0,0) to be in middle of CANVAS
	this.context.translate(this.canvasWidth/2, this.canvasHeight/2);

	// DRAW COMMON ELEMENTS (non clouds)
	length = this._elements.length;
	for(i=0;i<length;i++){
		if(this._elements[i].tag != 'cloud')
			this._elements[i].draw(this.context);
	}

	// DRAW FAR CLOUDS
	var DIST_FACTOR = 0.2;
	this.context.save();
	this.context.translate(this.worldVector.x * DIST_FACTOR, this.worldVector.y * DIST_FACTOR);
	
	length = this._farClouds.length;
	for(i=0;i<length;i++)
		this._farClouds[i].draw(this.context);
	this.context.restore();

	// DRAW MEDIUM CLOUDS
	DIST_FACTOR = 0.5;
	this.context.save();
	this.context.translate(this.worldVector.x * DIST_FACTOR, this.worldVector.y * DIST_FACTOR);
	
	length = this._mediumClouds.length;
	for(i=0;i<length;i++)
		this._mediumClouds[i].draw(this.context);
	this.context.restore();

	// DRAW CLOSEST CLOUDS
	DIST_FACTOR = 1.0;
	this.context.save();
	this.context.translate(this.worldVector.x * DIST_FACTOR, this.worldVector.y * DIST_FACTOR);
	
	length = this._closeClouds.length;
	for(i=0;i<length;i++)
		this._closeClouds[i].draw(this.context);
	this.context.restore();

	this.context.restore();
}
// ---------------------= =---------------------
function prototypeEngine_drawBackground(context)
{
	// when background assigned, use it
	if(this.background !== null){
		this.background.draw(context);
		return
	}

	// if not background assigned, draw default
	if(typeof this._backgroundPattern === 'undefined'){
		if(typeof this._imgBg === 'undefined'){
			this._imgBg = new Image();

			this._imgBg.src = 'img/bg.png';
		}

		this._backgroundPattern = context.createPattern(this._imgBg,'repeat');
	}

	context.fillStyle = this._backgroundPattern;
	context.fillRect(0,0,this.canvasWidth,this.canvasHeight);
}
// ---------------------= =---------------------
function prototypeEngine_start()
{
	this._lastTime = getTime();

	this.processFrameInterval = setInterval(function(){getEngine().update();},FRAME_FREQUENCY);

	this.isPaused = false;
}
// ---------------------= =---------------------
function prototypeEngine_pause()
{
	this.isPaused = true;
}
// ---------------------= =---------------------
function prototypeEngine_resume()
{
	this.isPaused = false;
}
// ---------------------= =---------------------
function prototypeEngine_setSize(width,height)
{
	this.canvasWidth = width;
	this.canvasHeight = height;

	// this.canvas.width = width;
	// this.canvas.height = height;
}
// ---------------------= =---------------------
function prototypeEngine_addElement(newElement)
{
	// T.O.D.O Check if newElement exists in _elements first
	this._elements.push(newElement);
}
// ---------------------= =---------------------
function prototypeEngine_removeElement(element)
{
	// T.O.D.O Check if element exists in _elements first
	this._elements.remove(element);	
}
// ---------------------= =---------------------
function prototypeEngine_addCloud(cloud)
{
	if(cloud.typeKey == 'ld')
		this._farClouds.push(cloud);
	else if(cloud.typeKey == 'md')
		this._mediumClouds.push(cloud);
	else if(cloud.typeKey == 'hd')
		this._closeClouds.push(cloud);

	this.addElement(cloud);
}
// ---------------------= =---------------------
function prototypeEngine_mouseDown(ev)
{
}
// ---------------------= =---------------------
function prototypeEngine_mouseUp(ev)
{
}
// ---------------------= =---------------------
function prototypeEngine_mouseMove(ev)
{
	this.mouse.pos.x = ev.offsetX;
	this.mouse.pos.y = ev.offsetY;

	// var mouseParallaxFactor = 0.1;
	// this.worldVector.x = mouseParallaxFactor*((-this.mouse.pos.x/this.canvasWidth) * (2*this.canvasWidth) - this.canvasWidth/2);
	// this.worldVector.y = mouseParallaxFactor*((this.mouse.pos.y/this.canvasHeight) * (2*this.canvasHeight) - this.canvasHeight/2) 
}
// ---------------------= =---------------------
// gets current time in milliseconds
function getTime()
{
	return new Date().getTime();
}
// ---------------------= =---------------------
function generateIntRandom(max,min)
{
	if(min>max){
		var tmp = max;
		max = min;
		min = tmp;
	}

	return parseInt(min + (Math.random() * (max-min+1)));
}
// ---------------------= =---------------------
function disposeDeadElements(arr)
{
	var i=arr.length-1;
	for(;i>=0;i--){
		if(typeof arr[i]==='undefined') continue;

		if(arr[i].isDead())
			arr = arr.splice(i,1);
	}
}
// ---------------------= =---------------------
function generateRandom(max,min)
{
	if(min>max){
		var tmp = max;
		max = min;
		min = tmp;
	}

	return min + (Math.random() * (max-min));
}
// ---------------------= =---------------------
function generateIntNormalRandom(min,max)
{
	if(min>max){
		var tmp = max;
		max = min;
		min = tmp;
	}

	var r = (Math.random() + Math.random() + Math.random() + Math.random() + Math.random() + Math.random()) / 6;

	return parseInt(r*(max-min+1)) + min;
};
// ---------------------= =---------------------
function segmentsIntersect(P,Q)
{
	var a = Q.b.x - Q.a.x;
	var b = P.a.x - P.b.x;
	var c = Q.b.y - Q.a.y;
	var d = P.a.y - P.b.y;
	var e = P.a.x - Q.a.x;
	var f = P.a.y - Q.a.y;
	var det = a*d - b*c;

	var s = (e*d-b*f)/det;
	var t = (a*f-c*e)/det;

    return (s >=0 && s<=1 && t>=0 && t<=1);
}
// ---------------------= =---------------------
// ---------------------= =---------------------
// ---------------------= =---------------------
// ---------------------= =---------------------
// ---------------------= =---------------------
// ---------------------= =---------------------
// ---------------------= =---------------------
// ---------------------= =---------------------
// ---------------------= =---------------------
// ---------------------= =---------------------