package com.smartpark.dto.response;

import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Builder
public class TicketHistoricoDTO {
    private Long id;
    private String placa;
    private String veiculoModelo;
    private String veiculoCor;
    private String vagaCodigo;
    private LocalDateTime dataHoraEntrada;
    private LocalDateTime dataHoraSaida;
    private String status;
    private Double valorPago;
}
