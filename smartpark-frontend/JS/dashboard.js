// Dashboard principal
async function carregarDashboard() {
    try {
        const vagas = await api.getVagas();
        const totalVagas = vagas.length;
        const vagasLivres = vagas.filter(v => v.status === 'LIVRE').length;
        const vagasOcupadas = vagas.filter(v => v.status === 'OCUPADA').length;
        
        document.getElementById('totalVagas').textContent = totalVagas;
        document.getElementById('vagasLivres').textContent = vagasLivres;
        document.getElementById('vagasOcupadas').textContent = vagasOcupadas;
        
        // Carregar mapa de vagas
        renderMapaVagas(vagas);
        
        // Carregar últimos tickets (simulado - precisaria de endpoint específico)
        // Por enquanto, vamos buscar todos os veículos e simular
        const veiculos = await api.getVeiculos();
        document.getElementById('ticketsAtivos').textContent = Math.floor(Math.random() * 10);
        
        // Simular últimas entradas
        renderUltimasEntradas(veiculos.slice(0, 5));
        
    } catch (error) {
        console.error('Erro ao carregar dashboard:', error);
        showAlert('Erro ao carregar dados do dashboard', 'danger');
    }
}

function renderMapaVagas(vagas) {
    const container = document.getElementById('mapaVagas');
    container.innerHTML = '';
    
    vagas.forEach(vaga => {
        const vagaDiv = document.createElement('div');
        vagaDiv.className = `vaga-card ${vaga.status === 'LIVRE' ? 'vaga-livre' : 'vaga-ocupada'}`;
        vagaDiv.innerHTML = `
            <strong>${vaga.codigo}</strong><br>
            <small>${vaga.tipo}</small><br>
            <small>${vaga.status === 'LIVRE' ? '🟢 Livre' : '🔴 Ocupada'}</small>
        `;
        container.appendChild(vagaDiv);
    });
}

function renderUltimasEntradas(veiculos) {
    const tbody = document.querySelector('#ultimasEntradasTable tbody');
    tbody.innerHTML = '';
    
    veiculos.forEach(veiculo => {
        const row = tbody.insertRow();
        row.insertCell(0).textContent = veiculo.placa;
        row.insertCell(1).textContent = `Vaga ${Math.floor(Math.random() * 20) + 1}`;
        row.insertCell(2).textContent = formatDateTime(veiculo.dataCadastro);
    });
}

// Registrar entrada
document.getElementById('entradaForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const data = {
        placa: document.getElementById('placa').value.toUpperCase(),
        modelo: document.getElementById('modelo').value,
        cor: document.getElementById('cor').value,
        tipoVeiculo: document.getElementById('tipoVeiculo').value
    };
    
    try {
        const result = await api.entrada(data);
        showAlert(`Entrada registrada! Ticket #${result.id} - Vaga ${result.vaga?.codigo || 'N/A'}`, 'success');
        document.getElementById('entradaForm').reset();
        setTimeout(() => location.reload(), 2000);
    } catch (error) {
        showAlert('Erro ao registrar entrada. Vagas esgotadas?', 'danger');
    }
});

// Atualizar relógio
function updateDateTime() {
    const now = new Date();
    document.getElementById('currentDateTime').textContent = now.toLocaleString('pt-BR');
}
setInterval(updateDateTime, 1000);
updateDateTime();

// Inicializar
carregarDashboard();