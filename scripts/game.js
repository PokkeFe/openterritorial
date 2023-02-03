let MAP_IMG;
let MAP_TYPE_IMAGE;
function preload() {
    MAP_IMG = loadImage("maps/testworld.bmp");
    MAP_TYPE_IMAGE = loadImage("maps/testworld.bmp");
}

let WORLD;
let COUNTRY_MANAGER;
function setup() {
    createCanvas(600, 600);
    COUNTRY_MANAGER = new CountryManager()
    WORLD = new World(MAP_IMG, MAP_TYPE_IMAGE)

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
    WORLD.draw()
    draws_to_tick -= 1;
    if(draws_to_tick <= 0) {
        //console.log("Tick")
        COUNTRY_MANAGER.tick()
        WORLD.tick()
        draws_to_tick = MAX_DRAWS_TO_TICK
    }
}