// js/historico.js
async function carregarVeiculos() {
    try {
        const veiculos = await api.getVeiculos();
        const container = document.getElementById('veiculosList');
        
        if (veiculos.length === 0) {
            container.innerHTML = '<div class="alert alert-info">Nenhum veículo cadastrado</div>';
            return;
        }
        
        container.innerHTML = `
            <div class="table-responsive">
                <table class="table table-striped">
                    <thead>
                        <tr><th>Placa</th><th>Modelo</th><th>Cor</th><th>Tipo</th><th>Cadastro</th></tr>
                    </thead>
                    <tbody>
                        ${veiculos.map(v => `
                            <tr>
                                <td><strong>${v.placa}</strong></td>
                                <td>${v.modelo || '-'}</td>
                                <td>${v.cor || '-'}</td>
                                <td>${v.tipo}</td>
                                <td>${formatDateTime(v.dataCadastro)}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    } catch (error) {
        showAlert('Erro ao carregar veículos', 'danger');
    }
}

async function buscarVeiculo() {
    const placa = document.getElementById('buscarPlaca').value.toUpperCase();
    if (!placa) {
        showAlert('Digite uma placa', 'warning');
        return;
    }
    
    try {
        const veiculo = await api.getVeiculoByPlaca(placa);
        document.getElementById('veiculoDetalhe').innerHTML = `
            <div class="alert alert-success">
                <h5>Veículo encontrado:</h5>
                <p><strong>Placa:</strong> ${veiculo.placa}<br>
                <strong>Modelo:</strong> ${veiculo.modelo || '-'}<br>
                <strong>Cor:</strong> ${veiculo.cor || '-'}<br>
                <strong>Tipo:</strong> ${veiculo.tipo}<br>
                <strong>Cadastro:</strong> ${formatDateTime(veiculo.dataCadastro)}</p>
            </div>
        `;
    } catch (error) {
        document.getElementById('veiculoDetalhe').innerHTML = `
            <div class="alert alert-danger">Veículo com placa ${placa} não encontrado</div>
        `;
    }
}

carregarVeiculos();