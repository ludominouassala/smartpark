package com.smartpark.repository;

import com.smartpark.model.Vaga;
import com.smartpark.enums.StatusVaga;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import java.util.List;
public interface VagaRepository extends JpaRepository<Vaga, Long> {
    Optional<Vaga> findFirstByStatus(StatusVaga status);
    List<Vaga> findByStatus(StatusVaga status);
}
