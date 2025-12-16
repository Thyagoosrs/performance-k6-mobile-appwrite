
## 🖥️ Ambiente de Testes

### Hardware Utilizado

| Componente | Especificação |
|------------|---------------|
| **Equipamento** | Dell Inspiron 14 5440 |
| **Processador** | Intel Core 7 150U (1.80 GHz base, 10 núcleos) |
| **Memória RAM** | 32 GB DDR5 (5200 MT/s) |
| **Armazenamento** | SSD NVMe SK hynix 512GB |
| **Sistema Operacional** | Windows 11 Pro |

### Software e Versões

| Componente | Versão |
|------------|--------|
| **Appwrite** | 1.7.5 |
| **Docker Desktop** | Última versão estável |
| **K6** | Última versão estável |
| **MariaDB** | 10.11 |
| **Redis** | 7.2.4-alpine |

### Arquitetura do Ambiente

```
┌─────────────────────────────────────────────────────────────┐
│                    NOTEBOOK LOCAL                           │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────────────────────────────────────────────────┐   │
│  │              DOCKER DESKTOP (WSL2)                   │   │
│  │                                                      │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐   │   │
│  │  │  Appwrite   │  │  MariaDB    │  │   Redis     │   │   │
│  │  │  (Backend)  │  │  (Banco)    │  │   (Cache)   │   │   │
│  │  └─────────────┘  └─────────────┘  └─────────────┘   │   │
│  │                                                      │   │
│  │  + 23 outros containers (workers, schedulers, etc.)  │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────┐                                            │
│  │     K6      │  ← Ferramenta de Teste de Carga            │
│  │ (localhost) │                                            │
│  └─────────────┘                                            │
└─────────────────────────────────────────────────────────────┘
```

**Total de Containers:** 26 containers Docker rodando simultaneamente.

---

## 🔧 Ajustes Realizados na Infraestrutura

### Objetivo dos Ajustes

Criar um ambiente de testes **controlado e previsível**, onde:
- Cada componente tenha recursos garantidos
- Os resultados sejam reproduzíveis
- A competição por recursos seja minimizada
- Os dados obtidos sejam mais próximos de um cenário de produção

### Configurações Aplicadas

### Distribuição de Recursos (Docker Compose)

```
┌─────────────────────────────────────────────────────────────┐
│                    CPU TOTAL: 10 NÚCLEOS                    │
├─────────────────────────────────────────────────────────────┤
│  ┌────────────────┐  4 cores                                │
│  │    Appwrite    │  ████████░░                             │
│  └────────────────┘                                         │
│  ┌────────────────┐  2 cores                                │
│  │    MariaDB     │  ████░░░░░░                             │
│  └────────────────┘                                         │
│  ┌────────────────┐  ~2-3 cores (dinâmico)                  │
│  │  Outros + K6   │  █████░░░░░                             │
│  └────────────────┘                                         │
│  ┌────────────────┐  ~1-2 cores                             │
│  │    Windows     │  ███░░░░░░░                             │
│  └────────────────┘                                         │
└─────────────────────────────────────────────────────────────┘
```

---

## 🎯 Limitações Conhecidas do Ambiente

### 1. Ambiente Compartilhado

O K6 (ferramenta de teste) roda no mesmo hardware que o Appwrite. Em um cenário ideal de testes de performance, o gerador de carga deveria estar em uma máquina separada.

### 2. Processador de Baixo Consumo

O Intel Core 7 150U é um processador da série "U" (Ultra-Low Power), otimizado para notebooks com foco em eficiência energética, não para cargas de servidor.

### 3. Virtualização Docker no Windows

O Docker Desktop no Windows utiliza WSL2 (Windows Subsystem for Linux), que adiciona uma camada de virtualização. Em produção, containers rodariam nativamente em Linux.

---

## 📝 Recomendações para Testes Futuros

### Curto Prazo
- [x] Aplicar limites de recursos nos containers principais
- [ ] Executar testes com diferentes perfis de carga (smoke, load, stress)
- [ ] Documentar resultados comparativos

### Médio Prazo
- [ ] Configurar ambiente de testes em VM na nuvem (AWS/Azure/GCP)
- [ ] Separar K6 do ambiente testado
- [ ] Implementar monitoramento com Grafana/Prometheus

### Longo Prazo
- [ ] Definir baseline de performance em ambiente dedicado
- [ ] Estabelecer thresholds baseados em requisitos de negócio
- [ ] Integrar testes de performance no pipeline de CI/CD

---




## 📞 Contato

Para dúvidas sobre este relatório ou sobre os testes de performance, entre em contato com o time:

| **Lucas Carvalho Cunha** |
| **Madona Schvambach** |
| **Samira Martinho Rodrigues** |
| **Thyago Soares Rodrigues da Silva** |