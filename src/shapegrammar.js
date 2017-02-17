//Shape Grammar
const THREE = require('three'); // older modules are imported like this. You shouldn't have to worry about this much
// const ShapeStates ={ //possible states that a shape can have
// 	TOWER : 0,
// 	CITYBUILDING: 1,
// 	SUBURBBUILDING: 2

// };

export function Shape(symbol){
	if(symbol){
		this.symbol = symbol;
	}else{
		this.symbol = 'A';
	}
	
	this.geometry = new THREE.CubeGeometry(1.0, 1.0, 1.0);;
	this.material = new THREE.MeshLambertMaterial( {color: 0xD3D3D3} );
	this.mesh =  new THREE.Mesh(this.geometry, this.material);
	this.position = new THREE.Vector3(0,0,0);
	this.rotation = new THREE.Vector3(0,0,0);
	this.scale = new THREE.Vector3(0.75,0.75,0.75);
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

	this.setSymbol = function(symbol){
		this.symbol = symbol;
	}
}


function Rule(symbol){
	this.succesorSymbol = symbol; //symbol predecessor
	this.func = null; //function that will generate new shape
	this.probability = 1.0;

	this.setProb = function(prob){
		this.probability = prob;
	};
}

export function generateRules(){

	//A is a general city building which can
	//B is the base of a skyscraper
	//C is towering shapes of the skyscraper
	var subdivX = new Rule('A');
	subdivX.func = subdivideX;
	subdivX.probability = 0.5;
	
	var subdivZ = new Rule('A');
	subdivZ.func = subdivideZ;
	subdivZ.probability = 0.5;
	
	var tower = new Rule('B');
	tower.func = createTower;

	var tall = new Rule('B');
	tall.func = makeTall;

	var rules = {'A': [subdivX, subdivZ, tall],
				 'B': [tower],
				 'C': [tower]
				};

	rules['A'][0].setProb(0.45);
	rules['A'][1].setProb(0.45);
	rules['A'][2].setProb(0.10);

	rules['B'][0].setProb(1.0);

	rules['C'][0].setProb(1.0);



	return rules;
}

function revertTowerProb(rules){
	rules['A'][0].setProb(0.45);
	rules['A'][1].setProb(0.45);
	rules['A'][2].setProb(0.10);
}


function bias(b, t){
	return Math.pow(t, Math.log(b)/ Math.log(0.5));
}
function adjustTowerProb(shape, rules){
	//7 is max radius
	var normalizedRadius = shape.position.length()/7.0;
	if (normalizedRadius < 0.30){
		rules['A'][0].setProb(0.25);
		rules['A'][1].setProb(0.25);
		rules['A'][2].setProb(0.50);
	}else{
		rules['A'][0].setProb(0.45);
		rules['A'][1].setProb(0.45);
		rules['A'][2].setProb(0.10);
	}


	// var towerProb = bias(1.0, normalizedRadius);
	// var otherProb = (1.0 - towerProb)/2.0; 
	// console.log(normalizedRadius);

	// var invSquare = (1.0*Math.pow(normalizedRadius, 3.0));
	// var towerProb = Math.max(0,0, Math.min(invSquare, 1.0));
	// var otherProb = (1.0  - towerProb)/2.0;



	// if(normalizedRadius < 0.2){
	// 	console.log("LOW RADIUS");`
	// 	console.log(rules['A']);
	// }
	// if(normalizedRadius > 0.8){
	// 	console.log("HIGH RADIUS")
	// 	console.log(rules['A']);
	// }
	
}

function applyRandomRule(shape, rules){
	var predecessorSymbol = shape.symbol;

	if (predecessorSymbol in rules){
		//console.log("found");

		adjustTowerProb(shape,rules);
		
		var symbolRules = rules[predecessorSymbol];
		var p = Math.random();
		var cumulativeProbability = 0.0;
		
		for (var i = 0; i < symbolRules.length; i++) {
		    cumulativeProbability += symbolRules[i].probability;
		    if (p <= cumulativeProbability) {
		        return symbolRules[i].func(shape);
		    }
		}

		//revertTowerProb(rules);
		// var size = rules[predecessorSymbol].length;
		// var index = Math.floor(Math.random() * size);
		// return rules[predecessorSymbol][index].func(shape);
	}

	return [shape];
}

function isTooSmall(shape){

	return (shape.scale.x < 0.3
		|| shape.scale.y < 0.3
		|| shape.scale.z < 0.3);
}

export function varyHeights(shapes){
	for (var i = 0; i < shapes.length; i++){
		var s = shapes[i];
		if (s.symbol != 'B' && s.symbol != 'C'){
			var randScale = Math.random() * s.scale.y;//random num (0,0.5)

			s.setPosition(s.position.x, -0.5 + (randScale/2.0), s.position.z);
			s.setScale(s.scale.x, randScale, s.scale.z);
		}
	}
}



export function parseShapeGrammar(shapes, rules, iterations){
	//newShapes will be the shapes we create from subdivision
	var newShapes = shapes.slice();
	//unsplitLen will be used to iterate so we dont go infinity
	var unsplitLen = shapes.length; //
	for (var n = 0; n < iterations; n++){

		for (var i = 0; i < unsplitLen; i++){
			var s = newShapes[i];

			if (isTooSmall(s)){
				s.terminal = true;
			}

			if (!s.terminal){
				//console.log(shapes);
				//apply a rule to get the succesor
				//console.log(s.symbol);
				var successors = applyRandomRule(s,rules);
				//remove the old shape
      			newShapes.splice(i, 1); 
      			//add new shapes
      			newShapes = newShapes.concat(successors);
			}
		}

		//next iteration we can iterate on the new shapes we created
		unsplitLen = newShapes.length;
 	}

 	varyHeights(newShapes);

	return newShapes;
}

export function subdivideX(shape){
	//console.log("subdivX");

	// if(shape.isA(ShapeStates.TOWER)){
	// 	return [shape];
	// }

	var shapePos = shape.position;
	var shapeLen = shape.scale.x; //assuming cube
	var shapeScale = shape.scale;
	var padding = 0.1;

	var newLen = (shapeLen - padding)/2.0;

	var newPos1 = shape.position.clone();
	newPos1.x = newPos1.x - newLen/2.0 - padding/2.0;

	//split into 2 pieces
	//first shape
	var newShape1 = new Shape('A');
	newShape1.setScale(newLen, shapeScale.y, shapeScale.z);
	newShape1.setPosition(newPos1.x,newPos1.y,newPos1.z);

	//second shape
	var newPos2 = shape.position.clone();
	newPos2.x = newPos2.x + newLen/2.0 + padding/2.0;
	var newShape2 = new Shape('A');
	//newShape2.material.color.setHex( 0x0000FF );
	newShape2.setScale(newLen, shapeScale.y, shapeScale.z);
	newShape2.setPosition(newPos2.x,newPos2.y,newPos2.z);

	return [newShape1, newShape2];
}


export function subdivideZ(shape){
	//console.log("subdivZ");

	// if(shape.isA(ShapeStates.TOWER)){
	// 	return [shape];
	// }

	var shapePos = shape.position;
	var shapeLen = shape.scale.z; //assuming cube
	var shapeScale = shape.scale;
	var padding = 0.1;

	var newLen = (shapeLen - padding)/2.0;

	var newPos1 = shape.position.clone();
	newPos1.z = newPos1.z - newLen/2.0 - padding/2.0;

	//split into 2 pieces
	//first shape
	var newShape1 = new Shape('A');
	newShape1.setScale(shapeScale.x, shapeScale.y, newLen);
	newShape1.setPosition(newPos1.x,newPos1.y,newPos1.z);

	//second shape
	var newPos2 = shape.position.clone();
	newPos2.z = newPos2.z + newLen/2.0 + padding/2.0;
	var newShape2 = new Shape('A');
	//newShape2.material.color.setHex( 0x0000FF );
	newShape2.setScale(shapeScale.x, shapeScale.y, newLen);
	newShape2.setPosition(newPos2.x,newPos2.y,newPos2.z);

	return [newShape1, newShape2];
}

function isReadyToTower(shape){
	return ((Math.abs(shape.scale.x - shape.scale.z)
		< 0.2) && shape.scale.x<1.0) ;
}

function createTower(shape){
	//console.log("tower");

	var scale = Math.random() * (1 - 0.3) + 0.3;;
	//var newScale = shape.scale.clone().multiplyScalar(scale);
	//var newYpos = shape.position.y + shape.scale.y/2.0 + newScale.y/2.0;

	var newShape = new Shape('C');
	var s = shape;
	var randScale = (Math.random() * 1.0);
	newShape.setPosition(s.position.x, s.position.y + (randScale/2.0), s.position.z);
	newShape.setScale(s.scale.x*scale, randScale, s.scale.z*scale);
	newShape.mesh.material.color = new THREE.Color(newShape.position.y, newShape.position.y, newShape.position.y);

	//newShape.material.color.setHex(0xFFA500);
	// newShape.setPosition(shape.position.x, newYpos, shape.position.z)
	// newShape.setScale(newScale.x,newScale.y,newScale.z);
	//newShape.addState(ShapeStates.TOWER);

	return [shape, newShape];
}

export function makeTall(shape){
	//console.log("makeTall");
	// if (!isReadyToTower(shape)){
	// 	return [shape];
	// }
	var s = shape;
	var randScale = (Math.random() * 2.0);//random num (0,0.5)
	s.setPosition(s.position.x, -0.5 + (randScale/2.0), s.position.z);
	s.setScale(s.scale.x, randScale, s.scale.z);
	s.setSymbol('B');
	s.mesh.material.color = new THREE.Color(s.position.y, s.position.y, s.position.y);
	// console.log(s);
	return [s];
}

export function shapeTest(){
	var shape1 = new Shape();
	//shape1.setScale(1.0,1.0,1.0);


	return shape1;
}