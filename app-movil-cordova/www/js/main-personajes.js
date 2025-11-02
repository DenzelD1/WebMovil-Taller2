const container = document.getElementById("personajes-container");
const detalleInfoContainer = document.getElementById("personaje-detalle-info");
const inputFiltro = document.getElementById("filtro-nombre");
const selectFiltroTipo = document.getElementById("filtro-tipo");
const selectFiltroGeneracion = document.getElementById("filtro-generacion");
const filtroContenedor = document.getElementById("filtro-contenedor"); 

let allDetailPokemon = [];

// Rangos definidos para cada generación de Pokémon, una forma más sencilla de filtrarlos
const rangoGeneraciones = [
    { name: "1ª Generación (Kanto)", min: 1, max: 151 },
    { name: "2ª Generación (Johto)", min: 152, max: 251 },
    { name: "3ª Generación (Hoenn)", min: 252, max: 386 },
    { name: "4ª Generación (Sinnoh)", min: 387, max: 493 },
    { name: "5ª Generación (Unova)", min: 494, max: 649 },
    { name: "6ª Generación (Kalos)", min: 650, max: 721 },
    { name: "7ª Generación (Alola)", min: 722, max: 809 },
    { name: "8ª Generación (Galar)", min: 810, max: 905 },
    { name: "9ª Generación (Paldea)", min: 906, max: 1025 }
];

function obtenerParametroID() {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('id');
}

async function mostrarDetallePokemon(id) {
    const filtroContainer = document.querySelector('.mb-10.flex.flex-col.md\\:flex-row.gap-4.justify-start');

    if (filtroContainer) {
        filtroContainer.classList.add('hidden');
    }
    container.classList.add('hidden');

    try {
        const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
        if (!res.ok) throw new Error("Pokémon no encontrado");
        const detalle = await res.json();

        const normalSprite = detalle.sprites.front_default;
        const shinySprite = detalle.sprites.front_shiny;

        const estadisticasRows = detalle.stats.map(stat => {
            let nombre = stat.stat.name.replace(/-/g, ' ');
            switch (nombre.toLowerCase()) {
                case 'hp': nombre = 'HP'; break;
                case 'attack': nombre = 'Ataque'; break;
                case 'defense': nombre = 'Defensa'; break;
                case 'special attack': nombre = 'At. Especial'; break;
                case 'special defense': nombre = 'Def. Especial'; break;
                case 'speed': nombre = 'Velocidad'; break;
                default: nombre = nombre.charAt(0).toUpperCase() + nombre.slice(1);
            }
            const valor = stat.base_stat;
            return `
                <tr class="border-b last:border-b-0">
                    <td class="px-2 py-1 font-semibold text-gray-700">${nombre}</td>
                    <td class="px-2 py-1 text-center font-bold text-blue-600">${valor}</td>
                </tr>
            `;
        }).join('');

        const tablaEstadisticas = `
            <table class="min-w-full bg-white rounded-lg shadow-sm border border-gray-200">
                <thead>
                    <tr class="bg-gray-100 border-b border-gray-200">
                        <th class="px-2 py-2 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Estadística</th>
                        <th class="px-2 py-2 text-center text-xs font-bold text-gray-600 uppercase tracking-wider">Valor Base</th>
                    </tr>
                </thead>
                <tbody>
                    ${estadisticasRows}
                </tbody>
            </table>
        `;

        const tipos = detalle.types.map(t => t.type.name.charAt(0).toUpperCase() + t.type.name.slice(1)).join(', ');
        const habilidades = detalle.abilities.map(a => a.ability.name.replace(/-/g, ' ').charAt(0).toUpperCase() + a.ability.name.replace(/-/g, ' ').slice(1)).join(', ');

        detalleInfoContainer.innerHTML = `
            <h2 class="text-3xl font-bold capitalize text-center mb-6">${detalle.name} (#${detalle.id})</h2>
            
            <div class="flex flex-col md:flex-row items-start">
                
                <div class="flex-shrink-0 flex flex-col items-center mx-auto mb-6 md:mb-0 md:mr-8">
                    <img id="pokemon-sprite" 
                         src="${normalSprite}" 
                         alt="${detalle.name}" 
                         class="w-48 h-48 object-contain">
                         
                    <button id="sprite-toggle-btn" 
                            data-current-sprite="normal"
                            data-normal-url="${normalSprite}"
                            data-shiny-url="${shinySprite}"
                            class="mt-2 bg-yellow-500 text-white font-bold py-2 px-4 rounded hover:bg-yellow-600 transition">
                        Ver Sprite Shiny
                    </button>
                </div>
                
                <div class="md:flex-1 w-full grid grid-cols-1 lg:grid-cols-2 gap-6">
                    
                    <div class="border-r lg:pr-6">
                        <h3 class="text-2xl font-semibold mb-3 border-b pb-2">Información General</h3>
                        <p class="mb-2"><strong>Tipos:</strong> ${tipos}</p>
                        <p class="mb-2"><strong>Altura:</strong> ${detalle.height / 10} m</p>
                        <p class="mb-2"><strong>Peso:</strong> ${detalle.weight / 10} kg</p>
                        <p class="mb-4"><strong>Habilidades:</strong> ${habilidades}</p>
                    </div>
                    
                    <div>
                        <h3 class="text-2xl font-semibold mb-3 border-b pb-2">Estadísticas Base</h3>
                        ${tablaEstadisticas}
                    </div>
                    
                </div>
            </div>
            <a href="personaje.html" class="mt-8 inline-block bg-blue-500 text-white font-bold py-2 px-4 rounded hover:bg-blue-700 transition">
                &larr; Volver a la Lista
            </a>
        `;

        const toggleSprite = document.getElementById('sprite-toggle-btn');
        const spritePokemon = document.getElementById('pokemon-sprite');
        
        if (toggleSprite) {
            toggleSprite.addEventListener('click', () => {
                const isNormal = toggleSprite.getAttribute('data-current-sprite') === 'normal';
                
                if (isNormal) {
                    spritePokemon.src = toggleSprite.getAttribute('data-shiny-url');
                    toggleSprite.setAttribute('data-current-sprite', 'shiny');
                    toggleSprite.textContent = 'Ver Sprite Normal';
                    toggleSprite.classList.remove('bg-yellow-500', 'hover:bg-yellow-600');
                    toggleSprite.classList.add('bg-blue-500', 'hover:bg-blue-600');
                } else {
                    spritePokemon.src = toggleSprite.getAttribute('data-normal-url');
                    toggleSprite.setAttribute('data-current-sprite', 'normal');
                    toggleSprite.textContent = 'Ver Sprite Shiny';
                    toggleSprite.classList.remove('bg-blue-500', 'hover:bg-blue-600');
                    toggleSprite.classList.add('bg-yellow-500', 'hover:bg-yellow-600');
                }
            });
        }
        
    } catch (error) {
        detalleInfoContainer.innerHTML = `<p class='text-red-500 text-center font-bold'>Error al cargar detalles del Pokémon con ID ${id}.</p>`;
        console.error("Error al cargar detalle:", error);
    }
}

function renderizarPersonajes(personajes) {
  const container = document.getElementById("personajes-container");
  container.innerHTML = "";
  
  if (personajes.length === 0) {
     container.innerHTML = "<p class='text-center col-span-full text-gray-500 text-lg mt-10'>No se encontraron Pokémones que coincidan con los filtros.</p>";
     return;
  }

  for (const detalle of personajes) {
    const card = document.createElement("div");
    card.className =
      "bg-white shadow-lg rounded-lg overflow-hidden hover:scale-105 transition-transform";

    // Reemplaza los tipos de cada pokemon por sus respectivos iconos (.svg) en la carpeta img/pokemon-tipos/
    const tiposHTML = detalle.types.map(t => {
        const tipoNombre = t.type.name;
        const rutaSVG = `img/pokemon-tipos/${tipoNombre}.svg`;
        return `<img src="${rutaSVG}" alt="${tipoNombre}" title="${tipoNombre.charAt(0).toUpperCase() + tipoNombre.slice(1)}" class="w-12 h-6 inline-block mx-0.5 filter-invert-dark">`;
    }).join('');

    card.innerHTML = `
      <img src="${detalle.sprites.front_default}" alt="${detalle.name}" class="w-full h-48 object-contain bg-gray-100">
      <div class="p-6 text-center">
        <h3 class="text-xl font-semibold text-gray-800 capitalize">${detalle.name}</h3>
        <p class="mt-2 text-gray-600">ID: ${detalle.id}</p>
        <div class="mt-2 flex justify-center items-center">${tiposHTML}</div>
        <a href="personaje.html?id=${detalle.id}" 
           class="mt-4 inline-block bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
          Ver Detalle
        </a>
      </div>
    `;
    container.appendChild(card);
  }
}

async function cargarTipos() {
    try {
        const res = await fetch("https://pokeapi.co/api/v2/type");
        const data = await res.json();
        
        data.results.forEach(tipo => {
            const option = document.createElement('option');
            option.value = tipo.name;
            option.textContent = tipo.name.charAt(0).toUpperCase() + tipo.name.slice(1);
            selectFiltroTipo.appendChild(option);
        });

    } catch (error) {
        console.error("Error al cargar los tipos de Pokémon:", error);
    }
}

function cargarGeneraciones() {
    rangoGeneraciones.forEach((gen, index) => {
        const option = document.createElement('option');
        option.value = index; 
        option.textContent = gen.name;
        selectFiltroGeneracion.appendChild(option);
    });
}

async function cargarListaPokemones() {
  await cargarTipos();
  cargarGeneraciones(); 

  try {
    const res = await fetch("https://pokeapi.co/api/v2/pokemon?limit=1025");
    const data = await res.json();
    const detallesPokemon = [];

    for (const personaje of data.results) {
      const resDetalle = await fetch(personaje.url);
      const detalle = await resDetalle.json();
      detallesPokemon.push(detalle);
    }
    allDetailPokemon = detallesPokemon;
    renderizarPersonajes(allDetailPokemon);

    detalleInfoContainer.classList.add('hidden'); 
    filtroContenedor.classList.remove('hidden');

  } catch (error) {
    detalleInfoContainer.classList.remove('hidden');
    detalleInfoContainer.innerHTML =
      "<p class='text-red-500 text-center font-bold'>Error al cargar personajes. Intente de nuevo más tarde.</p>";
    console.error(error);
  }
}

function aplicarFiltro() {
  const terminoBusqueda = inputFiltro.value.toLowerCase();
  const tipoSeleccionado = selectFiltroTipo.value; 
  const generacionSeleccionadaIndex = selectFiltroGeneracion.value;
  
  const personajesFiltrados = allDetailPokemon.filter(pokemon => {
    
    const coincideNombre = pokemon.name.includes(terminoBusqueda);
    const coincideTipo = tipoSeleccionado === "" || pokemon.types.some(t => t.type.name === tipoSeleccionado);
    
    let coincideGeneracion = true;
    if (generacionSeleccionadaIndex !== "") {
        const genData = rangoGeneraciones[parseInt(generacionSeleccionadaIndex)];
        coincideGeneracion = pokemon.id >= genData.min && pokemon.id <= genData.max;
    }
    
    return coincideNombre && coincideTipo && coincideGeneracion;
  });

  renderizarPersonajes(personajesFiltrados);
}

async function inicializarPagina() {
    const pokemonId = obtenerParametroID();
    
    if (pokemonId) {
        await mostrarDetallePokemon(pokemonId);
    } else {
        await cargarListaPokemones(); 
        inputFiltro.addEventListener('input', aplicarFiltro);
        selectFiltroTipo.addEventListener('change', aplicarFiltro); 
        selectFiltroGeneracion.addEventListener('change', aplicarFiltro);
    }
}

inicializarPagina();