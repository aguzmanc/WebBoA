// --------------------= =--------------------
var DEFAULT_TRANSFORMABLE_SIZE = 100;
// --------------------= =--------------------
function Transformable(x,y)
{
	this.engine = getEngine();

	// public
	this.pos = {x:x,y:y};
	this.scale = 1.0;
	this.angle = 0.0;
	this.velocity = 1.0;
	this.angularVelocity = 0.01;
	this.width = DEFAULT_TRANSFORMABLE_SIZE;
	this.height = DEFAULT_TRANSFORMABLE_SIZE;
	this.imgSprite = new Image();
	this.imgSprite.src = 'content/images/dummy.png';
	this.tag = 'transformable';

	// private
	this._mov = {x:0.5,y:0.5}; 

	// ---= DUMMY INFO =---
	this.helpers={boundingBox:false,bounds:false};

	// ----------= METHODS =-------------
	// To change movement direction
	this.setDirection = function(x,y)
	{
		var v = Math.sqrt(x*x + y*y);
		this._mov.x = x/v;
		this._mov.y = y/v;
	};

	// ------= METHODS =--------
	this.update = prototypeTransformable_update;
	this.draw = prototypeTransformable_draw;
	this.drawSprite = prototypeTransformable_drawSprite;
	this.drawScreenInfo = function(ctx){}; // by default no screen info
	this.getBounds = prototypeTransformable_getBounds;
	this.getBoundingBox = prototypeTransformable_getBoundingBox;
	this.drawBounds = prototypeTransformable_drawBounds;
	this.drawBoundingBox = prototypeTransformable_drawBoundingBox;
	this.collidesWith = prototypeTransformable_collidesWith; // collision detection
	// to check if continues updating
	this.isDead = function(){return false;}; 
}
// ------------------
// 'diff' is the diference between last update and this new
function prototypeTransformable_update(diff)
{
	var factor = diff/1000.0;

	this.pos.x += this.velocity * this._mov.x * factor;
	this.pos.y += this.velocity * this._mov.y * factor;

	this.angle += this.angularVelocity * factor;
}
// ------------------
function prototypeTransformable_draw(context)
{
	// START DRAWING
	context.save();

	// BASIC TRANSFORMATION FOR THIS OBJECT
	context.translate(this.pos.x, this.pos.y);
	context.rotate(this.angle);
	context.scale(this.scale,this.scale);

	this.drawSprite(context);

	// FINISH DRAWING
	context.restore();
}
// ------------------
function prototypeTransformable_drawSprite(context)
{
	// DRAW ITSELF - it draws in the center of coordinate system (0,0)
	// context.drawImage(
	// 	this.imgSprite,
	// 	-this.width/2, -this.height/2,
	// 	this.width, this.height);
}
// ------------------
function prototypeTransformable_drawBounds(context)
{
	context.strokeStyle = '#FFFF00'; // yellow
	context.lineWidth=2;
	var bounds = this.getBounds();

	context.beginPath();
	context.moveTo(bounds[0].x,bounds[0].y);
	var i=1,length=bounds.length;
	for(;i<length;i++)
		context.lineTo(bounds[i].x,bounds[i].y);

	context.lineTo(bounds[0].x,bounds[0].y);

	context.stroke();
}
// ------------------
function prototypeTransformable_drawBoundingBox(context)
{
	var bb = this.getBoundingBox();

	context.strokeStyle = '#00FF00'; // green
	context.lineWidth=2;
	context.strokeRect(bb.x,bb.y,bb.w,bb.h);
}
// ------------------
// Basic assumption: bounds are composed of a rotated rectangle
function prototypeTransformable_getBounds()
{
	var w2 = this.width/2;
	var h2 = this.height/2;
	var s = Math.sin(this.angle);
	var c = Math.cos(this.angle);

	var v = [{x:w2,y:h2},{x:w2,y:-h2},{x:-w2,y:-h2},{x:-w2,y:h2}];

	var rot = {x:0,y:0};
	for(i=0;i<4;i++) {
		v[i].x *= this.scale;
		v[i].y *= this.scale;

		rot.x = v[i].x * c - v[i].y * s;
		rot.y = v[i].x * s + v[i].y * c;

		v[i].x = rot.x + this.pos.x;
		v[i].y = rot.y + this.pos.y;
	}

	return v;
}
// ------------------
function prototypeTransformable_getBoundingBox()
{
	var v = this.getBounds();
	var length = v.length;
	var ma={x:-99999.0,y:-99999.0}, mi={x:99999.0,y:99999.0};

	for(i=0;i<length;i++){
		ma.x = Math.max(ma.x, v[i].x);
		ma.y = Math.max(ma.y, v[i].y);
		mi.x = Math.min(mi.x, v[i].x);
		mi.y = Math.min(mi.y, v[i].y);
	}

	return {
		x: mi.x,
		y: mi.y,
		w: ma.x-mi.x,
		h: ma.y-mi.y 
	};
}
// ------------------
function prototypeTransformable_collidesWith(that)
{
	// first check if two bounding boxes collide
	var A = this.getBoundingBox();
	var B = that.getBoundingBox();

	if(A.x < B.x){
		if(A.x + A.w < B.x) 
			return false;
	}else{
		if(B.x + B.w < A.x)
			return false;
	}

	if(A.y < B.y){
		if(A.y + A.h < B.y)
			return false;
	}else{
		if(B.y + B.h < A.y)
			return false;
	}

	// get a list of coordinates
	A = this.getBounds();
	B = that.getBounds();

	var i,k,al=A.length,bl=B.length;
	var segmentA, segmentB;

	for(i=0;i<al;i++){
		segmentA = {a:A[i],b:A[(i+1) % al]};

		for(k=0;k<bl;k++){
			segmentB = {a:B[k],b:B[(k+1)%bl]};

			if(segmentsIntersect(segmentA,segmentB)) // just two intersects, means the two objects collide
				return true;
		}
	}
	
	// No collision were found
	return false; 
}
// ------------------
// ------------------