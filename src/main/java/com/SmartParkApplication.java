package com.smartpark;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class SmartParkApplication {

    public static void main(String[] args) {
        SpringApplication.run(SmartParkApplication.class, args);
        System.out.println("🚀 SmartPark System started successfully!");
        System.out.println("📝 Endpoints disponíveis:");
        System.out.println("   POST /api/tickets/entrada - Registrar entrada");
        System.out.println("   POST /api/tickets/saida - Registrar saída");
        System.out.println("   POST /api/pagamentos/{id} - Processar pagamento");
        System.out.println("   GET  /api/vagas - Listar vagas");
        System.out.println("   GET  /api/tickets/{id} - Buscar ticket");
    }
}