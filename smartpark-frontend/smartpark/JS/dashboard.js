/* dashboard.js – SmartPark refatorado */

async function atualizarDashboard() {
  try {
    const stats = await apiGet('/vagas/stats');
    animCount('totalVagas',   stats.total    || 0);
    animCount('vagasLivres',  stats.livres   || 0);
    animCount('vagasOcupadas',stats.ocupadas || 0);
    animCount('ticketsAtivos',stats.ticketsAtivos || 0);
  } catch(e) {
    ['totalVagas','vagasLivres','vagasOcupadas','ticketsAtivos']
      .forEach(id => { const el = document.getElementById(id); if(el) el.textContent = '–'; });
  }

  try {
    const tickets = await apiGet('/tickets/ativos');
    const tbody = document.querySelector('#ultimasEntradasTable tbody');
    const countEl = document.getElementById('entradas-count');
    if (!tbody) return;
    if (!tickets || tickets.length === 0) {
      tbody.innerHTML = `<tr><td colspan="3"><div class="sp-empty"><i class="fas fa-inbox"></i><p>Nenhuma entrada registrada</p></div></td></tr>`;
      if(countEl) countEl.textContent = '0';
      return;
    }
    if(countEl) countEl.textContent = tickets.length;
    tbody.innerHTML = tickets.slice(0,8).map(t => `
      <tr>
        <td><span class="sp-badge sp-badge-info" style="font-family:'Exo 2',monospace;letter-spacing:2px">${t.placa || '–'}</span></td>
        <td>${t.vagaNumero || t.vaga || '–'}</td>
        <td style="color:var(--sp-muted);font-size:0.82rem">${formatarData(t.entrada || t.dataEntrada)}</td>
      </tr>`).join('');
  } catch(e) {
    const tbody = document.querySelector('#ultimasEntradasTable tbody');
    if(tbody) tbody.innerHTML = `<tr><td colspan="3" style="text-align:center;color:var(--sp-muted);padding:1.5rem">Erro ao carregar dados</td></tr>`;
  }

  try {
    const vagas = await apiGet('/vagas');
    const mapa = document.getElementById('mapaVagas');
    if (!mapa || !vagas) return;
    mapa.innerHTML = vagas.map(v => `
      <div class="vaga-card ${v.livre || v.status==='LIVRE' ? 'vaga-livre' : 'vaga-ocupada'}"
           title="${v.livre || v.status==='LIVRE' ? 'Livre' : 'Ocupada – '+( v.placa||'')}">
        <i class="fas fa-${v.livre || v.status==='LIVRE' ? 'check' : 'car'}"></i>
        <div>${v.numero || v.id}</div>
      </div>`).join('');
  } catch(e) {
    const mapa = document.getElementById('mapaVagas');
    if(mapa) mapa.innerHTML = `<div class="sp-empty" style="grid-column:1/-1"><i class="fas fa-exclamation-triangle"></i><p>Erro ao carregar vagas</p></div>`;
  }
}

/* ── Formulário de entrada ── */
const form = document.getElementById('entradaForm');
if (form) {
  form.addEventListener('submit', async e => {
    e.preventDefault();
    const btn = form.querySelector('button[type=submit]');
    const msgEl = document.getElementById('entradaMsg');
    btn.disabled = true;
    btn.innerHTML = '<div class="sp-spinner" style="width:16px;height:16px;border-width:2px"></div> Registrando...';

    const payload = {
      placa: document.getElementById('placa').value.toUpperCase().trim(),
      modelo: document.getElementById('modelo').value.trim(),
      cor: document.getElementById('cor').value.trim(),
      tipo: document.getElementById('tipoVeiculo').value
    };

    try {
      await apiPost('/tickets/entrada', payload);
      showAlert(msgEl, 'success', `<i class="fas fa-check-circle"></i> Entrada registrada com sucesso para <strong>${payload.placa}</strong>!`);
      form.reset();
      atualizarDashboard();
    } catch(err) {
      showAlert(msgEl, 'danger', `<i class="fas fa-exclamation-circle"></i> ${err.message || 'Erro ao registrar entrada'}`);
    } finally {
      btn.disabled = false;
      btn.innerHTML = '<i class="fas fa-sign-in-alt"></i> Registrar Entrada';
    }
  });
}

/* ── Helpers ── */
function animCount(id, target) {
  const el = document.getElementById(id);
  if (!el) return;
  const start = parseInt(el.textContent) || 0;
  const duration = 600;
  const step = (timestamp) => {
    if (!start_time) start_time = timestamp;
    const progress = Math.min((timestamp - start_time) / duration, 1);
    el.textContent = Math.floor(progress * (target - start) + start);
    if (progress < 1) requestAnimationFrame(step);
  };
  let start_time = null;
  requestAnimationFrame(step);
}

function showAlert(el, type, html) {
  if (!el) return;
  el.innerHTML = `<div class="sp-alert sp-alert-${type}">${html}</div>`;
  setTimeout(() => { if(el) el.innerHTML = ''; }, 5000);
}

function formatarData(str) {
  if (!str) return '–';
  try {
    return new Date(str).toLocaleString('pt-BR', {day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'});
  } catch { return str; }
}

// Inicia
atualizarDashboard();
setInterval(atualizarDashboard, 30000);
