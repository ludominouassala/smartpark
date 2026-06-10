// api.js - Comunicação com o backend SmartPark

const API_BASE_URL = 'http://localhost:8080/api';

// Função genérica POST (se algum script estiver chamando apiPost)
async function apiPost(endpoint, dados) {
    return apiRequest(endpoint, 'POST', dados);
}

// Função genérica GET
async function apiGet(endpoint) {
    return apiRequest(endpoint, 'GET');
}

// Função genérica para requisições
async function apiRequest(endpoint, method = 'GET', body = null) {
    const options = {
        method: method,
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        }
    };
    
    if (body) {
        options.body = JSON.stringify(body);
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
        
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText || `Erro HTTP ${response.status}`);
        }
        
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
            return await response.json();
        }
        return await response.text();
    } catch (error) {
        console.error(`Erro na API (${endpoint}):`, error);
        throw error;
    }
}

// ========== ENDPOINTS DO SMART PARK ==========

// Tickets
async function registrarEntrada(veiculo) {
    return apiRequest('/tickets/entrada', 'POST', veiculo);
}

async function registrarSaida(ticketId) {
    return apiRequest('/tickets/saida', 'POST', { ticketId: parseInt(ticketId) });
}

async function buscarTicket(ticketId) {
    return apiRequest(`/tickets/${ticketId}`, 'GET');
}

// Pagamentos
async function processarPagamento(ticketId) {
    return apiRequest(`/pagamentos/${ticketId}`, 'POST');
}

// Vagas
async function listarVagas() {
    return apiRequest('/vagas', 'GET');
}

// Veículos
async function listarVeiculos() {
    return apiRequest('/veiculos', 'GET');
}

async function buscarVeiculoPorPlaca(placa) {
    return apiRequest(`/veiculos/${placa}`, 'GET');
}

// Histórico
async function listarHistorico() {
    try {
        return await apiRequest('/historico', 'GET');
    } catch (error) {
        console.warn('Endpoint /historico não disponível ainda');
        return [];
    }
}