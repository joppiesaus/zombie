// Everything on your screen starts with one line of code.

/* TODO:
 * Make this a game
 * Position stuff!
 * Add shooting, bullets, with light!
 * Collisions!
 * */

Math.PI = 3.14159265359;

var scene, camera, renderer, clock;
var delta, clock;
var mouse = new THREE.Vector3();


var DEPTH = 1.2;

var BLOCK_SIZE = 4;
var BLOCK_DEPTH = BLOCK_SIZE * DEPTH;

var PLAYER_MOVEMENT_SPEED = 18; // units / second
var ZOMBIE_MOVEMENT_SPEED = 8;

var WORLD_WIDTH_CUBES = 30;
var WORLD_WIDTH = WORLD_WIDTH_CUBES * BLOCK_SIZE;

var ZOMBIE_SIZE = new THREE.Vector3( BLOCK_SIZE, BLOCK_SIZE * 1.8, BLOCK_DEPTH );

Array.prototype.clone = function()
{
    return this.slice( 0 );
};

var rnd = function( min, max )
{
    return Math.floor( Math.random() * (max - min) ) + min;
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

var player;
var zombies = [], bullets = [];

var makeFloor = function()
{
    //var CubeGeometry = new THREE.BoxGeometry( BLOCK_SIZE, BLOCK_SIZE, BLOCK_DEPTH );
    var CubeGeometry = new THREE.BoxGeometry( WORLD_WIDTH, BLOCK_SIZE, BLOCK_DEPTH );
    var CubeMaterial = new THREE.MeshBasicMaterial( { color: 0x343434 } );
    
    // What was I thinking?
    /*for ( var x = 0; x < WORLD_WIDTH_CUBES; x++ )
    {
        var cube = new THREE.Mesh( CubeGeometry, CubeMaterial );
        cube.position.set( x * BLOCK_SIZE, 0, 0 );
        
        scene.add( cube );
    }*/
    
    var floor = new THREE.Mesh( CubeGeometry, CubeMaterial );
    floor.position.set( WORLD_WIDTH / 2, -BLOCK_SIZE / 2, 0 );
    scene.add( floor );
};

var createZombie = function()
{
    var Geometry = new THREE.BoxGeometry( ZOMBIE_SIZE.x, ZOMBIE_SIZE.y, ZOMBIE_SIZE.z );
    var Material = new THREE.MeshLambertMaterial( { color: 0xff0000 * ( Math.random() * 0.2 + 0.8 ) } );
    
    var zombie = new THREE.Mesh( Geometry, Material );
    
    zombie.size = new THREE.Vector3( ZOMBIE_SIZE.x, ZOMBIE_SIZE.y, ZOMBIE_SIZE.z );
    zombie.position.set( rnd( zombie.size.x / 2 , WORLD_WIDTH - zombie.size.x / 2 + 1 ), zombie.size.y / 2, 0 );
    
    zombie.direction = rnd(0, 2) === 0 ? -1 : 1;
    
    zombies.push( zombie );
    scene.add( zombie );
};

var createZombies = function( n )
{
    for (var i = 0; i < n; i++)
    {
        createZombie();
    }
};

var createBullet = function( direction, position )
{ 
    var bullet = new THREE.PointLight( 0xffff00, 1, BLOCK_SIZE * 10.11 );
    bullet.direction = direction;
    bullet.position.set( position.x, position.y, position.z );
    bullets.push( bullet );
    scene.add( bullet );
};


var init = function()
{
    window.addEventListener  ( 'resize'    , onWindowResize, false );
    document.addEventListener( 'keydown'   , onKeyDown, false );
    document.addEventListener( 'keyup'     , onKeyUp, false );
    document.addEventListener( 'mousemove' , onMouseMove, false );
    document.addEventListener( 'mouseenter', onMouseMove, false );
    document.addEventListener( 'click',      onMouseClick, false );
    
    
    clock = new THREE.Clock();
    
    scene = new THREE.Scene();

    // camera
    camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 1, 10000 );
    
    scene.add( camera );
    
    var light = new THREE.AmbientLight( 0x444444 );
    //var light2 = new THREE.PointLight( 0xffff00, 1, 222 );
    //light2.position.set( WORLD_WIDTH / 2, ZOMBIE_SIZE.x / 2, 0 );
    scene.add( light );
    //scene.add( light2 );
    
    createBullet( undefined, new THREE.Vector3( WORLD_WIDTH / 2, ZOMBIE_SIZE.x / 2, 0 ) );

    renderer = new THREE.WebGLRenderer(/*{ antialias:true }*/);
    renderer.setSize( window.innerWidth, window.innerHeight );
    renderer.setClearColor( 0xe3e3e3 );
    
    document.body.appendChild( renderer.domElement );
    
    
    makeFloor();
    
    createZombies( 5 );
    
    player = new THREE.Mesh(
        new THREE.BoxGeometry( ZOMBIE_SIZE.x, ZOMBIE_SIZE.y, ZOMBIE_SIZE.z ),
        new THREE.MeshLambertMaterial( { color: 0x0000ff } )
    );
    
    player.size = new THREE.Vector3( ZOMBIE_SIZE.x, ZOMBIE_SIZE.y, ZOMBIE_SIZE.z );
    player.position.set( WORLD_WIDTH / 2, ZOMBIE_SIZE.y * 1.5, 0 );
    
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

var onMouseMove = function( e )
{
    mouse.x = e.pageX;
    mouse.y = e.pageY;
};

var onMouseClick = function()
{
///////////// Y U NO WORK
    createBullet( undefined, new THREE.Vector3( WORLD_WIDTH / 2, ZOMBIE_SIZE.x / 2, 0 ) );
    //createBullet( getMouseDirectionFromMiddle(), player.position );
};

var getMouseDirectionFromMiddle = function()
{
    var dir = new THREE.Vector3( mouse.x - window.innerWidth / 2, -( mouse.y - window.innerHeight / 2 ), 0 );
    dir.normalize();
    return dir;
};

var updateInput = function()
{
    if ( InputManager.isKeyDown( 37 ) ) // left arrow down -> move left
    {
        player.position.x -= PLAYER_MOVEMENT_SPEED * delta;
    }
    else if ( InputManager.isKeyDown( 39 ) ) // right arrow down -> move right
    {
        player.position.x += PLAYER_MOVEMENT_SPEED * delta;
    }
    
    /*if ( InputManager.isKeyDown( 38 ) ) // up
    {
        player.position.y += PLAYER_MOVEMENT_SPEED * delta;
    }
    else if ( InputManager.isKeyDown( 40 ) ) // down
    {
        player.position.y -= PLAYER_MOVEMENT_SPEED * delta;
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
        if ( player.position.y <= player.size.y / 2 )
        {
            player.inAir = false;
            player.position.y = player.size.y / 2;
            player.velocity.y = 0;
        }
    }    
};

var updateZombies = function()
{
    zombies.forEach( function( zombie )
        {
            // let the zombie walk
            zombie.position.x += zombie.direction * ZOMBIE_MOVEMENT_SPEED * delta;
            
            // invert on collision
            if (zombie.position.x < zombie.size.x / 2)
            {
                zombie.position.x = zombie.size.x / 2;
                zombie.direction *= -1;
            }
            else if (zombie.position.x > WORLD_WIDTH - zombie.size.x / 2)
            {
                zombie.position.x = WORLD_WIDTH - zombie.size.x / 2;
                zombie.direction *= -1;
            }
        }
    );
};

var updateBullets = function()
{
    // TODO
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
    updateZombies();
    updatePlayer();
    updateCamera();
    
    render();
};

var render = function()
{
    renderer.render( scene, camera );
};


window.onload = init;