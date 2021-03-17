window.onload = init;
window.onresize = resize;

const renderer  = new THREE.WebGLRenderer({

    preserveDrawingBuffer: true,
    logarithmicDepthBuffering: true

});

const scene     = new THREE.Scene();
const camera    = new THREE.PerspectiveCamera();
let ico, fill, wires, nodes, stars, master;

let targets = [];

let timer = 0;
let time = -1;
let seed = 0

let mode = 0;

let up = new THREE.Vector3( 0, 2, 1 );

	up.normalize();

let state = [];

	state[0] = {

		render: function(){

			ui.clear();
			state[0].title();
			state[0].intro();
			state[0].url();

		},

		title: function(){

			ui.color = '#fff';

			ui.set( 16, 24 );

			ui.print(

				'手続き型',
				'2',
				'1',
				'1.0',

			);

			ui.set( 10, 24 );

		},

		intro: function (){

			ui.print(

			'PROCEDURAL — ( CAD )',
			"-0",
			"+1",
			'-0',
			{ color: '#bbb' }

			);

// 			ui.print(

// 			'ᴄᴜʀʀᴇɴᴛ ᴘʀᴏᴊᴇᴄᴛ',
// 			'-0',
// 			'1.0-6',
// 			'1.0',
// 			{ color: '#bbb' }

// 			);

// 			ui.print(

// 			'ᴜɴᴅᴇʀ ᴅᴇᴠᴇʟᴏᴘᴍᴇɴᴛ:',
// 			'-0',
// 			'+1',
// 			'1.0',
// 			{ color: '#bbb' }

// 			);

// 			ui.print(

// 			'Special Stage',
// 			'-0',
// 			'+2',
// 			'1.0',
// 			{ color: '#ff5d8a' }

// 			);

// 			ui.print(

// 			'ʜᴛᴛᴘs://sᴘᴇᴄɪᴀʟsᴛᴀɢᴇ.ɪᴏ',
// 			'-0',
// 			'+1',
// 			'1.0',
// 			{ color: '#bbb' }

// 			);

		},

		url: function(){

			// Render link text and create a element overlay.

			ui.print(

				'♡',
				'1.0-10',
				'1',
				64,
				{ color: '#ff5d8a' }

			);

			ui.print(

				'ɢ-ᴛᴇᴀᴍ',
				'1.0-8',
				'1',
				64,
				{ color: '#bbb' }

			);

			ui.print(

			'',
			'4',
			'1.0-3',
			64,
			{ color: '#eee' }

			);

			ui.print(

			'contact@procedural.ca',
			'4',
			'+1',
			64,
			{ color: '#eee' }

			);

			ui.print(

			'△',
			'1.0-4',
			'1.0-2',
			64,
			{ color: '#eee' }

			);

		}
	};
function init(){

    master		= new THREE.IcosahedronGeometry( 20, 3 );
    nodes		= new THREE.IcosahedronGeometry( 200, 3 );
    material	= new THREE.MeshBasicMaterial( { wireframe: true } );

    master.computeVertexNormals();
    nodes.computeVertexNormals();

    normals = [];

    normals[0] = []

		for( let i = 0; i < master.faces.length; i++ ){

			normals[0][ master.faces[i].a ] = master.faces[i].vertexNormals[0].clone()
			normals[0][ master.faces[i].b ] = master.faces[i].vertexNormals[1].clone()
			normals[0][ master.faces[i].c ] = master.faces[i].vertexNormals[2].clone()

		}

    normals[1] = []

		for( let i = 0; i < nodes.faces.length; i++ ){

			normals[1][ nodes.faces[i].a ] = nodes.faces[i].vertexNormals[0].clone()
			normals[1][ nodes.faces[i].b ] = nodes.faces[i].vertexNormals[1].clone()
			normals[1][ nodes.faces[i].c ] = nodes.faces[i].vertexNormals[2].clone()

		}


    ico		= new THREE.Mesh( master.clone(), material.clone() );
    fill	= new THREE.Mesh( master.clone(), material.clone() );

			fill.material.wireframe = false;
			fill.material.color.set(0xffffff);
			fill.material.opacity = 0.9 ;
			fill.material.transparent = true;
			fill.material.blendMode = THREE.AdditiveBlending;

    wires	= new THREE.Mesh( nodes.clone(), material.clone() );

			wires.material.color.set(0xffffff);
			wires.material.opacity = 0.5 ;
			wires.material.transparent = true;
			wires.material.blendMode = THREE.AdditiveBlending;

    targets[0]	= new THREE.Mesh( master.clone(), material.clone() );
    targets[1]	= new THREE.Mesh( nodes.clone(), material.clone() );

    sky = Sky();

	sky.material.fog = false;

    // scene.add( ico );
    // scene.add( fill );
    // scene.add( wires );

    // scene.add( sky );

    camera.position.y += 320;
    camera.up.copy( new THREE.Vector3( 0, 0, 1 ));
    camera.fov = 60;
    camera.far = 10000;

    scene.add( camera );

//     renderer.autoClearColor = false;

	renderer.domElement.id = "WEBGLRENDERER";
    document.body.appendChild( renderer.domElement );

    renderer.domElement.style.opacity = 1;

// 	scene.fog = new THREE.FogExp2( 0x000000, 0.0075 );

	ui = new Ui( 'unifont.min.png' );

    resize();

	ui.onload = function(){ state[0].render(); main(); }

};

function resize(){

    const width		= window.innerWidth;
    const height	= window.innerHeight;

    renderer.setSize( width, height );

    camera.aspect = width / height;
    camera.updateProjectionMatrix();

    ui.resize();

};

function main(){

    window.requestAnimationFrame( main );

    camera.position.applyAxisAngle( up, 0.0025 )

    camera.lookAt( ico.position );
//
// 	switch( mode ){
//
// 		case( 0 ):
//
// 		if( timer > time ){
//
// 			seed = Math.random() * 16^16;
// 			timer = 0;
// 			time = 300
//
// 			let x = Math.random() - 0.5;
// 			let y = Math.random() - 0.5;
// 			let z = Math.random() - 0.5;
//
// 			let n = normals[1]
//
// 			targets[0].geometry.copy( master );
// 			targets[0].geometry.copy( applyNoise( targets[0].geometry, normals[0] ) );
//
// 			targets[1].geometry.copy( nodes );
// 			targets[1].geometry.copy( applyNoise( targets[1].geometry, normals[1] ) );
//
// 		};
//
// 		break;
//
// 		case( 1 ):
//
// 		seed += 0.5
//         targets[0].geometry.copy( master );
//         targets[0].geometry.copy( applyNoise( targets[0].geometry, normals[0] ));
//
// //         targets[1].geometry.copy( nodes );
// //         targets[1].geometry.copy( applyNoise( targets[1].geometry, normals[1] ));
//
// 		break;
//
// 	};
//
// 	for( let i = 0; i < targets[0].geometry.vertices.length; i++ ){
//
// 		ico.geometry.vertices[i].lerp( targets[0].geometry.vertices[i], 0.1 );
// 		fill.geometry.vertices[i].lerp( targets[0].geometry.vertices[i].clone().multiplyScalar(0.9), 0.1 );
//
// 	};

	for( let i = 0; i < targets[1].geometry.vertices.length; i++ ){

		wires.geometry.vertices[i].lerp( targets[1].geometry.vertices[i], 0.02 );

	};

    fill.geometry.verticesNeedUpdate = true;
    ico.geometry.verticesNeedUpdate = true;
    wires.geometry.verticesNeedUpdate = true;

    timer ++;
//     seed++;
    renderer.render( scene, camera );
	ui.render();

};


function Icosahedron(){

    const geometry = new THREE.IcosahedronGeometry( 0.01,2 );
//     const geometry = new THREE.PlaneGeometry(20,20,20);
    const material = new THREE.MeshBasicMaterial( { wireframe: true } );
    const mesh = new THREE.Mesh( geometry, material );

    return mesh.clone();

};

function Sky(){

    const buffer = new THREE.IcosahedronGeometry( 1,20 );
    const geometry = new THREE.Geometry();
    const material = new THREE.PointsMaterial( { color: 0xffffff, size: 1, sizeAttenuation: false } );

	// while( geometry.vertices.length < 1000){
  //
	// 	let i = Math.floor( Math.random() * buffer.vertices.length-1 )
  //
	// 		geometry.vertices.push( buffer.vertices[i].clone() );
  //
	// 	};

    const points = new THREE.Points( geometry, material );

    return points.clone();

};

function applyNoise( target, normal ){

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

		geometry.vertices[i].add( normal[i].clone().multiplyScalar( noise[i] ) )
	}

	geometry.verticesNeedUpdate = true;

	return geometry;

}

function IGMODE(){

	let w = ( window.innerWidth < window.innerHeight ) ? window.innerWidth : window.innerHeight;

	document.body.requestFullscreen()

	ui.resize( w, w );
	renderer.setSize( w, w );
	camera.aspect = w / w;
	camera.updateProjectionMatrix();

	let n = window.innerHeight/2 - w/2;
	let top = n + 'px';

	renderer.domElement.style.top = top;
	ui.renderer.style.top = top;


}
