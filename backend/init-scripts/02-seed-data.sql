-- =============================================================================
-- AEGIS - Dados de Seed
-- =============================================================================

-- Fichas
INSERT INTO AEGIS_FICHAS (ATENDIMENTO_PARA, SERVICO, OFERTA_SERVICO, DETALHE_FALHA, CATEGORIA, SUBCATEGORIA)
VALUES ('João Silva', 'Suporte Técnico', 'Premium', 'Falha na autenticação do sistema legado', 'Segurança', 'Autenticação');

INSERT INTO AEGIS_FICHAS (ATENDIMENTO_PARA, SERVICO, OFERTA_SERVICO, DETALHE_FALHA, CATEGORIA, SUBCATEGORIA)
VALUES ('Maria Santos', 'Infraestrutura', 'Enterprise', 'Indisponibilidade do servidor de banco de dados', 'Infraestrutura', 'Banco de Dados');

INSERT INTO AEGIS_FICHAS (ATENDIMENTO_PARA, SERVICO, OFERTA_SERVICO, DETALHE_FALHA, CATEGORIA, SUBCATEGORIA)
VALUES ('Carlos Oliveira', 'Rede', 'Gov', 'Latência elevada no link de comunicação', 'Rede', 'Conectividade');

INSERT INTO AEGIS_FICHAS (ATENDIMENTO_PARA, SERVICO, OFERTA_SERVICO, DETALHE_FALHA, CATEGORIA, SUBCATEGORIA)
VALUES ('Ana Costa', 'Aplicação', 'Básico', 'Erro 503 no módulo de relatórios', 'Aplicação', 'API');

INSERT INTO AEGIS_FICHAS (ATENDIMENTO_PARA, SERVICO, OFERTA_SERVICO, DETALHE_FALHA, CATEGORIA, SUBCATEGORIA)
VALUES ('Pedro Souza', 'Segurança', 'Premium', 'Tentativa de acesso não autorizado detectada', 'Segurança', 'Acesso');

-- Travas
INSERT INTO AEGIS_TRAVAS (NOME, DESCRICAO, ENDPOINT, METODO, ATIVO)
VALUES ('Login Legado', 'Trava de segurança para login do sistema legado', '/api/v2/login', 'POST', 'TRUE');

INSERT INTO AEGIS_TRAVAS (NOME, DESCRICAO, ENDPOINT, METODO, ATIVO)
VALUES ('Pagamentos', 'Bloqueio preventivo de processamento de pagamentos', '/checkout', 'POST', 'TRUE');

INSERT INTO AEGIS_TRAVAS (NOME, DESCRICAO, ENDPOINT, METODO, ATIVO)
VALUES ('Notificações Push', 'Gateway de notificações em manutenção', '/push', 'POST', 'TRUE');

INSERT INTO AEGIS_TRAVAS (NOME, DESCRICAO, ENDPOINT, METODO, ATIVO)
VALUES ('Ingestão de Logs', 'Serviço de logs centralizado sobrecarregado', '/ingest', 'POST', 'TRUE');

INSERT INTO AEGIS_TRAVAS (NOME, DESCRICAO, ENDPOINT, METODO, ATIVO)
VALUES ('Health Check', 'Balanceador de carga em manutenção programada', '/health', 'GET', 'TRUE');

INSERT INTO AEGIS_TRAVAS (NOME, DESCRICAO, ENDPOINT, METODO, ATIVO)
VALUES ('Proxy Reverso', 'Atualização de configuração do proxy', '/api', 'GET', 'TRUE');

INSERT INTO AEGIS_TRAVAS (NOME, DESCRICAO, ENDPOINT, METODO, ATIVO)
VALUES ('Cache Distribuído', 'Limpeza de cache programada', '/keys', 'DELETE', 'TRUE');

INSERT INTO AEGIS_TRAVAS (NOME, DESCRICAO, ENDPOINT, METODO, ATIVO)
VALUES ('Consulta Direta BD', 'Restrição de consultas diretas ao banco', '/query', 'SELECT', 'TRUE');

INSERT INTO AEGIS_TRAVAS (NOME, DESCRICAO, ENDPOINT, METODO, ATIVO)
VALUES ('Exportação Relatórios', 'Módulo de relatórios em atualização', '/export', 'GET', 'FALSE');

INSERT INTO AEGIS_TRAVAS (NOME, DESCRICAO, ENDPOINT, METODO, ATIVO)
VALUES ('Upload Arquivos', 'API de importação temporariamente desativada', '/upload', 'POST', 'FALSE');

-- Logs de execução
INSERT INTO AEGIS_LOGS (ENDPOINT, VALIDATION_NAME, RESULT, STATUS, EXECUTION_TIME_MS, INPUT_VALUE)
VALUES ('/api/v1/travas/1/disable', 'valida.desativar.trava', 'Trava desativada com sucesso', 'SUCCESS', 234, '{"id":1,"reason":"Manutenção programada"}');

INSERT INTO AEGIS_LOGS (ENDPOINT, VALIDATION_NAME, RESULT, STATUS, EXECUTION_TIME_MS, INPUT_VALUE)
VALUES ('/api/v1/travas/2/disable', 'valida.desativar.trava', 'Erro: trava não encontrada', 'ERROR', 89, '{"id":2}');

INSERT INTO AEGIS_LOGS (ENDPOINT, VALIDATION_NAME, RESULT, STATUS, EXECUTION_TIME_MS, INPUT_VALUE)
VALUES ('/api/v1/fichas', 'valida.criar.ficha', 'Ficha criada com sucesso', 'SUCCESS', 156, '{"servico":"Suporte"}');

INSERT INTO AEGIS_LOGS (ENDPOINT, VALIDATION_NAME, RESULT, STATUS, EXECUTION_TIME_MS, INPUT_VALUE)
VALUES ('/api/v1/import/upload', 'valida.importar.csv', 'Importação concluída: 150 registros', 'SUCCESS', 4523, '{"arquivo":"fichas.csv","linhas":150}');

INSERT INTO AEGIS_LOGS (ENDPOINT, VALIDATION_NAME, RESULT, STATUS, EXECUTION_TIME_MS, INPUT_VALUE)
VALUES ('/api/v1/import/upload', 'valida.importar.csv', 'Erro de validação: coluna obrigatória ausente', 'VALIDATION_ERROR', 312, '{"arquivo":"fichas.csv","erro":"Coluna SERVIÇO ausente"}');

-- Logs de monitoramento
INSERT INTO AEGIS_MONITORING_LOGS (SOURCE_SYSTEM, REQUEST_BODY, DURATION_MS, REMOTE_ADDR, USER_AGENT)
VALUES ('Sentry', '{"event":"error","level":"error"}', 145, '10.0.0.1', 'Sentry/1.0');

INSERT INTO AEGIS_MONITORING_LOGS (SOURCE_SYSTEM, REQUEST_BODY, DURATION_MS, REMOTE_ADDR, USER_AGENT)
VALUES ('Grafana', '{"query":"up{job=\"aegis\"}"}', 89, '10.0.0.2', 'Grafana/8.5');

INSERT INTO AEGIS_MONITORING_LOGS (SOURCE_SYSTEM, REQUEST_BODY, DURATION_MS, REMOTE_ADDR, USER_AGENT)
VALUES ('Prometheus', '{"scrape":"metrics"}', 234, '10.0.0.3', 'Prometheus/2.45');

INSERT INTO AEGIS_MONITORING_LOGS (SOURCE_SYSTEM, REQUEST_BODY, DURATION_MS, REMOTE_ADDR, USER_AGENT)
VALUES ('Azure Monitor', '{"alert":"CPU > 90%"}', 567, '10.0.0.4', 'AzureMonitor/1.0');

INSERT INTO AEGIS_MONITORING_LOGS (SOURCE_SYSTEM, REQUEST_BODY, DURATION_MS, REMOTE_ADDR, USER_AGENT)
VALUES ('Elastic APM', '{"trace":"error","transaction":"POST /api"}', 789, '10.0.0.5', 'ElasticAPM/3.0');

COMMIT;
