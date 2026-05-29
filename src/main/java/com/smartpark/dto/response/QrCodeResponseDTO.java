package com.smartpark.dto.response;
import lombok.Builder;
import lombok.Data;
@Data @Builder
public class QrCodeResponseDTO {
    private String qrCodeData;
    private String urlPagamento;
    private Double valor;
    private Long ticketId;
}
