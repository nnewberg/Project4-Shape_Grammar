
const THREE = require('three'); // older modules are imported like this. You shouldn't have to worry about this much
import Framework from './framework'
//import Lsystem, {linkedListToString, testLinkedList} from './lsystem.js'
import Turtle from './turtle.js'
import {Shape, shapeTest, subdivideX, subdivideZ, createTower, createTowers, parseShapeGrammar, generateRules, varyHeights} from './shapegrammar.js'
import {generateTerrain} from './terrain.js'

var scene;
var camera;
var turtle;
var lsys;

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

function generateCitySeed(numShapes, maxRadius){
  var shapes = [];
  for (var i = 0; i < numShapes; i++){
    //random radius length from the center
    var radius = Math.random() * maxRadius;
    var randX = Math.random() * (1 - (-1)) + (-1);
    var randZ = Math.random() * (1 - (-1)) + (-1);
    var direction = new THREE.Vector3(randX, 0.0, randZ);
    direction.normalize();
    var position = direction.multiplyScalar(radius);
    var shape = new Shape();
    shape.setPosition(position.x,position.y,position.z);
    shapes.push(shape);
  }

  return shapes;
}

function testShapes(scene){

  var shape1 = new Shape();
  var shape2 = new Shape();
  var shape3 = new Shape();
  shape2.setPosition(-1,0,-1);
  shape3.setPosition(1,0,1);
  var shapes  = [shape1, shape2, shape3];

  //scene.add(shape.mesh);

  var rules = generateRules();
  // var shapes =  rules[0](shape);
  //var parsedShapes = parseShapeGrammar(shapes, rules, 5);


  var cityShapes = generateCitySeed(50, 4.0);
  cityShapes = parseShapeGrammar(cityShapes, rules, 5);
  //varyHeights(cityShapes);

  renderShapes(cityShapes);


  //renderShapes(parsedShapes);


}

// called after the scene loads
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

  scene.add(generateTerrain());

  testShapes(scene);

 

  // initialize a simple box and material
  var directionalLight = new THREE.DirectionalLight( 0xffffff, 1 );
  directionalLight.color.setHSL(0.1, 1, 0.95);
  directionalLight.position.set(1, 3, 2);
  directionalLight.position.multiplyScalar(10);
  scene.add(directionalLight);

  // set camera position
  camera.position.set(1, 1, 2);
  camera.lookAt(new THREE.Vector3(0,0,0));

  gui.add(camera, 'fov', 0, 180).onChange(function(newVal) {
    camera.updateProjectionMatrix();
  });

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
