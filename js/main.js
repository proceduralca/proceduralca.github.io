window.onload = init;
window.resize = resize;

const renderer  = new THREE.WebGLRenderer({

    preserveDrawingBuffer: true,
    logarithmicDepthBuffering: true

});

const scene     = new THREE.Scene();
const camera    = new THREE.PerspectiveCamera();
let ico, fill, stars, fade, target, master;
let timer = 0;
let time = 10;
let up = new THREE.Vector3( 0, 2, 1 );
let seed = 0
	up.normalize();


function init(){

    master		= new THREE.IcosahedronGeometry( 20, 3 );
    material	= new THREE.MeshBasicMaterial( { wireframe: true } );

    master.computeVertexNormals();

    normals = [];

		console.log( master.faces[0].vertexNormals[0] )

		for( let i = 0; i < master.faces.length; i++ ){

			normals[ master.faces[i].a ] = master.faces[i].vertexNormals[0].clone()
			normals[ master.faces[i].b ] = master.faces[i].vertexNormals[1].clone()
			normals[ master.faces[i].c ] = master.faces[i].vertexNormals[2].clone()

		}

		console.log( normals )

    ico		= new THREE.Mesh( master.clone(), material.clone() );
    fill	= new THREE.Mesh( master.clone(), material.clone() );

			fill.material.wireframe = false;
			fill.material.color.set(0x000000);
			fill.material.opacity = 0.9 ;
			fill.material.transparent = true;

    target	= new THREE.Mesh( master.clone(), material.clone() );
    sky = Sky();

	sky.material.fog = false;

    scene.add( ico );
    scene.add( fill );

    scene.add( sky );

    camera.position.y += 250;
    camera.up.copy( new THREE.Vector3( 0, 0, 1 ));
    camera.fov = 70;
    camera.far = 10000;

    scene.add( camera );

//     renderer.autoClearColor = false;

    document.body.appendChild( renderer.domElement );

// 	scene.fog = new THREE.FogExp2( 0x000000, 0.0075 );

    resize();
    main();

};

function resize(){

    const width = window.innerWidth;
    const height = window.innerHeight;

    renderer.setSize( width, height );

    camera.aspect = width / height;
    camera.updateProjectionMatrix();

};

function main(){

    window.requestAnimationFrame( main );

    camera.position.applyAxisAngle( up, 0.0025 )

    camera.lookAt( ico.position );

    if( timer > time ){

		seed = Math.random() * 16^16;
        timer = 0;
        time = 600

        let x = Math.random() - 0.5;
        let y = Math.random() - 0.5;
        let z = Math.random() - 0.5;

//         up.set( x, y, z );
//         up.normalize();


        target.geometry.copy( master );
        target.geometry.copy( applyNoise( target.geometry ) );

// 		for( let i = 0; i < target.geometry.vertices.length; i++ ){

// 			ico.geometry.vertices[i].copy( target.geometry.vertices[i] );

// 		};
    };


		for( let i = 0; i < target.geometry.vertices.length; i++ ){

			ico.geometry.vertices[i].lerp( target.geometry.vertices[i], 0.1 );
			fill.geometry.vertices[i].lerp( target.geometry.vertices[i], 0.1 );
			fill.geometry.vertices[i].multiplyScalar( 0.95 );
		};

    fill.geometry.verticesNeedUpdate = true;
    ico.geometry.verticesNeedUpdate = true;

    timer ++;
//     seed ++;
    renderer.render( scene, camera );

};

function Icosahedron(){

    const geometry = new THREE.IcosahedronGeometry( 0.01,2 );
//     const geometry = new THREE.PlaneGeometry(20,20,20);
    const material = new THREE.MeshBasicMaterial( { wireframe: true } );
    const mesh = new THREE.Mesh( geometry, material );

    return mesh.clone();

};

function Sky(){

    const buffer = new THREE.IcosahedronGeometry( 200,4 );
    const geometry = new THREE.Geometry();
    const material = new THREE.PointsMaterial( { color: 0xffffff, size: 1, sizeAttenuation: false } );

	for( let i in buffer.vertices ){

		if( Math.random() < 0.4 ){

			geometry.vertices.push( buffer.vertices[i].clone() );

		};

	};

    const points = new THREE.Points( geometry, material );

    return points.clone();

};

function applyNoise( target ){

// 	console.log( 'geometry' );

    const geometry = target.clone();

	const perlin = new ImprovedNoise()
	const noise = []

	let quality    = 0.5;
    let octaves    = 4;
    let scalar     = 3;
	let factor     = 10;
    let q = 10;

	for (let i = 0; i < geometry.vertices.length; i++) {

	  noise[i] = 1;

	}

	for (let r = 0; r < octaves; r++) {
	for (let i = 0; i < geometry.vertices.length; i++) {

		let x = geometry.vertices[i].x;
		let y = geometry.vertices[i].y;
		let z = geometry.vertices[i].z + seed;

		noise[i] += Math.abs( perlin.noise( x / quality, y / quality, z / quality )  * quality * factor );

	}

	quality *= scalar

	}

	for (let i = 0; i < geometry.vertices.length; i++) {

// 	    geometry.vertices[i].multiplyScalar( Math.random()*1+4 );

		geometry.vertices[i].add( normals[i].clone().multiplyScalar( noise[i] ) )
	}

	geometry.verticesNeedUpdate = true;

	return geometry;

}