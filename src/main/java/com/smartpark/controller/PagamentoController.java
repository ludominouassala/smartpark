package com.smartpark.controller;
import com.smartpark.service.EstacionamentoService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
@RestController @RequestMapping("/pagamentos") @RequiredArgsConstructor
public class PagamentoController {
    private final EstacionamentoService service;
    public EstacionamentoService getService() {
        return service;
    }
    @PostMapping("/{ticketId}") public String pagar(@PathVariable Long ticketId) {
        return service.processarPagamento(ticketId) ? "Pagamento OK" : "Falha";
    }
}
