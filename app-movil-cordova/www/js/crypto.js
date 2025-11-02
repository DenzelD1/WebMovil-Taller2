/**
 * Estado global de la aplicacion
 * Almacena toda la informacion necesaria para el funcionamiento de la app
 */
const estado = {
    criptos: [],          // Lista de criptomonedas cargadas
    filtros: {
        texto: ''         // Texto de busqueda
    },
    ordenamiento: 'market_cap-desc', // Criterio de ordenamiento actual
    pagina: 1,            // Pagina actual de resultados
    porPagina: 30         // Cantidad de criptomonedas por pagina
};

const API_URL = 'https://api.coingecko.com/api/v3';

/**
 * Formatea numeros grandes a un formato legible
 * Ejemplo: 1234567 -> $1.23M
 * @param {number} numero - Numero a formatear
 * @param {number} decimales - Cantidad de decimales a mostrar
 * @returns {string} Numero formateado con prefijo de moneda
 */
function formatearNumero(numero, decimales = 2) {
    if (numero === null || numero === undefined) return 'N/A';
    
    const opciones = {
        minimumFractionDigits: decimales,
        maximumFractionDigits: decimales
    };

    if (numero >= 1e9) {
        return `$${(numero / 1e9).toLocaleString('es-ES', opciones)}B`;
    } else if (numero >= 1e6) {
        return `$${(numero / 1e6).toLocaleString('es-ES', opciones)}M`;
    } else if (numero >= 1e3) {
        return `$${(numero / 1e3).toLocaleString('es-ES', opciones)}K`;
    } else {
        return `$${numero.toLocaleString('es-ES', opciones)}`;
    }
}



/**
 * Obtiene y muestra estadisticas globales del mercado de criptomonedas
 * - Capitalizacion total del mercado
 * - Volumen total de trading en 24h
 * - Porcentaje de dominancia de Bitcoin
 * - Numero total de criptomonedas activas
 * Se actualiza automaticamente cada 2 minutos
 */
async function obtenerDatosMercadoGlobal() {
    try {
        console.log('Obteniendo datos globales del mercado');
        const response = await fetch(`${API_URL}/global`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        console.log('Respuesta de datos globales recibida:', response.status);
        
        const { data } = await response.json();
        console.log('Datos globales recibidos:', data);
        
        if (!data) {
            throw new Error('No se recibieron datos globales');
        }
        
        document.getElementById('total-market-cap').textContent = 
            formatearNumero(data.total_market_cap.usd);
        document.getElementById('total-volume').textContent = 
            formatearNumero(data.total_volume.usd);
        document.getElementById('btc-dominance').textContent = 
            `${data.market_cap_percentage.btc.toFixed(1)}%`;
        document.getElementById('active-coins').textContent = 
            data.active_cryptocurrencies.toLocaleString();
    } catch (error) {
        console.error('Error al obtener datos globales:', error);
        // Mostrar mensaje de error en el panel de mercado
        const marketOverview = document.getElementById('market-overview');
        marketOverview.innerHTML = `
            <div class="col-span-full bg-red-50 p-4 rounded-xl">
                <div class="flex items-center">
                    <div class="flex-shrink-0">
                        <svg class="h-5 w-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
                        </svg>
                    </div>
                    <div class="ml-3">
                        <h3 class="text-sm font-medium text-red-800">Error al cargar datos globales</h3>
                        <div class="mt-2 text-sm text-red-700">
                            <p>No se pudieron cargar los datos del mercado. Por favor, intenta recargar la página.</p>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
}

// Variable para controlar el tiempo entre llamadas a la API
let ultimaLlamadaCriptos = 0;
const tiempoMinimoCriptos = 30000; // 30 segundos

/**
 * Obtiene la lista de criptomonedas desde la API de CoinGecko
 * Maneja la paginacion y el limite de peticiones
 * 
 * Caracteristicas:
 * - Carga 30 criptomonedas por pagina
 * - Espera 60 segundos entre peticiones para evitar limites
 * - Reintenta automaticamente si hay error 429 (Too Many Requests)
 * - Actualiza el estado global con los nuevos datos
 * 
 * @param {number} pagina - Numero de pagina a cargar (1 por defecto)
 */
async function obtenerCriptomonedas(pagina = 1) {
    try {
        const ahora = Date.now();
        if (ahora - ultimaLlamadaCriptos < tiempoMinimoCriptos) {
            const tiempoEspera = tiempoMinimoCriptos - (ahora - ultimaLlamadaCriptos);
            console.log(`Esperando ${tiempoEspera/1000} segundos para evitar límite de tasa...`);
            await new Promise(resolve => setTimeout(resolve, tiempoEspera));
        }

        console.log('Obteniendo criptomonedas para página:', pagina);
        const url = `${API_URL}/coins/markets`;
        const params = new URLSearchParams({
            vs_currency: 'usd',
            order: 'market_cap_desc',
            per_page: estado.porPagina.toString(),
            page: pagina.toString(),
            sparkline: 'false',
            price_change_percentage: '24h,7d'
        });

        const response = await fetch(`${url}?${params}`);

        if (response.status === 429) {
            const retryAfter = response.headers.get('Retry-After') || 60;
            console.log(`Límite de tasa alcanzado. Esperando ${retryAfter} segundos...`);
            await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
            return obtenerCriptomonedas(pagina);
        }
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        console.log('Respuesta recibida:', response.status);
        const nuevasCriptos = await response.json();
        console.log('Datos recibidos:', nuevasCriptos.length, 'criptomonedas');
        
        if (pagina === 1) {
            estado.criptos = nuevasCriptos;
        } else {
            estado.criptos = [...estado.criptos, ...nuevasCriptos];
        }
        
        ultimaLlamadaCriptos = ahora;
        aplicarFiltrosYOrdenamiento();
    } catch (error) {
        console.error('Error al obtener criptomonedas:', error);
        // Mostrar mensaje de error al usuario
        const contenedor = document.getElementById('crypto-container');
        contenedor.innerHTML = `
            <div class="col-span-full text-center py-12">
                <div class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-4">
                    <svg class="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
                    </svg>
                </div>
                <h3 class="text-lg font-medium text-gray-900 mb-2">Error al cargar los datos</h3>
                <p class="text-gray-500">${error.message || 'Lo sentimos, ha ocurrido un error al cargar los datos. Por favor, intenta de nuevo en unos momentos.'}</p>
            </div>
        `;
    }
}



/**
 * Filtra la lista de criptomonedas segun criterios de busqueda
 * 
 * Criterios de filtrado:
 * - Texto: busca en nombre y simbolo de la criptomoneda
 * - No distingue mayusculas/minusculas
 * - Devuelve todas las coincidencias parciales
 * 
 * @returns {Array} Lista de criptomonedas que cumplen los criterios
 */
function filtrarCriptomonedas() {
    return estado.criptos.filter(cripto => {
        const coincideTexto = 
            cripto.name.toLowerCase().includes(estado.filtros.texto.toLowerCase()) ||
            cripto.symbol.toLowerCase().includes(estado.filtros.texto.toLowerCase());
        return coincideTexto;
    });
}

/**
 * Ordena la lista de criptomonedas segun diferentes criterios
 * 
 * Criterios de ordenamiento:
 * - market_cap: por capitalizacion de mercado
 * - price: por precio actual
 * - volume: por volumen de trading
 * 
 * Direcciones:
 * - asc: orden ascendente (menor a mayor)
 * - desc: orden descendente (mayor a menor)
 * 
 * @param {Array} criptos - Lista de criptomonedas a ordenar
 * @returns {Array} Lista ordenada segun el criterio actual
 */
function ordenarCriptomonedas(criptos) {
    return criptos.sort((a, b) => {
        const [campo, orden] = estado.ordenamiento.split('-');
        let valorA, valorB;

        switch (campo) {
            case 'market_cap':
                valorA = a.market_cap;
                valorB = b.market_cap;
                break;
            case 'price':
                valorA = a.current_price;
                valorB = b.current_price;
                break;
            case 'volume':
                valorA = a.total_volume;
                valorB = b.total_volume;
                break;
            default:
                return 0;
        }

        return orden === 'asc' ? valorA - valorB : valorB - valorA;
    });
}

/**
 * Muestra las criptomonedas en la interfaz de usuario
 * 
 * Caracteristicas:
 * - Crea tarjetas interactivas para cada criptomoneda
 * - Muestra imagen, nombre, simbolo y datos importantes
 * - Indica cambios de precio con colores (verde/rojo)
 * - Maneja estado de carga y mensajes de error
 * - Permite hacer clic para ver mas detalles
 * 
 * @param {Array} criptos - Lista de criptomonedas a mostrar
 */
function mostrarCriptomonedas(criptos) {
    const contenedor = document.getElementById('crypto-container');
    const noResultados = document.getElementById('no-resultados');
    const cargarMasBtn = document.getElementById('cargar-mas');

    // Gestionar estado de carga
    cargarMasBtn.disabled = false;
    cargarMasBtn.classList.remove('opacity-50', 'cursor-not-allowed');

    if (estado.pagina === 1) {
        contenedor.innerHTML = '';
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    if (criptos.length === 0) {
        noResultados.classList.remove('hidden');
        return;
    }

    noResultados.classList.add('hidden');

    criptos.forEach(cripto => {
        const card = document.createElement('article');
        card.classList.add(
            'bg-white', 'rounded-lg', 'shadow-lg', 'overflow-hidden',
            'transition-all', 'duration-300', 'hover:transform',
            'hover:scale-105', 'active:scale-95', 'cursor-pointer',
            'touch-manipulation'
        );
        
        card.innerHTML = `
            <div class="p-6">
                <div class="flex items-center gap-4 mb-6">
                    <div class="relative">
                        <img src="${cripto.image}" 
                             alt="${cripto.name}" 
                             class="w-12 h-12 rounded-xl shadow-lg">
                        <div class="absolute -bottom-1 -right-1 bg-white rounded-full p-1 shadow-lg">
                            <div class="w-3 h-3 rounded-full ${cripto.price_change_percentage_24h >= 0 ? 'bg-green-500' : 'bg-red-500'}"></div>
                        </div>
                    </div>
                    <div>
                        <h3 class="font-bold text-lg text-gray-900">${cripto.name}</h3>
                        <span class="text-gray-500 text-sm font-medium uppercase tracking-wide">${cripto.symbol}</span>
                    </div>
                </div>
                
                <div class="grid grid-cols-2 gap-6">
                    <div class="space-y-1">
                        <p class="text-gray-500 text-sm font-medium">Precio</p>
                        <p class="font-bold text-lg text-gray-900">${formatearNumero(cripto.current_price)}</p>
                    </div>
                    <div class="space-y-1">
                        <p class="text-gray-500 text-sm font-medium">Cap. de Mercado</p>
                        <p class="font-bold text-lg text-gray-900">${formatearNumero(cripto.market_cap)}</p>
                    </div>
                    <div class="space-y-1">
                        <p class="text-gray-500 text-sm font-medium">Cambio 24h</p>
                        <div class="flex items-center gap-1 ${cripto.price_change_percentage_24h >= 0 ? 'text-green-600' : 'text-red-600'}">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                                      d="${cripto.price_change_percentage_24h >= 0 
                                          ? 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6' 
                                          : 'M13 17h8m0 0V9m0 8l-8-8-4 4-6-6'}"/>
                            </svg>
                            <span class="font-bold">${Math.abs(cripto.price_change_percentage_24h).toFixed(2)}%</span>
                        </div>
                    </div>
                    <div class="space-y-1">
                        <p class="text-gray-500 text-sm font-medium">Volumen 24h</p>
                        <p class="font-bold text-lg text-gray-900">${formatearNumero(cripto.total_volume)}</p>
                    </div>
                </div>
            </div>
        `;

        // Agregar evento para mostrar más detalles
        card.addEventListener('click', () => mostrarDetallesCripto(cripto));
        contenedor.appendChild(card);
    });
}

/**
 * Muestra una ventana modal con detalles detallados de una criptomoneda
 * 
 * Informacion mostrada:
 * - Precio actual y cambio porcentual
 * - Rango de precio en 24h con barra de progreso
 * - Capitalizacion de mercado
 * - Volumen de trading en 24h
 * - Suministro circulante
 * 
 * @param {Object} cripto - Objeto con los datos de la criptomoneda
 */
function mostrarDetallesCripto(cripto) {
    const modal = document.createElement('div');
    modal.classList.add(
        'fixed', 'inset-0', 'bg-black', 'bg-opacity-50',
        'flex', 'items-center', 'justify-center', 'p-4',
        'z-50'
    );

    const contenido = document.createElement('div');
    contenido.classList.add(
        'bg-white', 'rounded-lg', 'max-w-2xl', 'w-full',
        'max-h-[90vh]', 'overflow-y-auto', 'p-6'
    );

    contenido.innerHTML = `
        <div class="relative">
            <!-- Header con gradiente -->
            <div class="absolute top-0 left-0 right-0 h-32 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-t-lg"></div>
            
            <!-- Contenido principal -->
            <div class="relative">
                <div class="flex justify-between items-start mb-8 pt-6">
                    <div class="flex items-center gap-6">
                        <div class="p-1 bg-white rounded-2xl shadow-xl">
                            <img src="${cripto.image}" 
                                 alt="${cripto.name}" 
                                 class="w-20 h-20 rounded-xl">
                        </div>
                        <div class="text-white">
                            <h2 class="text-3xl font-bold">${cripto.name}</h2>
                            <p class="text-indigo-100 uppercase tracking-wide font-medium">${cripto.symbol}</p>
                        </div>
                    </div>
                    <button class="text-white hover:text-indigo-100 transition-colors" id="cerrar-modal">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                        </svg>
                    </button>
                </div>

                <!-- Tarjetas de estadísticas -->
                <div class="bg-white rounded-2xl shadow-lg p-6 mb-6">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div class="space-y-6">
                            <div class="p-4 bg-gray-50 rounded-xl">
                                <h3 class="text-gray-500 font-medium mb-2">Precio Actual</h3>
                                <div class="flex items-center gap-2">
                                    <span class="text-2xl font-bold text-gray-900">${formatearNumero(cripto.current_price)}</span>
                                    <span class="px-2 py-1 text-sm rounded-lg ${
                                        cripto.price_change_percentage_24h >= 0 
                                        ? 'bg-green-100 text-green-800' 
                                        : 'bg-red-100 text-red-800'
                                    }">
                                        ${cripto.price_change_percentage_24h >= 0 ? '↑' : '↓'} 
                                        ${Math.abs(cripto.price_change_percentage_24h).toFixed(2)}%
                                    </span>
                                </div>
                            </div>

                            <div class="p-4 bg-gray-50 rounded-xl">
                                <h3 class="text-gray-500 font-medium mb-2">Rango de Precio 24h</h3>
                                <div class="flex items-center gap-4">
                                    <div>
                                        <p class="text-sm text-gray-500">Mínimo</p>
                                        <p class="font-bold text-gray-900">${formatearNumero(cripto.low_24h)}</p>
                                    </div>
                                    <div class="flex-1 h-2 bg-gray-200 rounded-full">
                                        <div class="h-2 bg-indigo-600 rounded-full" style="width: ${
                                            ((cripto.current_price - cripto.low_24h) / (cripto.high_24h - cripto.low_24h)) * 100
                                        }%"></div>
                                    </div>
                                    <div>
                                        <p class="text-sm text-gray-500">Máximo</p>
                                        <p class="font-bold text-gray-900">${formatearNumero(cripto.high_24h)}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="space-y-6">
                            <div class="p-4 bg-gray-50 rounded-xl">
                                <h3 class="text-gray-500 font-medium mb-2">Capitalización de Mercado</h3>
                                <p class="text-2xl font-bold text-gray-900">${formatearNumero(cripto.market_cap)}</p>
                            </div>

                            <div class="grid grid-cols-2 gap-4">
                                <div class="p-4 bg-gray-50 rounded-xl">
                                    <h3 class="text-gray-500 font-medium mb-2">Volumen 24h</h3>
                                    <p class="font-bold text-gray-900">${formatearNumero(cripto.total_volume)}</p>
                                </div>
                                <div class="p-4 bg-gray-50 rounded-xl">
                                    <h3 class="text-gray-500 font-medium mb-2">Suministro</h3>
                                    <p class="font-bold text-gray-900">${formatearNumero(cripto.circulating_supply, 0)} 
                                       <span class="text-sm text-gray-500">${cripto.symbol.toUpperCase()}</span></p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;

    modal.appendChild(contenido);
    document.body.appendChild(modal);

    // Cerrar modal
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            document.body.removeChild(modal);
        }
    });

    document.getElementById('cerrar-modal').addEventListener('click', () => {
        document.body.removeChild(modal);
    });
}

// Función principal para aplicar filtros y ordenamiento
function aplicarFiltrosYOrdenamiento() {
    const criptosFiltradas = filtrarCriptomonedas();
    const criptosOrdenadas = ordenarCriptomonedas(criptosFiltradas);
    mostrarCriptomonedas(criptosOrdenadas);
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    // Cargar datos iniciales
    obtenerDatosMercadoGlobal();
    obtenerCriptomonedas();

    // Eventos de filtrado con debounce para mejor rendimiento
    let timeoutId;
    document.getElementById('busqueda').addEventListener('input', (e) => {
        const searchIcon = e.target.previousElementSibling.querySelector('svg');
        searchIcon.classList.add('animate-pulse');
        
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
            estado.filtros.texto = e.target.value;
            aplicarFiltrosYOrdenamiento();
            searchIcon.classList.remove('animate-pulse');
        }, 300);
    });



    document.getElementById('orden').addEventListener('change', (e) => {
        estado.ordenamiento = e.target.value;
        aplicarFiltrosYOrdenamiento();
    });

    // Evento de cargar más con manejo de límite de tasa
    let cargarMasEnProgreso = false;
    document.getElementById('cargar-mas').addEventListener('click', async (e) => {
        if (cargarMasEnProgreso) {
            console.log('Ya hay una carga en progreso...');
            return;
        }

        const btn = e.target;
        try {
            cargarMasEnProgreso = true;
            btn.disabled = true;
            btn.classList.add('opacity-50', 'cursor-not-allowed');
            btn.textContent = 'Cargando...';

            estado.pagina++;
            await obtenerCriptomonedas(estado.pagina);
        } catch (error) {
            console.error('Error al cargar más:', error);
            // Mostrar mensaje de error al usuario
            const mensaje = document.createElement('div');
            mensaje.className = 'text-red-600 mt-2 text-center';
            mensaje.textContent = error.message || 'Error al cargar más datos. Por favor, intenta de nuevo.';
            btn.parentNode.insertBefore(mensaje, btn.nextSibling);
            
            // Remover mensaje después de 3 segundos
            setTimeout(() => mensaje.remove(), 3000);
        } finally {
            cargarMasEnProgreso = false;
            btn.disabled = false;
            btn.classList.remove('opacity-50', 'cursor-not-allowed');
            btn.textContent = 'Cargar más criptomonedas';
        }
    });

    // Actualizar datos cada 2 minutos para evitar límites de tasa
    setInterval(() => {
        obtenerDatosMercadoGlobal();
        obtenerCriptomonedas(1);
    }, 120000);
});