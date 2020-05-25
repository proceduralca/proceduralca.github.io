window.onload = init;
window.resize = resize;

const renderer  = new THREE.WebGLRenderer({ logarithmicDepthBuffering: true });
const scene     = new THREE.Scene();
const camera    = new THREE.PerspectiveCamera();
let Ico;

function init(){

    Ico = Icosahedron();

    scene.add( Ico );

    camera.position.y += 5;
    camera.up.copy( new THREE.Vector3( 0, 0, 1 ));
    camera.fov = 70;

    scene.add( camera );

    document.body.appendChild( renderer.domElement );

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

    Ico.rotateZ( 0.01 );
    
    camera.lookAt( Ico.position );

    renderer.render( scene, camera );

};

function Icosahedron(){

    const geometry = new THREE.IcosahedronGeometry( 1,1 );
    const material = new THREE.MeshBasicMaterial( { wireframe: true } );
    const mesh = new THREE.Mesh( geometry, material );

    return mesh.clone();

};