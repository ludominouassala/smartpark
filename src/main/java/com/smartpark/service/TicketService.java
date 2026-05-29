package com.smartpark.service;
import com.smartpark.model.Ticket;
import com.smartpark.model.Veiculo;
import com.smartpark.model.Vaga;
import com.smartpark.repository.TicketRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
@Service @RequiredArgsConstructor
public class TicketService {
    private final TicketRepository repository;
    public Ticket criarTicket(Veiculo v, Vaga vaga) {
        Ticket t = new Ticket();
        t.setVeiculo(v);
        t.setVaga(vaga);
        return repository.save(t);
    }
    public Ticket buscarPorId(Long id) { return repository.findById(id).orElse(null); }
    public Ticket salvar(Ticket t) { return repository.save(t); }
}
