var CREATE_CLOUDS_EVERY_MS = 500;

var SKY_COLOR_DAY = 10798831; //#A4C6EF
var SKY_COLOR_AFTERNOON = 7181767; // #6D95C7
var SKY_COLOR_NIGHT = 13915; // #00365B

var SKY_CHANGING_COLOR_FACTOR = 0.5; // changes factor(from 0 to 1) in 2 seconds
// ---------------------= =---------------------
function Sky()
{
	Transformable.call(this,0,0);
	this.imgSprite.src = '';

	this._msToCreateCloud = CREATE_CLOUDS_EVERY_MS;

	this._currentState = 'day';
	this._changingState = false;
	this._factorChanging = 0; // 0 to 1 when changing
	this._fromColor = 0;
	this._toColor = 0;
	this._currentColor = SKY_COLOR_DAY;
	this._skyColors = {
		day: SKY_COLOR_DAY,
		night: SKY_COLOR_NIGHT,
		afternoon: SKY_COLOR_AFTERNOON
	};
	this.tag = 'sky';

	// this.engine.addElement(this._sun);
	// this.engine.addElement(this._moon);

	// create initial clouds
	var w = this.engine.canvasWidth;
	var h = this.engine.canvasHeight;
	for(var i=0;i<20;i++){
		var c = new Cloud(this._mov.x, this._mov.y);
		c.pos.x = generateIntRandom(-w,w);
		c.pos.y = generateIntRandom(-h,h);
		this.engine.addCloud(c);
	}

	// -----= OVERRIDE METHODS=-----
	this.update = prototypeSky_update;
	this.drawSprite = function(ctx){};

	// ------= NEW METHODS =---------
	this.changeState = prototypeSky_changeState;
	this.getHexStr = prototypeSky_getHexStr;
	this.getRGB = prototypeSky_getRGB;
}
// ---------------------= =---------------------
// ---------------------= =---------------------
function prototypeSky_update(diff)
{
	// cloud creation
	this._msToCreateCloud -= diff;
	this._msToCreateCloud = Math.max(0,this._msToCreateCloud);

	if(this._msToCreateCloud == 0) {
		this._msToCreateCloud = CREATE_CLOUDS_EVERY_MS;
		this.engine.addCloud(new Cloud(this._mov.x, this._mov.y));
	}

	// update background color
	if(this._changingState) {
		this._factorChanging += (diff/1000.0) / SKY_CHANGING_COLOR_FACTOR;
		this._factorChanging = Math.min(1.0,this._factorChanging);

		var toColorRGB = this.getRGB(this._toColor);
		var fromColorRGB = this.getRGB(this._fromColor);

		this._currentColor = 
			((fromColorRGB.red + parseInt(this._factorChanging * (toColorRGB.red - fromColorRGB.red)))<<16) |
			((fromColorRGB.green + parseInt(this._factorChanging * (toColorRGB.green - fromColorRGB.green))) << 8) |
			fromColorRGB.blue + parseInt(this._factorChanging * (toColorRGB.blue - fromColorRGB.blue));

		if(this._factorChanging >= 1.0){
			this._changingState = false;
			this._factorChanging = 0.0;
		}
	}

	this.engine.bgColor = "#" + this.getHexStr(this._currentColor);

	// this._sun.update(diff);
	// this._moon.update(diff);
}
// ---------------------= =---------------------
function prototypeSky_changeState(state)
{
	this._factorChanging = 0.0;

	if( this._currentState == state) {
		this._changingState = false;
		return; // no need to change when goal color is already set
	}

	this._changingState = true;
	this._fromColor = this._currentColor;
	this._toColor = this._skyColors[state];

	var equiv = {day:1,afternoon:1,night:0};

	// if(equiv[state] != equiv[this._currentState]){
	// 	this._sun.toggleState();
	// 	this._moon.toggleState();
	// }

	this._currentState = state;
}
// ---------------------= =---------------------
function prototypeSky_getHexStr(decColor)
{
	return ( "000000" + decColor.toString(16)).substr(-6);
}
// ---------------------= =---------------------
function prototypeSky_getRGB(decColor)
{
	return {
		red: (decColor & 0xFF0000) >> 16,
		green: (decColor & 0x00FF00) >> 8,
		blue: decColor & 0x0000FF
	};
}
// ---------------------= =---------------------
// ---------------------= =---------------------
// ---------------------= =---------------------
// ---------------------= =---------------------
// ---------------------= =---------------------
// ---------------------= =---------------------
// ---------------------= =---------------------
