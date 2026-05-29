
# SmartPark - Sistema Inteligente de Gestão de Estacionamento

SmartPark é uma API REST desenvolvida em Java Spring Boot para gerenciar estacionamentos de forma automatizada. O sistema controla entrada/saída de veículos, alocação de vagas, cálculo de tempo/valor, geração de QR Code simulado e pagamento.

## Tecnologias

- Java 17
- Spring Boot 3.1.5
- Spring Data JPA / Hibernate
- PostgreSQL
- Maven
- Lombok
- Jakarta Validation

## Funcionalidades

- Cadastro automático de veículos por placa
- Alocação inteligente de vagas livres
- Geração de ticket com data/hora de entrada
- Cálculo automático do valor do estacionamento (R$ 5,00/hora)
- Geração de QR Code simulado para pagamento
- Processamento de pagamento e liberação da vaga
- Consulta de tickets e status de vagas
- Pré-carga de 20 vagas iniciais ao iniciar o sistema

## Pre-requisitos

- JDK 17
- Maven
- PostgreSQL (versão 12 ou superior)

## Configuração do Banco de Dados

1. Acesse o PostgreSQL:
   ```bash
   sudo -u postgres psql
```

2. Crie o banco de dados:
   ```sql
   CREATE DATABASE smartpark_db;
   ```
3. (Opcional) Altere usuário e senha no application.properties se necessário.

Executando o Projeto

1. Clone o repositório:
   ```bash
   git clone https://github.com/seu-usuario/smartpark.git
   cd smartpark
   ```
2. Execute com Maven:
   ```bash
   mvn spring-boot:run
   ```

A API estará disponível em: http://localhost:8080/api

Estrutura do Projeto

```
smartpark/
├── src/main/java/com/smartpark/
│   ├── SmartParkApplication.java
│   ├── controller/
│   ├── service/
│   ├── repository/
│   ├── model/
│   ├── dto/request/
│   ├── dto/response/
│   ├── enums/
│   └── config/
└── src/main/resources/
    └── application.properties
```

Endpoints da API

Metodo Endpoint Descricao
POST /api/tickets/entrada Registra entrada de um veiculo
POST /api/tickets/saida Solicita saida e gera QR Code
POST /api/pagamentos/{ticketId} Processa pagamento e libera vaga
GET /api/tickets/{id} Consulta dados de um ticket
GET /api/vagas Lista todas as vagas e seus status
GET /api/veiculos Lista todos os veiculos cadastrados
GET /api/veiculos/{placa} Busca veiculo por placa

Fluxo Completo de Uso

1. Entrada: POST /api/tickets/entrada com a placa do veiculo. Sistema aloca vaga livre e retorna o ticket (ID, vaga, horario).
2. Saida: POST /api/tickets/saida com o ticketId. Calcula o valor (R$ 5/hora) e retorna QR Code simulado + link de pagamento.
3. Pagamento: POST /api/pagamentos/{ticketId} Confirma pagamento, libera a vaga e finaliza o ticket.

Exemplos de Requisicoes

1. Registrar entrada

```bash
curl -X POST http://localhost:8080/api/tickets/entrada \
  -H "Content-Type: application/json" \
  -d '{"placa":"ABC-1234","modelo":"Civic","cor":"Preto"}'
```

Resposta:

```json
{
  "id": 1,
  "placa": "ABC-1234",
  "vagaCodigo": "A001",
  "dataHoraEntrada": "2025-03-29T10:30:00",
  "status": "ATIVO"
}
```

2. Solicitar saida

```bash
curl -X POST http://localhost:8080/api/tickets/saida \
  -H "Content-Type: application/json" \
  -d '{"ticketId":1}'
```

Resposta:

```json
{
  "qrCodeData": "PAGAR_1_10.0",
  "urlPagamento": "http://localhost:8080/api/pagamentos/1",
  "valor": 10.0,
  "ticketId": 1
}
```

3. Processar pagamento

```bash
curl -X POST http://localhost:8080/api/pagamentos/1
```

Resposta: Pagamento OK

4. Consultar vagas

```bash
curl http://localhost:8080/api/vagas
```

Resposta:

```json
[
  { "id": 1, "codigo": "A001", "status": "LIVRE", "tipo": "NORMAL" },
  { "id": 2, "codigo": "A002", "status": "OCUPADA", "tipo": "NORMAL" }
]
```

Melhorias Futuras

· Autenticacao JWT (admin vs condutor)
· Dashboard administrativo com estatisticas
· Integracao real com gateway de pagamento
· Geracao de QR Code funcional (ZXing)
· Relatorios de faturamento
· Lock otimista/pessimista para concorrencia
· Documentacao Swagger/OpenAPI

