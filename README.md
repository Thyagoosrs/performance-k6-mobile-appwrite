## 👥 Equipe

| Nome |
|------|
| **Lucas Carvalho Cunha** |
| **Madona Schvambach** |
| **Samira Martinho Rodrigues** |
| **Thyago Soares Rodrigues da Silva** |

---

## 📋 Sobre o Projeto

Suite de **testes de performance** para avaliar o [Appwrite](https://appwrite.io/) sob carga, simulando cenários reais de uso mobile.

### 📁 Estrutura

```
testesk6/
├── src/tests/performance_mobile.js   # Script principal
├── src/lib/report-utils.js           # Gerador de relatórios HTML
├── src/config/                       # Configurações (Appwrite, teste)
├── reports/                          # Relatórios gerados
└── README.md
```

---

## 📦 Pré-requisitos

| Ferramenta | Versão | Verificar |
|------------|--------|-----------|
| Docker | 20.10+ | `docker --version` |
| k6 | 0.45+ | `k6 version` |

**Sistema:** Windows 10+, macOS 10.15+, ou Linux | 8GB RAM (16GB recomendado) | 4+ cores

---

## 🐳 Instalação Rápida

### Docker

| SO | Comando |
|----|---------|
| **Windows** | Baixar [Docker Desktop](https://www.docker.com/products/docker-desktop) |
| **macOS** | `brew install --cask docker` |
| **Linux** | [Guia oficial](https://docs.docker.com/engine/install/) |

### k6

| SO | Comando |
|----|---------|
| **Windows** | `choco install k6` ou `winget install k6` |
| **macOS** | `brew install k6` |
| **Linux** | [Guia oficial](https://k6.io/docs/get-started/installation/) |

### Appwrite

```bash
# Criar pasta e executar instalador
mkdir appwrite && cd appwrite
docker run -it --rm \
    --volume /var/run/docker.sock:/var/run/docker.sock \
    --volume "$(pwd)"/appwrite:/usr/src/code/appwrite:rw \
    --entrypoint install \
    appwrite/appwrite:latest
```

**Configuração:** HTTP `9090` | HTTPS `9443` | Hostname `localhost`

Após instalar, acesse `http://localhost:9090`, crie conta, projeto, database, collection e bucket. Copie os IDs para `src/config/appwrite.config.js`.

---

## ▶️ Executando os Testes

### 1. Configurar variáveis de ambiente

```powershell
# Windows PowerShell
$env:K6_WEB_DASHBOARD = "true"
$env:K6_WEB_DASHBOARD_EXPORT = "reports/relatorio.html"
```

```bash
# macOS/Linux
export K6_WEB_DASHBOARD="true"
export K6_WEB_DASHBOARD_EXPORT="reports/relatorio.html"
```

### 2. Executar

```bash
# Teste de Carga (padrão)
k6 run src/tests/performance_mobile.js --summary-export=reports/summary.json

# Outros tipos
k6 run -e TEST_TYPE=stress src/tests/performance_mobile.js
k6 run -e TEST_TYPE=spike src/tests/performance_mobile.js
k6 run -e TEST_TYPE=smoke src/tests/performance_mobile.js
```

## 📊 Relatórios Gerados

| Arquivo | Descrição |
|---------|-----------|
| `reports/relatorio.html` | Dashboard K6 interativo |
| `reports/relatorio_performance.html` | Relatório executivo (KPIs, gráficos, recomendações) |
| `reports/relatorio_dados.json` | Dados brutos em JSON |
| `reports/summary.json` | Métricas do teste |

---

## 🎭 Perfis de Usuário Simulados

| Perfil | % Tráfego | Comportamento |
|--------|-----------|---------------|
| 🧘 Casual | 50% | Navega, olha listagens |
| 🔥 Ativo | 30% | Cria e edita conteúdo |
| 🆕 Novo | 15% | Criando conta |
| 🔄 Background | 5% | Sincronização em segundo plano |

**Dispositivos simulados:** iPhone 15 Pro, Galaxy S24, Pixel 8 Pro, iPad Pro, Xiaomi 14  
**Redes:** 5G, 4G/LTE, 4G, 3G, WiFi (com latências realistas)

---

## 📈 Monitoramento (durante o teste)

```bash
docker stats --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}"
```

| Métrica | Saudável | Crítico |
|---------|----------|---------|
| CPU appwrite | < 200% | > 400% |
| CPU mariadb | < 50% | > 100% |
| Memória | < 80% | > 90% |

---

## 🔍 Troubleshooting

| Problema | Solução |
|----------|---------|
| Docker não inicia | `docker info` para verificar, reiniciar Docker Desktop |
| Appwrite não responde | `docker ps` + `docker logs appwrite` |
| k6 não encontrado | Verificar PATH: `k6 version` |
| Conexão recusada | Verificar porta 9090: `netstat -an \| findstr 9090` |

---

## 📚 Recursos

- [k6 Docs](https://k6.io/docs/) | [Appwrite Docs](https://appwrite.io/docs) | [Docker Docs](https://docs.docker.com/)

---

### Desenvolvido com ❤️ para testes de performance
