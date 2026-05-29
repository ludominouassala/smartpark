package com.smartpark.dto.request;
import lombok.Data;
import jakarta.validation.constraints.NotBlank;
@Data
public class EntradaRequestDTO {
    @NotBlank private String placa;
    private String modelo;
    private String cor;
    private String tipoVeiculo;
}
