package com.smartpark.controller;
import com.smartpark.dto.request.EntradaRequestDTO;
import com.smartpark.dto.request.SaidaRequestDTO;
import com.smartpark.dto.response.QrCodeResponseDTO;
import com.smartpark.dto.response.TicketResponseDTO;
import com.smartpark.service.EstacionamentoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
@RestController @RequestMapping("/tickets") @RequiredArgsConstructor
public class TicketController {
    private final EstacionamentoService service;
    @PostMapping("/entrada") public TicketResponseDTO entrada(@Valid @RequestBody EntradaRequestDTO dto) {
        return service.registrarEntrada(dto);
    }
    @PostMapping("/saida") public QrCodeResponseDTO saida(@Valid @RequestBody SaidaRequestDTO dto) {
        return service.registrarSaida(dto.getTicketId());
    }
    @GetMapping("/{id}") public TicketResponseDTO buscar(@PathVariable Long id) {
        return service.buscarTicket(id);
    }
}
