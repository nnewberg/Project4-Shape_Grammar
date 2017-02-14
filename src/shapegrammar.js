//Shape Grammar
const THREE = require('three'); // older modules are imported like this. You shouldn't have to worry about this much


function Rule(){
	
}

function Shape(){
	this.symbol = '';
	this.geometry = new THREE.CubeGeometry(1.0, 1.0, 1.0);;
	this.material = new THREE.MeshLambertMaterial( {color: 0xffffff} );
	this.mesh =  new THREE.Mesh(this.geometry, this.material);
	this.position = new THREE.Vector3(0,0,0);
	this.rotation = new THREE.Vector3(0,0,0);
	this.scale = new THREE.Vector3(1.0,1.0,1.0);
	this.terminal = true;

	this.setPosition = function(newX,newY,newZ){
		if (this.mesh){
			this.position = new THREE.Vector3(newX,newY,newZ);
			this.mesh.position.set(newX,newY,newZ);
		}
	};
	
	this.setScale = function(newX,newY,newZ){
		if (this.mesh){
			this.scale = new THREE.Vector3(newX,newY,newZ);
			this.mesh.scale.set(newX,newY,newZ);
		}
	};

}

export function subdivideX(shape, padding){
	var shapePos = shape.position;
	var shapeLen = shape.scale.x; //assuming cube
	var shapeScale = shape.scale;

	var newLen = (shapeLen - padding)/2.0;

	var newPos1 = shape.position.clone();
	newPos1.x = newPos1.x - newLen/2.0 - padding/2.0;

	//split into 2 pieces
	//first shape
	var newShape1 = new Shape();
	newShape1.setScale(newLen, shapeScale.y, shapeScale.z);
	newShape1.setPosition(newPos1.x,newPos1.y,newPos1.z);

	//second shape
	var newPos2 = shape.position.clone();
	newPos2.x = newPos2.x + newLen/2.0 + padding/2.0;
	var newShape2 = new Shape();
	newShape2.material.color.setHex( 0x0000FF );
	newShape2.setScale(newLen, shapeScale.y, shapeScale.z);
	newShape2.setPosition(newPos2.x,newPos2.y,newPos2.z);

	return [newShape1, newShape2];
}


export function subdivideZ(shape, padding){
	var shapePos = shape.position;
	var shapeLen = shape.scale.z; //assuming cube
	var shapeScale = shape.scale;

	var newLen = (shapeLen - padding)/2.0;

	var newPos1 = shape.position.clone();
	newPos1.z = newPos1.z - newLen/2.0 - padding/2.0;

	//split into 2 pieces
	//first shape
	var newShape1 = new Shape();
	newShape1.setScale(shapeScale.x, shapeScale.y, newLen);
	newShape1.setPosition(newPos1.x,newPos1.y,newPos1.z);

	//second shape
	var newPos2 = shape.position.clone();
	newPos2.z = newPos2.z + newLen/2.0 + padding/2.0;
	var newShape2 = new Shape();
	newShape2.material.color.setHex( 0x0000FF );
	newShape2.setScale(shapeScale.x, shapeScale.y, newLen);
	newShape2.setPosition(newPos2.x,newPos2.y,newPos2.z);

	return [newShape1, newShape2];
}

export function createTower(shape, scale){
	var newScale = shape.scale.clone().multiplyScalar(scale);
	var newYpos = shape.position.y + shape.scale.y/2.0 + newScale.y/2.0;

	var newShape = new Shape();
	newShape.material.color.setHex(0xFFA500);
	newShape.setPosition(shape.position.x, newYpos, shape.position.z)
	newShape.setScale(newScale.x,newScale.y,newScale.z);

	return newShape;
}

export function shapeTest(){
	var shape1 = new Shape();
	var cylGeo = new THREE.CubeGeometry(2.0, 1.0, 10.0);
	shape1.geometry = cylGeo;
	var shapeMesh = new THREE.Mesh(cylGeo, shape1.material);
	shape1.mesh = shapeMesh;

	return shape1;
}