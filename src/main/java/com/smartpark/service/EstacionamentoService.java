package com.smartpark.service;

import com.smartpark.dto.request.EntradaRequestDTO;
import com.smartpark.dto.response.QrCodeResponseDTO;
import com.smartpark.dto.response.TicketResponseDTO;
import com.smartpark.enums.StatusTicket;
import com.smartpark.enums.StatusVaga;
import com.smartpark.enums.TipoVeiculo;
import com.smartpark.model.Pagamento;
import com.smartpark.model.Ticket;
import com.smartpark.model.Vaga;
import com.smartpark.model.Veiculo;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.Duration;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class EstacionamentoService {
    private final VeiculoService veiculoService;
    private final VagaService vagaService;
    private final TicketService ticketService;
    private final PagamentoService pagamentoService;
    private static final double VALOR_POR_HORA = 5.0;

    @Transactional
    public TicketResponseDTO registrarEntrada(EntradaRequestDTO request) {
        Veiculo veiculo = veiculoService.buscarPorPlaca(request.getPlaca());
        if (veiculo == null) {
            veiculo = new Veiculo();
            veiculo.setPlaca(request.getPlaca());
            veiculo.setModelo(request.getModelo());
            veiculo.setCor(request.getCor());
            if (request.getTipoVeiculo() != null)
                veiculo.setTipo(TipoVeiculo.valueOf(request.getTipoVeiculo()));
            veiculo = veiculoService.salvar(veiculo);
        }
        Vaga vaga = vagaService.buscarVagaLivre();
        if (vaga == null) throw new RuntimeException("Sem vagas disponíveis");
        vaga.setStatus(StatusVaga.OCUPADA);
        vagaService.salvar(vaga);
        Ticket ticket = ticketService.criarTicket(veiculo, vaga);
        return TicketResponseDTO.builder()
                .id(ticket.getId())
                .placa(veiculo.getPlaca())
                .vagaCodigo(vaga.getCodigo())
                .dataHoraEntrada(ticket.getDataHoraEntrada())
                .status(ticket.getStatus().toString())
                .build();
    }

    @Transactional
    public QrCodeResponseDTO registrarSaida(Long ticketId) {
        Ticket ticket = ticketService.buscarPorId(ticketId);
        if (ticket == null || ticket.getStatus() != StatusTicket.ATIVO)
            throw new RuntimeException("Ticket inválido");
        LocalDateTime saida = LocalDateTime.now();
        ticket.setDataHoraSaida(saida);
        long horas = Duration.between(ticket.getDataHoraEntrada(), saida).toHours();
        if (horas == 0) horas = 1;
        double valor = horas * VALOR_POR_HORA;
        ticket.setValorCalculado(valor);
        ticketService.salvar(ticket);
        String qrCodeData = "PAGAR_" + ticketId + "_" + valor;
        String urlPagamento = "http://localhost:8080/api/pagamentos/" + ticketId;
        return QrCodeResponseDTO.builder()
                .qrCodeData(qrCodeData)
                .urlPagamento(urlPagamento)
                .valor(valor)
                .ticketId(ticketId)
                .build();
    }

    @Transactional
    public boolean processarPagamento(Long ticketId) {
        Ticket ticket = ticketService.buscarPorId(ticketId);
        if (ticket == null || ticket.getStatus() != StatusTicket.ATIVO) return false;
        Pagamento pagamento = pagamentoService.criarPagamento(ticket, ticket.getValorCalculado());
        pagamento.setStatus(com.smartpark.enums.StatusPagamento.PAGO);
        pagamento.setMetodoPagamento("QR_CODE");
        ticket.setStatus(StatusTicket.PAGO);
        ticketService.salvar(ticket);
        Vaga vaga = ticket.getVaga();
        vaga.setStatus(StatusVaga.LIVRE);
        vagaService.salvar(vaga);
        ticket.setStatus(StatusTicket.FINALIZADO);
        ticketService.salvar(ticket);
        return true;
    }

    public TicketResponseDTO buscarTicket(Long id) {
        Ticket t = ticketService.buscarPorId(id);
        if (t == null) return null;
        return TicketResponseDTO.builder()
                .id(t.getId())
                .placa(t.getVeiculo().getPlaca())
                .vagaCodigo(t.getVaga().getCodigo())
                .dataHoraEntrada(t.getDataHoraEntrada())
                .status(t.getStatus().toString())
                .valor(t.getValorCalculado())
                .build();
    }
}
