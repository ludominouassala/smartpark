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