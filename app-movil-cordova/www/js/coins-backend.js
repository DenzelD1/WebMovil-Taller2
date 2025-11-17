document.addEventListener('DOMContentLoaded', () => {
    const base = (window.API_CONFIG && window.API_CONFIG.NEST_COINS_BASE) ? window.API_CONFIG.NEST_COINS_BASE : null;
    const container = document.getElementById('local-coins-container');
    const loading = document.getElementById('local-coins-loading');

    if (!container) return;
    if (!base) {
        loading.textContent = 'API local no configurada.';
        return;
    }

    async function fetchLocalCoins() {
        try {
            const res = await fetch(base);
            if (!res.ok) throw new Error('API local no disponible');
            const coins = await res.json();

            if (!Array.isArray(coins) || coins.length === 0) {
                loading.textContent = 'No hay monedas registradas en la API local.';
                return;
            }

            loading.remove();

            const createFormHtml = `
                <form id="create-coin-form" class="mb-4 p-4 bg-white rounded-xl shadow flex flex-col sm:flex-row gap-3 items-end">
                    <div class="flex-1">
                        <label class="block text-sm text-gray-600 mb-1">Nombre*</label>
                        <input id="cc-name" type="text" class="w-full border rounded px-3 py-2" required />
                    </div>
                    <div class="w-full sm:w-32">
                        <label class="block text-sm text-gray-600 mb-1">Símbolo</label>
                        <input id="cc-symbol" type="text" class="w-full border rounded px-3 py-2" />
                    </div>
                    <div class="w-full sm:w-36">
                        <label class="block text-sm text-gray-600 mb-1">Precio*</label>
                        <input id="cc-price" type="number" step="0.01" min="0" class="w-full border rounded px-3 py-2" required />
                    </div>
                    <div class="w-full sm:w-40">
                        <label class="block text-sm text-gray-600 mb-1">Tendencia*</label>
                        <select id="cc-trend" class="w-full border rounded px-3 py-2" required>
                            <option value="up">Sube</option>
                            <option value="down">Baja</option>
                            <option value="stable">Estable</option>
                        </select>
                    </div>
                    <button type="submit" class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Crear moneda</button>
                </form>`;
            container.insertAdjacentHTML('beforebegin', createFormHtml);

            container.innerHTML = coins.map(c => {
                const img = c.imageUrl ? c.imageUrl : 'img/crypto.jpeg';
                const price = typeof c.price === 'number' ? `${c.price.toFixed(2)}` : 'N/A';
                return `
                    <article class="bg-white rounded-xl shadow-lg p-4 flex flex-col items-start">
                        <img src="${img}" alt="${c.name}" class="w-20 h-20 object-contain mb-3">
                        <h4 class="font-bold text-lg text-gray-900">${c.name}</h4>
                        <p class="text-sm text-gray-600">${(c.symbol||'').toUpperCase()}</p>
                        <p class="mt-2 font-semibold text-indigo-600">${price}</p>
                        <a href="#" data-id="${c.id}" class="mt-3 inline-block text-sm text-blue-600 hover:underline view-local-coin">Ver</a>
                    </article>
                `;
            }).join('');

            async function postCoin(payload) {
                const res = await fetch(base.replace(/\/$/, ''), {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
                if (!res.ok) {
                    const t = await res.text().catch(()=> '');
                    throw new Error(`HTTP ${res.status} ${t}`);
                }
                return res.json();
            }

            const form = document.getElementById('create-coin-form');
            form.addEventListener('submit', async (e) => {
                e.preventDefault();
                const name = document.getElementById('cc-name').value.trim();
                const symbol = document.getElementById('cc-symbol').value.trim();
                const priceVal = document.getElementById('cc-price').value.trim();
                const trend = document.getElementById('cc-trend').value;
                const price = parseFloat(priceVal);
                if (!name || isNaN(price)) {
                    alert('Nombre y precio son obligatorios.');
                    return;
                }
                const payload = { name, price, trend };
                if (symbol) payload.symbol = symbol;
                try {
                    const created = await postCoin(payload);
                    const img = created.imageUrl ? created.imageUrl : 'img/crypto.jpeg';
                    const priceStr = typeof created.price === 'number' ? `${created.price.toFixed(2)}` : 'N/A';
                    const card = `
                        <article class="bg-white rounded-xl shadow-lg p-4 flex flex-col items-start">
                            <img src="${img}" alt="${created.name}" class="w-20 h-20 object-contain mb-3">
                            <h4 class="font-bold text-lg text-gray-900">${created.name}</h4>
                            <p class="text-sm text-gray-600">${(created.symbol||'').toUpperCase()}</p>
                            <p class="mt-2 font-semibold text-indigo-600">${priceStr}</p>
                            <a href="#" data-id="${created.id}" class="mt-3 inline-block text-sm text-blue-600 hover:underline view-local-coin">Ver</a>
                        </article>`;
                    container.insertAdjacentHTML('afterbegin', card);
                    form.reset();
                    alert('Moneda creada');
                } catch (err) {
                    console.error('Error creando moneda', err);
                    alert('Error creando moneda: ' + err.message);
                }
            });

            async function fetchCoinById(id) {
                const url = `${base.replace(/\/$/, '')}/${id}`;
                const res = await fetch(url);
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                return res.json();
            }

            function openCoinModal(c) {
                const overlay = document.createElement('div');
                overlay.className = 'fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50';
                const box = document.createElement('div');
                box.className = 'bg-white rounded-2xl shadow-2xl max-w-xl w-full overflow-hidden';
                const trendColor = c.trend === 'up' ? 'text-green-600' : (c.trend === 'down' ? 'text-red-600' : 'text-gray-600');
                const img = c.imageUrl || 'img/crypto.jpeg';
                const symbol = (c.symbol || '').toUpperCase();
                const created = c.createdAt ? new Date(c.createdAt).toLocaleString() : '—';
                const updated = c.updatedAt ? new Date(c.updatedAt).toLocaleString() : '—';
                const priceStr = typeof c.price === 'number' ? `${c.price.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : 'N/A';
                box.innerHTML = `
                    <header class="bg-blue-600 text-white p-4 flex items-center justify-between">
                        <h3 class="text-xl font-bold">${c.name}</h3>
                        <button id="coin-modal-close" class="p-2 hover:bg-white/20 rounded">✕</button>
                    </header>
                    <div class="p-6 space-y-6">
                        <div class="flex items-center gap-4">
                            <img src="${img}" alt="${c.name}" class="w-16 h-16 object-contain rounded"/>
                            <div>
                                <p class="text-gray-900 font-semibold">${c.name} <span class="text-gray-500 font-medium">${symbol}</span></p>
                                <p class="text-lg font-bold">${priceStr}</p>
                                <p class="${trendColor} text-sm capitalize">Tendencia: ${c.trend}</p>
                            </div>
                        </div>
                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-700">
                            <div class="p-4 bg-gray-50 rounded-xl">
                                <p class="font-medium text-gray-500">Creado</p>
                                <p>${created}</p>
                            </div>
                            <div class="p-4 bg-gray-50 rounded-xl">
                                <p class="font-medium text-gray-500">Actualizado</p>
                                <p>${updated}</p>
                            </div>
                        </div>
                        <div class="text-right">
                            <button id="coin-modal-close-bottom" class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Cerrar</button>
                        </div>
                    </div>
                `;
                overlay.appendChild(box);
                document.body.appendChild(overlay);
                function close() { document.body.removeChild(overlay); }
                overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });
                box.querySelector('#coin-modal-close').addEventListener('click', close);
                box.querySelector('#coin-modal-close-bottom').addEventListener('click', close);
            }

            container.addEventListener('click', async (e) => {
                const a = e.target.closest('.view-local-coin');
                if (!a) return;
                e.preventDefault();
                const id = a.getAttribute('data-id');
                try {
                    const coin = await fetchCoinById(id);
                    openCoinModal(coin);
                } catch (err) {
                    console.error('No se pudo obtener la moneda', err);
                    alert('No se pudo obtener la información de la moneda.');
                }
            });

        } catch (err) {
            console.error('Error fetching local coins:', err);
            loading.textContent = 'No se pudo conectar con la API local.';
        }
    }

    fetchLocalCoins();
});
