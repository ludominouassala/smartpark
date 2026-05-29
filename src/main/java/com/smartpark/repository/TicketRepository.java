package com.smartpark.repository;

import com.smartpark.model.Ticket;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
public interface TicketRepository extends JpaRepository<Ticket, Long> {
    Optional<Ticket> findByIdAndStatus(Long id, com.smartpark.enums.StatusTicket status);
}
