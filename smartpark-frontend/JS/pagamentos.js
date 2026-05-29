// js/pagamentos.js
async function carregarPagamentos() {
    try {
        // Simulação de pagamentos (endpoint específico seria ideal)
        const container = document.getElementById('pagamentosList');
        container.innerHTML = '<div class="loading">Carregando pagamentos...</div>';
        
        // Simular alguns pagamentos
        setTimeout(() => {
            const pagamentos = [
                { id: 1, ticketId: 101, valor: 15.00, data: new Date(), status: 'PAGO' },
                { id: 2, ticketId: 102, valor: 10.00, data: new Date(), status: 'PAGO' }
            ];
            
            if (pagamentos.length === 0) {
                container.innerHTML = '<div class="alert alert-info">Nenhum pagamento registrado</div>';
                return;
            }
            
            container.innerHTML = `
                <div class="table-responsive">
                    <table class="table table-striped">
                        <thead>
                            <tr><th>ID</th><th>Ticket</th><th>Valor</th><th>Data</th><th>Status</th></tr>
                        </thead>
                        <tbody>
                            ${pagamentos.map(p => `
                                <tr>
                                    <td>${p.id}</td>
                                    <td>${p.ticketId}</td>
                                    <td>${formatCurrency(p.valor)}</td>
                                    <td>${formatDateTime(p.data)}</td>
                                    <td><span class="badge bg-success">${p.status}</span></td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            `;
        }, 1000);
        
    } catch (error) {
        showAlert('Erro ao carregar pagamentos', 'danger');
    }
}

carregarPagamentos();