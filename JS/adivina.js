const pokeAPI = "https://pokeapi.co/api/v2/pokemon/";

//Pokemon actualmente en juego.
let currentPokemon;

let pokemonsDescubiertos = [];

//Nombre, tipos, tam, stat
let pistas = [0,0,0,0];

//Datos de la partida:
let datos = {
    puntuacion: 0,
    pistas: 10,
    intentos: 0
}

//Tiempo del temporizador.
let tiempo = [0,0,0];
let intervalo;

/**
 * Obtener y establecer un pokemon aleatorio para el juego.
 */
async function randomPokemon(){
    let rndId =  Math.floor(Math.random() * (898 - 1)) + 1;
    let pokemon = await findPokemon(rndId);
    currentPokemon = pokemon.pokemon;
    //Muestra los espacios del nombre
    const NOMBRE = document.getElementById("nombre");
    let espaciosnombre = "";
    for (let i = 0; i < currentPokemon.name.length; i++) {
        espaciosnombre+= "_";
    }
    NOMBRE.innerText = espaciosnombre;


    //Reinicia las pistas.
    const PISTAS = document.getElementsByClassName("interiorPistas");
    for (let i = 0; i < PISTAS.length; i++) {PISTAS[i].innerText = "??????"}
    pistas = [0,0,0,0];

    //Imprime la imagen del pokemon a adivinar.
    document.querySelector("#randomPokemon").src = (pokemon.error)? "../IMGS/general/pokeplaceIcon.png" : pokemon.pokemon.sprites.front_default; 
}

/**
 * Busca un pokemon en la pokeapi y lo devuelve.
 * @param {number} id identificador del pokemon que se quiere buscar en la pokeapi 
 * @returns {boolean, pokemon} Si hay errores o no y el pokemon encontrado
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
 * Verifica si el texto que ha introducido el usuario y el nombre del pokemon son iguales, si es asi aumenta la puntuación, si no, resta un intento.
 * @param {string} texto Texto introducido por el usuario 
 */
function intento(texto){
    document.getElementById("nombreInput").value = "";
    const respuesta = texto.toLowerCase();
    if(respuesta == currentPokemon.name){

        //Si la respuesta es correcta se le añade un punto al usuario.
        datos.puntuacion = datos.puntuacion + 1;
        document.getElementById("puntuacion").innerText = datos.puntuacion; 

        let IMG = document.createElement("img");
        IMG.src = currentPokemon.sprites.front_default;
        IMG.classList.add("imagen-descubiertos");

        let descubierto = {
            name: currentPokemon.name,
            img: currentPokemon.sprites.front_default
        }
        pokemonsDescubiertos.push(descubierto);


        document.querySelector(".descubiertos").appendChild(IMG);

        //Al llegar a una puntuación con multiplo de 10 se le regala un intento al usuario.
        if(datos.puntuacion % 10 == 0 && datos.intentos > 0){
            datos.intentos = datos.intentos - 1;
            document.getElementById("intentos").innerText = datos.intentos;
        }
        
        //Añade otro pokemon.
        randomPokemon();
    }else{
        //Resta intentos y/o finaliza la partida
        restarIntentos();
    }
}

/**
 * Resta intentos y si no quedan detiene el juego.
 */
function restarIntentos(){
    datos.intentos = datos.intentos + 1;
    document.getElementById("intentos").innerText = datos.intentos;
    if(datos.intentos >= 3){
        stopGame();
    }
}

/**
 * Comodín del jugador para obtener otro pokemon a cambio de un intento.
 */
function saltarPokemon(){
    restarIntentos();
    randomPokemon();
}

/**
 * Usuario gasta un punto de pistas para obtener una información aleatoria del pokemon que debe descubrir.
 */
function conseguirPista(){
    if(datos.pistas > 0){
        let rndId =  Math.floor(Math.random() * (5 - 1)) + 1;
        if(pistas[rndId - 1] == 0 || (rndId == 1 && pistas[rndId - 1] < currentPokemon.name.length)){
            switch (rndId) {
                case 1:
                    let pistaNombre = document.getElementById("nombre").innerText;
                    pistaNombre = setCharAt(pistaNombre,pistas[rndId - 1],currentPokemon.name.charAt(pistas[rndId - 1]));
                    document.getElementById("nombre").innerText = pistaNombre;
                    
                    break;
                case 2:
                    const ARRTIPOS = ["water","grass","poison","fire","bug","normal", "flying", "electric", "ground", "fairy", "fighting", "psychic", "rock", "steel", "ice", "ghost", "dragon", "dark"];
                    const ARRTIPOSES = ["Agua","Planta","Veneno","Fuego","Bicho","Normal", "Volador", "Electrico", "Tierra", "Hada", "Lucha", "Psíquico", "Roca", "Acero", "Hielo", "Fantasma", "Dragon", "Siniestro"];
                    document.getElementById("pistaTipo").innerText = (currentPokemon.types.length == 2)? `${ARRTIPOSES[ARRTIPOS.indexOf(currentPokemon.types[0].type.name)]} y ${ARRTIPOSES[ARRTIPOS.indexOf(currentPokemon.types[1].type.name)]}` : ARRTIPOSES[ARRTIPOS.indexOf(currentPokemon.types[0].type.name)];
                    break;
    
                case 3:
                    document.getElementById("pistaAlt").innerText = `${currentPokemon.height / 10} m y ${currentPokemon.weight / 10} kg` ;
                    break;
    
                case 4:
                    const STATS = ["HP", "Ataque", "Defensa", "Ataque especial", "Defensa Especial", "Velocidad"];
                    let bestStat = [0, ""];
                    for (let i = 0; i < currentPokemon.stats.length; i++) {
                        if(bestStat[0] < currentPokemon.stats[i].base_stat){
                            bestStat[0] = currentPokemon.stats[i].base_stat;
                            bestStat[1] = STATS[i];
                        }
                    }
                    document.getElementById("pistaStat").innerText = `${bestStat[1]}: ${bestStat[0]}`;
                    break;
                default:
                    break;
            }

            datos.pistas = datos.pistas - 1;
            pistas[rndId - 1] = pistas[rndId - 1] + 1;
            document.getElementById("pistasCant").innerText = datos.pistas;

        }else{
            conseguirPista();
        }
    }
}

/**
 * Cambia cierto carácter de cierta posición por otro.
 * @param {string} str 
 * @param {number} index 
 * @param {string} chr 
 * @returns texto cambiado
 */
function setCharAt(str,index,chr) {
    if(index > str.length-1) return str;
    return str.substring(0,index) + chr + str.substring(index+1);
}

/**
 * Contador de tiempo.
 */
function contador(){
    const TIEMPO = document.getElementById("tiempo");
    if(tiempo[2] < 59){

        tiempo[2]++;

    }else if(tiempo[1] < 59){

        tiempo[1]++;
        tiempo[2] = 0;

    }else{
        tiempo[0]++;
        tiempo[1] = 0;
        tiempo[2] = 0;
    }
    let tiempoStr = [
        (tiempo[0] < 10)? `0${tiempo[0]}`: tiempo[0],
        (tiempo[1] < 10)? `0${tiempo[1]}`: tiempo[1],
        (tiempo[2] < 10)? `0${tiempo[2]}`: tiempo[2]
    ]
    TIEMPO.innerText = "" + tiempoStr[0] + ":" + tiempoStr[1] + ":" + tiempoStr[2];
}

/**
 * Detiene el juego y muestra una ventana con los resultados.
 */
function stopGame() {
    clearInterval(intervalo);
    document.querySelector(".pantallaFinal").classList.remove("noVer");
    let tiempoStr = [
        (tiempo[0] < 10)? `0${tiempo[0]}`: tiempo[0],
        (tiempo[1] < 10)? `0${tiempo[1]}`: tiempo[1],
        (tiempo[2] < 10)? `0${tiempo[2]}`: tiempo[2]
    ]
    document.getElementById("PFTiempo").innerText = "" + tiempoStr[0] + ":" + tiempoStr[1] + ":" + tiempoStr[2];
    document.getElementById("PFPuntuacion").innerText = datos.puntuacion;
    document.getElementById("PFPistas").innerText = datos.pistas;

    for (let i = 0; i < pokemonsDescubiertos.length; i++) {
        const DIV = document.createElement("div");
        DIV.classList.add("PFPokemon");
        const IMG = document.createElement("img");
        const PAR = document.createElement("p");
        IMG.src = pokemonsDescubiertos[i].img;
        PAR.innerText = pokemonsDescubiertos[i].name;

        DIV.appendChild(IMG);
        DIV.appendChild(PAR);

        document.querySelector(".pantallaFinal-descubiertos").appendChild(DIV);
    }

}

/**
 * Inicializa parametros y empieza el contador y la búsqueda del pokemon a adivinar.
 */
async function startGame(){
    document.querySelector(".pantallaFinal").classList.add("noVer");
    tiempo = [0,0,0];
    datos = {
        puntuacion: 0,
        pistas: 10,
        intentos: 0
    }
    pistas = [0,0,0,0];
    await randomPokemon();
    intervalo = setInterval(contador, 1000);
    intervalo;
}