package com.smartpark.config;
import com.smartpark.enums.StatusVaga;
import com.smartpark.model.Vaga;
import com.smartpark.repository.VagaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
@Component @RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {
    private final VagaRepository vagaRepository;
    @Override
    public void run(String... args) {
        if (vagaRepository.count() == 0) {
            for (int i = 1; i <= 20; i++) {
                Vaga v = new Vaga();
                v.setCodigo(String.format("A%03d", i));
                v.setStatus(StatusVaga.LIVRE);
                v.setTipo("NORMAL");
                vagaRepository.save(v);
            }
            System.out.println("✅ 20 vagas criadas");
        }
    }
}
