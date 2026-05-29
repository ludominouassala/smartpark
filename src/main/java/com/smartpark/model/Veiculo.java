package com.smartpark.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import com.smartpark.enums.TipoVeiculo;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "veiculos")
public class Veiculo {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(unique = true, nullable = false, length = 10)
    private String placa;
    private String modelo;
    private String cor;
    @Enumerated(EnumType.STRING)
    private TipoVeiculo tipo;
    private LocalDateTime dataCadastro;
    @PrePersist
    protected void onCreate() { dataCadastro = LocalDateTime.now(); }
}
