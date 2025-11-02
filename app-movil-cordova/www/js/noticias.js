const API_KEY = "pub_ad3e16046fa94182aa7df45448a2a0c5"; // pub_ad3e16046fa94182aa7df45448a2a0c5
const BASE_URL = `https://newsdata.io/api/1/latest?apikey=${API_KEY}`;
    
let paginaActual = ''; // Token 'nextPage' para la paginación
let filtrosActivos = {
    // Valores iniciales
    language: 'es', 
    q: '',          
    country: ''
};
    
const contenedorNoticias = document.getElementById('contenedor-noticias');
const controlesNoticias = document.getElementById('controles-noticias');
const botonCargarMas = document.getElementById('cargar-mas');

// Lista de países
const PAISES = [
    { code: '', name: 'Todo el Mundo 🌎' }, // Opción global (omite el parámetro country)
    { code: 'cl', name: 'Chile 🇨🇱' },
    { code: 'us', name: 'Estados Unidos 🇺🇸' },
    { code: 'mx', name: 'México 🇲🇽' },
    { code: 'ar', name: 'Argentina 🇦🇷' },
    { code: 'es', name: 'España 🇪🇸' },
    { code: 'co', name: 'Colombia 🇨🇴' },
    { code: 've', name: 'Venezuela 🇻🇪' },
    { code: 'pe', name: 'Perú 🇵🇪' },
    { code: 'br', name: 'Brasil 🇧🇷' },
];


function formatearFecha(dateString) {
    if (!dateString) return 'Fecha Desconocida';
    const date = new Date(dateString.replace(' ', 'T') + 'Z'); 
    return date.toLocaleDateString('es-ES', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
    });
}


// Función que crea el HTML para una tarjeta de noticia
function crearTarjetaNoticia(noticia) {
    const imagenUrl = noticia.image_url || 'https://via.placeholder.com/600x400?text=Imagen+No+Disponible';
    // Limita la descripción para mantener la tarjeta concisa
    const descripcionCorta = noticia.description ? noticia.description.substring(0, 120) + '...' : 'Sin descripción disponible.';
    const fechaFormateada = formatearFecha(noticia.pubDate);

    return `
    <article class="card-noticia bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-2xl">
        <img src="${imagenUrl}" 
             alt="${noticia.title}" 
             class="w-full h-40 object-cover object-center">
        <div class="p-5 flex flex-col justify-between h-auto">
            <h3 class="card-title text-xl font-bold text-gray-900 mb-2">${noticia.title}</h3>
            <p class="text-sm text-gray-600 mb-3">${descripcionCorta}</p>
            
            <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center text-xs text-gray-500 mt-2 border-t pt-2">
                <span class="font-semibold text-blue-600">${noticia.source_name || noticia.source_id}</span>
                <span class="mt-1 sm:mt-0">${fechaFormateada}</span>
            </div>
            
            <a href="${noticia.link}" target="_blank" class="self-start mt-4 text-blue-700 hover:text-blue-900 font-medium text-sm transition-colors duration-200">
                Leer Noticia Completa →
            </a>
        </div>
    </article>
    `;
}

// Función para construir la URL y obtener los datos
async function obtenerNoticias(paginaToken) {
    
    // Construcción de la URL base
    let url = `${BASE_URL}&language=${filtrosActivos.language}`;

    // 1. Añadir Búsqueda (q) si existe
    if (filtrosActivos.q) {
        url += `&q=${encodeURIComponent(filtrosActivos.q)}`;
    }
    
    // 2. Añadir País (country) SOLO si NO está vacío (Si es '' se omite, buscando globalmente)
    if (filtrosActivos.country) {
        url += `&country=${filtrosActivos.country}`;
    }
    
    // 3. Añadir Paginación
    if (paginaToken) {
        url += `&page=${paginaToken}`;
    }

    try {
        // Mensaje de carga interactivo
        if (!paginaToken) { 
            const paisActual = filtrosActivos.country 
                ? PAISES.find(p => p.code === filtrosActivos.country)?.name 
                : 'Todo el Mundo'; 

            let mensaje = `Buscando noticias de **${paisActual}** sobre "${filtrosActivos.q || 'última hora'}..."`;
            contenedorNoticias.innerHTML = `<p class="text-center text-gray-500 col-span-full py-8 text-lg">${mensaje}</p>`;
        }

        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Error en la API: ${response.status}`);
        }
        const data = await response.json();
        
        // Gestión de la paginación
        paginaActual = data.nextPage || ''; 
        
        if (paginaActual) {
            botonCargarMas.classList.remove('hidden');
        } else {
            botonCargarMas.classList.add('hidden');
        }
        
        return data.results || [];
    } catch (error) {
        console.error('Error al obtener noticias:', error);
        contenedorNoticias.innerHTML = '<p class="text-center text-red-600 col-span-full py-8 text-lg">⚠️ Error de conexión o API Key inválida.</p>';
        return [];
    }
}

// Función para renderizar el contenido
function renderizarNoticias(noticias, append = false) {
    if (noticias.length === 0 && !append) {
        contenedorNoticias.innerHTML = `<p class="text-center text-gray-500 col-span-full py-8 text-xl">No se encontraron noticias con los filtros aplicados.</p>`;
        return;
    }
    
    const htmlNoticias = noticias.map(crearTarjetaNoticia).join('');
    
    if (append) {
        contenedorNoticias.insertAdjacentHTML('beforeend', htmlNoticias);
    } else {
        contenedorNoticias.innerHTML = htmlNoticias;
    }
}

// Lógica de "Cargar Más"
async function cargarMas() {
    botonCargarMas.textContent = 'Cargando más...';
    const noticias = await obtenerNoticias(paginaActual);
    renderizarNoticias(noticias, true); 
    botonCargarMas.textContent = 'Cargar Más Noticias';
}

// Inicialización de filtros: País y Búsqueda
function inicializarFiltros() {
    // 1. Selector de País
    const selectPais = document.createElement('select');
    // Mobile First: padding y tamaño de texto base.
    selectPais.className = "p-3 border rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 text-base min-w-[150px]";
    
    // Mapea la lista PAISES
    selectPais.innerHTML = PAISES.map(p => 
        `<option value="${p.code}" ${p.code === filtrosActivos.country ? 'selected' : ''}>${p.name}</option>`
    ).join('');
    
    // Evento de interacción: al cambiar el país
    selectPais.addEventListener('change', async (e) => {
        filtrosActivos.country = e.target.value;
        paginaActual = ''; 
        await cargarNoticiasIniciales(); 
    });

    // 2. Campo de Búsqueda
    const inputBusqueda = document.createElement('input');
    inputBusqueda.type = 'text';
    inputBusqueda.placeholder = 'Escribe aquí tu búsqueda (Ej: temblor, IA)...';
    inputBusqueda.className = "p-3 border rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 text-base flex-grow w-full";
    
    // Debounce para optimizar la llamada a la API (interactividad)
    let timer;
    inputBusqueda.addEventListener('keyup', () => {
        clearTimeout(timer);
        timer = setTimeout(async () => {
            if (inputBusqueda.value !== filtrosActivos.q) { 
                 filtrosActivos.q = inputBusqueda.value;
                 paginaActual = ''; 
                 await cargarNoticiasIniciales();
            }
        }, 600);
    });

    // Añadir los elementos al contenedor de controles
    // Configuración para que el contenedor use flex y se ajuste bien en móvil/desktop
    controlesNoticias.classList.add('flex', 'flex-wrap', 'sm:flex-nowrap', 'gap-4'); 

    controlesNoticias.appendChild(selectPais);
    controlesNoticias.appendChild(inputBusqueda);
}

// Carga inicial al cargar el documento
async function cargarNoticiasIniciales() {
    const noticias = await obtenerNoticias('');
    renderizarNoticias(noticias);
}

document.addEventListener('DOMContentLoaded', () => {
    inicializarFiltros();
    cargarNoticiasIniciales();
    botonCargarMas.addEventListener('click', cargarMas);
});