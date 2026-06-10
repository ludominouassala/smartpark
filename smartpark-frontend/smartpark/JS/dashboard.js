// dashboard.js - Funcionalidades da página inicial

// Atualizar dashboard completo
async function atualizarDashboard() {
    try {
        const vagas = await listarVagas();
        
        // Estatísticas
        const totalVagas = vagas.length;
        const vagasLivres = vagas.filter(v => v.status === 'LIVRE').length;
        const vagasOcupadas = vagas.filter(v => v.status === 'OCUPADA').length;
        
        const totalEl = document.getElementById('totalVagas');
        const livresEl = document.getElementById('vagasLivres');
        const ocupadasEl = document.getElementById('vagasOcupadas');
        
        if (totalEl) totalEl.textContent = totalVagas;
        if (livresEl) livresEl.textContent = vagasLivres;
        if (ocupadasEl) ocupadasEl.textContent = vagasOcupadas;
        
        // Buscar histórico de tickets
        try {
            const historico = await listarHistorico();
            const ticketsAtivos = historico.filter(t => t.status === 'ATIVO').length;
            const ativosEl = document.getElementById('ticketsAtivos');
            const countEl = document.getElementById('entradas-count');
            
            if (ativosEl) ativosEl.textContent = ticketsAtivos;
            if (countEl) countEl.textContent = historico.length;
            
            // Carregar últimas 5 entradas (mais recentes primeiro)
            const ultimasEntradas = [...historico]
                .sort((a, b) => new Date(b.dataHoraEntrada) - new Date(a.dataHoraEntrada))
                .slice(0, 5);
            
            carregarUltimasEntradas(ultimasEntradas);
            
        } catch (e) {
            console.warn('Erro ao buscar histórico:', e);
            const ativosEl = document.getElementById('ticketsAtivos');
            const countEl = document.getElementById('entradas-count');
            if (ativosEl) ativosEl.textContent = '0';
            if (countEl) countEl.textContent = '0';
            carregarUltimasEntradas([]);
        }
        
        // Renderizar mapa de vagas
        renderizarMapaVagas(vagas);
        
    } catch (error) {
        console.error('Erro ao carregar dashboard:', error);
        exibirToast('Erro ao carregar dados do servidor. Verifique se o backend está rodando.', 'danger');
    }
}

// Renderizar grid de vagas
function renderizarMapaVagas(vagas) {
    const container = document.getElementById('mapaVagas');
    if (!container) return;
    
    if (!vagas || vagas.length === 0) {
        container.innerHTML = '<div class="sp-loading">Nenhuma vaga encontrada</div>';
        return;
    }
    
    container.innerHTML = '';
    
    vagas.forEach(vaga => {
        const card = document.createElement('div');
        card.className = `vaga-card ${vaga.status === 'LIVRE' ? 'livre' : 'ocupada'}`;
        card.title = `Vaga ${vaga.codigo} - ${vaga.status}`;
        card.innerHTML = `
            <div class="vaga-codigo">${vaga.codigo}</div>
            <div class="vaga-status">${vaga.status === 'LIVRE' ? 'LIVRE' : 'OCUPADA'}</div>
            <div class="vaga-tipo">${vaga.tipo || 'NORMAL'}</div>
        `;
        container.appendChild(card);
    });
}

// Carregar tabela de últimas entradas
function carregarUltimasEntradas(entradas) {
    const tbody = document.getElementById('ultimasEntradasBody');
    if (!tbody) return;
    
    if (!entradas || entradas.length === 0) {
        tbody.innerHTML = '<tr><td colspan="3" style="text-align:center; color:#6c757d;">Nenhuma entrada registrada</td></tr>';
        return;
    }
    
    tbody.innerHTML = entradas.map(ticket => `
        <tr>
            <td><strong>${ticket.placa || '-'}</strong></td>
            <td>${ticket.vagaCodigo || '-'}</td>
            <td>${formatarDataHora(ticket.dataHoraEntrada)}</td>
        </tr>
    `).join('');
}

// Formatar data/hora
function formatarDataHora(dataHora) {
    if (!dataHora) return '-';
    try {
        const data = new Date(dataHora);
        return data.toLocaleString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    } catch {
        return dataHora.substring(0, 16).replace('T', ' ');
    }
}

// Registrar entrada via formulário
async function registrarEntradaVeiculo(event) {
    event.preventDefault();
    
    const placa = document.getElementById('placa')?.value.trim().toUpperCase();
    const modelo = document.getElementById('modelo')?.value;
    const cor = document.getElementById('cor')?.value;
    const tipoVeiculo = document.getElementById('tipoVeiculo')?.value;
    
    if (!placa) {
        exibirToast('Por favor, informe a placa do veículo', 'warning');
        return;
    }
    
    const submitBtn = event.submitter;
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processando...';
    submitBtn.disabled = true;
    
    try {
        const resultado = await registrarEntrada({ placa, modelo, cor, tipoVeiculo });
        
        exibirToast(`✅ Entrada registrada! Ticket: ${resultado.id} | Vaga: ${resultado.vagaCodigo}`, 'success');
        
        // Limpar formulário
        document.getElementById('placa').value = '';
        document.getElementById('modelo').value = '';
        document.getElementById('cor').value = '';
        
        // Atualizar dashboard
        setTimeout(() => atualizarDashboard(), 500);
        
    } catch (error) {
        exibirToast(`❌ Erro: ${error.message}`, 'danger');
    } finally {
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }
}

// Sistema de toast notifications
function exibirToast(mensagem, tipo = 'info') {
    let toastContainer = document.getElementById('toastContainer');
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.id = 'toastContainer';
        toastContainer.style.cssText = 'position:fixed;bottom:20px;right:20px;z-index:9999;max-width:350px;';
        document.body.appendChild(toastContainer);
        
        // Adicionar animação CSS
        if (!document.getElementById('toastStyle')) {
            const style = document.createElement('style');
            style.id = 'toastStyle';
            style.textContent = `
                @keyframes slideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
            `;
            document.head.appendChild(style);
        }
    }
    
    const bgColor = tipo === 'success' ? '#28a745' : tipo === 'danger' ? '#dc3545' : tipo === 'warning' ? '#ffc107' : '#17a2b8';
    const icon = tipo === 'success' ? 'fa-check-circle' : tipo === 'danger' ? 'fa-exclamation-circle' : 'fa-info-circle';
    
    const toast = document.createElement('div');
    toast.style.cssText = `background:${bgColor};color:white;padding:12px 20px;border-radius:8px;margin-bottom:10px;box-shadow:0 4px 12px rgba(0,0,0,0.15);animation:slideIn 0.3s ease;display:flex;align-items:center;gap:10px;z-index:10000;`;
    toast.innerHTML = `<i class="fas ${icon}"></i><div style="flex:1">${mensagem}</div><i class="fas fa-times" style="cursor:pointer" onclick="this.parentElement.remove()"></i>`;
    
    toastContainer.appendChild(toast);
    
    setTimeout(() => {
        if (toast.parentElement) toast.remove();
    }, 5000);
}

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    atualizarDashboard();
    
    const form = document.getElementById('entradaForm');
    if (form) {
        form.addEventListener('submit', registrarEntradaVeiculo);
    }
});