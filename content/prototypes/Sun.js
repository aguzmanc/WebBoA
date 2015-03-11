var ASTRAL_MOVEMENT_RATIO = 3.0; // complete movement in seconds
// ---------------------= =---------------------
function Sun()
{
	Transparent.call(this, 0, 0, 0.0);

	this.imgSprite.src = 'content/images/textures.png';
	this.factor = 0.0;
	this._state = 'none'; // could be 'hiding' or 'showing'

	this.tag = 'sun';

	// ------= OVERRIDE METHODS =--------
	this.update = prototypeSun_update;
	this.drawSprite = prototypeSun_drawSprite;
	this.isDead = function(){return false;}; 

	// ------= NEW METHODS =--------
	this.toggleState = prototypeSun_toggleState;
}
// ---------------------= =---------------------
function prototypeSun_update(diff)
{	
	var w = this.engine.canvasWidth;
		h = this.engine.canvasHeight;
	var MARGIN = 100;

	if(this._state!='none'){
		var diffFactor = (diff/1000.0) / ASTRAL_MOVEMENT_RATIO;

		if(this._state == 'showing')
			this.factor += diffFactor;
		else if(this._state == 'hiding')
			this.factor -= diffFactor;
	}
	

	this.factor = Math.max(0,Math.min(1.0,this.factor));

	// T.O.D.O. APPLY LOGARITMIC SCALE RELATION 'P' TO 'MOVING FACTOR' (DISACCELERATION CLOSE TO 1)
	var p;
	if(Math.log2) // in safari this
		p = (this.factor==0?0:(Math.log2(this.factor*8)+4)/7.0);
	else
		p = (this.factor==0?0:(Math.log(this.factor*8)/Math.log(2)+4)/7.0);

	this.alpha = p;

	this.pos.x = p * (w - 2*MARGIN) - w/2 + MARGIN;
	this.pos.y = p * (h - 2*MARGIN) - h/2 + MARGIN;
}
// ---------------------= =---------------------
function prototypeSun_drawSprite(context)
{
	context.drawImage(
		this.imgSprite,
		1015,207,136,136,
		-this.width/2, -this.height/2,
		this.width, this.height);
}
// ---------------------= =---------------------
function prototypeSun_toggleState()
{
	if(this._state=='none')
		this._state = (this.factor==0?'showing':'hiding');
	else if(this._state=='showing')
		this._state = 'hiding';
	else 
		this._state = 'showing';
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
// ---------------------= =---------------------
// ---------------------= =---------------------