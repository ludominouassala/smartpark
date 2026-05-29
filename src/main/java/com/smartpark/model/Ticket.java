package com.smartpark.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import com.smartpark.enums.StatusTicket;
import java.time.LocalDateTime;

@Data @NoArgsConstructor @AllArgsConstructor
@Entity @Table(name = "tickets")
public class Ticket {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @ManyToOne @JoinColumn(name = "veiculo_id", nullable = false)
    private Veiculo veiculo;
    @ManyToOne @JoinColumn(name = "vaga_id", nullable = false)
    private Vaga vaga;
    private LocalDateTime dataHoraEntrada;
    private LocalDateTime dataHoraSaida;
    @Enumerated(EnumType.STRING)
    private StatusTicket status;
    private Double valorCalculado;
    @PrePersist
    protected void onCreate() {
        dataHoraEntrada = LocalDateTime.now();
        status = StatusTicket.ATIVO;
    }
}
