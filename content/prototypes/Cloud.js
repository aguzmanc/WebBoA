var MAX_CLOUD_SIZE = 500;
var MIN_CLOUD_SIZE = 100;
// ---------------------= =---------------------
function Cloud(movx, movy)
{
	Transformable.call(this,0,0);

	var typeIdx = generateIntRandom(0,2);
	var types = ['ld','md','hd'];
	var velocityPerType = {ld:20,md:60,hd:90};
	this.typeKey = types[typeIdx]; 

	this.tag = 'cloud';

	this.imgSprite.src = 'content/images/textures.png';
	this.width = (Math.random() * (MAX_CLOUD_SIZE - MIN_CLOUD_SIZE)) + MIN_CLOUD_SIZE;
	this.height = this.width;
	this.velocity = velocityPerType[this.typeKey];
	this.angularVelocity = generateRandom(-Math.PI/10,Math.PI/10);
	this.setDirection(-movx,-movy);

	var c = this.engine.camera;
	var CREATION_MARGIN = 330;

	if(generateIntRandom(0,1)==0){
		if(movx > 0)
			this.pos.x = c.max.x + this.width/2 + CREATION_MARGIN;
		else
			this.pos.x = c.min.x - this.width/2 - CREATION_MARGIN;	

		this.pos.y = generateRandom(c.min.y, c.max.y + this.height);
	} else {
		if(movy > 0)
			this.pos.y = c.max.y + this.height/2 + CREATION_MARGIN;
		else
			this.pos.y = c.min.y - this.height/2 - CREATION_MARGIN;

		this.pos.x = generateRandom(c.min.x, c.max.x + this.width);
	}

	// ------= METHODS =--------
	this.isDead = prototypeCloud_isDead;
	this.drawSprite = prototypeCloud_drawSprite;
}
// ---------------------= =---------------------
function prototypeCloud_isDead()
{
	var DEAD_MARGIN = 550;  // MUST: CREATION MARGIN < DEAD MARGIN  !!!!
	var c = this.engine.camera;

	if(this.pos.x + this.width/2 + DEAD_MARGIN < c.min.x) return true;

	if(this.pos.x - DEAD_MARGIN > c.max.x) return true;

	if(this.pos.y + this.height/2 + DEAD_MARGIN < c.min.y) return true;

	if(this.pos.y - DEAD_MARGIN > c.max.y) return true;

	// otherwise
	return false;
}
// ---------------------= =---------------------
function prototypeCloud_drawSprite(context)
{
	var sx,sy,swidth,sheight;

	switch(this.typeKey){
		case "hd":
			sx = 2;sy=279;swidth=128;sheight=128; 
			break;
		case "md":
			sx = 1283;sy=207;swidth=128;sheight=128; 
			break;
		case "ld":
			sx=1153;sy=207;swidth=128;sheight=128; 
			break;
	}

	context.drawImage(
		this.imgSprite,
		sx,sy,swidth,sheight,
		-this.width/2, -this.height/2,
		this.width, this.height);
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