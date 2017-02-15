
const THREE = require('three'); // older modules are imported like this. You shouldn't have to worry about this much
import Framework from './framework'
//import Lsystem, {linkedListToString, testLinkedList} from './lsystem.js'
import Turtle from './turtle.js'
import {shapeTest, subdivideX, subdivideZ, createTower, createTowers} from './shapegrammar.js'
import {generateTerrain} from './terrain.js'

var scene;
var turtle;
var lsys;

function renderShapes(shapes){
  for (var i = 0; i < shapes.length; i++){
      scene.add(shapes[i].mesh);
  }
}

function testShapes(scene){

  var shape = shapeTest();
  //scene.add(shape.mesh);

  // var shape1 = subdivide(shape, 0.0);
  // //shape1.setPosition(shape1.position.x + 1.0, shape1.position.y, shape1.position.z);
  // scene.add(shape1.mesh);

  // var shape2 = subdivide(shape, 0.0);
  // //shape2.setPosition(shape2.position.x + 1.75, shape2.position.y, shape2.position.z);
  // scene.add(shape2.mesh);

  var shapes = subdivideX(shape, 0.1);
  //scene.add(shapes[0].mesh);

  var shape0 = subdivideZ(shapes[0], 0.1);
  console.log(shape0);
  scene.add(shape0[0].mesh);
  scene.add(shape0[1].mesh);


  //scene.add(shapes[1].mesh);
  var towers = createTowers(shape0[1], 3);
  renderShapes(towers);
  //renderShapes(towers);
  // for (var i = 0; i  < towers.length; i++){

  // }
  // scene.add(tower1.mesh);

  // var tower2 = createTower(tower1, 0.8);
  // scene.add(tower2.mesh);



  var shapes2 = subdivideX(shapes[1], 0.1);
  scene.add(shapes2[0].mesh);
  //scene.add(shapes2[1].mesh);


  var shapes3 = subdivideX(shapes2[1], 0.1);
  scene.add(shapes3[0].mesh);
  scene.add(shapes3[1].mesh);



}

// called after the scene loads
function onLoad(framework) {
  scene = framework.scene;
  var camera = framework.camera;
  var renderer = framework.renderer;
  var gui = framework.gui;
  var stats = framework.stats;

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
