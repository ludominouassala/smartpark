package com.smartpark.service;
import com.smartpark.model.Vaga;
import com.smartpark.enums.StatusVaga;
import com.smartpark.repository.VagaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;
@Service @RequiredArgsConstructor
public class VagaService {
    private final VagaRepository repository;
    public List<Vaga> listarTodas() { return repository.findAll(); }
    public Vaga buscarVagaLivre() {
        return repository.findFirstByStatus(StatusVaga.LIVRE).orElse(null);
    }
    public Vaga salvar(Vaga v) { return repository.save(v); }
}
