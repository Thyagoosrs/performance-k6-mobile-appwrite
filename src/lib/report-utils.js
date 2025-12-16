// Função para gerar relatório HTML executivo completo
export function generateHtmlReport(data) {
    const metrics = data.metrics;
    
    // Extrai métricas HTTP principais
    const httpDuration = metrics.http_req_duration?.values || {};
    const httpBlocked = metrics.http_req_blocked?.values || {};
    const httpConnecting = metrics.http_req_connecting?.values || {};
    const httpWaiting = metrics.http_req_waiting?.values || {};
    const httpReceiving = metrics.http_req_receiving?.values || {};
    const httpSending = metrics.http_req_sending?.values || {};
    const vus = metrics.vus?.values || {};
    const httpReqs = metrics.http_reqs?.values || {};
    const reqSuccess = metrics.requisicoes_sucesso?.values || {};
    const reqFailed = metrics.requisicoes_falha?.values || {};
    const taxaSucesso = metrics.taxa_sucesso?.values || {};
    const iterations = metrics.iterations?.values || {};
    
    // Métricas de Database
    const dbCreate = metrics.db_criar_documento?.values || {};
    const dbRead = metrics.db_ler_documento?.values || {};
    const dbUpdate = metrics.db_atualizar_documento?.values || {};
    const dbDelete = metrics.db_deletar_documento?.values || {};
    const dbList = metrics.db_listar_documentos?.values || {};
    const dbQuery = metrics.db_query_documentos?.values || {};
    
    // Métricas de Auth
    const authCreate = metrics.auth_criar_usuario?.values || {};
    const authGet = metrics.auth_obter_usuario?.values || {};
    const authList = metrics.auth_listar_usuarios?.values || {};
    const authDelete = metrics.auth_deletar_usuario?.values || {};
    
    // Métricas de Storage
    const storageUpload = metrics.storage_upload_arquivo?.values || {};
    const storageDownload = metrics.storage_download_arquivo?.values || {};
    const storageList = metrics.storage_listar_arquivos?.values || {};
    const storageDelete = metrics.storage_deletar_arquivo?.values || {};
    
    // Métricas de Health
    const health = metrics.health_check?.values || {};
    
    // Métricas Mobile
    const iosReqs = metrics.requisicoes_ios?.values || {};
    const androidReqs = metrics.requisicoes_android?.values || {};
    
    // Métricas por Perfil
    const perfilCasual = metrics.perfil_casual?.values || {};
    const perfilAtivo = metrics.perfil_ativo?.values || {};
    const perfilNovo = metrics.perfil_novo?.values || {};
    const perfilBackground = metrics.perfil_background?.values || {};
    
    // Métricas de Erros
    const erros400 = metrics.erros_400_bad_request?.values || {};
    const erros401 = metrics.erros_401_unauthorized?.values || {};
    const erros403 = metrics.erros_403_forbidden?.values || {};
    const erros404 = metrics.erros_404_not_found?.values || {};
    const erros409 = metrics.erros_409_conflict?.values || {};
    const erros429 = metrics.erros_429_too_many_requests?.values || {};
    const erros500 = metrics.erros_500_server_error?.values || {};
    const erros502 = metrics.erros_502_bad_gateway?.values || {};
    const erros503 = metrics.erros_503_service_unavailable?.values || {};
    const erros504 = metrics.erros_504_gateway_timeout?.values || {};
    const errosOutros = metrics.erros_outros?.values || {};
    
    // Métricas de Erros por Operação
    const operacoes = [
        'listar_documentos', 'ler_documento', 'query_documentos', 'criar_documento',
        'atualizar_documento', 'deletar_documento', 'criar_usuario', 'obter_usuario',
        'listar_usuarios', 'deletar_usuario', 'health_check', 'upload_arquivo',
        'download_arquivo', 'listar_arquivos', 'deletar_arquivo'
    ];
    
    const codigosHttp = [400, 401, 403, 404, 409, 429, 500, 502, 503, 504, 'outros'];
    
    // Erros totais por operação
    const errosPorOperacao = {};
    for (let i = 0; i < operacoes.length; i++) {
        const op = operacoes[i];
        errosPorOperacao[op] = metrics['erro_op_' + op]?.values?.count || 0;
    }
    
    // Erros detalhados por operação e código HTTP
    const errosDetalhados = {};
    for (let i = 0; i < operacoes.length; i++) {
        const op = operacoes[i];
        errosDetalhados[op] = {};
        for (let j = 0; j < codigosHttp.length; j++) {
            const codigo = codigosHttp[j];
            errosDetalhados[op][codigo] = metrics['erro_det_' + op + '_' + codigo]?.values?.count || 0;
        }
    }
    
    // Calcula quais operações tiveram erros (para mostrar no relatório)
    const operacoesComErro = [];
    for (let i = 0; i < operacoes.length; i++) {
        if (errosPorOperacao[operacoes[i]] > 0) {
            operacoesComErro.push(operacoes[i]);
        }
    }
    
    // Nomes amigáveis das operações
    const nomesOperacoes = {
        listar_documentos: '📋 Listar Documentos',
        ler_documento: '📖 Ler Documento',
        query_documentos: '🔍 Query Documentos',
        criar_documento: '➕ Criar Documento',
        atualizar_documento: '✏️ Atualizar Documento',
        deletar_documento: '🗑️ Deletar Documento',
        criar_usuario: '👤 Criar Usuário',
        obter_usuario: '👁️ Obter Usuário',
        listar_usuarios: '👥 Listar Usuários',
        deletar_usuario: '🚫 Deletar Usuário',
        health_check: '💓 Health Check',
        upload_arquivo: '📤 Upload Arquivo',
        download_arquivo: '📥 Download Arquivo',
        listar_arquivos: '📁 Listar Arquivos',
        deletar_arquivo: '🗑️ Deletar Arquivo'
    };
    
    // Cálculos
    const totalRequests = httpReqs.count || 0;
    const successCount = reqSuccess.count || 0;
    const failCount = reqFailed.count || 0;
    const successRate = totalRequests > 0 ? (successCount / totalRequests) * 100 : 0;
    
    // Throughput (requisições por segundo)
    const testDurationMs = data.state?.testRunDurationMs || 120000;
    const testDuration = testDurationMs / 1000;
    const throughput = totalRequests / testDuration;
    
    // Formatação da duração do teste
    const testDurationMinutes = Math.floor(testDuration / 60);
    const testDurationSeconds = Math.floor(testDuration % 60);
    const testDurationFormatted = testDurationMinutes > 0 
        ? `${testDurationMinutes}m ${testDurationSeconds}s` 
        : `${testDurationSeconds}s`;
    
    // VUs
    const vusMax = metrics.vus_max?.values?.value || vus.max || 0;
    const vusMin = vus.min || 1;
    
    // Tipo de teste (do setup_data)
    const testType = data.setup_data?.testType || 'load';
    
    // Mobile
    const iosCount = iosReqs.count || 0;
    const androidCount = androidReqs.count || 0;
    const totalMobile = iosCount + androidCount;
    
    // Perfis
    const casualCount = perfilCasual.count || 0;
    const ativoCount = perfilAtivo.count || 0;
    const novoCount = perfilNovo.count || 0;
    const backgroundCount = perfilBackground.count || 0;
    const totalPerfis = casualCount + ativoCount + novoCount + backgroundCount;
    
    // Erros
    const total400 = erros400.count || 0;
    const total401 = erros401.count || 0;
    const total403 = erros403.count || 0;
    const total404 = erros404.count || 0;
    const total409 = erros409.count || 0;
    const total429 = erros429.count || 0;
    const total500 = erros500.count || 0;
    const total502 = erros502.count || 0;
    const total503 = erros503.count || 0;
    const total504 = erros504.count || 0;
    const totalOutros = errosOutros.count || 0;
    const totalErros4xx = total400 + total401 + total403 + total404 + total409 + total429;
    const totalErros5xx = total500 + total502 + total503 + total504;
    const totalErros = totalErros4xx + totalErros5xx + totalOutros;
    
    // ============================================
    // MÉTRICAS DE CONFIABILIDADE (MTTR / MTTF)
    // ============================================
    // MTTF (Mean Time To Failure) - Tempo médio até a falha
    // Fórmula: Tempo total de operação bem-sucedida / Número de falhas
    // Representa quanto tempo, em média, o sistema opera antes de uma falha
    const mttfSeconds = failCount > 0 
        ? (testDuration * (successCount / totalRequests)) / failCount 
        : testDuration; // Se não há falhas, MTTF = duração total do teste
    
    // MTTR (Mean Time To Recovery) - Tempo médio para recuperação
    // Fórmula aproximada: Tempo médio de resposta das requisições com erro
    // No contexto de teste de carga, representa o tempo médio que uma requisição
    // leva para "falhar" (timeout, erro de servidor, etc.)
    // Usamos o tempo máximo de resposta dividido pelo número de falhas como aproximação
    const mttrMs = failCount > 0 
        ? (httpDuration.max || 0) / Math.max(1, Math.log10(failCount + 1) * 2)
        : 0; // Se não há falhas, MTTR = 0
    
    // Disponibilidade calculada
    // Fórmula: MTTF / (MTTF + MTTR) * 100
    const availability = mttfSeconds > 0 
        ? (mttfSeconds / (mttfSeconds + (mttrMs / 1000))) * 100 
        : 100;
    
    // SLA Targets (metas)
    const SLA = {
        successRate: 95,        // Meta: 95% de sucesso
        p95Duration: 2000,      // Meta: P95 < 2000ms
        p99Duration: 3000,      // Meta: P99 < 3000ms
        errorRate5xx: 0,        // Meta: 0 erros 5xx
        avgDuration: 500,       // Meta: média < 500ms
    };
    
    // Calcula score de saúde (0-100)
    let healthScore = 100;
    if (successRate < SLA.successRate) healthScore -= (SLA.successRate - successRate) * 2;
    if ((httpDuration['p(95)'] || 0) > SLA.p95Duration) healthScore -= 15;
    if (totalErros5xx > 0) healthScore -= 20;
    if ((httpDuration.avg || 0) > SLA.avgDuration) healthScore -= 10;
    healthScore = Math.max(0, Math.min(100, healthScore));
    
    // Status geral
    const getStatus = (score) => {
        if (score >= 90) return { text: 'EXCELENTE', color: '#64ffda', bg: 'rgba(100, 255, 218, 0.1)' };
        if (score >= 75) return { text: 'BOM', color: '#74b9ff', bg: 'rgba(116, 185, 255, 0.1)' };
        if (score >= 50) return { text: 'ATENÇÃO', color: '#ffd93d', bg: 'rgba(255, 217, 61, 0.1)' };
        return { text: 'CRÍTICO', color: '#ff6b6b', bg: 'rgba(255, 107, 107, 0.1)' };
    };
    const status = getStatus(healthScore);
    
    const fmt = (val) => (val || 0).toFixed(2);
    
    // ============================================
    // PRÉ-GERAÇÃO DE HTML PARA ERROS POR REQUISIÇÃO
    // ============================================
    // Gera a tabela de erros por operação
    let tabelaErrosPorOperacao = '';
    for (let i = 0; i < operacoes.length; i++) {
        const op = operacoes[i];
        const total = errosPorOperacao[op];
        if (total === 0) continue;
        const det = errosDetalhados[op];
        tabelaErrosPorOperacao += '<tr>';
        tabelaErrosPorOperacao += '<td class="metric-name">' + nomesOperacoes[op] + '</td>';
        tabelaErrosPorOperacao += '<td style="font-weight: bold; color: ' + (total > 10 ? 'var(--danger)' : total > 0 ? 'var(--warning)' : 'var(--success)') + ';">' + total + '</td>';
        tabelaErrosPorOperacao += '<td style="color: ' + (det[400] > 0 ? 'var(--warning)' : 'var(--text-secondary)') + '">' + (det[400] || '-') + '</td>';
        tabelaErrosPorOperacao += '<td style="color: ' + (det[401] > 0 ? 'var(--warning)' : 'var(--text-secondary)') + '">' + (det[401] || '-') + '</td>';
        tabelaErrosPorOperacao += '<td style="color: ' + (det[403] > 0 ? 'var(--warning)' : 'var(--text-secondary)') + '">' + (det[403] || '-') + '</td>';
        tabelaErrosPorOperacao += '<td style="color: ' + (det[404] > 0 ? 'var(--warning)' : 'var(--text-secondary)') + '">' + (det[404] || '-') + '</td>';
        tabelaErrosPorOperacao += '<td style="color: ' + (det[409] > 0 ? 'var(--warning)' : 'var(--text-secondary)') + '">' + (det[409] || '-') + '</td>';
        tabelaErrosPorOperacao += '<td style="color: ' + (det[429] > 0 ? 'var(--warning)' : 'var(--text-secondary)') + '">' + (det[429] || '-') + '</td>';
        tabelaErrosPorOperacao += '<td style="color: ' + (det[500] > 0 ? 'var(--danger)' : 'var(--text-secondary)') + '">' + (det[500] || '-') + '</td>';
        tabelaErrosPorOperacao += '<td style="color: ' + (det[502] > 0 ? 'var(--danger)' : 'var(--text-secondary)') + '">' + (det[502] || '-') + '</td>';
        tabelaErrosPorOperacao += '<td style="color: ' + (det[503] > 0 ? 'var(--danger)' : 'var(--text-secondary)') + '">' + (det[503] || '-') + '</td>';
        tabelaErrosPorOperacao += '<td style="color: ' + (det[504] > 0 ? 'var(--danger)' : 'var(--text-secondary)') + '">' + (det[504] || '-') + '</td>';
        tabelaErrosPorOperacao += '<td style="color: ' + (det['outros'] > 0 ? 'var(--warning)' : 'var(--text-secondary)') + '">' + (det['outros'] || '-') + '</td>';
        tabelaErrosPorOperacao += '</tr>';
    }
    
    // Gera cards de erro por operação
    let cardsErrosPorOperacao = '';
    const maxCards = Math.min(6, operacoesComErro.length);
    for (let i = 0; i < maxCards; i++) {
        const op = operacoesComErro[i];
        const total = errosPorOperacao[op];
        const det = errosDetalhados[op];
        const erros4xx = (det[400] || 0) + (det[401] || 0) + (det[403] || 0) + (det[404] || 0) + (det[409] || 0) + (det[429] || 0);
        const erros5xx = (det[500] || 0) + (det[502] || 0) + (det[503] || 0) + (det[504] || 0);
        
        cardsErrosPorOperacao += '<div class="error-card">';
        cardsErrosPorOperacao += '<h4>' + nomesOperacoes[op] + ' <span class="badge ' + (erros5xx > 0 ? 'badge-danger' : 'badge-warning') + '">' + total + ' erros</span></h4>';
        if (det[400] > 0) cardsErrosPorOperacao += '<div class="error-item"><span class="code">400 Bad Request</span><span class="count warning">' + det[400] + '</span></div>';
        if (det[401] > 0) cardsErrosPorOperacao += '<div class="error-item"><span class="code">401 Unauthorized</span><span class="count warning">' + det[401] + '</span></div>';
        if (det[403] > 0) cardsErrosPorOperacao += '<div class="error-item"><span class="code">403 Forbidden</span><span class="count warning">' + det[403] + '</span></div>';
        if (det[404] > 0) cardsErrosPorOperacao += '<div class="error-item"><span class="code">404 Not Found</span><span class="count warning">' + det[404] + '</span></div>';
        if (det[409] > 0) cardsErrosPorOperacao += '<div class="error-item"><span class="code">409 Conflict</span><span class="count warning">' + det[409] + '</span></div>';
        if (det[429] > 0) cardsErrosPorOperacao += '<div class="error-item"><span class="code">429 Too Many</span><span class="count warning">' + det[429] + '</span></div>';
        if (det[500] > 0) cardsErrosPorOperacao += '<div class="error-item critical"><span class="code">500 Server Error</span><span class="count danger">' + det[500] + '</span></div>';
        if (det[502] > 0) cardsErrosPorOperacao += '<div class="error-item critical"><span class="code">502 Bad Gateway</span><span class="count danger">' + det[502] + '</span></div>';
        if (det[503] > 0) cardsErrosPorOperacao += '<div class="error-item critical"><span class="code">503 Unavailable</span><span class="count danger">' + det[503] + '</span></div>';
        if (det[504] > 0) cardsErrosPorOperacao += '<div class="error-item critical"><span class="code">504 Timeout</span><span class="count danger">' + det[504] + '</span></div>';
        if (det['outros'] > 0) cardsErrosPorOperacao += '<div class="error-item"><span class="code">Outros</span><span class="count warning">' + det['outros'] + '</span></div>';
        cardsErrosPorOperacao += '<div style="margin-top: 12px; font-size: 0.75rem; color: var(--text-secondary);">';
        cardsErrosPorOperacao += '📊 ' + erros4xx + ' erros cliente (4xx) | ' + erros5xx + ' erros servidor (5xx)';
        cardsErrosPorOperacao += '</div></div>';
    }
    
    // Gera dados para gráficos de erros
    let chartLabelsErros = [];
    let chartData4xx = [];
    let chartData5xx = [];
    let chartDataTotal = [];
    for (let i = 0; i < operacoesComErro.length; i++) {
        const op = operacoesComErro[i];
        const det = errosDetalhados[op];
        const nomeOp = nomesOperacoes[op] ? nomesOperacoes[op].replace(/^[^\s]+\s/, '') : op;
        chartLabelsErros.push(nomeOp);
        chartData4xx.push((det[400] || 0) + (det[401] || 0) + (det[403] || 0) + (det[404] || 0) + (det[409] || 0) + (det[429] || 0));
        chartData5xx.push((det[500] || 0) + (det[502] || 0) + (det[503] || 0) + (det[504] || 0));
        chartDataTotal.push(errosPorOperacao[op]);
    }
    
    // Top 8 para o gráfico horizontal
    const top8Labels = chartLabelsErros.slice(0, 8);
    const top8Data = chartDataTotal.slice(0, 8);
    const fmtInt = (val) => Math.round(val || 0);
    const fmtPercent = (val) => (val || 0).toFixed(1);
    const fmtNumber = (val) => String(Math.round(val || 0)).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    
    // Data e hora formatadas
    const now = new Date();
    const dateStr = now.toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    const timeStr = now.toLocaleTimeString('pt-BR');
    
    return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Relatório Executivo de Performance - Mobile App</title>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <style>
        :root {
            --primary: #667eea;
            --primary-dark: #5a67d8;
            --success: #64ffda;
            --warning: #ffd93d;
            --danger: #ff6b6b;
            --info: #74b9ff;
            --bg-dark: #0f172a;
            --bg-card: #1e293b;
            --bg-card-hover: #273449;
            --text-primary: #f1f5f9;
            --text-secondary: #94a3b8;
            --border: rgba(255, 255, 255, 0.1);
        }
        
        * { margin: 0; padding: 0; box-sizing: border-box; }
        
        body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
            background: var(--bg-dark);
            color: var(--text-primary);
            line-height: 1.6;
            min-height: 100vh;
        }
        
        .container { max-width: 1400px; margin: 0 auto; padding: 24px; }
        
        /* Header Executivo */
        .header {
            background: linear-gradient(135deg, var(--primary) 0%, #764ba2 100%);
            border-radius: 20px;
            padding: 40px;
            margin-bottom: 32px;
            position: relative;
            overflow: hidden;
        }
        .header::before {
            content: '';
            position: absolute;
            top: -50%;
            right: -20%;
            width: 60%;
            height: 200%;
            background: rgba(255,255,255,0.05);
            transform: rotate(30deg);
        }
        .header-content { position: relative; z-index: 1; }
        .header h1 { 
            font-size: 2rem; 
            font-weight: 700; 
            margin-bottom: 8px;
            letter-spacing: -0.5px;
        }
        .header .subtitle { 
            opacity: 0.9; 
            font-size: 1rem;
            font-weight: 400;
        }
        .header .date { 
            margin-top: 16px;
            font-size: 0.875rem;
            opacity: 0.8;
        }
        
        /* Test Configuration */
        .test-config {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 16px;
            margin-bottom: 32px;
        }
        .config-item {
            background: var(--bg-card);
            border-radius: 12px;
            padding: 20px;
            border: 1px solid var(--border);
            display: flex;
            align-items: center;
            gap: 16px;
        }
        .config-icon {
            font-size: 2rem;
            line-height: 1;
        }
        .config-content {
            display: flex;
            flex-direction: column;
        }
        .config-label {
            font-size: 0.75rem;
            text-transform: uppercase;
            letter-spacing: 1px;
            color: var(--text-secondary);
            margin-bottom: 4px;
        }
        .config-value {
            font-size: 1.5rem;
            font-weight: 700;
            color: var(--text-primary);
        }
        
        /* Executive Summary */
        .executive-summary {
            background: var(--bg-card);
            border-radius: 16px;
            padding: 32px;
            margin-bottom: 32px;
            border: 1px solid var(--border);
        }
        .summary-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 24px;
            flex-wrap: wrap;
            gap: 20px;
        }
        .summary-title h2 {
            font-size: 1.25rem;
            font-weight: 600;
            color: var(--text-primary);
            margin-bottom: 4px;
        }
        .summary-title p {
            color: var(--text-secondary);
            font-size: 0.875rem;
        }
        
        /* Health Score */
        .health-score {
            text-align: center;
            padding: 20px 32px;
            background: ${status.bg};
            border-radius: 12px;
            border: 2px solid ${status.color};
        }
        .health-score .score {
            font-size: 3rem;
            font-weight: 700;
            color: ${status.color};
            line-height: 1;
        }
        .health-score .label {
            font-size: 0.75rem;
            text-transform: uppercase;
            letter-spacing: 1px;
            color: var(--text-secondary);
            margin-top: 4px;
        }
        .health-score .status {
            font-size: 0.875rem;
            font-weight: 600;
            color: ${status.color};
            margin-top: 8px;
        }
        
        /* Key Insights */
        .key-insights {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
            gap: 16px;
            margin-top: 24px;
        }
        .insight {
            display: flex;
            align-items: flex-start;
            gap: 12px;
            padding: 16px;
            background: rgba(255,255,255,0.03);
            border-radius: 10px;
            border-left: 3px solid var(--primary);
        }
        .insight.success { border-left-color: var(--success); }
        .insight.warning { border-left-color: var(--warning); }
        .insight.danger { border-left-color: var(--danger); }
        .insight .icon { font-size: 1.25rem; }
        .insight .text { font-size: 0.875rem; color: var(--text-secondary); }
        .insight .text strong { color: var(--text-primary); }
        
        /* KPI Cards */
        .kpi-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
            gap: 16px;
            margin-bottom: 32px;
        }
        .kpi-card {
            background: var(--bg-card);
            border-radius: 12px;
            padding: 20px;
            border: 1px solid var(--border);
            transition: all 0.2s ease;
        }
        .kpi-card:hover {
            transform: translateY(-2px);
            background: var(--bg-card-hover);
        }
        .kpi-card .label {
            font-size: 0.7rem;
            text-transform: uppercase;
            letter-spacing: 1px;
            color: var(--text-secondary);
            margin-bottom: 8px;
        }
        .kpi-card .value {
            font-size: 1.75rem;
            font-weight: 700;
            color: var(--text-primary);
        }
        .kpi-card .unit {
            font-size: 0.875rem;
            color: var(--text-secondary);
            margin-left: 4px;
        }
        .kpi-card .change {
            font-size: 0.75rem;
            margin-top: 8px;
            display: flex;
            align-items: center;
            gap: 4px;
        }
        .kpi-card .change.positive { color: var(--success); }
        .kpi-card .change.negative { color: var(--danger); }
        .kpi-card.highlight { border-color: var(--primary); }
        
        /* SLA Compliance */
        .sla-section {
            background: var(--bg-card);
            border-radius: 16px;
            padding: 24px;
            margin-bottom: 32px;
            border: 1px solid var(--border);
        }
        .sla-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
        }
        .sla-header h3 {
            font-size: 1rem;
            font-weight: 600;
        }
        .sla-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 16px;
        }
        .sla-item {
            padding: 16px;
            background: rgba(255,255,255,0.02);
            border-radius: 10px;
        }
        .sla-item .sla-label {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 10px;
        }
        .sla-item .sla-name {
            font-size: 0.875rem;
            color: var(--text-secondary);
        }
        .sla-item .sla-value {
            font-size: 0.875rem;
            font-weight: 600;
        }
        .sla-item .sla-value.pass { color: var(--success); }
        .sla-item .sla-value.fail { color: var(--danger); }
        .sla-bar {
            height: 8px;
            background: rgba(255,255,255,0.1);
            border-radius: 4px;
            overflow: hidden;
        }
        .sla-bar .fill {
            height: 100%;
            border-radius: 4px;
            transition: width 0.5s ease;
        }
        .sla-bar .fill.pass { background: var(--success); }
        .sla-bar .fill.fail { background: var(--danger); }
        .sla-bar .fill.warning { background: var(--warning); }
        
        /* Section Title */
        .section-title {
            font-size: 1.125rem;
            font-weight: 600;
            color: var(--text-primary);
            margin: 32px 0 20px;
            padding-bottom: 12px;
            border-bottom: 2px solid var(--primary);
            display: flex;
            align-items: center;
            gap: 10px;
        }
        .badge {
            font-size: 0.7rem;
            padding: 4px 10px;
            border-radius: 20px;
            font-weight: 500;
        }
        .badge-mobile { background: rgba(162, 155, 254, 0.2); color: #a29bfe; }
        .badge-success { background: rgba(100, 255, 218, 0.2); color: var(--success); }
        .badge-warning { background: rgba(255, 217, 61, 0.2); color: var(--warning); }
        .badge-danger { background: rgba(255, 107, 107, 0.2); color: var(--danger); }
        
        /* Charts Grid */
        .charts-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(380px, 1fr));
            gap: 20px;
            margin-bottom: 32px;
        }
        .chart-card {
            background: var(--bg-card);
            border-radius: 12px;
            padding: 20px;
            border: 1px solid var(--border);
        }
        .chart-card h4 {
            font-size: 0.875rem;
            font-weight: 600;
            color: var(--text-primary);
            margin-bottom: 16px;
            display: flex;
            align-items: center;
            gap: 8px;
        }
        .chart-wrapper { height: 220px; position: relative; }
        
        /* Tables */
        .table-card {
            background: var(--bg-card);
            border-radius: 12px;
            padding: 20px;
            margin-bottom: 20px;
            border: 1px solid var(--border);
            overflow-x: auto;
        }
        .table-card h4 {
            font-size: 0.875rem;
            font-weight: 600;
            margin-bottom: 16px;
        }
        table {
            width: 100%;
            border-collapse: collapse;
        }
        th, td {
            padding: 12px 16px;
            text-align: left;
            border-bottom: 1px solid var(--border);
            font-size: 0.8rem;
        }
        th {
            color: var(--text-secondary);
            font-weight: 500;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            font-size: 0.7rem;
        }
        td { color: var(--text-primary); }
        tr:hover { background: rgba(255,255,255,0.02); }
        .metric-name { color: var(--success); font-weight: 500; }
        
        /* Error Cards */
        .error-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 20px;
        }
        .error-card {
            background: var(--bg-card);
            border-radius: 12px;
            padding: 20px;
            border: 1px solid var(--border);
        }
        .error-card h4 {
            font-size: 0.875rem;
            font-weight: 600;
            margin-bottom: 16px;
        }
        .error-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 10px 12px;
            background: rgba(255,255,255,0.02);
            border-radius: 8px;
            margin-bottom: 8px;
            border-left: 3px solid var(--warning);
        }
        .error-item.critical { border-left-color: var(--danger); }
        .error-item .code { font-size: 0.8rem; color: var(--text-secondary); }
        .error-item .count { font-weight: 600; }
        .error-item .count.zero { color: var(--success); }
        .error-item .count.warning { color: var(--warning); }
        .error-item .count.danger { color: var(--danger); }
        
        /* Recommendations */
        .recommendations {
            background: var(--bg-card);
            border-radius: 12px;
            padding: 24px;
            margin-bottom: 32px;
            border: 1px solid var(--border);
        }
        .recommendations h3 {
            font-size: 1rem;
            font-weight: 600;
            margin-bottom: 16px;
            display: flex;
            align-items: center;
            gap: 8px;
        }
        .recommendation-item {
            display: flex;
            gap: 12px;
            padding: 12px;
            background: rgba(255,255,255,0.02);
            border-radius: 8px;
            margin-bottom: 10px;
        }
        .recommendation-item .priority {
            width: 24px;
            height: 24px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 0.75rem;
            font-weight: 600;
            flex-shrink: 0;
        }
        .recommendation-item .priority.high { background: var(--danger); color: white; }
        .recommendation-item .priority.medium { background: var(--warning); color: #1a1a2e; }
        .recommendation-item .priority.low { background: var(--success); color: #1a1a2e; }
        .recommendation-item .content { flex: 1; }
        .recommendation-item .title { font-weight: 500; font-size: 0.875rem; margin-bottom: 4px; }
        .recommendation-item .desc { font-size: 0.8rem; color: var(--text-secondary); }
        
        /* Footer */
        .footer {
            text-align: center;
            padding: 32px;
            color: var(--text-secondary);
            font-size: 0.8rem;
            border-top: 1px solid var(--border);
            margin-top: 32px;
        }
        .footer .logo { font-weight: 600; color: var(--primary); }
        
        /* Print Styles */
        @media print {
            body { background: white; color: #1a1a2e; }
            .header { background: #667eea !important; -webkit-print-color-adjust: exact; }
            .chart-card, .table-card, .sla-section, .executive-summary, .recommendations { 
                break-inside: avoid; 
            }
        }
        
        @media (max-width: 768px) {
            .container { padding: 16px; }
            .header { padding: 24px; }
            .header h1 { font-size: 1.5rem; }
            .charts-grid { grid-template-columns: 1fr; }
            .kpi-grid { grid-template-columns: repeat(2, 1fr); }
        }
    </style>
</head>
<body>
    <div class="container">
        <!-- Header -->
        <header class="header">
            <div class="header-content">
                <h1>📊 Relatório Executivo de Performance</h1>
                <p class="subtitle">Teste de Carga - Aplicação Mobile Appwrite</p>
                <p class="date">📅 ${dateStr} às ${timeStr}</p>
            </div>
        </header>

        <!-- Configuração do Teste -->
        <div class="test-config">
            <div class="config-item">
                <span class="config-icon">⏱️</span>
                <div class="config-content">
                    <span class="config-label">Duração</span>
                    <span class="config-value">${testDurationFormatted}</span>
                </div>
            </div>
            <div class="config-item">
                <span class="config-icon">👥</span>
                <div class="config-content">
                    <span class="config-label">VUs (Usuários)</span>
                    <span class="config-value">${vusMax}</span>
                </div>
            </div>
            <div class="config-item">
                <span class="config-icon">🔄</span>
                <div class="config-content">
                    <span class="config-label">Iterações</span>
                    <span class="config-value">${fmtNumber(iterations.count || 0)}</span>
                </div>
            </div>
            <div class="config-item">
                <span class="config-icon">🎯</span>
                <div class="config-content">
                    <span class="config-label">Tipo de Teste</span>
                    <span class="config-value">${testType.toUpperCase()}</span>
                </div>
            </div>
        </div>

        <!-- Executive Summary -->
        <section class="executive-summary">
            <div class="summary-header">
                <div class="summary-title">
                    <h2>Resumo Executivo</h2>
                    <p>Visão geral do desempenho da aplicação</p>
                </div>
                <div class="health-score">
                    <div class="score">${fmtInt(healthScore)}</div>
                    <div class="label">Health Score</div>
                    <div class="status">${status.text}</div>
                </div>
            </div>
            
            <div class="key-insights">
                <div class="insight ${successRate >= 95 ? 'success' : successRate >= 80 ? 'warning' : 'danger'}">
                    <span class="icon">${successRate >= 95 ? '✅' : successRate >= 80 ? '⚠️' : '❌'}</span>
                    <span class="text">Taxa de sucesso de <strong>${fmtPercent(successRate)}%</strong> ${successRate >= SLA.successRate ? 'atende' : 'não atende'} a meta de ${SLA.successRate}%</span>
                </div>
                <div class="insight ${(httpDuration['p(95)'] || 0) <= SLA.p95Duration ? 'success' : 'warning'}">
                    <span class="icon">${(httpDuration['p(95)'] || 0) <= SLA.p95Duration ? '✅' : '⚠️'}</span>
                    <span class="text">P95 de <strong>${fmt(httpDuration['p(95)'])}ms</strong> ${(httpDuration['p(95)'] || 0) <= SLA.p95Duration ? 'dentro' : 'acima'} do limite de ${SLA.p95Duration}ms</span>
                </div>
                <div class="insight ${totalErros5xx === 0 ? 'success' : 'danger'}">
                    <span class="icon">${totalErros5xx === 0 ? '✅' : '❌'}</span>
                    <span class="text"><strong>${totalErros5xx}</strong> erros de servidor (5xx) durante o teste</span>
                </div>
                <div class="insight">
                    <span class="icon">📱</span>
                    <span class="text"><strong>${fmtInt(totalMobile)}</strong> requisições mobile (${totalMobile > 0 ? fmtPercent((iosCount/totalMobile)*100) : 0}% iOS, ${totalMobile > 0 ? fmtPercent((androidCount/totalMobile)*100) : 0}% Android)</span>
                </div>
            </div>
        </section>

        <!-- KPI Cards -->
        <div class="kpi-grid">
            <div class="kpi-card highlight">
                <div class="label">Total de Requisições</div>
                <div class="value">${fmtNumber(totalRequests)}</div>
                <div class="change positive">Durante ${fmtInt(testDuration)}s de teste</div>
            </div>
            <div class="kpi-card">
                <div class="label">Throughput</div>
                <div class="value">${fmtPercent(throughput)}<span class="unit">req/s</span></div>
                <div class="change">Requisições por segundo</div>
            </div>
            <div class="kpi-card">
                <div class="label">Taxa de Sucesso</div>
                <div class="value" style="color: ${successRate >= 95 ? 'var(--success)' : 'var(--warning)'}">${fmtPercent(successRate)}%</div>
                <div class="change ${successRate >= SLA.successRate ? 'positive' : 'negative'}">${successRate >= SLA.successRate ? '✓ Meta atingida' : '✗ Abaixo da meta'}</div>
            </div>
            <div class="kpi-card">
                <div class="label">Tempo Médio</div>
                <div class="value">${fmt(httpDuration.avg)}<span class="unit">ms</span></div>
                <div class="change ${(httpDuration.avg || 0) <= SLA.avgDuration ? 'positive' : 'negative'}">Meta: ${SLA.avgDuration}ms</div>
            </div>
            <div class="kpi-card">
                <div class="label">P95 Latência</div>
                <div class="value">${fmt(httpDuration['p(95)'])}<span class="unit">ms</span></div>
                <div class="change ${(httpDuration['p(95)'] || 0) <= SLA.p95Duration ? 'positive' : 'negative'}">Meta: ${SLA.p95Duration}ms</div>
            </div>
            <div class="kpi-card">
                <div class="label">Tempo Máximo</div>
                <div class="value">${fmt(httpDuration.max)}<span class="unit">ms</span></div>
                <div class="change">Pior caso observado</div>
            </div>
            <div class="kpi-card">
                <div class="label">VUs Máximo</div>
                <div class="value">${vus.max || 0}</div>
                <div class="change">Usuários simultâneos</div>
            </div>
            <div class="kpi-card">
                <div class="label">Erros Totais</div>
                <div class="value" style="color: ${failCount === 0 ? 'var(--success)' : 'var(--danger)'}">${failCount}</div>
                <div class="change">${totalErros4xx} cliente + ${totalErros5xx} servidor</div>
            </div>
        </div>

        <!-- Métricas de Confiabilidade -->
        <h3 class="section-title">🔧 Métricas de Confiabilidade (MTTR / MTTF)</h3>
        <div class="kpi-grid" style="margin-bottom: 32px;">
            <div class="kpi-card highlight">
                <div class="label">MTTF</div>
                <div class="value">${fmtPercent(mttfSeconds)}<span class="unit">s</span></div>
                <div class="change">Mean Time To Failure</div>
                <div class="description" style="font-size: 0.7rem; color: var(--text-secondary); margin-top: 4px;">Tempo médio de operação antes de uma falha</div>
            </div>
            <div class="kpi-card">
                <div class="label">MTTR</div>
                <div class="value" style="color: ${mttrMs <= 500 ? 'var(--success)' : mttrMs <= 1000 ? 'var(--warning)' : 'var(--danger)'}">${fmtPercent(mttrMs)}<span class="unit">ms</span></div>
                <div class="change">Mean Time To Recovery</div>
                <div class="description" style="font-size: 0.7rem; color: var(--text-secondary); margin-top: 4px;">Tempo médio para recuperação após falha</div>
            </div>
            <div class="kpi-card">
                <div class="label">Disponibilidade</div>
                <div class="value" style="color: ${availability >= 99 ? 'var(--success)' : availability >= 95 ? 'var(--warning)' : 'var(--danger)'}">${fmtPercent(availability)}%</div>
                <div class="change">${availability >= 99.9 ? '✓ Alta disponibilidade' : availability >= 99 ? '✓ Boa disponibilidade' : '⚠️ Melhorar disponibilidade'}</div>
                <div class="description" style="font-size: 0.7rem; color: var(--text-secondary); margin-top: 4px;">Calculado: MTTF / (MTTF + MTTR)</div>
            </div>
            <div class="kpi-card">
                <div class="label">Total de Falhas</div>
                <div class="value" style="color: ${failCount === 0 ? 'var(--success)' : failCount <= 10 ? 'var(--warning)' : 'var(--danger)'}">${failCount}</div>
                <div class="change">${failCount === 0 ? '✓ Nenhuma falha' : failCount <= 10 ? '⚠️ Poucas falhas' : '❌ Muitas falhas'}</div>
                <div class="description" style="font-size: 0.7rem; color: var(--text-secondary); margin-top: 4px;">Requisições que falharam durante o teste</div>
            </div>
        </div>

        <div class="table-card">
            <h4>📖 Entendendo MTTR e MTTF</h4>
            <table>
                <tr>
                    <th style="width: 120px;">Métrica</th>
                    <th>Descrição</th>
                    <th style="width: 180px;">Fórmula</th>
                    <th style="width: 100px;">Resultado</th>
                </tr>
                <tr>
                    <td><strong>MTTF</strong></td>
                    <td>Mean Time To Failure (Tempo Médio até a Falha). Representa o tempo médio que o sistema opera com sucesso antes de ocorrer uma falha. Quanto maior, mais confiável é o sistema.</td>
                    <td><code>Tempo operação / Nº falhas</code></td>
                    <td style="color: ${mttfSeconds >= testDuration/2 ? 'var(--success)' : 'var(--warning)'}">${fmtPercent(mttfSeconds)}s</td>
                </tr>
                <tr>
                    <td><strong>MTTR</strong></td>
                    <td>Mean Time To Recovery (Tempo Médio para Recuperação). Indica o tempo médio necessário para o sistema se recuperar após uma falha. Quanto menor, mais resiliente é o sistema.</td>
                    <td><code>Tempo inativo / Nº falhas</code></td>
                    <td style="color: ${mttrMs <= 500 ? 'var(--success)' : 'var(--warning)'}">${fmtPercent(mttrMs)}ms</td>
                </tr>
                <tr>
                    <td><strong>Disponibilidade</strong></td>
                    <td>Percentual do tempo em que o sistema está operacional e disponível para uso. Calculado com base no MTTF e MTTR. A meta típica é 99.9% (três noves).</td>
                    <td><code>MTTF / (MTTF + MTTR)</code></td>
                    <td style="color: ${availability >= 99 ? 'var(--success)' : 'var(--warning)'}">${fmtPercent(availability)}%</td>
                </tr>
            </table>
        </div>

        <!-- SLA Compliance -->
        <section class="sla-section">
            <div class="sla-header">
                <h3>📋 Conformidade com SLAs</h3>
                <span class="badge ${healthScore >= 75 ? 'badge-success' : 'badge-warning'}">${healthScore >= 75 ? 'COMPLIANT' : 'ATENÇÃO'}</span>
            </div>
            <div class="sla-grid">
                <div class="sla-item">
                    <div class="sla-label">
                        <span class="sla-name">Taxa de Sucesso (Meta: ≥${SLA.successRate}%)</span>
                        <span class="sla-value ${successRate >= SLA.successRate ? 'pass' : 'fail'}">${fmtPercent(successRate)}%</span>
                    </div>
                    <div class="sla-bar">
                        <div class="fill ${successRate >= SLA.successRate ? 'pass' : successRate >= 80 ? 'warning' : 'fail'}" style="width: ${Math.min(100, successRate)}%"></div>
                    </div>
                </div>
                <div class="sla-item">
                    <div class="sla-label">
                        <span class="sla-name">P95 Latência (Meta: ≤${SLA.p95Duration}ms)</span>
                        <span class="sla-value ${(httpDuration['p(95)'] || 0) <= SLA.p95Duration ? 'pass' : 'fail'}">${fmt(httpDuration['p(95)'])}ms</span>
                    </div>
                    <div class="sla-bar">
                        <div class="fill ${(httpDuration['p(95)'] || 0) <= SLA.p95Duration ? 'pass' : 'fail'}" style="width: ${Math.min(100, ((SLA.p95Duration / Math.max(httpDuration['p(95)'] || 1, SLA.p95Duration)) * 100))}%"></div>
                    </div>
                </div>
                <div class="sla-item">
                    <div class="sla-label">
                        <span class="sla-name">Tempo Médio (Meta: ≤${SLA.avgDuration}ms)</span>
                        <span class="sla-value ${(httpDuration.avg || 0) <= SLA.avgDuration ? 'pass' : 'fail'}">${fmt(httpDuration.avg)}ms</span>
                    </div>
                    <div class="sla-bar">
                        <div class="fill ${(httpDuration.avg || 0) <= SLA.avgDuration ? 'pass' : 'warning'}" style="width: ${Math.min(100, ((SLA.avgDuration / Math.max(httpDuration.avg || 1, SLA.avgDuration)) * 100))}%"></div>
                    </div>
                </div>
                <div class="sla-item">
                    <div class="sla-label">
                        <span class="sla-name">Erros 5xx (Meta: 0)</span>
                        <span class="sla-value ${totalErros5xx === 0 ? 'pass' : 'fail'}">${totalErros5xx}</span>
                    </div>
                    <div class="sla-bar">
                        <div class="fill ${totalErros5xx === 0 ? 'pass' : 'fail'}" style="width: ${totalErros5xx === 0 ? 100 : 20}%"></div>
                    </div>
                </div>
            </div>
        </section>

        <!-- Mobile Metrics -->
        <h3 class="section-title">📱 Métricas Mobile <span class="badge badge-mobile">Dispositivos & Perfis</span></h3>
        <div class="charts-grid">
            <div class="chart-card">
                <h4>📱 Distribuição por Plataforma</h4>
                <div class="chart-wrapper">
                    <canvas id="platformChart"></canvas>
                </div>
            </div>
            <div class="chart-card">
                <h4>👥 Distribuição por Perfil de Usuário</h4>
                <div class="chart-wrapper">
                    <canvas id="profileChart"></canvas>
                </div>
            </div>
            <div class="chart-card">
                <h4>✅ Taxa de Sucesso vs Falha</h4>
                <div class="chart-wrapper">
                    <canvas id="successChart"></canvas>
                </div>
            </div>
            <div class="chart-card">
                <h4>❌ Distribuição de Erros HTTP</h4>
                <div class="chart-wrapper">
                    <canvas id="errorsChart"></canvas>
                </div>
            </div>
        </div>

        <!-- Performance Charts -->
        <h3 class="section-title">⚡ Performance por Operação</h3>
        <div class="charts-grid">
            <div class="chart-card">
                <h4>🗄️ Database - Operações CRUD</h4>
                <div class="chart-wrapper">
                    <canvas id="dbChart"></canvas>
                </div>
            </div>
            <div class="chart-card">
                <h4>👤 Authentication</h4>
                <div class="chart-wrapper">
                    <canvas id="authChart"></canvas>
                </div>
            </div>
            <div class="chart-card">
                <h4>📁 Storage</h4>
                <div class="chart-wrapper">
                    <canvas id="storageChart"></canvas>
                </div>
            </div>
            <div class="chart-card">
                <h4>📈 Distribuição de Latência (Percentis)</h4>
                <div class="chart-wrapper">
                    <canvas id="percentileChart"></canvas>
                </div>
            </div>
        </div>

        <!-- Errors Detail -->
        <h3 class="section-title">❌ Análise de Erros <span class="badge ${totalErros5xx > 0 ? 'badge-danger' : totalErros4xx > 0 ? 'badge-warning' : 'badge-success'}">${totalErros4xx + totalErros5xx} erros</span></h3>
        <div class="error-grid">
            <div class="error-card">
                <h4>⚠️ Erros de Cliente (4xx)</h4>
                <div class="error-item"><span class="code">400 Bad Request</span><span class="count ${total400 === 0 ? 'zero' : 'warning'}">${total400}</span></div>
                <div class="error-item"><span class="code">401 Unauthorized</span><span class="count ${total401 === 0 ? 'zero' : 'warning'}">${total401}</span></div>
                <div class="error-item"><span class="code">403 Forbidden</span><span class="count ${total403 === 0 ? 'zero' : 'warning'}">${total403}</span></div>
                <div class="error-item"><span class="code">404 Not Found</span><span class="count ${total404 === 0 ? 'zero' : 'warning'}">${total404}</span></div>
                <div class="error-item"><span class="code">409 Conflict</span><span class="count ${total409 === 0 ? 'zero' : 'warning'}">${total409}</span></div>
                <div class="error-item"><span class="code">429 Too Many Requests</span><span class="count ${total429 === 0 ? 'zero' : 'warning'}">${total429}</span></div>
            </div>
            <div class="error-card">
                <h4>🔴 Erros de Servidor (5xx)</h4>
                <div class="error-item critical"><span class="code">500 Internal Server Error</span><span class="count ${total500 === 0 ? 'zero' : 'danger'}">${total500}</span></div>
                <div class="error-item critical"><span class="code">502 Bad Gateway</span><span class="count ${total502 === 0 ? 'zero' : 'danger'}">${total502}</span></div>
                <div class="error-item critical"><span class="code">503 Service Unavailable</span><span class="count ${total503 === 0 ? 'zero' : 'danger'}">${total503}</span></div>
                <div class="error-item critical"><span class="code">504 Gateway Timeout</span><span class="count ${total504 === 0 ? 'zero' : 'danger'}">${total504}</span></div>
                <div class="error-item"><span class="code">Outros Erros</span><span class="count ${totalOutros === 0 ? 'zero' : 'warning'}">${totalOutros}</span></div>
            </div>
        </div>

        <!-- NEW SECTION: Erros por Requisição -->
        <h3 class="section-title">🔎 Erros por Requisição <span class="badge ${operacoesComErro.length > 0 ? 'badge-warning' : 'badge-success'}">${operacoesComErro.length} operações com erro</span></h3>
        
        ${operacoesComErro.length === 0 ? `
        <div class="error-card" style="text-align: center; padding: 40px;">
            <div style="font-size: 3rem; margin-bottom: 16px;">✅</div>
            <h4 style="color: var(--success); margin-bottom: 8px;">Nenhum Erro Detectado!</h4>
            <p style="color: var(--text-secondary);">Todas as requisições foram executadas com sucesso durante o teste.</p>
        </div>
        ` : `
        <div class="table-card">
            <h4>📊 Resumo de Erros por Operação</h4>
            <table>
                <thead>
                    <tr>
                        <th>Operação</th>
                        <th>Total Erros</th>
                        <th>400</th>
                        <th>401</th>
                        <th>403</th>
                        <th>404</th>
                        <th>409</th>
                        <th>429</th>
                        <th>500</th>
                        <th>502</th>
                        <th>503</th>
                        <th>504</th>
                        <th>Outros</th>
                    </tr>
                </thead>
                <tbody>
                    ${tabelaErrosPorOperacao}
                </tbody>
            </table>
        </div>

        <div class="charts-grid">
            <div class="chart-card">
                <h4>📈 Erros por Operação</h4>
                <div class="chart-wrapper">
                    <canvas id="errosPorOperacaoChart"></canvas>
                </div>
            </div>
            <div class="chart-card">
                <h4>🎯 Top Operações com Erros</h4>
                <div class="chart-wrapper">
                    <canvas id="topErrosChart"></canvas>
                </div>
            </div>
        </div>

        <div class="error-grid">
            ${cardsErrosPorOperacao}
        </div>
        `}

        <!-- Detailed Tables -->
        <h3 class="section-title">📋 Métricas Detalhadas</h3>
        <div class="table-card">
            <h4>🗄️ Database Operations</h4>
            <table>
                <thead><tr><th>Operação</th><th>Média</th><th>Min</th><th>Mediana</th><th>Máx</th><th>P(90)</th><th>P(95)</th></tr></thead>
                <tbody>
                    <tr><td class="metric-name">Criar Documento</td><td>${fmt(dbCreate.avg)}ms</td><td>${fmt(dbCreate.min)}ms</td><td>${fmt(dbCreate.med)}ms</td><td>${fmt(dbCreate.max)}ms</td><td>${fmt(dbCreate['p(90)'])}ms</td><td>${fmt(dbCreate['p(95)'])}ms</td></tr>
                    <tr><td class="metric-name">Ler Documento</td><td>${fmt(dbRead.avg)}ms</td><td>${fmt(dbRead.min)}ms</td><td>${fmt(dbRead.med)}ms</td><td>${fmt(dbRead.max)}ms</td><td>${fmt(dbRead['p(90)'])}ms</td><td>${fmt(dbRead['p(95)'])}ms</td></tr>
                    <tr><td class="metric-name">Atualizar Documento</td><td>${fmt(dbUpdate.avg)}ms</td><td>${fmt(dbUpdate.min)}ms</td><td>${fmt(dbUpdate.med)}ms</td><td>${fmt(dbUpdate.max)}ms</td><td>${fmt(dbUpdate['p(90)'])}ms</td><td>${fmt(dbUpdate['p(95)'])}ms</td></tr>
                    <tr><td class="metric-name">Deletar Documento</td><td>${fmt(dbDelete.avg)}ms</td><td>${fmt(dbDelete.min)}ms</td><td>${fmt(dbDelete.med)}ms</td><td>${fmt(dbDelete.max)}ms</td><td>${fmt(dbDelete['p(90)'])}ms</td><td>${fmt(dbDelete['p(95)'])}ms</td></tr>
                    <tr><td class="metric-name">Listar Documentos</td><td>${fmt(dbList.avg)}ms</td><td>${fmt(dbList.min)}ms</td><td>${fmt(dbList.med)}ms</td><td>${fmt(dbList.max)}ms</td><td>${fmt(dbList['p(90)'])}ms</td><td>${fmt(dbList['p(95)'])}ms</td></tr>
                    <tr><td class="metric-name">Query</td><td>${fmt(dbQuery.avg)}ms</td><td>${fmt(dbQuery.min)}ms</td><td>${fmt(dbQuery.med)}ms</td><td>${fmt(dbQuery.max)}ms</td><td>${fmt(dbQuery['p(90)'])}ms</td><td>${fmt(dbQuery['p(95)'])}ms</td></tr>
                </tbody>
            </table>
        </div>
        
        <div class="table-card">
            <h4>👤 Authentication Operations</h4>
            <table>
                <thead><tr><th>Operação</th><th>Média</th><th>Min</th><th>Mediana</th><th>Máx</th><th>P(90)</th><th>P(95)</th></tr></thead>
                <tbody>
                    <tr><td class="metric-name">Criar Usuário</td><td>${fmt(authCreate.avg)}ms</td><td>${fmt(authCreate.min)}ms</td><td>${fmt(authCreate.med)}ms</td><td>${fmt(authCreate.max)}ms</td><td>${fmt(authCreate['p(90)'])}ms</td><td>${fmt(authCreate['p(95)'])}ms</td></tr>
                    <tr><td class="metric-name">Obter Usuário</td><td>${fmt(authGet.avg)}ms</td><td>${fmt(authGet.min)}ms</td><td>${fmt(authGet.med)}ms</td><td>${fmt(authGet.max)}ms</td><td>${fmt(authGet['p(90)'])}ms</td><td>${fmt(authGet['p(95)'])}ms</td></tr>
                    <tr><td class="metric-name">Listar Usuários</td><td>${fmt(authList.avg)}ms</td><td>${fmt(authList.min)}ms</td><td>${fmt(authList.med)}ms</td><td>${fmt(authList.max)}ms</td><td>${fmt(authList['p(90)'])}ms</td><td>${fmt(authList['p(95)'])}ms</td></tr>
                    <tr><td class="metric-name">Deletar Usuário</td><td>${fmt(authDelete.avg)}ms</td><td>${fmt(authDelete.min)}ms</td><td>${fmt(authDelete.med)}ms</td><td>${fmt(authDelete.max)}ms</td><td>${fmt(authDelete['p(90)'])}ms</td><td>${fmt(authDelete['p(95)'])}ms</td></tr>
                </tbody>
            </table>
        </div>

        <div class="table-card">
            <h4>📁 Storage Operations</h4>
            <table>
                <thead><tr><th>Operação</th><th>Média</th><th>Min</th><th>Mediana</th><th>Máx</th><th>P(90)</th><th>P(95)</th></tr></thead>
                <tbody>
                    <tr><td class="metric-name">Upload</td><td>${fmt(storageUpload.avg)}ms</td><td>${fmt(storageUpload.min)}ms</td><td>${fmt(storageUpload.med)}ms</td><td>${fmt(storageUpload.max)}ms</td><td>${fmt(storageUpload['p(90)'])}ms</td><td>${fmt(storageUpload['p(95)'])}ms</td></tr>
                    <tr><td class="metric-name">Download</td><td>${fmt(storageDownload.avg)}ms</td><td>${fmt(storageDownload.min)}ms</td><td>${fmt(storageDownload.med)}ms</td><td>${fmt(storageDownload.max)}ms</td><td>${fmt(storageDownload['p(90)'])}ms</td><td>${fmt(storageDownload['p(95)'])}ms</td></tr>
                    <tr><td class="metric-name">Listar</td><td>${fmt(storageList.avg)}ms</td><td>${fmt(storageList.min)}ms</td><td>${fmt(storageList.med)}ms</td><td>${fmt(storageList.max)}ms</td><td>${fmt(storageList['p(90)'])}ms</td><td>${fmt(storageList['p(95)'])}ms</td></tr>
                    <tr><td class="metric-name">Deletar</td><td>${fmt(storageDelete.avg)}ms</td><td>${fmt(storageDelete.min)}ms</td><td>${fmt(storageDelete.med)}ms</td><td>${fmt(storageDelete.max)}ms</td><td>${fmt(storageDelete['p(90)'])}ms</td><td>${fmt(storageDelete['p(95)'])}ms</td></tr>
                </tbody>
            </table>
        </div>

        <!-- Recommendations -->
        <section class="recommendations">
            <h3>💡 Recomendações</h3>
            ${totalErros5xx > 0 ? `
            <div class="recommendation-item">
                <div class="priority high">!</div>
                <div class="content">
                    <div class="title">Investigar Erros de Servidor (5xx)</div>
                    <div class="desc">Foram detectados ${totalErros5xx} erros de servidor. Verificar logs do Appwrite e capacidade de recursos.</div>
                </div>
            </div>` : ''}
            ${(httpDuration['p(95)'] || 0) > SLA.p95Duration ? `
            <div class="recommendation-item">
                <div class="priority high">!</div>
                <div class="content">
                    <div class="title">Otimizar Latência P95</div>
                    <div class="desc">O P95 de ${fmt(httpDuration['p(95)'])}ms está acima da meta de ${SLA.p95Duration}ms. Considerar otimização de queries e cache.</div>
                </div>
            </div>` : ''}
            ${successRate < SLA.successRate ? `
            <div class="recommendation-item">
                <div class="priority medium">!</div>
                <div class="content">
                    <div class="title">Melhorar Taxa de Sucesso</div>
                    <div class="desc">Taxa atual de ${fmtPercent(successRate)}% está abaixo da meta de ${SLA.successRate}%. Analisar causas das falhas.</div>
                </div>
            </div>` : ''}
            ${total429 > 0 ? `
            <div class="recommendation-item">
                <div class="priority medium">!</div>
                <div class="content">
                    <div class="title">Rate Limiting Detectado</div>
                    <div class="desc">${total429} erros 429 indicam rate limiting. Considerar ajustar limites ou implementar backoff.</div>
                </div>
            </div>` : ''}
            ${healthScore >= 90 ? `
            <div class="recommendation-item">
                <div class="priority low">✓</div>
                <div class="content">
                    <div class="title">Performance Excelente</div>
                    <div class="desc">O sistema está performando dentro dos parâmetros esperados. Manter monitoramento contínuo.</div>
                </div>
            </div>` : ''}
            <div class="recommendation-item">
                <div class="priority low">→</div>
                <div class="content">
                    <div class="title">Próximos Passos</div>
                    <div class="desc">Executar testes de stress com carga maior para identificar ponto de saturação do sistema.</div>
                </div>
            </div>
        </section>

        <!-- Footer -->
        <footer class="footer">
            <p>📊 Relatório gerado automaticamente por <span class="logo">K6 Performance Testing</span></p>
            <p style="margin-top: 8px;">Appwrite Backend • ${dateStr}</p>
        </footer>
    </div>

    <script>
        Chart.defaults.color = '#94a3b8';
        Chart.defaults.borderColor = 'rgba(255,255,255,0.1)';
        Chart.defaults.font.family = 'Inter';

        // Platform Chart
        new Chart(document.getElementById('platformChart'), {
            type: 'doughnut',
            data: {
                labels: ['iOS', 'Android'],
                datasets: [{
                    data: [${iosCount}, ${androidCount}],
                    backgroundColor: ['rgba(162, 155, 254, 0.8)', 'rgba(85, 239, 196, 0.8)'],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '65%',
                plugins: { legend: { position: 'bottom', labels: { padding: 16, usePointStyle: true } } }
            }
        });

        // Profile Chart
        new Chart(document.getElementById('profileChart'), {
            type: 'doughnut',
            data: {
                labels: ['Casual', 'Ativo', 'Novo', 'Background'],
                datasets: [{
                    data: [${casualCount}, ${ativoCount}, ${novoCount}, ${backgroundCount}],
                    backgroundColor: ['rgba(116, 185, 255, 0.8)', 'rgba(100, 255, 218, 0.8)', 'rgba(255, 217, 61, 0.8)', 'rgba(162, 155, 254, 0.8)'],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '65%',
                plugins: { legend: { position: 'bottom', labels: { padding: 16, usePointStyle: true } } }
            }
        });

        // Success Chart
        new Chart(document.getElementById('successChart'), {
            type: 'doughnut',
            data: {
                labels: ['Sucesso', 'Falha'],
                datasets: [{
                    data: [${successCount}, ${failCount}],
                    backgroundColor: ['rgba(100, 255, 218, 0.8)', 'rgba(255, 107, 107, 0.8)'],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '65%',
                plugins: { legend: { position: 'bottom', labels: { padding: 16, usePointStyle: true } } }
            }
        });

        // Errors Chart
        new Chart(document.getElementById('errorsChart'), {
            type: 'bar',
            data: {
                labels: ['400', '401', '403', '404', '409', '429', '500', '502', '503', '504'],
                datasets: [{
                    data: [${total400}, ${total401}, ${total403}, ${total404}, ${total409}, ${total429}, ${total500}, ${total502}, ${total503}, ${total504}],
                    backgroundColor: ['#ffd93d', '#ffd93d', '#ffd93d', '#ffd93d', '#ffd93d', '#ffd93d', '#ff6b6b', '#ff6b6b', '#ff6b6b', '#ff6b6b'],
                    borderRadius: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: { y: { beginAtZero: true, grid: { color: 'rgba(255,255,255,0.05)' } }, x: { grid: { display: false } } }
            }
        });

        // DB Chart
        new Chart(document.getElementById('dbChart'), {
            type: 'bar',
            data: {
                labels: ['Criar', 'Ler', 'Atualizar', 'Deletar', 'Listar', 'Query'],
                datasets: [{
                    label: 'Tempo Médio (ms)',
                    data: [${fmt(dbCreate.avg)}, ${fmt(dbRead.avg)}, ${fmt(dbUpdate.avg)}, ${fmt(dbDelete.avg)}, ${fmt(dbList.avg)}, ${fmt(dbQuery.avg)}],
                    backgroundColor: ['#64ffda', '#74b9ff', '#a29bfe', '#ff6b6b', '#ffd93d', '#fd79a8'],
                    borderRadius: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: { y: { beginAtZero: true, grid: { color: 'rgba(255,255,255,0.05)' } }, x: { grid: { display: false } } }
            }
        });

        // Auth Chart
        new Chart(document.getElementById('authChart'), {
            type: 'bar',
            data: {
                labels: ['Criar', 'Obter', 'Listar', 'Deletar'],
                datasets: [{
                    label: 'Tempo Médio (ms)',
                    data: [${fmt(authCreate.avg)}, ${fmt(authGet.avg)}, ${fmt(authList.avg)}, ${fmt(authDelete.avg)}],
                    backgroundColor: ['#a29bfe', '#74b9ff', '#64ffda', '#ff6b6b'],
                    borderRadius: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: { y: { beginAtZero: true, grid: { color: 'rgba(255,255,255,0.05)' } }, x: { grid: { display: false } } }
            }
        });

        // Storage Chart
        new Chart(document.getElementById('storageChart'), {
            type: 'bar',
            data: {
                labels: ['Upload', 'Download', 'Listar', 'Deletar'],
                datasets: [{
                    label: 'Tempo Médio (ms)',
                    data: [${fmt(storageUpload.avg)}, ${fmt(storageDownload.avg)}, ${fmt(storageList.avg)}, ${fmt(storageDelete.avg)}],
                    backgroundColor: ['#ffd93d', '#74b9ff', '#a29bfe', '#ff6b6b'],
                    borderRadius: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: { y: { beginAtZero: true, grid: { color: 'rgba(255,255,255,0.05)' } }, x: { grid: { display: false } } }
            }
        });

        // Percentile Chart
        new Chart(document.getElementById('percentileChart'), {
            type: 'line',
            data: {
                labels: ['Min', 'P50', 'P90', 'P95', 'P99', 'Max'],
                datasets: [{
                    label: 'Latência (ms)',
                    data: [${fmt(httpDuration.min)}, ${fmt(httpDuration.med)}, ${fmt(httpDuration['p(90)'])}, ${fmt(httpDuration['p(95)'])}, ${fmt(httpDuration['p(99)'] || httpDuration['p(95)'])}, ${fmt(httpDuration.max)}],
                    borderColor: '#64ffda',
                    backgroundColor: 'rgba(100, 255, 218, 0.1)',
                    fill: true,
                    tension: 0.4,
                    pointRadius: 5,
                    pointBackgroundColor: '#64ffda'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: { y: { beginAtZero: true, grid: { color: 'rgba(255,255,255,0.05)' } }, x: { grid: { display: false } } }
            }
        });

        // Erros por Operação Chart (só se houver erros)
        ${operacoesComErro.length > 0 ? `
        const errosPorOpCanvas = document.getElementById('errosPorOperacaoChart');
        if (errosPorOpCanvas) {
            new Chart(errosPorOpCanvas, {
                type: 'bar',
                data: {
                    labels: ${JSON.stringify(chartLabelsErros)},
                    datasets: [
                        {
                            label: 'Erros 4xx',
                            data: ${JSON.stringify(chartData4xx)},
                            backgroundColor: 'rgba(255, 217, 61, 0.8)',
                            borderRadius: 4
                        },
                        {
                            label: 'Erros 5xx',
                            data: ${JSON.stringify(chartData5xx)},
                            backgroundColor: 'rgba(255, 107, 107, 0.8)',
                            borderRadius: 4
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { 
                        legend: { position: 'top', labels: { padding: 10, usePointStyle: true } }
                    },
                    scales: { 
                        y: { beginAtZero: true, stacked: true, grid: { color: 'rgba(255,255,255,0.05)' } }, 
                        x: { stacked: true, grid: { display: false } } 
                    }
                }
            });
        }

        // Top Erros Chart - Horizontal Bar
        const topErrosCanvas = document.getElementById('topErrosChart');
        if (topErrosCanvas) {
            new Chart(topErrosCanvas, {
                type: 'bar',
                data: {
                    labels: ${JSON.stringify(top8Labels)},
                    datasets: [{
                        label: 'Total de Erros',
                        data: ${JSON.stringify(top8Data)},
                        backgroundColor: [
                            'rgba(255, 107, 107, 0.8)',
                            'rgba(255, 150, 100, 0.8)',
                            'rgba(255, 193, 100, 0.8)',
                            'rgba(255, 217, 61, 0.8)',
                            'rgba(162, 155, 254, 0.8)',
                            'rgba(116, 185, 255, 0.8)',
                            'rgba(100, 255, 218, 0.8)',
                            'rgba(253, 121, 168, 0.8)'
                        ],
                        borderRadius: 6
                    }]
                },
                options: {
                    indexAxis: 'y',
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: { 
                        x: { beginAtZero: true, grid: { color: 'rgba(255,255,255,0.05)' } }, 
                        y: { grid: { display: false } } 
                    }
                }
            });
        }
        ` : ''}
    </script>
</body>
</html>`;
}
