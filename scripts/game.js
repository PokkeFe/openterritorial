let MAP_IMG;
let MAP_TYPE_IMAGE;
function preload() {
    MAP_IMG = loadImage("maps/testworld.bmp");
    MAP_TYPE_IMAGE = loadImage("maps/testworld.bmp");
}

// CAMERA STUFF
let camera_x = 0;
let camera_y = 0;
let camera_zoom = 1;
const CAMERA_ZOOM_MAX = 0.2;
const CAMERA_ZOOM_MIN = 10;

let WORLD;
let COUNTRY_MANAGER;
function setup() {
    let window_width = window.innerWidth;
    let window_height = window.innerHeight;

    let canvas = createCanvas(window_width, window_height).elt;
    let context = canvas.getContext('2d');
    context.imageSmoothingEnabled = false;

    COUNTRY_MANAGER = new CountryManager()
    WORLD = new World(MAP_IMG, MAP_TYPE_IMAGE)

    camera_x = -(width / 2)
    camera_y = -(height / 2)

    tryPopulating(20)
}

function tryPopulating(num_bots) {
    for(let bot = 0; bot < num_bots; bot++)
    {
        for(let i = 0; i < 10; i++) {
            let x = int(random(MAP_IMG.width))
            let y = int(random(MAP_IMG.height))
            if(WORLD._isLandPixel(x, y))
            {
                let country = COUNTRY_MANAGER.createCountry()
                WORLD.addTestCountry(country, x, y)
                console.log("Adding bot", bot, "to", x, y, "on try", i)
                break;
            } else {
                continue;
            }
        }
    }
}

const MAX_DRAWS_TO_TICK = 10;
let draws_to_tick = MAX_DRAWS_TO_TICK;
function draw() {
    background(51);
    // Do camera scaling
    push()
    translate(-camera_x, -camera_y)
    scale(camera_zoom, camera_zoom)

    push()
    translate(-MAP_IMG.width/2, -MAP_IMG.height/2)
    WORLD.draw()
    pop()
    pop()
    draws_to_tick -= 1;
    if(draws_to_tick <= 0) {
        //console.log("Tick")
        COUNTRY_MANAGER.tick()
        WORLD.tick()
        draws_to_tick = MAX_DRAWS_TO_TICK
    }
}

function mouseDragged(event) {
    console.log(event)
    event.preventDefault()

    camera_x -= event.movementX;
    camera_y -= event.movementY;
    return false;
}

function mouseWheel(event) {
    console.log(event)
    if(event.deltaY < 0) camera_zoom *= 1.25;
    if(event.deltaY > 0) camera_zoom /= 1.25;
}

function mouseClicked(event) {
    console.log(event)
    return false
}

document.body.onmousedown = function(e) {
    if(e.button == 1) {
        e.preventDefault()
        return false
    }
}

document.body.oncontextmenu = function(e) {
    e.preventDefault()
    return false
}