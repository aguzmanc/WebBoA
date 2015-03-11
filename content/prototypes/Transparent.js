// ---------------------= =---------------------
function Transparent(x,y,alpha)
{
	Transformable.call(this, x,y);

	this.alpha = alpha;

	// -----= METHODS =-------
	this.draw = prototypeTransparent_draw;
}
// ---------------------= =---------------------
function prototypeTransparent_draw(context)
{
	// saves previous alpha
	var oldAlpha = context.globalAlpha;
	context.globalAlpha = this.alpha;

	// START DRAWING
	context.save();

	// BASIC TRANSFORMATION FOR THIS OBJECT
	context.translate(this.pos.x, this.pos.y);
	context.rotate(this.angle);
	context.scale(this.scale,this.scale);

	this.drawSprite(context);

	// FINISH DRAWING
	context.restore();

	// restores alpha
	context.globalAlpha = oldAlpha; 
}
// ---------------------= =---------------------
// ---------------------= =---------------------