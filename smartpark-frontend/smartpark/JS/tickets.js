/* tickets.js – SmartPark refatorado */

let ticketAtualId = null;

async function carregarTickets() {
  const container = document.getElementById('ticketsAtivosList');
  if (!container) return;
  container.innerHTML = `<div class="sp-loading"><div class="sp-spinner"></div><p>Carregando tickets...</p></div>`;

  try {
    const tickets = await apiGet('/tickets/ativos');
    if (!tickets || tickets.length === 0) {
      container.innerHTML = `<div class="sp-empty"><i class="fas fa-ticket-alt"></i><p>Nenhum ticket ativo no momento</p></div>`;
      return;
    }

    container.innerHTML = tickets.map(t => `
      <div class="ticket-card">
        <div class="d-flex justify-content-between align-items-start flex-wrap gap-2">
          <div>
            <div class="ticket-placa">${t.placa || '–'}</div>
            <div class="ticket-meta">
              <i class="fas fa-parking"></i> Vaga ${t.vagaNumero || t.vaga || '–'} &nbsp;|&nbsp;
              <i class="fas fa-car"></i> ${t.modelo || 'Veículo'} &nbsp;|&nbsp;
              <i class="fas fa-palette"></i> ${t.cor || '–'}
            </div>
            <div class="ticket-meta mt-1">
              <i class="fas fa-clock"></i> Entrada: ${formatarData(t.entrada || t.dataEntrada)}
            </div>
            <div class="ticket-time mt-1">
              <i class="fas fa-hourglass-half"></i> <span id="timer-${t.id}">Calculando...</span>
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

    // Timers
    tickets.forEach(t => {
      const entrada = new Date(t.entrada || t.dataEntrada);
      if (!isNaN(entrada)) {
        atualizarTimer(t.id, entrada);
        setInterval(() => atualizarTimer(t.id, entrada), 60000);
      }
    });

  } catch(e) {
    container.innerHTML = `<div class="sp-empty"><i class="fas fa-exclamation-triangle"></i><p>Erro ao carregar tickets</p></div>`;
  }
}

function atualizarTimer(id, entrada) {
  const el = document.getElementById(`timer-${id}`);
  if (!el) return;
  const diff = Math.floor((Date.now() - entrada) / 60000);
  const h = Math.floor(diff / 60);
  const m = diff % 60;
  el.textContent = h > 0 ? `${h}h ${m}min estacionado` : `${m} min estacionado`;
}

function prepararSaida(ticketId) {
  const el = document.getElementById('ticketIdSaida');
  if (el) { el.value = ticketId; }
  registrarSaida(ticketId);
}

async function registrarSaida(idOverride) {
  const id = idOverride || document.getElementById('ticketIdSaida')?.value;
  if (!id) { alert('Informe o ID do ticket'); return; }

  try {
    const data = await apiPost(`/tickets/${id}/saida`, {});
    ticketAtualId = id;

    const valor = data.valor ? `R$ ${parseFloat(data.valor).toFixed(2).replace('.',',')}` : '–';

    const content = document.getElementById('qrcodeContent');
    content.innerHTML = `
      <div class="qr-container">
        <p style="color:var(--sp-muted);font-size:0.85rem">Ticket <strong style="color:var(--sp-accent)">#${id}</strong></p>
        <div class="valor-destaque">${valor}</div>
        <p style="color:var(--sp-muted);font-size:0.8rem;margin-bottom:1rem">Tempo: ${data.tempoFormatado || data.tempo || '–'}</p>
        <div class="qr-box">
          <img src="https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=smartpark-pagamento-ticket-${id}-valor-${data.valor||0}"
            alt="QR Code" width="160" height="160">
        </div>
        <div class="qrcode-modal mt-2">smartpark://pay/${id}?valor=${data.valor||0}&ts=${Date.now()}</div>
      </div>`;

    new bootstrap.Modal(document.getElementById('qrcodeModal')).show();
  } catch(e) {
    alert('Erro ao gerar QR Code: ' + (e.message || 'verifique o ID do ticket'));
  }
}

async function confirmarPagamento() {
  if (!ticketAtualId) return;
  try {
    await apiPost(`/tickets/${ticketAtualId}/pagamento`, {});
    bootstrap.Modal.getInstance(document.getElementById('qrcodeModal'))?.hide();
    ticketAtualId = null;
    carregarTickets();
  } catch(e) {
    alert('Erro ao confirmar pagamento');
  }
}

function formatarData(str) {
  if (!str) return '–';
  try { return new Date(str).toLocaleString('pt-BR', {day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'}); }
  catch { return str; }
}

carregarTickets();
setInterval(carregarTickets, 30000);
