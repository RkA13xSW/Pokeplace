const pokeAPI = "https://pokeapi.co/api/v2/pokemon/";
const pokeAPIEvolutions = "https://pokeapi.co/api/v2/pokemon-species/";
let currentPokemon;
let configuraciones = {
    idxPokemon: 1,
    shiny: false,
    back: false,

};

/**
 * Cambia el icono principal de la página.
 */
async function changeIcon(){
    let rndId =  Math.floor(Math.random() * (898 - 1)) + 1;
    let pokemon = await findPokemon(rndId);
    document.querySelector("#imagenLogo").src = (pokemon.error)? "../IMGS/general/pokeplaceIcon.png" : pokemon.pokemon.sprites.front_default; 
}

/**
 * Encontra en la pokeApi el pokemon buscado.
 * @param {number} id Identificador del pokemon 
 * @returns {boolean, Pokemon} Si ha habido errores y el pokemon recibido. 
 */
async function findPokemon(id){
    let error = false;
    let pokemon = "No encontrado";
    try {
        const response = await fetch(`${pokeAPI}${id}`)
        const data = await response.json();
        pokemon = await data;
    } catch (error) {
        console.error(error);
        error = true;
    }
    return {error, pokemon};
}

/**
 * Cambia el pokemon principal de la pokedex.
 * @param {number} id Identificador del pokemon
 */
async function changeMainPokemon(id){
    configuraciones.idxPokemon = parseInt(id);
    let info = await findPokemon(id);
    
    //POKEMON PRINCIPAL:
    if(!info.error){
        currentPokemon = await info.pokemon;
        mostrarPokemon();
    }
}

/**
 * Toogle de los tipos del pokemon.
 * @param {Tipos} tipos Se ratrea la lista de tipos del pokemon para mostrar los mismos. 
 */
function cambiarTipo(tipos){
    const ARRTIPOS = ["water","grass","poison","fire","bug","normal", "flying", "electric", "ground", "fairy", "fighting", "psychic", "rock", "steel", "ice", "ghost", "dragon", "dark"];
    const TIPOS = document.getElementsByClassName("tipo-encabezado");
    for (let i = 0; i < TIPOS.length; i++) {
        TIPOS[i].classList.add("noVer");
    }
    for (let t = 0; t < tipos.length; t++) {
        const tipo = tipos[t].type.name;
        TIPOS[ARRTIPOS.indexOf(tipo)].classList.remove("noVer");
        
    }
}

/**
 * Configura la vista para la disposición de la información del pokemon.
 */
function mostrarPokemon(){

    const IMGPOKEMON = document.querySelector("#pokemonPrincipal");
    if(configuraciones.back){
        if(configuraciones.shiny){
            IMGPOKEMON.src = currentPokemon.sprites.back_shiny;
        }else{
            IMGPOKEMON.src = currentPokemon.sprites.back_default;
        }
    }else{
        if(configuraciones.shiny){
            IMGPOKEMON.src = currentPokemon.sprites.front_shiny;
        }else{
            IMGPOKEMON.src = currentPokemon.sprites.front_default;
        }
    }
    document.querySelector("#nombrePokemon").innerHTML = currentPokemon.name;
    document.querySelector("#numeroPokemon").innerHTML = `Nº ${currentPokemon.id}`;
    
    //Mostrar stats:
    const STATS =  document.getElementsByClassName("stat-line-info");
    for (let i = 0; i < STATS.length; i++) {
        STATS[i].innerHTML = currentPokemon.stats[i].base_stat;    
    }
    //Mostrar altura/peso
    const STATS2 =  document.getElementsByClassName("stat-line-info2");
    STATS2[0].innerHTML = currentPokemon.height;
    STATS2[1].innerHTML = currentPokemon.weight;
    
    //Cambiar los tipos mostrados
    cambiarTipo(currentPokemon.types);

    //Mostrar Evoluciones y preevoluciones:
    setEvolutions(currentPokemon.name);
}

/**
 * Cambia el pokemon mostrado mediante los controles.
 * @param {number} operador operador aplicado al indice del pokemon actual. 
 */
function controlesCambioPokemon(operador){
    if(operador == +1 && configuraciones.idxPokemon == 898){
        configuraciones.idxPokemon = 1;
    }else if(operador == -1 && configuraciones.idxPokemon == 1){
        configuraciones.idxPokemon = 898;
    }else{
        configuraciones.idxPokemon = configuraciones.idxPokemon + operador;
    }
    document.getElementById("id").value = configuraciones.idxPokemon;
    changeMainPokemon(configuraciones.idxPokemon);
    
}

/**
 * Cambia boolean que establece si la imagen del pokemon es de espaldas o no.
 */
function toogleBack(){
    configuraciones.back = (configuraciones.back)? false : true;
    changeMainPokemon(configuraciones.idxPokemon);
}

/**
 * Cambia boolean que establece si la imagen del pokemon es shiny o no.
 */
function toogleShiny(){
    configuraciones.shiny = (configuraciones.shiny)? false : true;
    changeMainPokemon(configuraciones.idxPokemon);
}

/**
 * Muestra en la pokedex la cadena de evolución de cierto pokemon
 * @param {string} pokemonName Nombre del pokemon que se quiere saber la cadena de evoluciones. 
 */
async function setEvolutions(pokemonName){
    let evolvs = [];
    try {
        const response = await fetch(`${pokeAPIEvolutions}${pokemonName}`)
        const data = await response.json();
        
        try {
            const response = await fetch(data.evolution_chain.url)
            const data2 = await response.json();

            evolvs[0] = await data2.chain.species;
            evolvs[1] = await data2.chain.evolves_to[0]?.species;
            evolvs[2] = await data2.chain.evolves_to[0]?.evolves_to [0]?.species;
            
            const IMAGES =  document.getElementsByClassName("evoluciones-img");
            const NAMES = document.getElementsByClassName("evoluciones-nombres");
            for (let i = 0; i < 3; i++) {
                IMAGES[i].src = (evolvs[i] === undefined)? "../IMGS/general/pokeplaceIcon.png" : `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${evolvs[i].url.split("/")[6]}.png`;
                NAMES[i].innerHTML = (evolvs[i] === undefined) ? "??????" : evolvs[i].name;
            }
            
        } catch (error) {
            console.error(error);
        }

    } catch (error) {
        console.error(error);
    }
}


/**
 * Métodos usados en tras la carga de la página
 */
function init(){
    changeIcon();
    findPokemon(1);
    changeMainPokemon(1);
}
