
const THREE = require('three'); // older modules are imported like this. You shouldn't have to worry about this much
import Framework from './framework'
//import Lsystem, {linkedListToString, testLinkedList} from './lsystem.js'
import Turtle from './turtle.js'
import {Shape, shapeTest, subdivideX, subdivideZ, parseShapeGrammar, generateRules, varyHeights} from './shapegrammar.js'
import {generateTerrain, getFlatFaces} from './terrain.js'

var scene;
var camera;
var turtle;
var lsys;
var terrain;

var flatFacePositions;

function renderShapes(shapes){
  //shapes[0].material = THREE.MeshPhongMaterial( { emissive: 0x111111, envMap: camera.renderTarget } );

  for (var i = 0; i < shapes.length; i++){
      scene.add(shapes[i].mesh);
  }
}

function subdivide(shape){

  var shapes = [];
  var subdivisions = 1;

  shapes.push(shape);
  for (var i = 0; i < subdivisions; i++){
    
    for (var j = 0; j < shapes.length; j++){
      var xShapes = subdivideX(shapes[i], 0.1);
      console.log(xShapes);
      shapes.concat(xShapes);
      console.log(shapes);
      shapes.splice(j, 1); //remove the split shape
      console.log(shapes);
    }
  }

  return shapes;

}

function toRadians(degrees){
  return degrees * Math.PI / 180.0;
}

// function jitterPos(shape, amnt){
//   var jitterX = Math.random() * amnt;
//   var jitterZ = Math.random() * amnt;
//   shape.setPosition(shape.position.x + jitterX, 0.0, shape.position.z + jitterZ);
// }

function generateCitySeed(numShapes, maxRadius){
  //generates a city with more density in the center

  var material = new THREE.LineBasicMaterial({
  color: 0x0000ff
  });

  var shapes = [];

  var numRays = 10;
  var direction = new THREE.Vector2(0.0,-4.0);
  var center = new THREE.Vector2(0.0,0.0);
  for (var i = 0; i < 360.0; i+= 360.0/numRays){
    direction.rotateAround(center, toRadians(360.0/numRays));
    
    for (var j = 0; j < numShapes/numRays; j++){ //add multiple buildings on the same ray
      
      //create a bias towards center
      var minRadius = 0.0;
      var bias = 0.0; //bias towards 0
      var influence = 0.5;
      var rnd = Math.random()*maxRadius;
      var mix = Math.random()* influence;
      var biasedRadius = rnd * (1.0 - mix) + bias * mix;
      direction.normalize().multiplyScalar(biasedRadius);

      var position = new THREE.Vector3(direction.x, 0.0, direction.y);


      //render line for debugging
      var geometry = new THREE.Geometry();
      geometry.vertices.push(
      new THREE.Vector3( 0, 0, 0 ),
      position,
      );
      var line = new THREE.Line( geometry, material );
      scene.add(line);

      //add shape at the tip
      var shape = new Shape();
      var jitterAmnt = 1.0;
      var jitterX = Math.random() * (jitterAmnt - (-jitterAmnt)) + (-jitterAmnt);
      var jitterZ = Math.random() * (jitterAmnt - (-jitterAmnt)) + (-jitterAmnt);

      shape.setPosition(position.x + jitterX,0.0,position.z + jitterZ);
      //jitterPos(shape, 5.0);// jitters the position a bit
      //shape.setScale(1.0,1.0,1.0);
      //shape.setScale(0.1,0.1,0.1);
      //scene.add(shape.mesh);
      shapes.push(shape);
      }
    
  }
  
  // var shapes = [];
  // for (var i = 0; i < numShapes; i++){
  //   //random radius length from the center
  //   // var radius = Math.random() * maxRadius;
  //   // var randX = Math.random() * (1 - (-1)) + (-1);
  //   // var randZ = Math.random() * (1 - (-1)) + (-1);
  //   // var direction = new THREE.Vector3(randX, 0.0, randZ);
  //   // direction.normalize();
  //   // var position = direction.multiplyScalar(radius);
  //   // var shape = new Shape();
  //   // shape.setPosition(position.x,position.y,position.z);
  //   //UNCOMMENT BELOW!!
  //   //shapes.push(shape);

  // }

  return shapes;
}

function generateSuburbanSeed(){
    //place suburban holmes on the flat spots outside of the city
  flatFacePositions = getFlatFaces(terrain.geometry);
  var suburbanShapes = [];

  var numSuburbanShapes = 50;
  for (var i = 0; i < numSuburbanShapes; i++){

    var randomPos = flatFacePositions[getRandomInt(0,flatFacePositions.length)];
    var shape = new Shape('A');
    shape.setPosition(randomPos.x,randomPos.y - 0.2,randomPos.z);
    shape.setScale(0.5, 0.5, 0.5);
    // console.log(shape);
    // scene.add(shape.mesh);
    suburbanShapes.push(shape);
  }

  return suburbanShapes;

}

function generateWorld(scene){

  // var shape1 = new Shape('A');
  // var shape2 = new Shape('A');
  // var shape3 = new Shape();
  // shape2.setPosition(-1,0,-1);
  // shape3.setPosition(1,0,1);
  // var shapes  = [shape1, shape2, shape3];

  //scene.add(shape.mesh);

  terrain = generateTerrain();
  scene.add(terrain);


  var rules = generateRules();
  // var shapes =  rules[0](shape);
  //var parsedShapes = parseShapeGrammar(shapes, rules, 5);


  var cityShapes = generateCitySeed(80, 7.0);
  cityShapes = parseShapeGrammar(cityShapes, rules, 10);
  //varyHeights(cityShapes);

  // var shapes = [shape1, shape2];
  // var parsedShapes = parseShapeGrammar(shapes, rules, 10);
  renderShapes(cityShapes);

  var suburbanShapes = generateSuburbanSeed();
  suburbanShapes = parseShapeGrammar(suburbanShapes, rules, 2);

  renderShapes(suburbanShapes);


  //renderShapes(cityShapes);


  //renderShapes(parsedShapes);


}

// called after the scene loads

var settings = {"debug":false};

function onLoad(framework) {
  scene = framework.scene;
  camera = framework.camera;
  var renderer = framework.renderer;
  var gui = framework.gui;
  var stats = framework.stats;

   // set skybox
    var loader = new THREE.CubeTextureLoader();
    var urlPrefix = 'images/skymap/';

    var skymap = new THREE.CubeTextureLoader().load([
        urlPrefix + 'px.jpg', urlPrefix + 'nx.jpg',
        urlPrefix + 'py.jpg', urlPrefix + 'ny.jpg',
        urlPrefix + 'pz.jpg', urlPrefix + 'nz.jpg'
    ] );

    scene.background = skymap;


  generateWorld(scene);

 

  // initialize a simple box and material
  var directionalLight = new THREE.DirectionalLight( 0xffe700, 1 );
  directionalLight.color.setHex(0xFEFFE5);
  directionalLight.position.set(1, 3, 2);
  directionalLight.position.multiplyScalar(10);
  scene.add(directionalLight);

  // set camera position
  camera.position.set(1, 1, 2);
  camera.lookAt(new THREE.Vector3(0,0,0));

  gui.add(camera, 'fov', 0, 180).onChange(function(newVal) {
    camera.updateProjectionMatrix();
  });

  gui.add(settings, 'debug').onChange(function(newVal) {
    toggleDebug();
  });

}

var debug_lines = [];

function toggleDebug(){
  //DEBUG LINES
  if(settings.debug){
    var material = new THREE.LineBasicMaterial({color: 0x0000ff});
    for (var i = 0; i < flatFacePositions.length; i++){
      var f = flatFacePositions[i];
      var f_end = new THREE.Vector3(f.x, f.y + 1.0, f.z);
      var geometry = new THREE.Geometry();
      geometry.vertices.push(
        f,
        f_end
      );
    var line = new THREE.Line( geometry, material );
    debug_lines.push(line);
    scene.add(line);
    }
  } else {
     for( var i = 0; i < debug_lines.length; i++) {
        scene.remove(debug_lines[i]);
    }
  }
}

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min;
}

// clears the scene by removing all geometries added by turtle.js
function clearScene(turtle) {
  var obj;
  for( var i = turtle.scene.children.length - 1; i > 3; i--) {
      obj = turtle.scene.children[i];
      turtle.scene.remove(obj);
  }
}

function doLsystem(lsystem, iterations, turtle) {
    var result = lsystem.doIterations(iterations);
    turtle.clear();
    turtle = new Turtle(turtle.scene);
    turtle.iterations = iterations;
    turtle.renderSymbols(result);
}

// called on frame updates
function onUpdate(framework) {
}

// when the scene is done initializing, it will call onLoad, then on frame updates, call onUpdate
Framework.init(onLoad, onUpdate);
