/*******************************************************
 * CONFIGURAÇÃO TAILWIND
 *******************************************************/
tailwind.config = {
    theme: {
        extend: {
            colors: {
                wood: {
                    light: '#f4f1ea',
                    base: '#d8cbbd',
                    dark: '#8c7a6b',
                    darkest: '#3e362e'
                },
                leaf: {
                    base: '#6b705c',
                    dark: '#4a4f3d'
                }
            },
            fontFamily: {
                sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
                serif: ['Merriweather', 'ui-serif', 'Georgia', 'serif'],
            }
        }
    }
}

/*******************************************************
 * INTEGRAÇÃO GEMINI API
 *******************************************************/
const apiKey = ""; 
const modelName = "gemini-2.5-flash-preview-09-2025";

const systemPrompt = `És um Consultor Criativo especialista da 'Fabrício Wood Arts'.
O teu objetivo é sugerir projetos de marcenaria baseados no manifesto da marca.
Valores: Alma da Madeira, Sustentabilidade, Arte do Tempo e Acabamento Natural.
Usa Português de Portugal.`;

async function callGemini(userPrompt) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;
    const payload = {
        contents: [{ parts: [{ text: userPrompt }] }],
        systemInstruction: { parts: [{ text: systemPrompt }] }
    };

    const maxRetries = 5;
    for (let i = 0; i < maxRetries; i++) {
        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            if (!response.ok) throw new Error('Falha na API');
            const data = await response.json();
            return data.candidates?.[0]?.content?.parts?.[0]?.text;
        } catch (error) {
            if (i === maxRetries - 1) throw error;
            await new Promise(res => setTimeout(res, Math.pow(2, i) * 1000));
        }
    }
}

const aiSubmit = document.getElementById('ai-submit');
const aiInput = document.getElementById('ai-prompt');
const aiLoader = document.getElementById('ai-loader');
const aiResultContainer = document.getElementById('ai-result-container');
const aiResultText = document.getElementById('ai-result-text');
const aiError = document.getElementById('ai-error');

if (aiSubmit) {
    aiSubmit.onclick = async () => {
        const prompt = aiInput.value.trim();
        if (!prompt) return;

        aiLoader.classList.remove('hidden');
        aiSubmit.disabled = true;
        aiError.classList.add('hidden');
        aiResultContainer.classList.add('hidden');

        try {
            const result = await callGemini(prompt);
            aiResultText.textContent = result;
            aiResultContainer.classList.remove('hidden');
            aiResultContainer.scrollIntoView({ behavior: 'smooth' });
        } catch (error) {
            aiError.textContent = "Erro ao contactar o consultor. Tente novamente.";
            aiError.classList.remove('hidden');
        } finally {
            aiLoader.classList.add('hidden');
            aiSubmit.disabled = false;
        }
    };
}

/*******************************************************
 * EXPLORADOR E GRÁFICOS
 *******************************************************/
const manifestoData = [
    { id: 'alma', title: '1. A Alma da Madeira', icon: '&#127807;', content: '<h4 class="text-2xl font-serif font-bold text-wood-darkest mb-4">A Alma da Madeira</h4><p class="text-lg">Celebramos a perfeição orgânica dos nós e texturas únicas.</p>' },
    { id: 'origem', title: '2. O Respeito à Origem', icon: '&#9851;', content: '<h4 class="text-2xl font-serif font-bold text-wood-darkest mb-4">Sustentabilidade</h4><p class="text-lg">Madeira de manejo ou reuso. Criamos para durar gerações.</p>' },
    { id: 'tempo', title: '3. A Arte do Tempo', icon: '&#8987;', content: '<h4 class="text-2xl font-serif font-bold text-wood-darkest mb-4">A Arte do Tempo</h4><p class="text-lg italic">"O fazer manual é um ritual de paciência."</p>' },
    { id: 'acabamento', title: '4. O Acabamento', icon: '&#10024;', content: '<h4 class="text-2xl font-serif font-bold text-wood-darkest mb-4">Acabamento Natural</h4><p class="text-lg">Utilizamos óleos e ceras naturais que deixam a madeira respirar.</p>' },
    { id: 'compromisso', title: '5. Nosso Compromisso', icon: '&#129309;', content: '<h4 class="text-2xl font-serif font-bold text-wood-darkest mb-4">Compromisso Ético</h4><p class="text-lg">Arte e consciência caminham juntas em cada projeto.</p>' }
];

const navContainer = document.getElementById('nav-container');
const contentDisplay = document.getElementById('content-display');

function showTab(index) {
    document.querySelectorAll('.nav-btn').forEach((btn, i) => btn.classList.toggle('active', i === index));
    contentDisplay.innerHTML = manifestoData[index].content;
}

function init() {
    if (navContainer) {
        manifestoData.forEach((item, index) => {
            const btn = document.createElement('button');
            btn.className = `nav-btn w-full text-left px-6 py-4 rounded font-bold flex items-center gap-3 bg-wood-light text-wood-darkest transition-all`;
            btn.innerHTML = `<span>${item.icon}</span> <span>${item.title}</span>`;
            btn.onclick = () => showTab(index);
            navContainer.appendChild(btn);
        });
        showTab(0);
    }

    // Charts
    const commonOptions = { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } };
    
    const wasteCtx = document.getElementById('wasteChart');
    if (wasteCtx) {
        new Chart(wasteCtx, {
            type: 'doughnut',
            data: { labels: ['Móveis', 'Decoração', 'Natureza'], datasets: [{ data: [75, 20, 5], backgroundColor: ['#8c7a6b', '#c2b29f', '#6b705c'] }] },
            options: commonOptions
        });
    }

    const radarCtx = document.getElementById('radarChart');
    if (radarCtx) {
        new Chart(radarCtx, {
            type: 'radar',
            data: {
                labels: ['Sustentabilidade', 'Exclusividade', 'Durabilidade', 'Toque Natural', 'Escala'],
                datasets: [{ label: 'Nossa Oficina', data: [100, 100, 95, 100, 10], backgroundColor: 'rgba(107, 112, 92, 0.4)', borderColor: '#6b705c' }]
            },
            options: { ...commonOptions, scales: { r: { ticks: { display: false }, min: 0, max: 100 } } }
        });
    }
}

window.onload = init;