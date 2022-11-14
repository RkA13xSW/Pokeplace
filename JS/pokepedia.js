// TODO: VARIABLES =================================================================================================================================================================================

/**URL de la api para obtener los pokemons.*/
const pokeAPI = "https://pokeapi.co/api/v2/pokemon";

/**URL de la api para obtener los pokemons por tipos.*/
const typeAPI = "https://pokeapi.co/api/v2/type/";

/**
 * URL de la api para obtener los pokemons por generacion
 */
const genAPI = "https://pokeapi.co/api/v2/generation/";

/**
 * URL de la api para obtener la cadena evolutiva de un pokemon
 */
const pokeAPIEvolutions = "https://pokeapi.co/api/v2/pokemon-species/";


/**Lista de pokemons que se está manejando actualemnte.*/
let currentPokemons = [];

/**Lista de todos los pokemons filtrados.*/
let filtredNames = [];

/**Lista con todos los nombres de todos los pokemons.*/
let fullNameList = [];

/**Límite de impresión por tandas de los pokemons.*/
const currentLimit = 30;

/**Indice de impresión de los pokemon (Para no cargar pokemons ya cargados)*/
let count = 0;

/**Determina si se ha activado algún filtro.*/
let filter = false;

//Traducción de tipos:
const ARRTIPOS = ["water","grass","poison","fire","bug","normal", "flying", "electric", "ground", "fairy", "fighting", "psychic", "rock", "steel", "ice", "ghost", "dragon", "dark"];
const ARRTIPOSES = ["Agua","Planta","Veneno","Fuego","Bicho","Normal", "Volador", "Electrico", "Tierra", "Hada", "Lucha", "Psíquico", "Roca", "Acero", "Hielo", "Fantasma", "Dragon", "Siniestro"];

// TODO: VARIABLES =================================================================================================================================================================================

// TODO: FUNCIONES =================================================================================================================================================================================

/** Obtiene todos los nombres de todos los pokemons almacenados en la POKEAPI.
 * 
 */
async function GetFullNameList(){
    let fullList = [];
    try {
        let next = `${pokeAPI}?offset=0&limit=100`;
        while (next != null) {
            const response = await fetch(next);
            const data = await response.json();
            fullList = fullList.concat(data.results);
            next = data.next;
        }

    } catch (error) {
        console.error(error);
    }
    return fullList;
}

/**
 * Busca en la pokeapi los siguientes 30 pokemons de la lista (Según haya filtros aplicados o no).
 */
async function SiguienteLista(){
        try {
            const limit = currentLimit + count;
            for (count; count < limit; count++) {
                if((filter && count >= filtredNames.length) || count >= fullNameList.length){
                    document.getElementById("paginacion").classList.add("noVer");
                    break;
                }else if(document.getElementById("paginacion").classList.contains("noVer")){
                    document.getElementById("paginacion").classList.remove("noVer");
                }
                const response = await fetch(((!filter) ? fullNameList[count].url : filtredNames[count].url));
                const pkm = await response.json();
                currentPokemons.push(pkm);
                printPokemon(pkm.sprites.front_default, pkm.types, pkm.name, pkm.id);
            }
        }catch (error) {
            console.error(error);
        }  
} 

/**
 * Imprime el pokemon recibido por parametro en .pokepedia .
 * @param {string} img - url de la imagen del pokemon 
 * @param {object} types - tipos del pokemon 
 * @param {string} name - nombre del pokemon 
 */
function printPokemon(img, types, name, idPokemon){
    if(img != null && types != null && name != null){
        const CAJA = document.querySelector(".pokepedia");

        const POKEMON = document.createElement("div");
        POKEMON.classList.add("pokemon");
        POKEMON.addEventListener("click", ()=>{
            mostrarPokemon(idPokemon);
        });
        const IMAGE =  document.createElement("img");
        IMAGE.src = img;
        IMAGE.alt = name;
        POKEMON.appendChild(IMAGE);


        const NAME = document.createElement("h4");
        NAME.innerText = name;
        POKEMON.appendChild(NAME);

        const ID = document.createElement("span");
        ID.innerText = `Nº ${idPokemon}`;
        POKEMON.appendChild(ID);


        const GEN = document.createElement("span");
        const TIPOS = document.createElement("div");
        TIPOS.classList.add("tipos-pokemon");
        for(let i = 0; i< types.length; i++){
            const TIPO = document.createElement("span");
            TIPO.classList.add("tipo-encabezado");
            TIPO.classList.add(`tipo${ARRTIPOSES[ARRTIPOS.indexOf(types[i].type.name)]}`);
            TIPO.innerText = ARRTIPOSES[ARRTIPOS.indexOf(types[i].type.name)];
            TIPOS.appendChild(TIPO);
        }
        POKEMON.appendChild(TIPOS);

        CAJA.appendChild(POKEMON);
    }
}

// !FILTROS =================================================================================================================================================================================


/**
 * Obtener la lista de pokemons según el tipo requerido.
 * @param {string} tipo - tipo del pokemon por el que se quiere filtrar. 
 */
async function typeFilter(tipo){
    toogleFiltros();
    
    if(tipo != "none"){
        filter = true;        
        try {
            const response = await fetch(`${typeAPI}${tipo}`)
            const data = await response.json();
            
            pkms = await data.pokemon;
            let newList = [];

            for (let index = 0; index < pkms.length; index++) {
                newList.push(pkms[index].pokemon);
            }
            filtredNames = newList;

            console.log(filtredNames)
            currentPokemons = [];

        } catch (error) {
            console.error(error);
        }
    }else{
        filter = false;
    }

    document.querySelector(".pokepedia").innerHTML = '';
    count = 0;
    SiguienteLista();
}

/**
 * Obtiene todos los pokemons de cierta generacion.
 * @param {number} gen - Generación de la cual se quiere obtener los pokemons 
 */
async function genFilter(gen){
    toogleFiltros();
    
    if(gen != "-"){
        filter = true;        
        try {
            const response = await fetch(`${genAPI}${gen}`)
            const data = await response.json();
            const list = await data.pokemon_species;
            let newList = [];

            for (let i = 0; i < list.length; i++) {
                const splitUrl = list[i].url.split("/");
                console.log(splitUrl)
                const newUrl = pokeAPI + "/" + splitUrl[splitUrl.length - 2];
                const newPokemon = {
                    name: list[i].name,
                    url: newUrl
                }
                newList.push(newPokemon);
            }

            filtredNames = newList;
            currentPokemons = [];

        } catch (error) {
            console.error(error);
        }
    }else{
        filter = false;
    }

    document.querySelector(".pokepedia").innerHTML = '';
    count = 0;
    SiguienteLista();
}

/**
 * Elimina los filtros existentes y vuelve a imprimir los pokemons de forma normal.
 */
function eliminarFiltros(){
    toogleFiltros();
    filter = false; 
    document.querySelector(".pokepedia").innerHTML = '';
    count = 0;
    currentPokemons = [];
    filtredNames = [];
    SiguienteLista();
}

/**
 * Filtra todos los pokemons según si la clave coincide con alguna parte del nombre del pokemon.
 * @param {string} key - Palabra clave con la que se quiere buscar al pokemon. 
 */
function textFilter(key){
    let nameFilter = fullNameList;
    filter = true;
    let resultados = [];
    for (let i = 0; i < nameFilter.length; i++) {
        if (nameFilter[i].name.toLowerCase().indexOf(key.toLowerCase()) !== -1){
            resultados.push(nameFilter[i]);
        }
    }

    if(resultados.length < 1 || key.length < 1){
        filter = false;
        document.getElementById("search").value="";
    }else{
        filtredNames = resultados;
    }

    currentPokemons = [];
    document.querySelector(".pokepedia").innerHTML = '';
    count = 0;
    SiguienteLista();
}

/**
 * Toogle de la configuración de filtros.
 */
 function toogleFiltros(){
    document.querySelector(".filtros-box").classList.toggle("noVer");
}

// !FILTROS =================================================================================================================================================================================


/**
 * Prepara los datos necesarios y comienza la impresión.
 */
async function init(){
    fullNameList = await GetFullNameList();
    SiguienteLista();
}

// !POKEMON =================================================================================================================================================================================

/**
 * Busca un pokemon en concreto en la pokeApi y lo muestra con todos sus datos.
 * @param {number} idPokemon - Identificador del pokemon. 
 */
async function mostrarPokemon(idPokemon){
    tooglePokemon();
    document.querySelector(".SLTCon").removeChild(document.getElementById("SLTStats"));
    try {
        const response = await fetch(`${pokeAPI}/${idPokemon}`)
        const data = await response.json();
        console.log(data);

        const CANVAS = document.createElement("canvas");
        CANVAS.id = "SLTStats";
        document.querySelector(".SLTCon").appendChild(CANVAS);
        
        document.querySelector(".SLT-name").innerText = data.name;
        document.querySelector(".SLTImage").src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${idPokemon}.png`;

        //DATOS GENERALES:
        document.querySelector("#SLTPeso").innerText = (data.weight/10);
        document.querySelector("#SLTAltura").innerText = (data.height/10);
        document.querySelector("#SLTTipo").innerText = ((data.types.length > 1)? `${ARRTIPOSES[ARRTIPOS.indexOf(data.types[0].type.name)]}/${ARRTIPOSES[ARRTIPOS.indexOf(data.types[1].type.name)]}` : `${ARRTIPOSES[ARRTIPOS.indexOf(data.types[0].type.name)]}`);
        document.querySelector("#SLTNum").innerText = data.id;

        //MOSTRAR EVOLUCIONES:
        showEvolvs(data.name);

        loadStatsPokemon(data.stats);
    } catch (error) {
        console.error(error);
    }

}

/**
 * Toogle vista de datos de un pokemon espeficico
 */
function tooglePokemon(){
    document.querySelector(".SLTpokemon").classList.toggle("noVer");
    
}

//https://www.chartjs.org/docs/latest/charts/radar.html
/**
 * Carga los stats iniciales en un grafo.
 * @param {Object} datos - Stats iniciales del pokemon 
 */
function loadStatsPokemon(datos){
    const ctx = document.getElementById('SLTStats');
    const myChart = new Chart(ctx, {
        type: 'radar',
        data: {
            labels: ['HP', 'Ataque', 'Defensa', 'Ataque Especial', 'Defensa Especial', 'Velocidad'],
            datasets: [{
                label: 'Stats Iniciales',
                data: [datos[0].base_stat, datos[1].base_stat, datos[2].base_stat, datos[3].base_stat, datos[4].base_stat, datos[5].base_stat],
                backgroundColor: [
                    'rgba(255, 99, 132, 0.2)',
                    'rgba(54, 162, 235, 0.2)',
                    'rgba(255, 206, 86, 0.2)',
                    'rgba(75, 192, 192, 0.2)',
                    'rgba(153, 102, 255, 0.2)',
                    'rgba(255, 159, 64, 0.2)'
                ],
                borderColor: [
                    'rgba(255, 99, 132, 1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 206, 86, 1)',
                    'rgba(75, 192, 192, 1)',
                    'rgba(153, 102, 255, 1)',
                    'rgba(255, 159, 64, 1)'
                ],
                borderWidth: 5
            }]
        },
        options: {
            plugins: {
                legend: {
                    labels: {
                        font: {
                            size: 20
                        }
                    }
                }
            }
        }
    });
}

/**
 * Imprime la cadena evolutiva de cierto pokemon.
 * @param {string} pokemonName - Nombre del pokemon del cual se quiere buscar la cadena evolutiva. 
 */
async function showEvolvs(pokemonName){
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
            document.querySelector(".SLTEvoluciones").innerHTML = '';
            for (let i = 0; i < 3; i++) {
                if(evolvs[i] !== undefined){
                    const CONTENEDOR = document.querySelector(".SLTEvoluciones");
                    const EVOL = document.createElement("div");
                    EVOL.classList.add("SLTEvol");

                    const NAME = document.createElement("h4");
                    NAME.innerText = evolvs[i].name;
                    EVOL.appendChild(NAME);

                    const IMG = document.createElement("img");
                    IMG.src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${evolvs[i].url.split("/")[6]}.png`
                    IMG.alt = evolvs[i].name;

                    EVOL.appendChild(IMG);

                    CONTENEDOR.appendChild(EVOL)
                }
            }
            
        } catch (error) {
            console.error(error);
        }

    } catch (error) {
        console.error(error);
    }
}

// !POKEMON =================================================================================================================================================================================


// TODO: FUNCIONES =================================================================================================================================================================================
