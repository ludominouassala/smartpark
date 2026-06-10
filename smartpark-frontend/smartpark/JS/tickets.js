// tickets.js - SmartPark integrado com API real

let ticketAtualId = null;
let intervaloTickets = null;

// Carregar tickets ativos
async function carregarTickets() {
    const container = document.getElementById('ticketsAtivosList');
    if (!container) return;
    
    container.innerHTML = `<div class="sp-loading"><div class="sp-spinner"></div><p>Carregando tickets...</p></div>`;

    try {
        // Buscar do endpoint real /historico
        const historico = await listarHistorico();
        
        // Filtrar apenas tickets ATIVOS
        const ticketsAtivos = historico.filter(t => t.status === 'ATIVO');
        
        if (!ticketsAtivos || ticketsAtivos.length === 0) {
            container.innerHTML = `
                <div class="sp-empty-state">
                    <i class="fas fa-ticket-alt"></i>
                    <p>Nenhum ticket ativo no momento</p>
                    <small>Registre uma entrada no Dashboard</small>
                </div>
            `;
            return;
        }

        container.innerHTML = ticketsAtivos.map(t => `
            <div class="ticket-card" data-id="${t.id}">
                <div class="d-flex justify-content-between align-items-start flex-wrap gap-2">
                    <div>
                        <div class="ticket-placa">
                            <i class="fas fa-car"></i> ${t.placa || '–'}
                        </div>
                        <div class="ticket-meta">
                            <i class="fas fa-parking"></i> Vaga ${t.vagaCodigo || '–'} &nbsp;|&nbsp;
                            <i class="fas fa-clock"></i> Entrada: ${formatarData(t.dataHoraEntrada)}
                        </div>
                        <div class="ticket-time mt-1">
                            <i class="fas fa-hourglass-half"></i> 
                            <span id="timer-${t.id}">Calculando...</span>
                        </div>
                    </div>
                    <div class="d-flex gap-2">
                        <span class="sp-badge sp-badge-success">#${t.id}</span>
                        <button class="sp-btn sp-btn-warning" onclick="prepararSaida(${t.id})" style="padding:5px 12px;font-size:0.8rem">
                            <i class="fas fa-qrcode"></i> Saída
                        </button>
                    </div>
                </div>
            </div>
        `).join('');

        // Iniciar timers
        ticketsAtivos.forEach(t => {
            const entrada = new Date(t.dataHoraEntrada);
            if (!isNaN(entrada)) {
                atualizarTimer(t.id, entrada);
                if (intervaloTickets) clearInterval(intervaloTickets);
                intervaloTickets = setInterval(() => {
                    ticketsAtivos.forEach(t2 => {
                        const entrada2 = new Date(t2.dataHoraEntrada);
                        if (!isNaN(entrada2)) atualizarTimer(t2.id, entrada2);
                    });
                }, 60000);
            }
        });

    } catch(error) {
        console.error('Erro ao carregar tickets:', error);
        container.innerHTML = `
            <div class="sp-empty-state">
                <i class="fas fa-exclamation-triangle"></i>
                <p>Erro ao carregar tickets</p>
                <small>Verifique se o backend está rodando</small>
            </div>
        `;
    }
}

// Atualizar timer
function atualizarTimer(id, entrada) {
    const el = document.getElementById(`timer-${id}`);
    if (!el) return;
    
    const diff = Math.floor((Date.now() - entrada) / 60000);
    const h = Math.floor(diff / 60);
    const m = diff % 60;
    
    if (h > 0) {
        el.textContent = `${h}h ${m}min estacionado`;
    } else {
        el.textContent = `${m} min estacionado`;
    }
}

// Preparar saída
function prepararSaida(ticketId) {
    const el = document.getElementById('ticketIdSaida');
    if (el) {
        el.value = ticketId;
    }
    registrarSaida(ticketId);
}

// Registrar saída e gerar QR Code
async function registrarSaida(ticketId) {
    const id = ticketId || document.getElementById('ticketIdSaida')?.value;
    
    if (!id) {
        exibirToast('Informe o ID do ticket', 'warning');
        return;
    }

    const modalContent = document.getElementById('qrcodeContent');
    if (modalContent) {
        modalContent.innerHTML = `
            <div class="qr-loading text-center">
                <div class="sp-spinner"></div>
                <p class="mt-2">Gerando QR Code para o ticket #${id}...</p>
            </div>
        `;
    }
    
    try {
        // Chamar a função do api.js
        const resposta = await registrarSaidaAPI(parseInt(id));
        
        ticketAtualId = parseInt(id);
        
        // Extrair dados da resposta (funciona para JSON ou texto)
        let valor = 0;
        let qrCodeData = `PAGAR_${id}`;
        
        if (typeof resposta === 'object' && resposta !== null) {
            // Resposta é JSON
            valor = resposta.valor || resposta.valorCalculado || 0;
            qrCodeData = resposta.qrCodeData || resposta.mensagem || `PAGAR_${id}_${valor}`;
        } else if (typeof resposta === 'string') {
            // Resposta é texto
            qrCodeData = resposta;
            // Tentar extrair valor da string
            const match = resposta.match(/[\d,]+\.?\d*/);
            if (match) {
                valor = parseFloat(match[0].replace(',', '.')) || 0;
            }
        }
        
        if (modalContent) {
            modalContent.innerHTML = `
                <div class="qr-container text-center">
                    <p style="color:var(--sp-muted);font-size:0.85rem">
                        Ticket <strong style="color:var(--sp-accent)">#${id}</strong>
                    </p>
                    <div class="valor-destaque" style="font-size: 1.8rem; font-weight: bold; color: #28a745; margin: 15px 0;">
                        R$ ${Number(valor).toFixed(2).replace('.', ',')}
                    </div>
                    <p style="color:var(--sp-muted);font-size:0.8rem;margin-bottom:1rem">
                        Valor calculado com base no tempo estacionado
                    </p>
                    <div class="qr-box">
                        <img src="https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(qrCodeData)}"
                            alt="QR Code" width="160" height="160">
                    </div>
                    <div class="qrcode-modal mt-2" style="font-family: monospace; font-size: 11px; word-break: break-all; background: #f1f1f1; padding: 8px; border-radius: 6px;">
                        ${qrCodeData}
                    </div>
                    <div class="mt-3">
                        <small class="text-muted">Clique em "Simular Pagamento" para processar o pagamento</small>
                    </div>
                </div>
            `;
        }
        
        // Mostrar modal
        const modalElement = document.getElementById('qrcodeModal');
        if (modalElement) {
            const modal = new bootstrap.Modal(modalElement);
            modal.show();
        }
        
    } catch(error) {
        console.error('Erro ao gerar QR Code:', error);
        if (modalContent) {
            modalContent.innerHTML = `
                <div class="qr-error text-center">
                    <i class="fas fa-times-circle" style="font-size: 48px; color: #dc3545;"></i>
                    <p class="mt-2">Erro ao gerar QR Code</p>
                    <small>${error.message || 'Verifique se o ticket existe e está ativo'}</small>
                    <div class="mt-3">
                        <button class="sp-btn sp-btn-primary" onclick="fecharModal()">
                            <i class="fas fa-times"></i> Fechar
                        </button>
                    </div>
                </div>
            `;
        }
        exibirToast(`Erro: ${error.message || 'Ticket inválido'}`, 'danger');
    }
}

// Confirmar pagamento (SIMULAR PAGAMENTO)
async function confirmarPagamento() {
    if (!ticketAtualId) {
        exibirToast('Nenhum ticket selecionado', 'warning');
        return;
    }
    
    const modalContent = document.getElementById('qrcodeContent');
    if (modalContent) {
        modalContent.innerHTML = `
            <div class="qr-loading text-center">
                <div class="sp-spinner"></div>
                <p class="mt-2">Processando pagamento do ticket #${ticketAtualId}...</p>
            </div>
        `;
    }
    
    try {
        // Chamar função de pagamento do api.js
        const resultado = await processarPagamento(ticketAtualId);
        
        // Verificar se a resposta é válida (pode ser string ou JSON)
        let mensagem = 'Pagamento realizado com sucesso';
        if (typeof resultado === 'string') {
            mensagem = resultado;
        } else if (resultado && typeof resultado === 'object') {
            mensagem = resultado.mensagem || resultado.message || 'Pagamento realizado com sucesso';
        }
        
        if (modalContent) {
            modalContent.innerHTML = `
                <div class="qr-success text-center">
                    <i class="fas fa-check-circle" style="font-size: 64px; color: #28a745;"></i>
                    <h4 class="mt-3">Pagamento Confirmado!</h4>
                    <p>${mensagem}</p>
                    <p class="text-muted small">A vaga foi liberada automaticamente.</p>
                </div>
            `;
        }
        
        // Fechar modal após 2 segundos
        setTimeout(() => {
            fecharModal();
            ticketAtualId = null;
            carregarTickets();
            
            // Atualizar dashboard se existir
            if (typeof atualizarDashboard === 'function') {
                atualizarDashboard();
            }
            
            exibirToast('Pagamento confirmado! Vaga liberada.', 'success');
        }, 2000);
        
    } catch(error) {
        console.error('Erro no pagamento:', error);
        if (modalContent) {
            modalContent.innerHTML = `
                <div class="qr-error text-center">
                    <i class="fas fa-times-circle" style="font-size: 48px; color: #dc3545;"></i>
                    <h4 class="mt-3">Erro no Pagamento</h4>
                    <p>${error.message || 'Erro ao processar pagamento'}</p>
                    <div class="mt-3">
                        <button class="sp-btn sp-btn-primary" onclick="confirmarPagamento()">
                            <i class="fas fa-redo"></i> Tentar novamente
                        </button>
                        <button class="sp-btn sp-btn-secondary ms-2" onclick="fecharModal()">
                            <i class="fas fa-times"></i> Cancelar
                        </button>
                    </div>
                </div>
            `;
        }
        exibirToast(`Erro: ${error.message}`, 'danger');
    }
}

// Fechar modal
function fecharModal() {
    const modalElement = document.getElementById('qrcodeModal');
    if (modalElement) {
        const modal = bootstrap.Modal.getInstance(modalElement);
        if (modal) modal.hide();
    }
}

// Formatar data/hora
function formatarData(str) {
    if (!str) return '–';
    try {
        return new Date(str).toLocaleString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    } catch {
        return str;
    }
}

// Toast notifications
function exibirToast(mensagem, tipo = 'info') {
    let toastContainer = document.getElementById('toastContainer');
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.id = 'toastContainer';
        toastContainer.style.cssText = 'position:fixed;bottom:20px;right:20px;z-index:9999;max-width:350px;';
        document.body.appendChild(toastContainer);
        
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

// Inicializar
document.addEventListener('DOMContentLoaded', () => {
    carregarTickets();
    setInterval(carregarTickets, 30000);
});