(function(){
    // Client for news backend: uses POST /noticias to create; stores created items in localStorage
    const STORAGE_KEY = 'mis_noticias';
    const defaultBase = (window.API_CONFIG && window.API_CONFIG.EXPRESS_NEWS_BASE) || 'http://localhost:3001/noticias';

    function buildUrl(base) {
        try {
            const u = new URL(base);
            return u.origin + u.pathname.replace(/\/$/, '');
        } catch(e) {
            return base.replace(/\/$/, '');
        }
    }

    function getStored() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            return raw ? JSON.parse(raw) : [];
        } catch (e) { return []; }
    }

    function setStored(list) {
        try { localStorage.setItem(STORAGE_KEY, JSON.stringify(list)); } catch(e){}
    }

    function renderList(container) {
        const list = getStored();
        if (!list.length) {
            container.innerHTML = '<p class="text-gray-500">No hay noticias guardadas localmente.</p>';
            return;
        }
        container.innerHTML = '';
        for (const item of list.slice().reverse()) {
            const el = document.createElement('article');
            el.className = 'p-4 border rounded bg-gray-50';
            const img = item.imagen_url ? `<img src="${item.imagen_url}" alt="" class="w-full h-40 object-cover rounded mb-2">` : '';
            const keywords = item.keywords ? `<p class="text-sm text-gray-500">${(item.keywords || []).join(', ')}</p>` : '';
            el.innerHTML = `
                ${img}
                <h4 class="font-bold text-lg">${item.titulo}</h4>
                <p class="text-gray-700">${item.descripcion}</p>
                ${keywords}
                <p class="mt-2"><a class="text-blue-600 underline" href="${item.noticia_url}" target="_blank">Leer noticia original</a></p>
            `;
            container.appendChild(el);
        }
    }

    async function createNoticia(payload) {
        const url = buildUrl(defaultBase);
        const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const data = await res.json().catch(()=>null);
        if (!res.ok) throw new Error((data && data.message) || `HTTP ${res.status}`);
        // backend returns { message, data }
        return data && data.data ? data.data : data;
    }

    function toServerPayload(form) {
        const titulo = form.querySelector('#mn-titulo').value.trim();
        const descripcion = form.querySelector('#mn-descripcion').value.trim();
        const noticiaUrl = form.querySelector('#mn-noticiaUrl').value.trim();
        const imagenUrl = form.querySelector('#mn-imagenUrl').value.trim();
        const keywordsRaw = form.querySelector('#mn-keywords').value.trim();
        const keywords = keywordsRaw ? keywordsRaw.split(',').map(s=>s.trim()).filter(Boolean) : [];
        return { titulo, descripcion, noticiaUrl, imagenUrl: imagenUrl || undefined, keywords };
    }

    function normalizeServerRow(row) {
        return row;
    }

    function init() {
        const form = document.getElementById('mis-noticias-form');
        const listContainer = document.getElementById('mis-noticias-list');
        const refreshBtn = document.getElementById('mn-refresh');
        if (!form || !listContainer) return;

        renderList(listContainer);

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const payload = toServerPayload(form);
            if (!payload.titulo || !payload.descripcion || !payload.noticiaUrl || !payload.keywords.length) {
                alert('Por favor complete título, descripción, URL y al menos 1 keyword.');
                return;
            }
            try {
                const created = await createNoticia(payload);
                const normalized = normalizeServerRow(created || payload);
                const stored = getStored();
                stored.push(normalized);
                setStored(stored);
                renderList(listContainer);
                form.reset();
                alert('Noticia creada y guardada (respuesta del backend).');
            } catch (err) {
                console.error('Error creando noticia', err);
                alert('Error al crear noticia: ' + err.message);
            }
        });

        refreshBtn && refreshBtn.addEventListener('click', () => renderList(listContainer));
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
    else init();
})();
