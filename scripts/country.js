const MIN_COUNTRY_COLOR_VALUE = 100;
const MAX_COUNTRY_COLOR_VALUE = 240;

/**
 * The CountryManager is responsible for keeping track of all of the countries and who is at war with who.
 */
class CountryManager {
    constructor() {
        this.countries = {}
        this.war_map = {}
    }

    createCountry() {
        // Generates an acceptable random country
        let r, g, b, country_tag;
        do {
            r = int(random(MAX_COUNTRY_COLOR_VALUE - MIN_COUNTRY_COLOR_VALUE)) + MIN_COUNTRY_COLOR_VALUE;
            g = int(random(MAX_COUNTRY_COLOR_VALUE - MIN_COUNTRY_COLOR_VALUE)) + MIN_COUNTRY_COLOR_VALUE;
            b = int(random(MAX_COUNTRY_COLOR_VALUE - MIN_COUNTRY_COLOR_VALUE)) + MIN_COUNTRY_COLOR_VALUE;
            country_tag = (r * 1000000) + (g * 1000) + b;
        } while (this.countries[country_tag] != undefined)
        this.countries[country_tag] = new Country(r, g, b);
        this.war_map[country_tag] = {}

        return [r, g, b];
    }

    getCountryTag(r, g, b) {
        return (r * 1000000) + (g * 1000) + b;
    }

    declareWar(attacker_tag, defender_tag) {
        this.war_map[attacker_tag][defender_tag] = true
    }

    isAtWar(attacker_tag, defender_tag) {
        // Return true if unclaimed territory
        if(defender_tag == 0){
            return true;
        }
        return this.war_map[attacker_tag][defender_tag] == true;
    }

    endWar(attacker_tag, defender_tag) {
        if(this.war_map[attacker_tag][defender_tag] != undefined)
            delete this.war_map[attacker_tag][defender_tag]
    }

    tick() {
        // Random chance a country will declare war on a neighbor
        let war_chance = 10; // Percent chance for war declaration on a random enemy per tick
        // If that neighbor is already at war with them, the wars will cancel out ( if only :( )
        let country_keys = Object.keys(this.countries)
        for(let country of country_keys) {
            let roll = random(100)
            if(roll <= war_chance) {
                // Declare war (if we haven't already) or cancel existing war against us by whomever
                let enemy_country;
                do {
                    enemy_country = random(country_keys)
                } while (country == enemy_country)
                // Check if they have an ongoing war against us
                if(this.isAtWar(enemy_country, country)) {
                    // Cancel it
                    this.endWar(enemy_country, country)
                    // console.log(country,"halted the troops of",enemy_country)
                } else if (this.isAtWar(country, enemy_country)) {
                    // If we're already fighting THEM, quit it
                    this.endWar(country, enemy_country)
                    // console.log(country,"stopped their assault against",enemy_country)
                } else {
                    // If no war, get fightin'
                    this.declareWar(country, enemy_country)
                    // console.log("War declared by",country,"against",enemy_country)
                }
            }
        }
    }
}

/**
 * A Country is defined by a country 'code' i.e. color. Should not be defined manually, should be interacted with through the CountryManager
 * @param r Integer value of red channel (100-240)
 * @param g Integer value of green channel (100-240)
 * @param b Integer value of blue channel (100-240)
 */
class Country {
    constructor(r, g, b) {
        this.r = r
        this.g = g
        this.b = b
    }
}

