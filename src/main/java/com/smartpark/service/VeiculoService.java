package com.smartpark.service;

import com.smartpark.model.Veiculo;
import com.smartpark.repository.VeiculoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class VeiculoService {
    private final VeiculoRepository repository;

    public Veiculo salvar(Veiculo v) {
        return repository.save(v);
    }

    public Veiculo buscarPorPlaca(String placa) {
        return repository.findByPlaca(placa).orElse(null);
    }

    public List<Veiculo> listarTodos() {
        return repository.findAll();
    }
}