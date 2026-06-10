// pagamentos.js - Página de Pagamentos Realizados

// Carregar todos os pagamentos do histórico
async function carregarPagamentos() {
    const container = document.getElementById('pagamentosList');
    if (!container) return;
    
    container.innerHTML = `<div class="sp-loading"><div class="sp-spinner"></div><p>Carregando pagamentos...</p></div>`;

    try {
        // Buscar histórico completo
        const historico = await listarHistorico();
        
        // Filtrar apenas tickets FINALIZADOS (pagamentos realizados)
        const pagamentos = historico.filter(t => t.status === 'FINALIZADO' || t.status === 'PAGO');
        
        if (!pagamentos || pagamentos.length === 0) {
            container.innerHTML = `
                <div class="sp-empty-state">
                    <i class="fas fa-credit-card"></i>
                    <p>Nenhum pagamento realizado ainda</p>
                    <small>Quando um pagamento for processado, aparecerá aqui</small>
                </div>
            `;
            // Atualizar cards com zeros
            atualizarCardsResumo([]);
            return;
        }
        
        // Ordenar por data de entrada (mais recente primeiro)
        pagamentos.sort((a, b) => new Date(b.dataHoraEntrada) - new Date(a.dataHoraEntrada));
        
        // Renderizar tabela de pagamentos
        container.innerHTML = `
            <div class="sp-table-wrap">
                <table class="sp-table">
                    <thead>
                        <tr>
                            <th>Ticket</th>
                            <th>Placa</th>
                            <th>Vaga</th>
                            <th>Entrada</th>
                            <th>Saída</th>
                            <th>Tempo</th>
                            <th>Valor</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${pagamentos.map(p => {
                            const tempo = calcularTempo(p.dataHoraEntrada, p.dataHoraSaida);
                            return `
                                <tr>
                                    <td><span class="sp-badge sp-badge-dark">#${p.id}</span></td>
                                    <td><strong>${p.placa || '-'}</strong></td>
                                    <td>${p.vagaCodigo || '-'}</td>
                                    <td>${formatarData(p.dataHoraEntrada)}</td>
                                    <td>${formatarData(p.dataHoraSaida)}</td>
                                    <td>${tempo}</td>
                                    <td class="valor-pago">R$ ${(p.valorPago || p.valorCalculado || 0).toFixed(2).replace('.', ',')}</td>
                                    <td><span class="status-badge status-pago">${p.status || 'FINALIZADO'}</span></td>
                                </tr>
                            `;
                        }).join('')}
                    </tbody>
                </table>
            </div>
        `;
        
        // Atualizar cards de resumo
        atualizarCardsResumo(pagamentos);
        
    } catch(error) {
        console.error('Erro ao carregar pagamentos:', error);
        container.innerHTML = `
            <div class="sp-empty-state">
                <i class="fas fa-exclamation-triangle"></i>
                <p>Erro ao carregar pagamentos</p>
                <small>Verifique se o backend está rodando</small>
            </div>
        `;
    }
}

// Calcular tempo de permanência
function calcularTempo(entrada, saida) {
    if (!entrada || !saida) return '-';
    try {
        const inicio = new Date(entrada);
        const fim = new Date(saida);
        const diffMinutos = Math.floor((fim - inicio) / 60000);
        const horas = Math.floor(diffMinutos / 60);
        const minutos = diffMinutos % 60;
        
        if (horas > 0) {
            return `${horas}h ${minutos}min`;
        }
        return `${minutos}min`;
    } catch {
        return '-';
    }
}

// Atualizar cards de resumo
function atualizarCardsResumo(pagamentos) {
    // Calcular total pago hoje
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    
    const pagamentosHoje = pagamentos.filter(p => {
        if (!p.dataHoraEntrada) return false;
        const dataEntrada = new Date(p.dataHoraEntrada);
        dataEntrada.setHours(0, 0, 0, 0);
        return dataEntrada.getTime() === hoje.getTime();
    });
    
    const totalHoje = pagamentosHoje.reduce((sum, p) => sum + (p.valorPago || p.valorCalculado || 0), 0);
    const transacoesHoje = pagamentosHoje.length;
    
    // Calcular ticket médio
    const totalGeral = pagamentos.reduce((sum, p) => sum + (p.valorPago || p.valorCalculado || 0), 0);
    const ticketMedio = pagamentos.length > 0 ? totalGeral / pagamentos.length : 0;
    
    // Atualizar elementos
    const totalEl = document.getElementById('totalPagoHoje');
    const transacoesEl = document.getElementById('transacoesHoje');
    const ticketMedioEl = document.getElementById('ticketMedio');
    
    if (totalEl) totalEl.textContent = `R$ ${totalHoje.toFixed(2).replace('.', ',')}`;
    if (transacoesEl) transacoesEl.textContent = transacoesHoje;
    if (ticketMedioEl) ticketMedioEl.textContent = `R$ ${ticketMedio.toFixed(2).replace('.', ',')}`;
}

// Formatar data/hora
function formatarData(dataHora) {
    if (!dataHora) return '-';
    try {
        return new Date(dataHora).toLocaleString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    } catch {
        return dataHora;
    }
}

// Inicializar
document.addEventListener('DOMContentLoaded', () => {
    carregarPagamentos();
    // Recarregar a cada 30 segundos
    setInterval(carregarPagamentos, 30000);
});