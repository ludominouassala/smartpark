// Configuração da API
const API_BASE_URL = 'http://localhost:8080/api';

const api = {
    // Tickets
    entrada: async (data) => {
        const response = await fetch(`${API_BASE_URL}/tickets/entrada`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        return response.json();
    },
    
    saida: async (ticketId) => {
        const response = await fetch(`${API_BASE_URL}/tickets/saida`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ticketId })
        });
        return response.json();
    },
    
    getTicket: async (id) => {
        const response = await fetch(`${API_BASE_URL}/tickets/${id}`);
        return response.json();
    },
    
    // Pagamentos
    pagar: async (ticketId) => {
        const response = await fetch(`${API_BASE_URL}/pagamentos/${ticketId}`, {
            method: 'POST'
        });
        return response.text();
    },
    
    // Vagas
    getVagas: async () => {
        const response = await fetch(`${API_BASE_URL}/vagas`);
        return response.json();
    },
    
    // Veículos
    getVeiculos: async () => {
        const response = await fetch(`${API_BASE_URL}/veiculos`);
        return response.json();
    },
    
    getVeiculoByPlaca: async (placa) => {
        const response = await fetch(`${API_BASE_URL}/veiculos/${placa}`);
        return response.json();
    }
};

// Funções auxiliares
function formatDateTime(dateTimeStr) {
    const date = new Date(dateTimeStr);
    return date.toLocaleString('pt-BR');
}

function formatCurrency(value) {
    return new Intl.NumberFormat('pt', {
        style: 'currency',
        currency: 'MZN'
    }).format(value);
}

function showAlert(message, type = 'success') {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} alert-dismissible fade show position-fixed top-0 end-0 m-3`;
    alertDiv.style.zIndex = '9999';
    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    document.body.appendChild(alertDiv);
    setTimeout(() => alertDiv.remove(), 3000);
}