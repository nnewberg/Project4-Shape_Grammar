const THREE = require('three'); // older modules are imported like this. You shouldn't have to worry about this much

function Terrain(){
	
}

export function getFlatFaces(geometry){

	geometry.computeFaceNormals();
	geometry.computeVertexNormals();

	var flatFaces = [];
	var faces = geometry.faces;
	console.log(faces.length);

	for (var i = 0; i < faces.length; i++){
		var f = faces[i];
		var dot = new THREE.Vector3(0.0,1.0,0.0).dot(f.normal);
		var facePos = geometry.vertices[f.a];
		var distance = facePos.length();
		if(dot < 0.001 && distance > 7.0){
			var rotatedFacePos = facePos.clone();
			//var vector = new THREE.Vector3( 1, 0, 0 );
			
			var axis = new THREE.Vector3( 1, 0, 0 );
			var angle = -(Math.PI / 2);
			rotatedFacePos.applyAxisAngle( axis, angle );

			flatFaces.push(rotatedFacePos);
		}
	}
	return flatFaces;
}

export function generateTerrain(){
	//cosine_interpolate(5.0,10.0,0.1);
	var geometry = new THREE.PlaneGeometry( 20, 20, 100, 100 );
	// var material = new THREE.MeshLambertMaterial( {color: 0xdbd1b4, vertexColors: THREE.FaceColors,
	// 	side: THREE.DoubleSide} );
	
	var vertices = geometry.vertices;

	//generate noise offset
	for (var i = 0; i < vertices.length; i++){
		var frequency = 0.75;
		var centerPos = new THREE.Vector3(0.0,0.0,0.0);
		var distance = centerPos.distanceTo(vertices[i]);
		var offset = 0.0;
		
		offset = perlinNoise(vertices[i], frequency)*distance*distance/90.0;



		// if(distance > 5){
		// 	//frequency += 0.5*distance;
		// 	offset = perlinNoise(vertices[i], frequency)*distance*distance/50.0;
		// }else{
		// 	offset = perlinNoise(vertices[i], frequency)*distance*distance/50.0;
		// }

		vertices[i].z -= offset;

		
	}

	geometry.computeFaceNormals();
	geometry.computeVertexNormals();

	var texture = new THREE.TextureLoader().load( "images/grid.jpg" );
	// assuming you want the texture to repeat in both directions:
	texture.wrapS = THREE.RepeatWrapping; 
	texture.wrapT = THREE.RepeatWrapping;
	// how many times to repeat in each direction; the default is (1,1),
	texture.repeat.set( 15, 15 ); 	

	var material = new THREE.MeshLambertMaterial({ map : texture });

	var plane = new THREE.Mesh( geometry, material);
	plane.position.set(0.0,-0.5,0.0);
	plane.rotation.x = -Math.PI / 2.0;
	//plane.scale.set(10.0,1.0,10.0);
	return plane;
}

function perlinNoise(pos, frequencyControl){
	var numOctaves = 1;
	var total = 0.0;
	var persistance = 1.0 / 2.0;

	for (var i = 0 ; i < numOctaves; i++){

		var frequency = Math.pow(2.0, i) * frequencyControl;
		var amplitude = Math.pow(persistance,i);
		total += bilinearInterpolation(pos, frequency, amplitude);
	}

	return total;

}

function bilinearInterpolation(pos, frequency, amplitude){

	var pd = pos.clone().multiplyScalar(frequency);

	//4 adjacent vec2 positions on plane
	var v00 = new THREE.Vector3(Math.floor(pd.x), Math.floor(pd.y), 0.0);
	var v01 = new THREE.Vector3(Math.floor(pd.x), Math.ceil(pd.y), 0.0);
	var v10 = new THREE.Vector3(Math.ceil(pd.x), Math.floor(pd.y), 0.0);
	var v11 = new THREE.Vector3(Math.ceil(pd.x), Math.ceil(pd.y), 0.0);
	
	//noise of cooresponding positions on lattice
	var n00 = noise(v00.multiplyScalar(frequency)) * amplitude;
	var n01 = noise(v01.multiplyScalar(frequency)) * amplitude;
	var n10 = noise(v10.multiplyScalar(frequency)) * amplitude;
	var n11 = noise(v11.multiplyScalar(frequency)) * amplitude;

	//time val for interpolation
	var tX = pd.x - Math.floor(pd.x);
	var tY = pd.y - Math.floor(pd.y);

	var nx0 = cosine_interpolate(n00, n10, tX);
	var nx1 = cosine_interpolate(n01, n11, tX);
	var n = cosine_interpolate(nx0, nx1, tY);

	return n;
}

function noise(seed){
    return fract(Math.sin(seed.dot( new THREE.Vector3(12.9898,78.233, 157.179))) * 43758.5453);
}

function lerp( a, b, t){
	return (a * (1.0 - t) + b * t);
}

function cosine_interpolate(a, b, t){
	var cos_t = (1.0 - Math.cos(t * 3.14159265359)) * 0.5;
	return lerp(a, b, cos_t);
}

function fract(f){
	return f%1;
}