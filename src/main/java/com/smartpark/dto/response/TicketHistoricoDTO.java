```java
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
```

Passo 3: Criar o controller

No diretório src/main/java/com/smartpark/controller, crie o arquivo HistoricoController.java com o conteúdo:

```java
package com.smartpark.controller;

import com.smartpark.dto.response.TicketHistoricoDTO;
import com.smartpark.model.Ticket;
import com.smartpark.repository.TicketRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/historico")
public class HistoricoController {

    @Autowired
    private TicketRepository ticketRepository;

    @GetMapping
    public List<TicketHistoricoDTO> listarTodosTickets() {
        List<Ticket> todos = ticketRepository.findAll();
        return todos.stream()
                .map(ticket -> TicketHistoricoDTO.builder()
                        .id(ticket.getId())
                        .placa(ticket.getVeiculo().getPlaca())
                        .veiculoModelo(ticket.getVeiculo().getModelo())
                        .veiculoCor(ticket.getVeiculo().getCor())
                        .vagaCodigo(ticket.getVaga().getCodigo())
                        .dataHoraEntrada(ticket.getDataHoraEntrada())
                        .dataHoraSaida(ticket.getDataHoraSaida())
                        .status(ticket.getStatus().toString())
                        .valorPago(ticket.getValorCalculado())
                        .build())
                .collect(Collectors.toList());
    }
}
```