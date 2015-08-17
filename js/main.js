// Everything on your screen starts with one line of code.

// TODO: Make this a game

Math.PI = 3.14159265359;

var scene, camera, renderer, clock;
var delta, clock;

var player;


var DEPTH = 1.2;

var BLOCK_SIZE = 4;
var BLOCK_DEPTH = BLOCK_SIZE * DEPTH;

var MOVEMENT_SPEED = 18; // units / second

var WORLD_WIDTH_CUBES = 25;
var WORLD_WIDTH = WORLD_WIDTH_CUBES * BLOCK_SIZE;

Array.prototype.clone = function()
{
    return this.slice( 0 );
};


var InputManager =
{
    keys: [],
    oldKeys: [],
    
    update: function()
    {
        /* of course, I could make another array,
           holding the indexes, iterating trough them...
           but I don't know what's a better solution. */
        this.oldKeys = this.keys.clone();
    },
    
    keyDown: function( code )
    {
        this.keys[ code ] = true;
    },
    
    keyUp: function( code )
    {
        this.keys[ code ] = false;
    },
    
    isKeyDown: function( code )
    {
        return ( this.keys[ code ] === true );
    },
    
    isKeyPressed: function( code )
    {
        return ( this.keys[ code ] === true && this.oldKeys[ code ] !== true );
    },
};


var makeFloor = function()
{
    //var CubeGeometry = new THREE.BoxGeometry( BLOCK_SIZE, BLOCK_SIZE, BLOCK_DEPTH );
    var CubeGeometry = new THREE.BoxGeometry( WORLD_WIDTH, BLOCK_SIZE, BLOCK_DEPTH );
    var CubeMaterial = new THREE.MeshBasicMaterial( { color: 0x343434 } );
    
    /*for ( var x = 0; x < WORLD_WIDTH_CUBES; x++ )
    {
        var cube = new THREE.Mesh( CubeGeometry, CubeMaterial );
        cube.position.set( x * BLOCK_SIZE, 0, 0 );
        
        scene.add( cube );
    }*/
    
    var floor = new THREE.Mesh( CubeGeometry, CubeMaterial );
    floor.position.set( WORLD_WIDTH / 2, 0, 0 );
    scene.add( floor );
};


var init = function()
{
    window.addEventListener  ( 'resize' , onWindowResize, false );
    document.addEventListener( 'keydown', onKeyDown, false );
    document.addEventListener( 'keyup'  , onKeyUp, false );
    
    clock = new THREE.Clock();
    
    scene = new THREE.Scene();

    // camera
    camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 1, 10000 );
    
    scene.add( camera );
    
    var light = new THREE.AmbientLight( 0x444444 );
    scene.add( light );

    renderer = new THREE.WebGLRenderer(/*{ antialias:true }*/);
    renderer.setSize( window.innerWidth, window.innerHeight );
    renderer.setClearColor( 0xe3e3e3 );
    
    document.body.appendChild( renderer.domElement );
    
    
    makeFloor();
    
    player = new THREE.Mesh(
        new THREE.BoxGeometry( BLOCK_SIZE, BLOCK_SIZE * 1.8, BLOCK_SIZE ),
        new THREE.MeshLambertMaterial( { color: 0x0000ff } )
    );
    player.position.set( WORLD_WIDTH / 2, BLOCK_SIZE * 2.5, 0 );
    
    player.inAir = true;
    player.velocity = new THREE.Vector3( 0, 0, 0 );    
    
    scene.add( player );
    
    camera.position.set( player.position.x, player.position.y, 20 );
    //camera.rotation.y = Math.PI;
    
    
    clock.start();
    
    animate();
};

var onWindowResize = function()
{
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    
    renderer.setSize( window.innerWidth, window.innerHeight );
};

// input handling
var onKeyDown = function( e )
{
    InputManager.keyDown( e.keyCode );
};

var onKeyUp = function( e )
{
    InputManager.keyUp( e.keyCode );
};

var updateInput = function()
{
    if ( InputManager.isKeyDown( 37 ) ) // left arrow down -> move left
    {
        player.position.x -= MOVEMENT_SPEED * delta;
    }
    else if ( InputManager.isKeyDown( 39 ) ) // right arrow down -> move right
    {
        player.position.x += MOVEMENT_SPEED * delta;
    }
    
    /*if ( InputManager.isKeyDown( 38 ) ) // up
    {
        player.position.y += MOVEMENT_SPEED * delta;
    }
    else if ( InputManager.isKeyDown( 40 ) ) // down
    {
        player.position.y -= MOVEMENT_SPEED * delta;
    }*/
    
    if ( InputManager.isKeyPressed( 38 ) && player.inAir === false )
    {
        player.inAir = true;
        player.velocity.y = 45;
    }
    
    /* At last, update the input manager.
       If you do at first, the old key array will be the same as the new one,
       resulting in isKeyPressed not working properly. */
    InputManager.update();
};

var updatePlayer = function()
{
    var vel = player.velocity.clone();
    vel.multiplyScalar( delta );
    player.position.add( vel );
    
    if ( player.inAir === true )
    {
        player.velocity.y -= 68 * delta;
        if ( player.position.y <= 0 )
        {
            player.inAir = false;
            player.position.y = 0;
            player.velocity.y = 0;
        }
    }    
};

var updateCamera = function()
{
    // make the camera follow the player
    camera.position.x = player.position.x;
    camera.position.y = player.position.y;
};

var animate = function()
{
    requestAnimationFrame( animate );
    
    delta = clock.getDelta();
    
    updateInput();
    updatePlayer();
    updateCamera();
    
    render();
};

var render = function()
{
    renderer.render( scene, camera );
};


window.onload = init;