package com.smartpark.repository;

import com.smartpark.model.Pagamento;
import com.smartpark.model.Ticket;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
public interface PagamentoRepository extends JpaRepository<Pagamento, Long> {
    Optional<Pagamento> findByTicket(Ticket ticket);
}
