document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('clima-info-index')) {
        obtenerDatosClimaIndex(); 
    }

    if (document.getElementById('clima-detalle-info')) {
        obtenerDatosClimaDetalle(); 
    }

    if (document.getElementById('formulario-busqueda-clima')) {
        configurarFormularioBusquedaClima();
    }
});

// Backend FastAPI runs on port 8001 during local development to avoid
// conflict with the Cordova browser static server (which uses 8000).
const urlBaseClima = 'http://localhost:8001/weather';

function obtenerDatosClimaIndex() {
    const climaInfoDiv = document.getElementById('clima-info-index');
    
    const urlIndex = `${urlBaseClima}?q=Coquimbo,cl`;
    fetch(urlIndex) 
        .then(response => response.json())
        .then(data => {
            if (data.cod !== 200) { 
                throw new Error(data.message);
            }
            const temperatura = data.main.temp;
            const descripcion = data.weather[0].description;
            const icono = data.weather[0].icon;

            climaInfoDiv.innerHTML = `
                <div class="flex items-center justify-center">
                    <img src="https://openweathermap.org/img/wn/${icono}.png" alt="Icono clima" class="w-12 h-12">
                    <p class="text-3xl font-bold ml-2">${temperatura.toFixed(1)}°C</p>
                </div>
                <p class="text-lg capitalize">${descripcion}</p>
            `;
        })
        .catch(error => {
            console.error('Error en index:', error);
            climaInfoDiv.innerHTML = `<p class="text-red-300">No se pudo cargar</p>`;
        });
}

function obtenerDatosClimaDetalle() {
    const climaDetalleDiv = document.getElementById('clima-detalle-info');
    const climaRecomendacionesDiv = document.getElementById('clima-recomendaciones');
    
    const urlDetalle = `${urlBaseClima}?q=Coquimbo,cl`;

    fetch(urlDetalle) 
        .then(response => response.json())
        .then(data => {
            if (data.cod !== 200) {
                throw new Error(data.message);
            }
            const { main, weather, wind, name } = data;
            const icono = weather[0].icon;

            climaDetalleDiv.innerHTML = `
                <div class="text-center mb-6">
                    <h2 class="text-4xl font-bold text-gray-800">${name}</h2>
                    <p class="text-2xl text-gray-600 capitalize">${weather[0].description}</p>
                    <img src="https://openweathermap.org/img/wn/${icono}@4x.png" alt="Icono clima" class="mx-auto">
                </div>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                    <div class="bg-blue-100 p-4 rounded-lg">
                        <p class="text-lg font-bold text-blue-800">Temperatura</p>
                        <p class="text-3xl">${main.temp.toFixed(1)}°C</p>
                    </div>
                    <div class="bg-green-100 p-4 rounded-lg">
                        <p class="text-lg font-bold text-green-800">Humedad</p>
                        <p class="text-3xl">${main.humidity}%</p>
                    </div>
                    <div class="bg-yellow-100 p-4 rounded-lg">
                        <p class="text-lg font-bold text-yellow-800">Viento</p>
                        <p class="text-3xl">${wind.speed} m/s</p>
                    </div>
                </div>
            `;

            const recomendacionTemp = generarRecomendacionTemperatura(main.temp);
            const recomendacionHumedad = generarRecomendacionHumedad(main.humidity);
            const recomendacionViento = generarRecomendacionViento(wind.speed);

            climaRecomendacionesDiv.innerHTML = `
                <div class="flex items-center bg-white p-6 rounded-lg shadow-md">
                    <img src="img/temp-icono.webp" alt="Icono Temperatura" class="w-16 h-16 mr-6">
                    <div>
                        <h4 class="font-bold text-xl text-gray-800">Temperatura</h4>
                        <p class="text-gray-600">${recomendacionTemp}</p>
                    </div>
                </div>

                <div class="flex items-center bg-white p-6 rounded-lg shadow-md">
                    <img src="img/humedad-icono.webp" alt="Icono Humedad" class="w-16 h-16 mr-6">
                    <div>
                        <h4 class="font-bold text-xl text-gray-800">Humedad</h4>
                        <p class="text-gray-600">${recomendacionHumedad}</p>
                    </div>
                </div>

                <div class="flex items-center bg-white p-6 rounded-lg shadow-md">
                    <img src="img/viento-icono.webp" alt="Icono Viento" class="w-16 h-16 mr-6">
                    <div>
                        <h4 class="font-bold text-xl text-gray-800">Viento</h4>
                        <p class="text-gray-600">${recomendacionViento}</p>
                    </div>
                </div>
            `;
        })
        .catch(error => {
            console.error('Error en detalle:', error);
            climaDetalleDiv.innerHTML = `<p class="text-red-500 text-center text-xl">No se pudieron cargar los datos del clima. Verifique su conexión</p>`;
        });
}

function generarRecomendacionTemperatura(temp) {
    if (temp < 10) {
        return "Hace frío. Se recomienda abrigarse para evitar contagios por frío. Debe tener cuidado con las superficies resbaladizas si hay heladas.";
    } else if (temp >= 10 && temp <= 20) {
        return "El clima está templado y agradable. Es ideal para salir a caminar o hacer actividades al aire libre.";
    } else {
        return "Es un día caluroso. Manténgase hidratado, utilice ropa ligera y no olvide el protector solar. Evite la exposición directa al sol en las horas de mayor calor.";
    }
}

function generarRecomendacionHumedad(humedad) {
    if (humedad < 50) {
        return `El ambiente está seco (${humedad}%). Beba suficiente agua para mantenerse hidratado. Puede notar la piel y los labios con resequedad.`;
    } else {
        return `Hay bastante humedad en el aire (${humedad}%). La sensación térmica puede ser mayor si hace calor. Tenga en consideración ventilar los espacios cerrados.`;
    }
}

function generarRecomendacionViento(velocidad) {
    if (velocidad < 5) { 
        return `Hay una brisa ligera (${velocidad} m/s). Es perfecto para actividades al aire libre sin que el viento sea una molestia.`;
    } else { 
        return `El viento es moderado a fuerte (${velocidad} m/s). Considere la precaución al realizar alguna actividad o asegurar objetos con posibilidad de volarse.`;
    }
}

function configurarFormularioBusquedaClima() {
    const formulario = document.getElementById('formulario-busqueda-clima');
    formulario.addEventListener('submit', function(e) {
        e.preventDefault();
        const ciudad = document.getElementById('ciudad-input').value.trim();
        const pais = document.getElementById('pais-input').value.trim();
        
        if (ciudad) {
            buscarClimaPorCiudad(ciudad, pais);
        }
    });
}

function buscarClimaPorCiudad(ciudad, pais = '') {
    const climaDetalleDiv = document.getElementById('clima-detalle-info');
    const climaRecomendacionesDiv = document.getElementById('clima-recomendaciones');
    
    climaDetalleDiv.innerHTML = '<p class="text-gray-500 text-center text-xl">Buscando datos del clima...</p>';
    climaRecomendacionesDiv.innerHTML = '';
    
    const query = pais ? `${ciudad},${pais}` : ciudad;
    const urlBusqueda = `${urlBaseClima}?q=${encodeURIComponent(query)}`;
    
    fetch(urlBusqueda)
        .then(response => response.json())
        .then(data => {
            if (data.cod !== 200) {
                throw new Error(data.message);
            }
            
            mostrarDatosClima(data, climaDetalleDiv, climaRecomendacionesDiv);
        })
        .catch(error => {
            console.error('Error al buscar clima:', error);
            climaDetalleDiv.innerHTML = `
                <div class="text-center">
                    <p class="text-red-500 text-xl mb-4">No se pudo encontrar la ciudad "${ciudad}"</p>
                    <p class="text-gray-600">Verifica que el nombre de la ciudad esté escrito correctamente.</p>
                    <p class="text-sm text-gray-500 mt-2">Ejemplos: Coquimbo,cl, Tokyo, Madrid,es</p>
                </div>
            `;
            climaRecomendacionesDiv.innerHTML = '';
        });
}

function mostrarDatosClima(data, climaDetalleDiv, climaRecomendacionesDiv) {
    const { main, weather, wind, name, sys } = data;
    const icono = weather[0].icon;
    const pais = sys.country;

    climaDetalleDiv.innerHTML = `
        <div class="text-center mb-6">
            <h2 class="text-4xl font-bold text-gray-800">${name}, ${pais}</h2>
            <p class="text-2xl text-gray-600 capitalize">${weather[0].description}</p>
            <img src="https://openweathermap.org/img/wn/${icono}@4x.png" alt="Icono clima" class="mx-auto">
        </div>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div class="bg-blue-100 p-4 rounded-lg">
                <p class="text-lg font-bold text-blue-800">Temperatura</p>
                <p class="text-3xl">${main.temp.toFixed(1)}°C</p>
            </div>
            <div class="bg-green-100 p-4 rounded-lg">
                <p class="text-lg font-bold text-green-800">Humedad</p>
                <p class="text-3xl">${main.humidity}%</p>
            </div>
            <div class="bg-yellow-100 p-4 rounded-lg">
                <p class="text-lg font-bold text-yellow-800">Viento</p>
                <p class="text-3xl">${wind.speed} m/s</p>
            </div>
        </div>
    `;

    const recomendacionTemp = generarRecomendacionTemperatura(main.temp);
    const recomendacionHumedad = generarRecomendacionHumedad(main.humidity);
    const recomendacionViento = generarRecomendacionViento(wind.speed);

    climaRecomendacionesDiv.innerHTML = `
        <div class="flex items-center bg-white p-6 rounded-lg shadow-md">
            <img src="img/temp-icono.webp" alt="Icono Temperatura" class="w-16 h-16 mr-6">
            <div>
                <h4 class="font-bold text-xl text-gray-800">Temperatura</h4>
                <p class="text-gray-600">${recomendacionTemp}</p>
            </div>
        </div>

        <div class="flex items-center bg-white p-6 rounded-lg shadow-md">
            <img src="img/humedad-icono.webp" alt="Icono Humedad" class="w-16 h-16 mr-6">
            <div>
                <h4 class="font-bold text-xl text-gray-800">Humedad</h4>
                <p class="text-gray-600">${recomendacionHumedad}</p>
            </div>
        </div>

        <div class="flex items-center bg-white p-6 rounded-lg shadow-md">
            <img src="img/viento-icono.webp" alt="Icono Viento" class="w-16 h-16 mr-6">
            <div>
                <h4 class="font-bold text-xl text-gray-800">Viento</h4>
                <p class="text-gray-600">${recomendacionViento}</p>
            </div>
        </div>
    `;
}