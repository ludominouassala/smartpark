package com.smartpark.service;
import com.smartpark.model.Pagamento;
import com.smartpark.model.Ticket;
import com.smartpark.repository.PagamentoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
@Service @RequiredArgsConstructor
public class PagamentoService {
    private final PagamentoRepository repository;
    public Pagamento criarPagamento(Ticket ticket, Double valor) {
        Pagamento p = new Pagamento();
        p.setTicket(ticket);
        p.setValorPago(valor);
        return repository.save(p);
    }
}
