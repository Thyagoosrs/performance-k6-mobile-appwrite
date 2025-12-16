// ============================================
// CONFIGURAÇÕES DOS TIPOS DE TESTE
// ============================================
// Use a variável de ambiente TEST_TYPE para selecionar:
// k6 run -e TEST_TYPE=load ./src/tests/performance_mobile.js
// k6 run -e TEST_TYPE=stress ./src/tests/performance_mobile.js
// k6 run -e TEST_TYPE=endurance ./src/tests/performance_mobile.js
// k6 run -e TEST_TYPE=spike ./src/tests/performance_mobile.js

// ============================================
// TESTE DE CARGA (Load Test) - Padrão
// ============================================
// Objetivo: Validar performance sob carga normal esperada
// Duração: ~3.5 minutos
export const LOAD_TEST = {
    name: 'Teste de Carga (Load Test)',
/*
    stages: [
        { duration: '30s', target: 20 },   // Ramp-up: Aquecer o sistema
        { duration: '1m', target: 50 },    // Carga sustentada normal
        { duration: '30s', target: 80 },   // Pico moderado
        { duration: '1m', target: 50 },    // Estabilização
        { duration: '30s', target: 0 },    // Ramp-down
    ],
*/
//    /*
    stages: [
        { duration: "1m", target:  30,  },
        { duration: "5m", target: 50,  },
        { duration: "5m", target: 70,  },
        { duration: "5m", target: 90,  },
        { duration: "5m", target: 110,  },
        { duration: "5m", target: 130, },
        { duration: "5m", target: 150, },
        { duration: "5m", target: 200, },
        { duration: "1m", target:  100,  },
        { duration: "1m", target:  0,   },
      ],
    //   */
};

// ============================================
// TESTE DE STRESS (Stress Test)
// ============================================
// Objetivo: Encontrar o ponto de ruptura do sistema
// Duração: ~5 minutos
export const STRESS_TEST = {
    name: 'Teste de Stress (Stress Test)',
    description: 'Identifica o ponto de ruptura do sistema sob carga extrema',
    stages: [
        { duration: '30s', target: 50 },   // Ramp-up rápido
        { duration: '1m', target: 100 },   // Carga alta
        { duration: '30s', target: 150 },  // Carga muito alta
        { duration: '1m', target: 200 },   // Carga extrema (ponto de ruptura)
        { duration: '30s', target: 250 },  // Além do limite
        { duration: '1m', target: 0 },     // Ramp-down para avaliar recuperação
    ],
 /*
    stages: [ 
        { duration: "30s", target: 10  },
        { duration: "30s", target: 30  },
        { duration: "30s", target: 50  },
        { duration: "2m", target: 100  },
        { duration: "2m", target: 150  },
        { duration: "2m", target: 200  },
        { duration: "2m", target: 250  },
        { duration: "2m", target: 300  },
        { duration: "2m", target: 350  },
        { duration: "2m", target: 400  },
        { duration: "2m", target: 450  },
        { duration: "2m", target: 500  },
        { duration: "2m", target: 550  },
        { duration: "2m", target: 600  },
        { duration: "2m", target: 650  },
        { duration: "2m", target: 700  },
        { duration: "20m", target: 700 },
        { duration: "1m", target: 600  },
        { duration: "1m", target: 500  },
        { duration: "1m", target: 400  },
        { duration: "1m", target: 300  },
        { duration: "1m", target: 200  },
        { duration: "1m", target: 100  },
        { duration: "1m", target: 0    },
      ],
      */
};

// ============================================
// TESTE DE ENDURANCE / SOAK (Endurance Test)
// ============================================
// Objetivo: Verificar estabilidade por período prolongado
// Duração: ~15 minutos (pode aumentar para horas em produção)
export const ENDURANCE_TEST = {
    name: 'Teste de Endurance (Soak Test)',
    description: 'Verifica estabilidade e vazamentos de memória em período prolongado',
    stages: [
        { duration: '1m', target: 50 },    // Ramp-up gradual
        { duration: '10m', target: 50 },   // Carga sustentada por longo período
        { duration: '2m', target: 80 },    // Pequeno aumento para testar estabilidade
        { duration: '2m', target: 0 },     // Ramp-down lento
    ],
};

// ============================================
// TESTE DE SPIKE (Spike Test)
// ============================================
// Objetivo: Testar resposta a picos súbitos de carga
// Duração: ~4 minutos
export const SPIKE_TEST = {
    name: 'Teste de Spike (Spike Test)',
    description: 'Avalia resposta do sistema a picos súbitos de tráfego',
    stages: [
        { duration: '30s', target: 20 },   // Carga normal
        { duration: '10s', target: 200 },  // SPIKE! Aumento súbito
        { duration: '1m', target: 200 },   // Mantém pico
        { duration: '10s', target: 20 },   // Queda súbita
        { duration: '1m', target: 20 },    // Recuperação
        { duration: '10s', target: 150 },  // Segundo spike
        { duration: '30s', target: 150 },  // Mantém
        { duration: '30s', target: 0 },    // Ramp-down
    ],
};

// ============================================
// TESTE DE BREAKPOINT (Breakpoint Test)
// ============================================
// Objetivo: Encontrar limite máximo de capacidade
// Duração: ~6 minutos
export const BREAKPOINT_TEST = {
    name: 'Teste de Breakpoint',
    description: 'Aumenta carga progressivamente até encontrar o limite máximo',
    stages: [
        { duration: '30s', target: 50 },   // Início
        { duration: '30s', target: 100 },  // +50
        { duration: '30s', target: 150 },  // +50
        { duration: '30s', target: 200 },  // +50
        { duration: '30s', target: 250 },  // +50
        { duration: '30s', target: 300 },  // +50
        { duration: '30s', target: 350 },  // +50
        { duration: '30s', target: 400 },  // +50 (provavelmente quebra aqui)
        { duration: '1m', target: 0 },     // Ramp-down
    ],
};

// ============================================
// TESTE RÁPIDO (Smoke Test)
// ============================================
// Objetivo: Verificação rápida de sanidade
// Duração: ~1 minuto
export const SMOKE_TEST = {
    name: 'Teste Rápido (Smoke Test)',
    description: 'Verificação rápida de sanidade do sistema',
    stages: [
        { duration: '10s', target: 5 },    // Poucos usuários
        { duration: '30s', target: 10 },   // Carga mínima
        { duration: '20s', target: 0 },    // Finaliza
    ],
};

// ============================================
// MAPA DE TIPOS DE TESTE
// ============================================
export const TEST_TYPES = {
    load: LOAD_TEST,
    stress: STRESS_TEST,
    endurance: ENDURANCE_TEST,
    soak: ENDURANCE_TEST,        // Alias para endurance
    spike: SPIKE_TEST,
    breakpoint: BREAKPOINT_TEST,
    smoke: SMOKE_TEST,
};

// Função para obter configuração do teste
// Nota: NÃO usar console.log aqui pois é chamado para cada VU
export function getTestConfig(testType) {
    const type = (testType || 'load').toLowerCase();
    const config = TEST_TYPES[type];
    
    if (!config) {
        return LOAD_TEST;
    }
    
    return config;
}

// Função para exibir info do teste (chamar apenas uma vez no setup)
export function logTestInfo(testType) {
    const type = (testType || 'load').toLowerCase();
    const config = TEST_TYPES[type] || LOAD_TEST;
    
    console.log(`\n🧪 Executando: ${config.name}`);
    console.log(`📋 ${config.description}\n`);
}

// ============================================
// THRESHOLDS (metas de performance)
// ============================================
export const THRESHOLDS = {
    // Performance geral
    http_req_duration: ['p(95)<3000'],
    taxa_sucesso: ['rate>0.70'],
    
    // Operações de banco de dados
    db_criar_documento: ['p(95)<2500'],
    db_ler_documento: ['p(95)<1500'],
    db_listar_documentos: ['p(95)<2000'],
    
    // Health check
    health_check: ['p(95)<500'],
    
    // Erros críticos de servidor (devem ser ZERO)
    erros_500_server_error: ['count==0'],
    erros_502_bad_gateway: ['count==0'],
    erros_503_service_unavailable: ['count==0'],
    erros_504_gateway_timeout: ['count==0'],
    
    // Erros de cliente (tolerância baixa)
    erros_400_bad_request: ['count<10'],
    erros_401_unauthorized: ['count<5'],
    erros_404_not_found: ['count<20'],
    erros_429_too_many_requests: ['count<5'],
};

// Estatísticas a serem exibidas no sumário
export const SUMMARY_TREND_STATS = ['avg', 'min', 'max', 'p(90)', 'p(95)', 'p(99)'];

// ============================================
// PERFIS DE USUÁRIO MOBILE
// ============================================
export const USER_PROFILES = {
    casual: {
        nome: 'casual',
        peso: 0.50,
        descricao: 'Só navega, olha listagens, não cria nada',
        acoes: [
            { tipo: 'listar_documentos', peso: 0.35, pausa: [2, 4] },
            { tipo: 'ler_documento', peso: 0.30, pausa: [3, 5] },
            { tipo: 'query_documentos', peso: 0.15, pausa: [2, 3] },
            { tipo: 'listar_arquivos', peso: 0.10, pausa: [2, 4] },
            { tipo: 'download_arquivo', peso: 0.05, pausa: [3, 5] },
            { tipo: 'health_check', peso: 0.05, pausa: [1, 2] },
        ],
    },
    ativo: {
        nome: 'ativo',
        peso: 0.30,
        descricao: 'Usa o app ativamente, cria e edita conteúdo',
        acoes: [
            { tipo: 'criar_documento', peso: 0.25, pausa: [1, 3] },
            { tipo: 'atualizar_documento', peso: 0.20, pausa: [1, 2] },
            { tipo: 'listar_documentos', peso: 0.15, pausa: [1, 2] },
            { tipo: 'ler_documento', peso: 0.12, pausa: [0.5, 1.5] },
            { tipo: 'upload_arquivo', peso: 0.10, pausa: [2, 4] },
            { tipo: 'download_arquivo', peso: 0.08, pausa: [1, 3] },
            { tipo: 'query_documentos', peso: 0.05, pausa: [1, 2] },
            { tipo: 'listar_arquivos', peso: 0.03, pausa: [1, 2] },
            { tipo: 'deletar_documento', peso: 0.01, pausa: [1, 2] },
            { tipo: 'deletar_arquivo', peso: 0.01, pausa: [1, 2] },
        ],
    },
    novo: {
        nome: 'novo',
        peso: 0.15,
        descricao: 'Acabou de instalar o app, está criando conta',
        acoes: [
            { tipo: 'criar_usuario', peso: 0.40, pausa: [3, 6] },
            { tipo: 'atualizar_preferencias', peso: 0.20, pausa: [2, 4] },
            { tipo: 'listar_documentos', peso: 0.20, pausa: [2, 4] },
            { tipo: 'listar_arquivos', peso: 0.10, pausa: [2, 4] },
            { tipo: 'health_check', peso: 0.10, pausa: [1, 2] },
        ],
    },
    background: {
        nome: 'background',
        peso: 0.05,
        descricao: 'App sincronizando em segundo plano',
        acoes: [
            { tipo: 'health_check', peso: 0.40, pausa: [0.1, 0.5] },
            { tipo: 'listar_documentos', peso: 0.30, pausa: [0.2, 0.5] },
            { tipo: 'listar_arquivos', peso: 0.15, pausa: [0.2, 0.5] },
            { tipo: 'query_documentos', peso: 0.15, pausa: [0.1, 0.3] },
        ],
    },
};
