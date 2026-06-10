/* pagamentos.js – SmartPark refatorado */

async function carregarPagamentos() {
  const container = document.getElementById('pagamentosList');
  if (!container) return;
  container.innerHTML = `<div class="sp-loading"><div class="sp-spinner"></div><p>Carregando...</p></div>`;

  try {
    const dados = await apiGet('/pagamentos');
    if (!dados || dados.length === 0) {
      container.innerHTML = `<div class="sp-empty"><i class="fas fa-receipt"></i><p>Nenhum pagamento registrado</p></div>`;
      atualizarResumo([]);
      return;
    }

    atualizarResumo(dados);

    container.innerHTML = `
      <div class="sp-table-wrap">
        <table class="sp-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Placa</th>
              <th>Entrada</th>
              <th>Saída</th>
              <th>Tempo</th>
              <th>Valor</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${dados.map(p => `
              <tr>
                <td style="color:var(--sp-muted)">${p.id}</td>
                <td><span style="font-family:'Exo 2',monospace;font-weight:700;color:var(--sp-accent);letter-spacing:2px">${p.placa || '–'}</span></td>
                <td style="font-size:0.82rem">${formatarData(p.entrada || p.dataEntrada)}</td>
                <td style="font-size:0.82rem">${formatarData(p.saida || p.dataSaida)}</td>
                <td><span class="sp-badge sp-badge-info">${p.tempoFormatado || p.tempo || '–'}</span></td>
                <td><strong style="color:var(--sp-success)">${formatarValor(p.valor)}</strong></td>
                <td>${badgeStatus(p.status)}</td>
              </tr>`).join('')}
          </tbody>
        </table>
      </div>`;

  } catch(e) {
    container.innerHTML = `<div class="sp-empty"><i class="fas fa-exclamation-triangle"></i><p>Erro ao carregar pagamentos</p></div>`;
  }
}

function atualizarResumo(dados) {
  const hoje = new Date().toDateString();
  const pagamentosHoje = dados.filter(p => {
    const d = new Date(p.saida || p.dataSaida || p.createdAt);
    return d.toDateString() === hoje;
  });
  const total = pagamentosHoje.reduce((s, p) => s + (parseFloat(p.valor) || 0), 0);
  const medio = pagamentosHoje.length > 0 ? total / pagamentosHoje.length : 0;

  const el1 = document.getElementById('totalPagoHoje');
  const el2 = document.getElementById('transacoesHoje');
  const el3 = document.getElementById('ticketMedio');
  if (el1) el1.textContent = `R$${total.toFixed(2).replace('.',',')}`;
  if (el2) el2.textContent = pagamentosHoje.length;
  if (el3) el3.textContent = `R$${medio.toFixed(2).replace('.',',')}`;
}

function badgeStatus(status) {
  const map = {
    'PAGO': '<span class="sp-badge sp-badge-success"><i class="fas fa-check"></i> Pago</span>',
    'PENDENTE': '<span class="sp-badge sp-badge-warning"><i class="fas fa-clock"></i> Pendente</span>',
    'CANCELADO': '<span class="sp-badge sp-badge-danger"><i class="fas fa-times"></i> Cancelado</span>',
  };
  return map[status] || `<span class="sp-badge sp-badge-muted">${status || '–'}</span>`;
}

function formatarValor(val) {
  if (val === undefined || val === null) return '–';
  return `R$ ${parseFloat(val).toFixed(2).replace('.',',')}`;
}

function formatarData(str) {
  if (!str) return '–';
  try { return new Date(str).toLocaleString('pt-BR', {day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'}); }
  catch { return str; }
}

carregarPagamentos();
