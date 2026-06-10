// historico.js - Página de Histórico

// Carregar histórico completo
async function carregarHistorico() {
    const container = document.getElementById('veiculosList');
    if (!container) return;
    
    container.innerHTML = '<div class="sp-loading"><div class="sp-spinner"></div><p>Carregando histórico...</p></div>';

    try {
        // Buscar histórico completo
        const historico = await listarHistorico();
        
        if (!historico || historico.length === 0) {
            container.innerHTML = `
                <div class="sp-empty-state">
                    <i class="fas fa-history"></i>
                    <p>Nenhum registro encontrado no histórico</p>
                    <small>Registre uma entrada no Dashboard para aparecer aqui</small>
                </div>
            `;
            return;
        }
        
        // Agrupar por veículo (placa)
        const veiculosMap = new Map();
        
        historico.forEach(ticket => {
            const placa = ticket.placa;
            if (!veiculosMap.has(placa)) {
                veiculosMap.set(placa, {
                    placa: placa,
                    tickets: []
                });
            }
            veiculosMap.get(placa).tickets.push(ticket);
        });
        
        // Ordenar por placa
        const veiculos = Array.from(veiculosMap.values())
            .sort((a, b) => a.placa.localeCompare(b.placa));
        
        // Renderizar
        container.innerHTML = veiculos.map(veiculo => {
            const safeId = veiculo.placa.replace(/[^a-zA-Z0-9]/g, '_');
            // Ordenar tickets por data (mais recente primeiro)
            const ticketsOrdenados = [...veiculo.tickets].sort((a, b) => 
                new Date(b.dataHoraEntrada) - new Date(a.dataHoraEntrada)
            );
            
            return `
                <div class="veiculo-card" data-placa="${veiculo.placa}">
                    <div class="veiculo-header" onclick="toggleVeiculo('${safeId}')">
                        <div>
                            <i class="fas fa-car"></i>
                            <strong>${veiculo.placa}</strong>
                            <span class="veiculo-badge">${veiculo.tickets.length} registro(s)</span>
                        </div>
                        <i class="fas fa-chevron-down veiculo-arrow" id="arrow-${safeId}"></i>
                    </div>
                    <div class="veiculo-tickets" id="tickets-${safeId}" style="display:none">
                        <table class="sp-table">
                            <thead>
                                <tr>
                                    <th>Ticket ID</th>
                                    <th>Vaga</th>
                                    <th>Entrada</th>
                                    <th>Saída</th>
                                    <th>Tempo</th>
                                    <th>Valor</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${ticketsOrdenados.map(ticket => {
                                    const tempo = calcularTempo(ticket.dataHoraEntrada, ticket.dataHoraSaida);
                                    const valor = ticket.valorPago || ticket.valorCalculado || 0;
                                    return `
                                        <tr>
                                            <td><span class="sp-badge sp-badge-dark">#${ticket.id}</span></td>
                                            <td>${ticket.vagaCodigo || '-'}</td>
                                            <td>${formatarData(ticket.dataHoraEntrada)}</td>
                                            <td>${formatarData(ticket.dataHoraSaida)}</td>
                                            <td>${tempo}</td>
                                            <td class="valor-pago">${valor > 0 ? `R$ ${valor.toFixed(2).replace('.', ',')}` : '-'}</td>
                                            <td><span class="status-badge status-${(ticket.status || '').toLowerCase()}">${ticket.status || 'ATIVO'}</span></td>
                                        </tr>
                                    `;
                                }).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            `;
        }).join('');
        
    } catch(error) {
        console.error('Erro ao carregar histórico:', error);
        container.innerHTML = `
            <div class="sp-empty-state">
                <i class="fas fa-exclamation-triangle"></i>
                <p>Erro ao carregar histórico</p>
                <small>Verifique se o backend está rodando</small>
            </div>
        `;
    }
}

// Buscar veículo específico
async function buscarVeiculo() {
    const placa = document.getElementById('buscarPlaca').value.trim().toUpperCase();
    const detalheDiv = document.getElementById('veiculoDetalhe');
    
    if (!placa) {
        detalheDiv.innerHTML = '<div class="alert alert-warning">Digite uma placa para buscar</div>';
        return;
    }
    
    detalheDiv.innerHTML = '<div class="sp-loading"><div class="sp-spinner"></div><p>Buscando veículo...</p></div>';
    
    try {
        // Buscar veículo
        const veiculo = await buscarVeiculoPorPlaca(placa);
        
        if (!veiculo) {
            detalheDiv.innerHTML = `
                <div class="alert alert-info">
                    <i class="fas fa-info-circle"></i> Veículo com placa ${placa} não encontrado.
                </div>
            `;
            return;
        }
        
        // Buscar histórico completo e filtrar pelo veículo
        const historico = await listarHistorico();
        const ticketsVeiculo = historico.filter(t => t.placa === placa);
        
        if (ticketsVeiculo.length === 0) {
            detalheDiv.innerHTML = `
                <div class="alert alert-info">
                    <i class="fas fa-info-circle"></i> Veículo ${placa} encontrado, mas não possui registros no histórico.
                </div>
            `;
            return;
        }
        
        // Ordenar tickets (mais recente primeiro)
        ticketsVeiculo.sort((a, b) => new Date(b.dataHoraEntrada) - new Date(a.dataHoraEntrada));
        
        detalheDiv.innerHTML = `
            <div class="veiculo-detalhe-card">
                <div class="veiculo-detalhe-header">
                    <div>
                        <i class="fas fa-car"></i>
                        <strong>${veiculo.placa}</strong>
                        ${veiculo.modelo ? `<span class="veiculo-info">${veiculo.modelo}</span>` : ''}
                        ${veiculo.cor ? `<span class="veiculo-info">${veiculo.cor}</span>` : ''}
                        ${veiculo.tipo ? `<span class="veiculo-info">${veiculo.tipo}</span>` : ''}
                    </div>
                    <button class="sp-btn sp-btn-sm" onclick="fecharBusca()">
                        <i class="fas fa-times"></i> Fechar
                    </button>
                </div>
                <div class="veiculo-detalhe-body">
                    <strong>Histórico de permanências (${ticketsVeiculo.length})</strong>
                    <table class="sp-table mt-2">
                        <thead>
                            <tr>
                                <th>Ticket</th>
                                <th>Vaga</th>
                                <th>Entrada</th>
                                <th>Saída</th>
                                <th>Tempo</th>
                                <th>Valor</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${ticketsVeiculo.map(ticket => {
                                const tempo = calcularTempo(ticket.dataHoraEntrada, ticket.dataHoraSaida);
                                const valor = ticket.valorPago || ticket.valorCalculado || 0;
                                return `
                                    <tr>
                                        <td>#${ticket.id}</td>
                                        <td>${ticket.vagaCodigo || '-'}</td>
                                        <td>${formatarData(ticket.dataHoraEntrada)}</td>
                                        <td>${formatarData(ticket.dataHoraSaida)}</td>
                                        <td>${tempo}</td>
                                        <td class="valor-pago">${valor > 0 ? `R$ ${valor.toFixed(2).replace('.', ',')}` : '-'}</td>
                                        <td><span class="status-badge status-${(ticket.status || '').toLowerCase()}">${ticket.status || 'ATIVO'}</span></td>
                                    </tr>
                                `;
                            }).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
        
    } catch(error) {
        console.error('Erro ao buscar veículo:', error);
        detalheDiv.innerHTML = `
            <div class="alert alert-danger">
                <i class="fas fa-exclamation-triangle"></i> Erro ao buscar veículo: ${error.message}
            </div>
        `;
    }
}

// Fechar busca
function fecharBusca() {
    document.getElementById('veiculoDetalhe').innerHTML = '';
    document.getElementById('buscarPlaca').value = '';
}

// Alternar exibição dos tickets do veículo
function toggleVeiculo(safeId) {
    const ticketsDiv = document.getElementById(`tickets-${safeId}`);
    const arrow = document.getElementById(`arrow-${safeId}`);
    
    if (!ticketsDiv) return;
    
    if (ticketsDiv.style.display === 'none' || ticketsDiv.style.display === '') {
        ticketsDiv.style.display = 'block';
        if (arrow) arrow.style.transform = 'rotate(180deg)';
    } else {
        ticketsDiv.style.display = 'none';
        if (arrow) arrow.style.transform = 'rotate(0deg)';
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
        
        if (horas > 0 && minutos > 0) {
            return `${horas}h ${minutos}min`;
        } else if (horas > 0) {
            return `${horas}h`;
        } else if (minutos > 0) {
            return `${minutos}min`;
        }
        return `${diffMinutos}min`;
    } catch {
        return '-';
    }
}

// Formatar data/hora
function formatarData(dataHora) {
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
        return dataHora;
    }
}

// Inicializar
document.addEventListener('DOMContentLoaded', () => {
    carregarHistorico();
    // Recarregar a cada 30 segundos
    setInterval(carregarHistorico, 30000);
});