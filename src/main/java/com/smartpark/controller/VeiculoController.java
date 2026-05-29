package com.smartpark.controller;
import com.smartpark.model.Veiculo;
import com.smartpark.service.VeiculoService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import java.util.List;
@RestController @RequestMapping("/veiculos") @RequiredArgsConstructor
public class VeiculoController {
    private final VeiculoService service;
    @GetMapping public List<Veiculo> listar() { return service.listarTodos(); }
    @GetMapping("/{placa}") public Veiculo buscar(@PathVariable String placa) {
        return service.buscarPorPlaca(placa);
    }
}
