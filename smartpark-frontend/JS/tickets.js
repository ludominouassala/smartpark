// js/tickets.js
let currentQRCode = null;

async function carregarTicketsAtivos() {
    try {
        // Simulação - idealmente teria endpoint GET /api/tickets?status=ATIVO
        const vagas = await api.getVagas();
        const vagasOcupadas = vagas.filter(v => v.status === 'OCUPADA');
        
        const container = document.getElementById('ticketsAtivosList');
        container.innerHTML = '';
        
        if (vagasOcupadas.length === 0) {
            container.innerHTML = '<div class="alert alert-info">Nenhum ticket ativo no momento</div>';
            return;
        }
        
        vagasOcupadas.forEach((vaga, index) => {
            const ticketCard = document.createElement('div');
            ticketCard.className = 'card ticket-card';
            ticketCard.innerHTML = `
                <div class="card-body">
                    <h5 class="card-title">Ticket #${index + 1}</h5>
                    <p><strong>Vaga:</strong> ${vaga.codigo} | <strong>Tipo:</strong> ${vaga.tipo}</p>
                    <p><strong>Status:</strong> <span class="status-ativo">ATIVO</span></p>
                    <button class="btn btn-sm btn-warning" onclick="registrarSaida(${index + 1})">
                        <i class="fas fa-qrcode"></i> Gerar QR Code
                    </button>
                </div>
            `;
            container.appendChild(ticketCard);
        });
    } catch (error) {
        showAlert('Erro ao carregar tickets', 'danger');
    }
}

async function registrarSaida(ticketId) {
    if (!ticketId) {
        ticketId = document.getElementById('ticketIdSaida').value;
        if (!ticketId) {
            showAlert('Informe o ID do ticket', 'warning');
            return;
        }
    }
    
    try {
        const response = await api.saida(parseInt(ticketId));
        currentQRCode = response;
        
        document.getElementById('qrcodeContent').innerHTML = `
            <div class="text-center">
                <div class="qrcode-modal mb-3">
                    <strong>QR Code Simulado:</strong><br>
                    ${response.qrCodeData}
                </div>
                <p><strong>Ticket ID:</strong> ${response.ticketId}</p>
                <p><strong>Valor:</strong> ${formatCurrency(response.valor)}</p>
                <p><strong>URL Pagamento:</strong><br>
                <small class="text-break">${response.urlPagamento}</small></p>
            </div>
        `;
        
        const modal = new bootstrap.Modal(document.getElementById('qrcodeModal'));
        modal.show();
        
    } catch (error) {
        showAlert('Erro ao registrar saída', 'danger');
    }
}

async function confirmarPagamento() {
    if (!currentQRCode) return;
    
    try {
        const response = await api.pagar(currentQRCode.ticketId);
        showAlert(response, 'success');
        
        // Fechar modal e recarregar
        bootstrap.Modal.getInstance(document.getElementById('qrcodeModal')).hide();
        setTimeout(() => carregarTicketsAtivos(), 1000);
        
    } catch (error) {
        showAlert('Erro no pagamento', 'danger');
    }
}

carregarTicketsAtivos();