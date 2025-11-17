window.API_CONFIG = {
    NEST_COINS_BASE: 'http://localhost:3000/coins',
    FASTAPI_WEATHER: 'http://localhost:8001/weather',
    EXPRESS_NEWS_BASE: 'http://localhost:3001/noticias'
};

(function adaptForDevice() {
    try {
        const ua = navigator.userAgent || '';
        if (/Android/i.test(ua) && location.hostname !== 'localhost') {
            window.API_CONFIG.NEST_COINS_BASE = window.API_CONFIG.NEST_COINS_BASE.replace('localhost', '10.0.2.2');
            window.API_CONFIG.FASTAPI_WEATHER = window.API_CONFIG.FASTAPI_WEATHER.replace('localhost', '10.0.2.2');
        }
    } catch (e) {
        console.warn('api-config adaptForDevice error', e);
    }
})();
