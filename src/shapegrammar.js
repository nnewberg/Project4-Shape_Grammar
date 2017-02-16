//Shape Grammar
const THREE = require('three'); // older modules are imported like this. You shouldn't have to worry about this much
const ShapeStates ={ //possible states that a shape can have
	TOWER : 0,
	CITYBUILDING: 1,
	SUBURBBUILDING: 2

};

function Rule(){

	this.func = null;
	this.probability = 1.0;
	
}

function applyRandomRule(shape, rules){
	var size = rules.length;
	var index = Math.floor(Math.random() * size);
	var randomRule = rules[index];
	return randomRule(shape);
}

function isTooSmall(shape){
	return (shape.scale.x < 0.3
		|| shape.scale.y < 0.3
		|| shape.scale.z < 0.3);
}

export function varyHeights(shapes){
	for (var i = 0; i < shapes.length; i++){
		var s = shapes[i];
		var randScale = Math.random();//random num (0,0.5)
		//console.log(randScale);
		//s.setPosition(s.position.x,s.position.y - (randScale/2.0), s.position.z);

		console.log(s.scale.y);
		s.setPosition(s.position.x, -0.5 + (randScale/2.0), s.position.z);
		s.setScale(s.scale.x, randScale, s.scale.z);
		//console.log(s.position.y);
		//s.position.y-(s.scale.y - 0.5)
	}
}

export function generateRules(){

	return [subdivideX, subdivideZ];
}

export function parseShapeGrammar(shapes, rules, iterations){
	//newShapes will be the shapes we create from subdivision
	var newShapes = shapes.slice();
	//unsplitLen will be used to iterate so we dont go infinity
	var unsplitLen = newShapes.length; //
	for (var n = 0; n < iterations; n++){

		for (var i = 0; i < unsplitLen; i++){
			var s = newShapes[i];
			if (isTooSmall(s)){
				s.terminal = true;
			}
			if (!s.terminal){
				//console.log(shapes);
				//apply a rule to get the succesor
				var successors = applyRandomRule(s,rules);
				//remove the old shape
      			newShapes.splice(i, 1); 
      			//add new shapes
      			//console.log(successors);
      			newShapes = newShapes.concat(successors);
			}
		}

		//next iteration we can iterate on the new shapes we created
		unsplitLen = newShapes.length;
 	}

 	//varyHeights(newShapes);
 	varyHeights(newShapes);

	return newShapes;
}

export function Shape(){
	this.symbol = '';
	this.geometry = new THREE.CubeGeometry(1.0, 1.0, 1.0);;
	this.material = new THREE.MeshLambertMaterial( {color: 0xD3D3D3} );
	this.mesh =  new THREE.Mesh(this.geometry, this.material);
	this.position = new THREE.Vector3(0,0,0);
	this.rotation = new THREE.Vector3(0,0,0);
	this.scale = new THREE.Vector3(1.0,1.0,1.0);
	this.terminal = false;
	this.states = [];

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

	this.addState = function(state){
		if (this.states.indexOf(state) < 0){
			this.states.push(state);
		}
	}

	this.isA = function(state){
		for (var i = 0; i < this.states.length; i++){
			if (this.states[i] == state){
				return true;
			}
		}

		return false;
	}

}

export function subdivideX(shape){

	if(shape.isA(ShapeStates.TOWER)){
		return [shape];
	}

	var shapePos = shape.position;
	var shapeLen = shape.scale.x; //assuming cube
	var shapeScale = shape.scale;
	var padding = 0.1;

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
	//newShape2.material.color.setHex( 0x0000FF );
	newShape2.setScale(newLen, shapeScale.y, shapeScale.z);
	newShape2.setPosition(newPos2.x,newPos2.y,newPos2.z);

	return [newShape1, newShape2];
}


export function subdivideZ(shape){

	if(shape.isA(ShapeStates.TOWER)){
		return [shape];
	}

	var shapePos = shape.position;
	var shapeLen = shape.scale.z; //assuming cube
	var shapeScale = shape.scale;
	var padding = 0.1;

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
	//newShape2.material.color.setHex( 0x0000FF );
	newShape2.setScale(shapeScale.x, shapeScale.y, newLen);
	newShape2.setPosition(newPos2.x,newPos2.y,newPos2.z);

	return [newShape1, newShape2];
}

function isNearlySquare(shape){
	return (Math.abs(shape.scale.x - shape.scale.z)
		< 0.2);
}

export function createTower(shape){

	if (!isNearlySquare(shape)){
		return [shape];
	}

	shape.terminal = true; //the base shouldn't be subdivided more
	shape.addState(ShapeStates.TOWER);

	var scale = 0.8;
	var newScale = shape.scale.clone().multiplyScalar(scale);
	var newYpos = shape.position.y + shape.scale.y/2.0 + newScale.y/2.0;

	var newShape = new Shape();
	//newShape.material.color.setHex(0xFFA500);
	newShape.setPosition(shape.position.x, newYpos, shape.position.z)
	newShape.setScale(newScale.x,newScale.y,newScale.z);
	newShape.addState(ShapeStates.TOWER);

	return [shape, newShape];
}

export function createTowers(shape, iterations){
	var towers = [];
	var currShape = shape;
	for (var i = 0; i < iterations; i++){
		var currShape = createTower(currShape,0.8);
		towers.push(currShape);
	}

	return towers;
}

export function shapeTest(){
	var shape1 = new Shape();
	shape1.setScale(1.0,1.0,1.0);


	return shape1;
}