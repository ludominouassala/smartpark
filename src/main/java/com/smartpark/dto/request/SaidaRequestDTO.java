package com.smartpark.dto.request;
import lombok.Data;
import jakarta.validation.constraints.NotNull;
@Data
public class SaidaRequestDTO {
    @NotNull private Long ticketId;
}
