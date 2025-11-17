(function(){
    const defaultBase = (window.API_CONFIG && window.API_CONFIG.FASTAPI_WEATHER) || 'http://localhost:8001/weather';

    function buildUrl(base, q) {
        try {
            const u = new URL(base);
            const path = u.pathname.replace(/\/$/, '');
            const origin = u.origin;
            return `${origin}${path}?q=${encodeURIComponent(q)}`;
        } catch (e) {
            return `${base.replace(/\/$/, '')}?q=${encodeURIComponent(q)}`;
        }
    }

    async function callWeather(q) {
        const url = buildUrl(defaultBase, q);
        const res = await fetch(url);
        if (!res.ok) {
            const text = await res.text().catch(()=>'');
            throw new Error(`HTTP ${res.status} ${text}`);
        }
        const data = await res.json();
        return data;
    }

    function renderResult(container, data) {
        if (!data || data.cod !== 200) {
            container.innerHTML = `<p class="text-red-500">No se encontró la ciudad o hubo un error: ${data && data.message ? data.message : 'error'}</p>`;
            return;
        }
        const temp = data.main.temp;
        const desc = data.weather[0].description;
        const icon = data.weather[0].icon;
        const name = data.name;
        const country = data.sys && data.sys.country ? data.sys.country : '';

        container.innerHTML = `
            <div class="flex items-center gap-4">
                <img src="https://openweathermap.org/img/wn/${icon}.png" alt="icono" class="w-12 h-12">
                <div>
                    <div class="font-bold text-lg">${name}${country ? ', ' + country : ''}</div>
                    <div class="text-gray-600">${desc} · ${temp.toFixed(1)}°C</div>
                </div>
            </div>
        `;
    }

    function init() {
        const form = document.getElementById('clima-backend-form');
        const input = document.getElementById('clima-backend-input');
        const result = document.getElementById('clima-backend-result');
        if (!form || !input || !result) return;

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            result.innerHTML = '<p class="text-gray-500">Buscando...</p>';
            const q = input.value.trim();
            if (!q) {
                result.innerHTML = '<p class="text-red-500">Ingrese una ciudad válida.</p>';
                return;
            }
            try {
                const data = await callWeather(q);
                renderResult(result, data);
            } catch (err) {
                console.error('clima-backend-only error', err);
                result.innerHTML = `<p class="text-red-500">Error al conectar con el backend: ${err.message}</p>`;
            }
        });
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
    else init();
})();
