// Useful constants
const NEIGHBOR_COORDS_REL = [[1, 0], [0, 1], [-1, 0], [0, -1]];


/**
 * A World is one map. Defined by a texture, a type map
 * Contains functions for managing territory ownership and combat
 * Needs a reference to the CountryManager for ticking
 */
class World {
    constructor(image, type_map_image, country_manager) {
        // Verify image is same dimensions as type map image
        if(image.width != type_map_image.width || image.height != type_map_image.height)
        {
            throw new Error("Images not equal dimensions");
        }
        
        this.MAP_WIDTH = image.width
        this.MAP_HEIGHT = image.height

        this.image = image
        this.type_map_image = type_map_image
        this.type_map_image.loadPixels()
        this.territory_map = createImage(this.MAP_WIDTH, this.MAP_HEIGHT)
        this.territory_map.loadPixels()
        this.territory_map_next = createImage(this.MAP_WIDTH, this.MAP_HEIGHT)
        this.territory_map_next.loadPixels()
        this.border_highlight_map = createImage(this.MAP_WIDTH, this.MAP_HEIGHT)
        this.border_highlight_map.loadPixels()

    }

    addTestCountry(test_country_colors, x, y) {
        if(x == undefined || y == undefined) throw new Error("Define country position pls")
        let r = test_country_colors[0]
        let g = test_country_colors[1]
        let b = test_country_colors[2]
        let position_x = int(x);
        let position_y = int(y);
        let root_position = (position_y * this.MAP_WIDTH) + position_x; 
        root_position = root_position * 4;
        this.territory_map.pixels[root_position] = r;
        this.territory_map.pixels[root_position + 1] = g;
        this.territory_map.pixels[root_position + 2] = b;
        this.territory_map.pixels[root_position + 3] = 255;
        this.territory_map.updatePixels()
    }

    draw() {
        // Draw the world
        image(this.image, 0, 0)

        // Draw the territory overlay
        image(this.territory_map, 0, 0)

        // Draw the border highlights
        image(this.border_highlight_map, 0, 0)
    }

    tick() {
        let x, y, texel_values, root_position;
        let neighbor_x, neighbor_y, neighbor_coords, neighbor_texel_values;
        for(x = 0; x < this.MAP_WIDTH; x++) {
            for(y = 0; y < this.MAP_HEIGHT; y++) {
                // Skip ticking this texel if the territory is unoccupied
                //texel_values = this.territory_map.get(x, y)
                texel_values = this._getPixelColor(this.territory_map, x, y)
                if(texel_values[3] == 0) continue;
                texel_values.pop() // Remove the alpha channel

                // Otherwise, check if the texel is at war with any neighboring texels, and if so they should be updated in the next territory map
                for(neighbor_coords of NEIGHBOR_COORDS_REL) {
                    neighbor_x = x + neighbor_coords[0]
                    neighbor_y = y + neighbor_coords[1]
                    if(neighbor_x < 0 || neighbor_x >= this.MAP_WIDTH) continue
                    if(neighbor_y < 0 || neighbor_y >= this.MAP_HEIGHT) continue
                    if(!this._isLandPixel(neighbor_x, neighbor_y)) continue
                    neighbor_texel_values = this._getPixelColor(this.territory_map, neighbor_x, neighbor_y)
                    neighbor_texel_values.pop()
                    if(COUNTRY_MANAGER.isAtWar(COUNTRY_MANAGER.getCountryTag(...texel_values), COUNTRY_MANAGER.getCountryTag(...neighbor_texel_values))) {
                        this._setPixelColor(this.territory_map_next, neighbor_x, neighbor_y, ...texel_values, 255)
                    }
                }
            }
        }

        this.territory_map_next.updatePixels()
        this.territory_map.copy(this.territory_map_next, 0, 0, this.MAP_WIDTH, this.MAP_HEIGHT, 0, 0, this.MAP_WIDTH, this.MAP_HEIGHT)
        this.territory_map.loadPixels()

        
        this.border_highlight_map = createImage(this.MAP_WIDTH, this.MAP_HEIGHT)
        this.border_highlight_map.loadPixels()
        for(x = 0; x < this.MAP_WIDTH; x++) {
            for(y = 0; y < this.MAP_HEIGHT; y++) {
                texel_values = this._getPixelColor(this.territory_map, x, y)
                if(texel_values[3] == 0) continue;
                texel_values.pop() // Remove the alpha channel
                if(this._isBorderPixel(x, y, texel_values)) {
                    this._setPixelColor(this.border_highlight_map, x, y, 255, 255, 255, 50)
                }
            }
        }
        this.border_highlight_map.updatePixels()
    }

    _isBorderPixel(x, y, country_colors) {
        for(let neighbor_coords of NEIGHBOR_COORDS_REL) {
            let neighbor_x = x + neighbor_coords[0]
            let neighbor_y = y + neighbor_coords[1]
            if(neighbor_x < 0 || neighbor_x >= this.MAP_WIDTH) return true
            if(neighbor_y < 0 || neighbor_y >= this.MAP_HEIGHT) return true
            if(!this._isLandPixel(neighbor_x, neighbor_y)) return true
            let neighbor_texel_values = this._getPixelColor(this.territory_map, neighbor_x, neighbor_y)
            if(neighbor_texel_values[3] == 0) return true
            if(neighbor_texel_values[0] != country_colors[0]) return true
            if(neighbor_texel_values[1] != country_colors[1]) return true
            if(neighbor_texel_values[2] != country_colors[2]) return true
        }
        return false
    }

    _isLandPixel(x, y) {
        let c = this._getPixelColor(this.type_map_image, x, y)
        return c[0] == 255;
    }

    _getPixelRootCoords(x, y) {
        return ((y * this.MAP_WIDTH) + x) * 4;
    }

    _getPixelColor(image, x, y) {
        let root_position = this._getPixelRootCoords(x, y);
        let r,g,b,a
        r = image.pixels[root_position]
        g = image.pixels[root_position + 1]
        b = image.pixels[root_position + 2]
        a = image.pixels[root_position + 3] 
        return [r,g,b,a]
    }

    _setPixelColor(image, x, y, r, g, b, a) {
        let root_position = this._getPixelRootCoords(x, y);
        image.pixels[root_position] = r
        image.pixels[root_position + 1] = g
        image.pixels[root_position + 2] = b
        image.pixels[root_position + 3] = a
    }
}