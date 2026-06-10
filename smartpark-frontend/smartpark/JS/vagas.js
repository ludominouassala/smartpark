/* vagas.js – SmartPark refatorado */

async function carregarVagas() {
  const mapa = document.getElementById('mapaVagasCompleto');
  if (!mapa) return;
  mapa.innerHTML = `<div class="sp-loading" style="grid-column:1/-1"><div class="sp-spinner"></div><p>Carregando...</p></div>`;

  try {
    const vagas = await apiGet('/vagas');
    if (!vagas || vagas.length === 0) {
      mapa.innerHTML = `<div class="sp-empty" style="grid-column:1/-1"><i class="fas fa-parking"></i><p>Nenhuma vaga encontrada</p></div>`;
      return;
    }

    const livres   = vagas.filter(v => v.livre || v.status === 'LIVRE').length;
    const ocupadas = vagas.length - livres;

    animCount('resumoLivres',   livres);
    animCount('resumoOcupadas', ocupadas);
    animCount('resumoTotal',    vagas.length);

    mapa.innerHTML = vagas.map(v => {
      const isLivre = v.livre || v.status === 'LIVRE';
      const placa = !isLivre && v.placa ? `<div style="font-size:0.65rem;letter-spacing:1px;opacity:.8">${v.placa}</div>` : '';
      return `
        <div class="vaga-card ${isLivre ? 'vaga-livre' : 'vaga-ocupada'}"
             title="${isLivre ? 'Livre' : 'Ocupada' + (v.placa ? ' – ' + v.placa : '')}">
          <i class="fas fa-${isLivre ? 'check-circle' : 'car'}"></i>
          <div style="font-weight:700">${v.numero || v.id}</div>
          ${placa}
        </div>`;
    }).join('');

  } catch(e) {
    mapa.innerHTML = `<div class="sp-empty" style="grid-column:1/-1">
      <i class="fas fa-exclamation-triangle"></i>
      <p>Erro ao carregar vagas. Verifique a API.</p>
    </div>`;
  }
}

function animCount(id, target) {
  const el = document.getElementById(id);
  if (!el) return;
  let start_time = null;
  const start = 0;
  const duration = 500;
  const step = ts => {
    if (!start_time) start_time = ts;
    const prog = Math.min((ts - start_time) / duration, 1);
    el.textContent = Math.floor(prog * target);
    if (prog < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

carregarVagas();
setInterval(carregarVagas, 20000);
