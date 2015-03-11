// ---------------------= =---------------------
function Moon()
{
	Sun.call(this);

	this.tag = 'moon';

	this.imgSprite.src = 'content/images/textures.png';

	// -------= =-------
	this.drawSprite = prototypeMoon_drawSprite;
}
// ---------------------= =---------------------
function prototypeMoon_drawSprite(context)
{
	context.drawImage(
		this.imgSprite,
		2,2,276,275,
		-this.width/2, -this.height/2,
		this.width, this.height);
}
// ---------------------= =---------------------
// ---------------------= =---------------------
// ---------------------= =---------------------
// ---------------------= =---------------------