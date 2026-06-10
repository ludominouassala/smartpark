/* historico.js – SmartPark refatorado */

async function carregarHistorico() {
  const container = document.getElementById('veiculosList');
  if (!container) return;
  container.innerHTML = `<div class="sp-loading"><div class="sp-spinner"></div><p>Carregando histórico...</p></div>`;

  try {
    const veiculos = await apiGet('/veiculos');
    if (!veiculos || veiculos.length === 0) {
      container.innerHTML = `<div class="sp-empty"><i class="fas fa-car-alt"></i><p>Nenhum veículo cadastrado</p></div>`;
      return;
    }

    container.innerHTML = `
      <div class="sp-table-wrap">
        <table class="sp-table">
          <thead>
            <tr>
              <th>Placa</th>
              <th>Modelo</th>
              <th>Cor</th>
              <th>Tipo</th>
              <th>Visitas</th>
              <th>Última Entrada</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${veiculos.map(v => `
              <tr>
                <td>
                  <span style="font-family:'Exo 2',monospace;font-weight:700;color:var(--sp-accent);letter-spacing:2px">${v.placa || '–'}</span>
                </td>
                <td>${v.modelo || '–'}</td>
                <td>
                  <span style="display:inline-flex;align-items:center;gap:6px">
                    <span style="width:10px;height:10px;border-radius:50%;background:${corHex(v.cor)};display:inline-block;border:1px solid rgba(255,255,255,0.2)"></span>
                    ${v.cor || '–'}
                  </span>
                </td>
                <td>${tipoIcon(v.tipo)}</td>
                <td><span class="sp-badge sp-badge-info">${v.totalVisitas || v.visitas || '–'}</span></td>
                <td style="font-size:0.82rem;color:var(--sp-muted)">${formatarData(v.ultimaEntrada || v.dataEntrada)}</td>
                <td>${v.ativo || v.presente ? '<span class="sp-badge sp-badge-success"><i class="fas fa-circle"></i> No pátio</span>' : '<span class="sp-badge sp-badge-muted">Saiu</span>'}</td>
              </tr>`).join('')}
          </tbody>
        </table>
      </div>`;

  } catch(e) {
    container.innerHTML = `<div class="sp-empty"><i class="fas fa-exclamation-triangle"></i><p>Erro ao carregar histórico</p></div>`;
  }
}

async function buscarVeiculo() {
  const placa = document.getElementById('buscarPlaca')?.value?.trim().toUpperCase();
  const container = document.getElementById('veiculoDetalhe');
  if (!placa || !container) return;

  container.innerHTML = `<div class="sp-loading" style="padding:1rem"><div class="sp-spinner"></div></div>`;

  try {
    const veiculo = await apiGet(`/veiculos/${placa}`);

    if (!veiculo) {
      container.innerHTML = `<div class="sp-alert sp-alert-danger"><i class="fas fa-search"></i> Nenhum veículo encontrado com a placa <strong>${placa}</strong></div>`;
      return;
    }

    const historico = veiculo.historico || veiculo.tickets || [];

    container.innerHTML = `
      <div style="border:1px solid var(--sp-border);border-radius:var(--sp-radius);overflow:hidden">
        <div style="padding:1rem 1.2rem;background:rgba(0,198,255,0.08);border-bottom:1px solid var(--sp-border);display:flex;align-items:center;gap:12px;flex-wrap:wrap">
          <div style="font-family:'Exo 2',monospace;font-size:1.3rem;font-weight:900;color:var(--sp-accent);letter-spacing:3px">${veiculo.placa}</div>
          <div style="color:var(--sp-muted);font-size:0.85rem">${veiculo.modelo || ''} · ${veiculo.cor || ''} · ${tipoIcon(veiculo.tipo)}</div>
          <div class="ms-auto">${veiculo.ativo || veiculo.presente ? '<span class="sp-badge sp-badge-success"><i class="fas fa-circle"></i> No pátio agora</span>' : '<span class="sp-badge sp-badge-muted">Fora do pátio</span>'}</div>
        </div>
        ${historico.length > 0 ? `
          <div class="sp-table-wrap">
            <table class="sp-table">
              <thead><tr><th>Entrada</th><th>Saída</th><th>Tempo</th><th>Valor</th></tr></thead>
              <tbody>
                ${historico.slice(0,10).map(h => `
                  <tr>
                    <td style="font-size:0.82rem">${formatarData(h.entrada || h.dataEntrada)}</td>
                    <td style="font-size:0.82rem">${formatarData(h.saida || h.dataSaida)}</td>
                    <td><span class="sp-badge sp-badge-info">${h.tempoFormatado || h.tempo || '–'}</span></td>
                    <td style="color:var(--sp-success);font-weight:600">${h.valor ? 'R$ '+parseFloat(h.valor).toFixed(2).replace('.',',') : '–'}</td>
                  </tr>`).join('')}
              </tbody>
            </table>
          </div>` : `<div class="sp-empty" style="padding:1.5rem"><i class="fas fa-history"></i><p>Sem histórico de visitas</p></div>`}
      </div>`;

  } catch(e) {
    container.innerHTML = `<div class="sp-alert sp-alert-danger"><i class="fas fa-exclamation-circle"></i> Erro ao buscar veículo: ${e.message || ''}</div>`;
  }
}

/* Helpers */
function tipoIcon(tipo) {
  const map = { CARRO: '🚗 Carro', MOTO: '🏍️ Moto', CAMINHAO: '🚛 Caminhão' };
  return map[tipo] || (tipo || '–');
}

function corHex(cor) {
  const map = { 'branco': '#fff', 'preto': '#222', 'prata': '#c0c0c0', 'cinza': '#888',
    'vermelho': '#e53935', 'azul': '#1e88e5', 'verde': '#43a047', 'amarelo': '#fdd835',
    'laranja': '#fb8c00', 'marrom': '#6d4c41', 'bege': '#d7ccc8', 'rosa': '#e91e63' };
  if (!cor) return '#555';
  const key = cor.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  return map[key] || '#8899aa';
}

function formatarData(str) {
  if (!str) return '–';
  try { return new Date(str).toLocaleString('pt-BR', {day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'}); }
  catch { return str; }
}

carregarHistorico();
