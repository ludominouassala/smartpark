package com.smartpark.dto.response;
import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;
@Data @Builder
public class TicketResponseDTO {
    private Long id;
    private String placa;
    private String vagaCodigo;
    private LocalDateTime dataHoraEntrada;
    private String status;
    private Double valor;
}
