package com.smartpark.controller;
import com.smartpark.model.Vaga;
import com.smartpark.service.VagaService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import java.util.List;
@RestController @RequestMapping("/vagas") @RequiredArgsConstructor
public class VagaController {
    private final VagaService service;
    @GetMapping public List<Vaga> listar() { return service.listarTodas(); }
}
