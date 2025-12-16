import http from 'k6/http';
import { check, group, sleep } from 'k6';
import { Trend, Counter, Rate } from 'k6/metrics';
import { textSummary } from "https://jslib.k6.io/k6-summary/0.0.3/index.js";
import { generateHtmlReport } from "../lib/report-utils.js";
import { getTestConfig, logTestInfo, THRESHOLDS, USER_PROFILES } from "../config/test.config.js";

// ============================================
// SELEÇÃO DO TIPO DE TESTE
// ============================================
// Use: k6 run -e TEST_TYPE=stress ./src/tests/performance_mobile.js
// Tipos disponíveis: load, stress, endurance, spike, breakpoint, smoke
const TEST_TYPE = __ENV.TEST_TYPE || 'load';
const testConfig = getTestConfig(TEST_TYPE);

export function setup() {
    logTestInfo(TEST_TYPE);
    return { testType: TEST_TYPE };
}

// ============================================
// PERFIS DE USUÁRIO MOBILE
// ============================================
const PERFIS = USER_PROFILES;

// ============================================
// MÉTRICAS PERSONALIZADAS
// ============================================
// Por operação
const dbCreateTrend = new Trend('db_criar_documento');
const dbReadTrend = new Trend('db_ler_documento');
const dbUpdateTrend = new Trend('db_atualizar_documento');
const dbDeleteTrend = new Trend('db_deletar_documento');
const dbListTrend = new Trend('db_listar_documentos');
const dbQueryTrend = new Trend('db_query_documentos');
const authCreateUserTrend = new Trend('auth_criar_usuario');
const authGetUserTrend = new Trend('auth_obter_usuario');
const authListUsersTrend = new Trend('auth_listar_usuarios');
const authDeleteUserTrend = new Trend('auth_deletar_usuario');
const authUpdatePrefsTrend = new Trend('auth_atualizar_prefs');
const healthTrend = new Trend('health_check');

// Storage
const storageUploadTrend = new Trend('storage_upload_arquivo');
const storageDownloadTrend = new Trend('storage_download_arquivo');
const storageListTrend = new Trend('storage_listar_arquivos');
const storageDeleteTrend = new Trend('storage_deletar_arquivo');

// Contadores gerais
const requestsSuccess = new Counter('requisicoes_sucesso');
const requestsFailed = new Counter('requisicoes_falha');
const successRate = new Rate('taxa_sucesso');

// Contadores por CÓDIGO DE ERRO HTTP
const erros_400_bad_request = new Counter('erros_400_bad_request');
const erros_401_unauthorized = new Counter('erros_401_unauthorized');
const erros_403_forbidden = new Counter('erros_403_forbidden');
const erros_404_not_found = new Counter('erros_404_not_found');
const erros_409_conflict = new Counter('erros_409_conflict');
const erros_429_too_many_requests = new Counter('erros_429_too_many_requests');
const erros_500_server_error = new Counter('erros_500_server_error');
const erros_502_bad_gateway = new Counter('erros_502_bad_gateway');
const erros_503_service_unavailable = new Counter('erros_503_service_unavailable');
const erros_504_gateway_timeout = new Counter('erros_504_gateway_timeout');
const erros_outros = new Counter('erros_outros');

// ============================================
// RASTREAMENTO DE ERROS POR OPERAÇÃO
// ============================================
// Objeto para armazenar erros por operação (será exportado para o relatório)
const errosPorOperacao = {};

// Counters para cada operação - rastreia erros específicos
const erroOperacao = {
    listar_documentos: new Counter('erro_op_listar_documentos'),
    ler_documento: new Counter('erro_op_ler_documento'),
    query_documentos: new Counter('erro_op_query_documentos'),
    criar_documento: new Counter('erro_op_criar_documento'),
    atualizar_documento: new Counter('erro_op_atualizar_documento'),
    deletar_documento: new Counter('erro_op_deletar_documento'),
    criar_usuario: new Counter('erro_op_criar_usuario'),
    obter_usuario: new Counter('erro_op_obter_usuario'),
    listar_usuarios: new Counter('erro_op_listar_usuarios'),
    deletar_usuario: new Counter('erro_op_deletar_usuario'),
    health_check: new Counter('erro_op_health_check'),
    upload_arquivo: new Counter('erro_op_upload_arquivo'),
    download_arquivo: new Counter('erro_op_download_arquivo'),
    listar_arquivos: new Counter('erro_op_listar_arquivos'),
    deletar_arquivo: new Counter('erro_op_deletar_arquivo'),
};

// Counters detalhados: erro + operação + código HTTP
const erroDetalhado = {
    listar_documentos: { 400: new Counter('erro_det_listar_documentos_400'), 401: new Counter('erro_det_listar_documentos_401'), 403: new Counter('erro_det_listar_documentos_403'), 404: new Counter('erro_det_listar_documentos_404'), 409: new Counter('erro_det_listar_documentos_409'), 429: new Counter('erro_det_listar_documentos_429'), 500: new Counter('erro_det_listar_documentos_500'), 502: new Counter('erro_det_listar_documentos_502'), 503: new Counter('erro_det_listar_documentos_503'), 504: new Counter('erro_det_listar_documentos_504'), outros: new Counter('erro_det_listar_documentos_outros') },
    ler_documento: { 400: new Counter('erro_det_ler_documento_400'), 401: new Counter('erro_det_ler_documento_401'), 403: new Counter('erro_det_ler_documento_403'), 404: new Counter('erro_det_ler_documento_404'), 409: new Counter('erro_det_ler_documento_409'), 429: new Counter('erro_det_ler_documento_429'), 500: new Counter('erro_det_ler_documento_500'), 502: new Counter('erro_det_ler_documento_502'), 503: new Counter('erro_det_ler_documento_503'), 504: new Counter('erro_det_ler_documento_504'), outros: new Counter('erro_det_ler_documento_outros') },
    query_documentos: { 400: new Counter('erro_det_query_documentos_400'), 401: new Counter('erro_det_query_documentos_401'), 403: new Counter('erro_det_query_documentos_403'), 404: new Counter('erro_det_query_documentos_404'), 409: new Counter('erro_det_query_documentos_409'), 429: new Counter('erro_det_query_documentos_429'), 500: new Counter('erro_det_query_documentos_500'), 502: new Counter('erro_det_query_documentos_502'), 503: new Counter('erro_det_query_documentos_503'), 504: new Counter('erro_det_query_documentos_504'), outros: new Counter('erro_det_query_documentos_outros') },
    criar_documento: { 400: new Counter('erro_det_criar_documento_400'), 401: new Counter('erro_det_criar_documento_401'), 403: new Counter('erro_det_criar_documento_403'), 404: new Counter('erro_det_criar_documento_404'), 409: new Counter('erro_det_criar_documento_409'), 429: new Counter('erro_det_criar_documento_429'), 500: new Counter('erro_det_criar_documento_500'), 502: new Counter('erro_det_criar_documento_502'), 503: new Counter('erro_det_criar_documento_503'), 504: new Counter('erro_det_criar_documento_504'), outros: new Counter('erro_det_criar_documento_outros') },
    atualizar_documento: { 400: new Counter('erro_det_atualizar_documento_400'), 401: new Counter('erro_det_atualizar_documento_401'), 403: new Counter('erro_det_atualizar_documento_403'), 404: new Counter('erro_det_atualizar_documento_404'), 409: new Counter('erro_det_atualizar_documento_409'), 429: new Counter('erro_det_atualizar_documento_429'), 500: new Counter('erro_det_atualizar_documento_500'), 502: new Counter('erro_det_atualizar_documento_502'), 503: new Counter('erro_det_atualizar_documento_503'), 504: new Counter('erro_det_atualizar_documento_504'), outros: new Counter('erro_det_atualizar_documento_outros') },
    deletar_documento: { 400: new Counter('erro_det_deletar_documento_400'), 401: new Counter('erro_det_deletar_documento_401'), 403: new Counter('erro_det_deletar_documento_403'), 404: new Counter('erro_det_deletar_documento_404'), 409: new Counter('erro_det_deletar_documento_409'), 429: new Counter('erro_det_deletar_documento_429'), 500: new Counter('erro_det_deletar_documento_500'), 502: new Counter('erro_det_deletar_documento_502'), 503: new Counter('erro_det_deletar_documento_503'), 504: new Counter('erro_det_deletar_documento_504'), outros: new Counter('erro_det_deletar_documento_outros') },
    criar_usuario: { 400: new Counter('erro_det_criar_usuario_400'), 401: new Counter('erro_det_criar_usuario_401'), 403: new Counter('erro_det_criar_usuario_403'), 404: new Counter('erro_det_criar_usuario_404'), 409: new Counter('erro_det_criar_usuario_409'), 429: new Counter('erro_det_criar_usuario_429'), 500: new Counter('erro_det_criar_usuario_500'), 502: new Counter('erro_det_criar_usuario_502'), 503: new Counter('erro_det_criar_usuario_503'), 504: new Counter('erro_det_criar_usuario_504'), outros: new Counter('erro_det_criar_usuario_outros') },
    obter_usuario: { 400: new Counter('erro_det_obter_usuario_400'), 401: new Counter('erro_det_obter_usuario_401'), 403: new Counter('erro_det_obter_usuario_403'), 404: new Counter('erro_det_obter_usuario_404'), 409: new Counter('erro_det_obter_usuario_409'), 429: new Counter('erro_det_obter_usuario_429'), 500: new Counter('erro_det_obter_usuario_500'), 502: new Counter('erro_det_obter_usuario_502'), 503: new Counter('erro_det_obter_usuario_503'), 504: new Counter('erro_det_obter_usuario_504'), outros: new Counter('erro_det_obter_usuario_outros') },
    listar_usuarios: { 400: new Counter('erro_det_listar_usuarios_400'), 401: new Counter('erro_det_listar_usuarios_401'), 403: new Counter('erro_det_listar_usuarios_403'), 404: new Counter('erro_det_listar_usuarios_404'), 409: new Counter('erro_det_listar_usuarios_409'), 429: new Counter('erro_det_listar_usuarios_429'), 500: new Counter('erro_det_listar_usuarios_500'), 502: new Counter('erro_det_listar_usuarios_502'), 503: new Counter('erro_det_listar_usuarios_503'), 504: new Counter('erro_det_listar_usuarios_504'), outros: new Counter('erro_det_listar_usuarios_outros') },
    deletar_usuario: { 400: new Counter('erro_det_deletar_usuario_400'), 401: new Counter('erro_det_deletar_usuario_401'), 403: new Counter('erro_det_deletar_usuario_403'), 404: new Counter('erro_det_deletar_usuario_404'), 409: new Counter('erro_det_deletar_usuario_409'), 429: new Counter('erro_det_deletar_usuario_429'), 500: new Counter('erro_det_deletar_usuario_500'), 502: new Counter('erro_det_deletar_usuario_502'), 503: new Counter('erro_det_deletar_usuario_503'), 504: new Counter('erro_det_deletar_usuario_504'), outros: new Counter('erro_det_deletar_usuario_outros') },
    health_check: { 400: new Counter('erro_det_health_check_400'), 401: new Counter('erro_det_health_check_401'), 403: new Counter('erro_det_health_check_403'), 404: new Counter('erro_det_health_check_404'), 409: new Counter('erro_det_health_check_409'), 429: new Counter('erro_det_health_check_429'), 500: new Counter('erro_det_health_check_500'), 502: new Counter('erro_det_health_check_502'), 503: new Counter('erro_det_health_check_503'), 504: new Counter('erro_det_health_check_504'), outros: new Counter('erro_det_health_check_outros') },
    upload_arquivo: { 400: new Counter('erro_det_upload_arquivo_400'), 401: new Counter('erro_det_upload_arquivo_401'), 403: new Counter('erro_det_upload_arquivo_403'), 404: new Counter('erro_det_upload_arquivo_404'), 409: new Counter('erro_det_upload_arquivo_409'), 429: new Counter('erro_det_upload_arquivo_429'), 500: new Counter('erro_det_upload_arquivo_500'), 502: new Counter('erro_det_upload_arquivo_502'), 503: new Counter('erro_det_upload_arquivo_503'), 504: new Counter('erro_det_upload_arquivo_504'), outros: new Counter('erro_det_upload_arquivo_outros') },
    download_arquivo: { 400: new Counter('erro_det_download_arquivo_400'), 401: new Counter('erro_det_download_arquivo_401'), 403: new Counter('erro_det_download_arquivo_403'), 404: new Counter('erro_det_download_arquivo_404'), 409: new Counter('erro_det_download_arquivo_409'), 429: new Counter('erro_det_download_arquivo_429'), 500: new Counter('erro_det_download_arquivo_500'), 502: new Counter('erro_det_download_arquivo_502'), 503: new Counter('erro_det_download_arquivo_503'), 504: new Counter('erro_det_download_arquivo_504'), outros: new Counter('erro_det_download_arquivo_outros') },
    listar_arquivos: { 400: new Counter('erro_det_listar_arquivos_400'), 401: new Counter('erro_det_listar_arquivos_401'), 403: new Counter('erro_det_listar_arquivos_403'), 404: new Counter('erro_det_listar_arquivos_404'), 409: new Counter('erro_det_listar_arquivos_409'), 429: new Counter('erro_det_listar_arquivos_429'), 500: new Counter('erro_det_listar_arquivos_500'), 502: new Counter('erro_det_listar_arquivos_502'), 503: new Counter('erro_det_listar_arquivos_503'), 504: new Counter('erro_det_listar_arquivos_504'), outros: new Counter('erro_det_listar_arquivos_outros') },
    deletar_arquivo: { 400: new Counter('erro_det_deletar_arquivo_400'), 401: new Counter('erro_det_deletar_arquivo_401'), 403: new Counter('erro_det_deletar_arquivo_403'), 404: new Counter('erro_det_deletar_arquivo_404'), 409: new Counter('erro_det_deletar_arquivo_409'), 429: new Counter('erro_det_deletar_arquivo_429'), 500: new Counter('erro_det_deletar_arquivo_500'), 502: new Counter('erro_det_deletar_arquivo_502'), 503: new Counter('erro_det_deletar_arquivo_503'), 504: new Counter('erro_det_deletar_arquivo_504'), outros: new Counter('erro_det_deletar_arquivo_outros') },
};

// Contadores por plataforma
const iosRequests = new Counter('requisicoes_ios');
const androidRequests = new Counter('requisicoes_android');

// Contadores por perfil de usuário
const perfilCasualCount = new Counter('perfil_casual');
const perfilAtivoCount = new Counter('perfil_ativo');
const perfilNovoCount = new Counter('perfil_novo');
const perfilBackgroundCount = new Counter('perfil_background');

// ============================================
// CONFIGURAÇÃO DO APPWRITE
// ============================================
const BASE_URL = 'http://localhost:9090/v1'; 
const PROJECT_ID = '693cc982001c2bf6c9ab';
const API_KEY = 'standard_9c4c074b60e91c48a2ae0850fd8a91f16adcc8cffbc538947cd8ff75242948f2f39da0391b0c86274b0ad46a68b7b0d931d15e24a50178b6d019f3c7a675c368852adc70e7568a8eca2ec935535bdf6f9fb2319cfaa8fb9a610b740cd9508a47193170463e66fb2ab6738b19a7aa48370f1983968cb53ea8ef33f3d653701d46';

const DATABASE_ID = '693ccaca0031917bf35b';
const COLLECTION_ID = '693ccad40017cbe94715';
const BUCKET_ID = '693d91c200026a7232e3';

// ============================================
// CONFIGURAÇÃO MOBILE - DISPOSITIVOS
// ============================================
const APP_VERSION = '2.5.0';
const APP_BUILD = '250';
const APP_NAME = 'MeuAppMobile';

const MOBILE_DEVICES = [
    { platform: 'iOS', device: 'iPhone 15 Pro', userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148', osVersion: '17.1', screenWidth: 393, screenHeight: 852 },
    { platform: 'iOS', device: 'iPhone 14', userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148', osVersion: '16.6', screenWidth: 390, screenHeight: 844 },
    { platform: 'iOS', device: 'iPad Pro 12.9', userAgent: 'Mozilla/5.0 (iPad; CPU OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148', osVersion: '17.0', screenWidth: 1024, screenHeight: 1366 },
    { platform: 'Android', device: 'Samsung Galaxy S24', userAgent: 'Mozilla/5.0 (Linux; Android 14; SM-S928B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.6099.43 Mobile Safari/537.36', osVersion: '14', screenWidth: 412, screenHeight: 915 },
    { platform: 'Android', device: 'Google Pixel 8 Pro', userAgent: 'Mozilla/5.0 (Linux; Android 14; Pixel 8 Pro) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.6099.43 Mobile Safari/537.36', osVersion: '14', screenWidth: 412, screenHeight: 892 },
    { platform: 'Android', device: 'Xiaomi 14', userAgent: 'Mozilla/5.0 (Linux; Android 14; 2401DPM57C) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.6045.66 Mobile Safari/537.36', osVersion: '14', screenWidth: 393, screenHeight: 873 },
];

const NETWORK_CONDITIONS = [
    { type: '5G', quality: 'excellent', thinkTimeMultiplier: 1.0 },
    { type: '4G/LTE', quality: 'good', thinkTimeMultiplier: 1.2 },
    { type: '4G', quality: 'fair', thinkTimeMultiplier: 1.5 },
    { type: '3G', quality: 'poor', thinkTimeMultiplier: 2.5 },
    { type: 'WiFi', quality: 'excellent', thinkTimeMultiplier: 0.8 },
];

const LOCALES = ['pt-BR', 'pt-PT', 'en-US', 'es-ES'];

// ============================================
// OPÇÕES DO TESTE (dinâmico baseado em TEST_TYPE)
// ============================================
export const options = {
    stages: testConfig.stages,
    thresholds: THRESHOLDS,
    summaryTrendStats: ['avg', 'min', 'max', 'p(90)', 'p(95)', 'p(99)'],
};

// ============================================
// FUNÇÕES AUXILIARES
// ============================================

function getRandomDevice() {
    return MOBILE_DEVICES[Math.floor(Math.random() * MOBILE_DEVICES.length)];
}

function getRandomNetwork() {
    const weights = [0.15, 0.30, 0.20, 0.05, 0.30];
    const random = Math.random();
    let cumulative = 0;
    for (let i = 0; i < weights.length; i++) {
        cumulative += weights[i];
        if (random < cumulative) return NETWORK_CONDITIONS[i];
    }
    return NETWORK_CONDITIONS[1];
}

function getRandomLocale() {
    return LOCALES[Math.floor(Math.random() * LOCALES.length)];
}

function generateSessionId() {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 16)}`;
}

function generateDeviceId() {
    return `device_${Math.random().toString(36).substr(2, 16)}`;
}

function gerarId() {
    return `test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Headers mobile com informações do perfil
function getHeaders(perfil) {
    const device = getRandomDevice();
    const network = getRandomNetwork();
    const locale = getRandomLocale();
    
    if (device.platform === 'iOS') {
        iosRequests.add(1);
    } else {
        androidRequests.add(1);
    }
    
    return {
        'Content-Type': 'application/json',
        'X-Appwrite-Project': PROJECT_ID,
        'X-Appwrite-Key': API_KEY,
        'User-Agent': device.userAgent,
        'Accept': 'application/json',
        'Accept-Language': locale,
        'Accept-Encoding': 'gzip, deflate, br',
        'X-App-Name': APP_NAME,
        'X-App-Version': APP_VERSION,
        'X-App-Build': APP_BUILD,
        'X-Platform': device.platform,
        'X-Platform-Version': device.osVersion,
        'X-Device-Model': device.device,
        'X-Device-Id': generateDeviceId(),
        'X-Session-Id': generateSessionId(),
        'X-Screen-Width': String(device.screenWidth),
        'X-Screen-Height': String(device.screenHeight),
        'X-Network-Type': network.type,
        'X-Network-Quality': network.quality,
        'X-User-Profile': perfil.nome,
        'X-Client-Type': 'mobile-app',
        'X-Timezone': 'America/Sao_Paulo',
    };
}

function registrarResultado(res, expectedStatus, operacao = null) {
    const isSuccess = res.status === expectedStatus;
    successRate.add(isSuccess);
    
    if (isSuccess) {
        requestsSuccess.add(1);
    } else {
        requestsFailed.add(1);
        
        // Categoriza o erro por código HTTP
        const status = res.status;
        let codigoErro = 'outros';
        
        switch (status) {
            case 400:
                erros_400_bad_request.add(1);
                codigoErro = 400;
                break;
            case 401:
                erros_401_unauthorized.add(1);
                codigoErro = 401;
                break;
            case 403:
                erros_403_forbidden.add(1);
                codigoErro = 403;
                break;
            case 404:
                erros_404_not_found.add(1);
                codigoErro = 404;
                break;
            case 409:
                erros_409_conflict.add(1);
                codigoErro = 409;
                break;
            case 429:
                erros_429_too_many_requests.add(1);
                codigoErro = 429;
                break;
            case 500:
                erros_500_server_error.add(1);
                codigoErro = 500;
                break;
            case 502:
                erros_502_bad_gateway.add(1);
                codigoErro = 502;
                break;
            case 503:
                erros_503_service_unavailable.add(1);
                codigoErro = 503;
                break;
            case 504:
                erros_504_gateway_timeout.add(1);
                codigoErro = 504;
                break;
            default:
                erros_outros.add(1);
                codigoErro = 'outros';
                break;
        }
        
        // Registra erro por operação específica
        if (operacao && erroOperacao[operacao]) {
            erroOperacao[operacao].add(1);
            
            // Registra erro detalhado (operação + código HTTP)
            if (erroDetalhado[operacao] && erroDetalhado[operacao][codigoErro]) {
                erroDetalhado[operacao][codigoErro].add(1);
            }
        }
    }
    return isSuccess;
}

// Escolhe um perfil baseado nos pesos
function escolherPerfil() {
    const rand = Math.random();
    let acumulado = 0;
    
    for (const [nome, perfil] of Object.entries(PERFIS)) {
        acumulado += perfil.peso;
        if (rand <= acumulado) {
            // Conta por perfil
            if (nome === 'casual') perfilCasualCount.add(1);
            else if (nome === 'ativo') perfilAtivoCount.add(1);
            else if (nome === 'novo') perfilNovoCount.add(1);
            else if (nome === 'background') perfilBackgroundCount.add(1);
            return perfil;
        }
    }
    return PERFIS.casual;
}

// Escolhe uma ação baseada nos pesos do perfil
function escolherAcao(perfil) {
    const rand = Math.random();
    let acumulado = 0;
    
    for (const acao of perfil.acoes) {
        acumulado += acao.peso;
        if (rand <= acumulado) return acao;
    }
    return perfil.acoes[0];
}

// Pausa realista baseada na ação
function pausaRealista(acao, network) {
    const [min, max] = acao.pausa;
    const base = Math.random() * (max - min) + min;
    const comRede = base * (network.thinkTimeMultiplier || 1);
    sleep(comRede);
}

// ============================================
// AÇÕES DISPONÍVEIS
// ============================================

// Variável compartilhada para documentos (simula cache local do app)
let documentosCache = [];

function acaoListarDocumentos(params) {
    const res = http.get(
        `${BASE_URL}/databases/${DATABASE_ID}/collections/${COLLECTION_ID}/documents?limit=25`,
        { headers: params.headers, tags: { acao: 'listar_documentos', perfil: params.perfil.nome } }
    );
    
    dbListTrend.add(res.timings.duration);
    
    const sucesso = check(res, {
        'listar documentos - status 200': (r) => r.status === 200,
    });
    
    // Guarda IDs para usar em outras ações
    if (sucesso) {
        try {
            const body = JSON.parse(res.body);
            if (body.documents && body.documents.length > 0) {
                documentosCache = body.documents.map(d => d.$id);
            }
        } catch {}
    }
    
    registrarResultado(res, 200, 'listar_documentos');
    return sucesso;
}

function acaoLerDocumento(params) {
    // Usa um documento do cache ou pega um aleatório
    let docId = documentosCache.length > 0 
        ? documentosCache[Math.floor(Math.random() * documentosCache.length)]
        : null;
    
    if (!docId) {
        // Se não tem cache, lista primeiro
        acaoListarDocumentos(params);
        docId = documentosCache[0];
    }
    
    if (!docId) return false;
    
    const res = http.get(
        `${BASE_URL}/databases/${DATABASE_ID}/collections/${COLLECTION_ID}/documents/${docId}`,
        { headers: params.headers, tags: { acao: 'ler_documento', perfil: params.perfil.nome } }
    );
    
    dbReadTrend.add(res.timings.duration);
    
    check(res, {
        'ler documento - status 200': (r) => r.status === 200,
    });
    
    registrarResultado(res, 200, 'ler_documento');
    return res.status === 200;
}

function acaoQueryDocumentos(params) {
    // Simula busca/paginação usando parâmetros básicos da API
    // Usa offset para simular uma "página" diferente da listagem normal
    const offset = Math.floor(Math.random() * 10); // Offset aleatório 0-9
    
    const res = http.get(
        `${BASE_URL}/databases/${DATABASE_ID}/collections/${COLLECTION_ID}/documents?limit=10&offset=${offset}`,
        { headers: params.headers, tags: { acao: 'query_documentos', perfil: params.perfil.nome } }
    );
    
    dbQueryTrend.add(res.timings.duration);
    
    check(res, {
        'query documentos - status 200': (r) => r.status === 200,
    });
    
    registrarResultado(res, 200, 'query_documentos');
    return res.status === 200;
}

function acaoCriarDocumento(params) {
    const payload = JSON.stringify({
        documentId: 'unique()',
        data: { 
            nome: `Produto ${gerarId()}`, 
            valor: Math.random() * 1000
        }
    });
    
    const res = http.post(
        `${BASE_URL}/databases/${DATABASE_ID}/collections/${COLLECTION_ID}/documents`,
        payload,
        { headers: params.headers, tags: { acao: 'criar_documento', perfil: params.perfil.nome } }
    );
    
    dbCreateTrend.add(res.timings.duration);
    
    const sucesso = check(res, {
        'criar documento - status 201': (r) => r.status === 201,
    });
    
    // Adiciona ao cache
    if (sucesso) {
        try {
            const body = JSON.parse(res.body);
            if (body.$id) documentosCache.push(body.$id);
        } catch {}
    }
    
    registrarResultado(res, 201, 'criar_documento');
    return sucesso;
}

function acaoAtualizarDocumento(params) {
    let docId = documentosCache.length > 0 
        ? documentosCache[Math.floor(Math.random() * documentosCache.length)]
        : null;
    
    if (!docId) {
        // Cria um documento primeiro
        acaoCriarDocumento(params);
        docId = documentosCache[documentosCache.length - 1];
    }
    
    if (!docId) return false;
    
    const payload = JSON.stringify({
        data: { 
            nome: `Produto Atualizado ${Date.now()}`,
            valor: Math.random() * 2000
        }
    });
    
    const res = http.patch(
        `${BASE_URL}/databases/${DATABASE_ID}/collections/${COLLECTION_ID}/documents/${docId}`,
        payload,
        { headers: params.headers, tags: { acao: 'atualizar_documento', perfil: params.perfil.nome } }
    );
    
    dbUpdateTrend.add(res.timings.duration);
    
    check(res, {
        'atualizar documento - status 200': (r) => r.status === 200,
    });
    
    registrarResultado(res, 200, 'atualizar_documento');
    return res.status === 200;
}

function acaoDeletarDocumento(params) {
    if (documentosCache.length === 0) return false;
    
    const docId = documentosCache.pop(); // Remove do cache
    
    const res = http.del(
        `${BASE_URL}/databases/${DATABASE_ID}/collections/${COLLECTION_ID}/documents/${docId}`,
        null,
        { headers: params.headers, tags: { acao: 'deletar_documento', perfil: params.perfil.nome } }
    );
    
    dbDeleteTrend.add(res.timings.duration);
    
    check(res, {
        'deletar documento - status 204': (r) => r.status === 204,
    });
    
    registrarResultado(res, 204, 'deletar_documento');
    return res.status === 204;
}

function acaoCriarUsuario(params) {
    const uniqueEmail = `user_${gerarId()}@teste.com`;
    let userId = null;
    
    // 1. CRIAR USUÁRIO
    const payloadCriar = JSON.stringify({
        userId: 'unique()',
        email: uniqueEmail,
        password: 'SenhaForte123!',
        name: `Usuário ${Date.now()}`
    });
    
    const resCriar = http.post(
        `${BASE_URL}/users`,
        payloadCriar,
        { headers: params.headers, tags: { acao: 'criar_usuario', perfil: params.perfil.nome } }
    );
    
    authCreateUserTrend.add(resCriar.timings.duration);
    
    const sucessoCriar = check(resCriar, {
        'criar usuário - status 201': (r) => r.status === 201,
    });
    
    registrarResultado(resCriar, 201, 'criar_usuario');
    
    if (sucessoCriar) {
        try {
            const body = JSON.parse(resCriar.body);
            userId = body.$id;
        } catch {}
    }
    
    if (!userId) return false;
    
    sleep(0.3);
    
    // 2. OBTER USUÁRIO (ler dados do usuário criado)
    const resObter = http.get(
        `${BASE_URL}/users/${userId}`,
        { headers: params.headers, tags: { acao: 'obter_usuario', perfil: params.perfil.nome } }
    );
    
    authGetUserTrend.add(resObter.timings.duration);
    
    check(resObter, {
        'obter usuário - status 200': (r) => r.status === 200,
    });
    
    registrarResultado(resObter, 200, 'obter_usuario');
    
    sleep(0.3);
    
    // 3. LISTAR USUÁRIOS
    const resListar = http.get(
        `${BASE_URL}/users?limit=10`,
        { headers: params.headers, tags: { acao: 'listar_usuarios', perfil: params.perfil.nome } }
    );
    
    authListUsersTrend.add(resListar.timings.duration);
    
    check(resListar, {
        'listar usuários - status 200': (r) => r.status === 200,
    });
    
    registrarResultado(resListar, 200, 'listar_usuarios');
    
    sleep(0.3);
    
    // 4. DELETAR USUÁRIO (limpeza)
    const resDeletetar = http.del(
        `${BASE_URL}/users/${userId}`,
        null,
        { headers: params.headers, tags: { acao: 'deletar_usuario', perfil: params.perfil.nome } }
    );
    
    authDeleteUserTrend.add(resDeletetar.timings.duration);
    
    check(resDeletetar, {
        'deletar usuário - status 204': (r) => r.status === 204,
    });
    
    registrarResultado(resDeletetar, 204, 'deletar_usuario');
    
    return true;
}

function acaoAtualizarPreferencias(params) {
    // Simula atualizar preferências de um usuário existente
    // Na prática, precisaria de um userId real, então simulamos com health
    const payload = JSON.stringify({
        theme: 'dark',
        language: 'pt-BR',
        notifications: true
    });
    
    // Por simplicidade, fazemos um health check (simula ação de configuração)
    const res = http.get(
        `${BASE_URL}/health`,
        { headers: params.headers, tags: { acao: 'atualizar_preferencias', perfil: params.perfil.nome } }
    );
    
    authUpdatePrefsTrend.add(res.timings.duration);
    registrarResultado(res, 200, 'health_check');
    return res.status === 200;
}

function acaoHealthCheck(params) {
    const res = http.get(
        `${BASE_URL}/health`,
        { headers: params.headers, tags: { acao: 'health_check', perfil: params.perfil.nome } }
    );
    
    healthTrend.add(res.timings.duration);
    
    check(res, {
        'health check - status 200': (r) => r.status === 200,
    });
    
    registrarResultado(res, 200, 'health_check');
    return res.status === 200;
}

// ============================================
// AÇÕES DE STORAGE
// ============================================

// Cache de arquivos (similar ao documentosCache)
let arquivosCache = [];

function acaoUploadArquivo(params) {
    // Cria um arquivo de texto simples para upload
    const fileContent = `Arquivo de teste gerado em ${new Date().toISOString()} - ${Math.random()}`;
    const fileName = `teste_${Date.now()}_${Math.random().toString(36).substr(2, 9)}.txt`;
    
    // Monta o FormData manualmente para o Appwrite
    const boundary = '----WebKitFormBoundary' + Math.random().toString(36).substr(2);
    const body = [
        `--${boundary}`,
        `Content-Disposition: form-data; name="fileId"`,
        '',
        'unique()',
        `--${boundary}`,
        `Content-Disposition: form-data; name="file"; filename="${fileName}"`,
        'Content-Type: text/plain',
        '',
        fileContent,
        `--${boundary}--`
    ].join('\r\n');
    
    const uploadHeaders = {
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
        'X-Appwrite-Project': PROJECT_ID,
        'X-Appwrite-Key': API_KEY,
    };
    
    const res = http.post(
        `${BASE_URL}/storage/buckets/${BUCKET_ID}/files`,
        body,
        { headers: uploadHeaders, tags: { acao: 'upload_arquivo', perfil: params.perfil.nome } }
    );
    
    storageUploadTrend.add(res.timings.duration);
    
    const sucesso = check(res, {
        'upload arquivo - status 201': (r) => r.status === 201,
    });
    
    // Guarda o ID do arquivo no cache
    if (sucesso) {
        try {
            const body = JSON.parse(res.body);
            if (body.$id) arquivosCache.push(body.$id);
        } catch {}
    }
    
    registrarResultado(res, 201, 'upload_arquivo');
    return sucesso;
}

function acaoDownloadArquivo(params) {
    // Usa um arquivo do cache
    let fileId = arquivosCache.length > 0 
        ? arquivosCache[Math.floor(Math.random() * arquivosCache.length)]
        : null;
    
    if (!fileId) {
        // Se não tem cache, faz upload primeiro
        acaoUploadArquivo(params);
        fileId = arquivosCache[arquivosCache.length - 1];
    }
    
    if (!fileId) return false;
    
    const res = http.get(
        `${BASE_URL}/storage/buckets/${BUCKET_ID}/files/${fileId}/download`,
        { headers: params.headers, tags: { acao: 'download_arquivo', perfil: params.perfil.nome } }
    );
    
    storageDownloadTrend.add(res.timings.duration);
    
    check(res, {
        'download arquivo - status 200': (r) => r.status === 200,
    });
    
    registrarResultado(res, 200, 'download_arquivo');
    return res.status === 200;
}

function acaoListarArquivos(params) {
    const res = http.get(
        `${BASE_URL}/storage/buckets/${BUCKET_ID}/files?limit=25`,
        { headers: params.headers, tags: { acao: 'listar_arquivos', perfil: params.perfil.nome } }
    );
    
    storageListTrend.add(res.timings.duration);
    
    const sucesso = check(res, {
        'listar arquivos - status 200': (r) => r.status === 200,
    });
    
    // Atualiza cache de arquivos
    if (sucesso) {
        try {
            const body = JSON.parse(res.body);
            if (body.files && body.files.length > 0) {
                arquivosCache = body.files.map(f => f.$id);
            }
        } catch {}
    }
    
    registrarResultado(res, 200, 'listar_arquivos');
    return sucesso;
}

function acaoDeletarArquivo(params) {
    if (arquivosCache.length === 0) return false;
    
    const fileId = arquivosCache.pop();
    
    const res = http.del(
        `${BASE_URL}/storage/buckets/${BUCKET_ID}/files/${fileId}`,
        null,
        { headers: params.headers, tags: { acao: 'deletar_arquivo', perfil: params.perfil.nome } }
    );
    
    storageDeleteTrend.add(res.timings.duration);
    
    check(res, {
        'deletar arquivo - status 204': (r) => r.status === 204,
    });
    
    registrarResultado(res, 204, 'deletar_arquivo');
    return res.status === 204;
}

// Mapa de ações
const ACOES = {
    listar_documentos: acaoListarDocumentos,
    ler_documento: acaoLerDocumento,
    query_documentos: acaoQueryDocumentos,
    criar_documento: acaoCriarDocumento,
    atualizar_documento: acaoAtualizarDocumento,
    deletar_documento: acaoDeletarDocumento,
    criar_usuario: acaoCriarUsuario,
    atualizar_preferencias: acaoAtualizarPreferencias,
    health_check: acaoHealthCheck,
    // Storage
    upload_arquivo: acaoUploadArquivo,
    download_arquivo: acaoDownloadArquivo,
    listar_arquivos: acaoListarArquivos,
    deletar_arquivo: acaoDeletarArquivo,
};

// ============================================
// FUNÇÃO PRINCIPAL - CENÁRIO DINÂMICO
// ============================================
export default function () {
    // 1. Escolhe um perfil de usuário (baseado nos pesos)
    const perfil = escolherPerfil();
    
    // 2. Escolhe uma ação do perfil (baseado nos pesos da ação)
    const acao = escolherAcao(perfil);
    
    // 3. Obtém headers mobile com info do perfil
    const network = getRandomNetwork();
    const headers = getHeaders(perfil);
    
    // 4. Executa a ação
    const params = { headers, perfil, network };
    const funcaoAcao = ACOES[acao.tipo];
    
    if (funcaoAcao) {
        group(`${perfil.nome} - ${acao.tipo}`, function() {
            funcaoAcao(params);
        });
    }
    
    // 5. Pausa realista (varia por ação e qualidade da rede)
    pausaRealista(acao, network);
}

// ============================================
// GERA RELATÓRIOS
// ============================================
// Os caminhos são relativos ao diretório de onde o k6 é executado
// Execute sempre a partir da raiz do projeto: C:\TestePerformance\testesk6\
export function handleSummary(data) {
    
    const results = {
        // Exibe resumo padrão do K6 no console (stdout)
        'stdout': textSummary(data, { indent: ' ', enableColors: true }),
    };
    
    try {
        const jsonData = JSON.stringify(data, null, 2);
        results["reports/relatorio_dados.json"] = jsonData;
        
        const htmlData = generateHtmlReport(data);
        results["reports/relatorio_performance.html"] = htmlData;
        
    } catch (error) {
        console.error("ERRO ao gerar relatórios: " + error.message);
        try {
            results["reports/relatorio_dados.json"] = JSON.stringify(data, null, 2);
        } catch (e) {
            console.error("Falha crítica: " + e.message);
        }
    }
    
    return results;
}
