// js/vagas.js
async function carregarVagas() {
    try {
        const vagas = await api.getVagas();
        const container = document.getElementById('mapaVagasCompleto');
        container.innerHTML = '';
        
        vagas.forEach(vaga => {
            const vagaDiv = document.createElement('div');
            vagaDiv.className = `vaga-card ${vaga.status === 'LIVRE' ? 'vaga-livre' : 'vaga-ocupada'}`;
            vagaDiv.innerHTML = `
                <strong>${vaga.codigo}</strong><br>
                <small>${vaga.tipo}</small><br>
                <small>${vaga.status === 'LIVRE' ? '🟢 LIVRE' : '🔴 OCUPADA'}</small>
            `;
            container.appendChild(vagaDiv);
        });
    } catch (error) {
        showAlert('Erro ao carregar vagas', 'danger');
    }
}

carregarVagas();