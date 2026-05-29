package com.smartpark.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import com.smartpark.enums.StatusPagamento;
import java.time.LocalDateTime;

@Data @NoArgsConstructor @AllArgsConstructor
@Entity @Table(name = "pagamentos")
public class Pagamento {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @OneToOne @JoinColumn(name = "ticket_id", nullable = false)
    private Ticket ticket;
    private Double valorPago;
    private LocalDateTime dataHoraPagamento;
    @Enumerated(EnumType.STRING)
    private StatusPagamento status;
    private String qrCodeData;
    private String metodoPagamento;
    @PrePersist
    protected void onCreate() {
        dataHoraPagamento = LocalDateTime.now();
        status = StatusPagamento.PENDENTE;
    }
}
