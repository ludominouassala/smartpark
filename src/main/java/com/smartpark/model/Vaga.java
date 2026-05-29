package com.smartpark.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import com.smartpark.enums.StatusVaga;

@Data @NoArgsConstructor @AllArgsConstructor
@Entity @Table(name = "vagas")
public class Vaga {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(unique = true, nullable = false, length = 5)
    private String codigo;
    @Enumerated(EnumType.STRING)
    private StatusVaga status;
    private String tipo;
}
