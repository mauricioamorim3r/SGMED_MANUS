// ============================================================================
// COMPONENTE DE TESTE DA API - SGM
// ============================================================================

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { API_BASE_URL, apiRequest, API_ENDPOINTS } from '../config/api';

const ApiTest = () => {
  const [testResults, setTestResults] = useState([]);
  const [isRunning, setIsRunning] = useState(false);
  const [summary, setSummary] = useState({ total: 0, success: 0, failed: 0 });

  const tests = [
    { name: 'Health Check', endpoint: API_ENDPOINTS.HEALTH, method: 'GET' },
    { name: 'Listar Equipamentos', endpoint: API_ENDPOINTS.EQUIPAMENTOS, method: 'GET' },
    { name: 'Listar Polos', endpoint: API_ENDPOINTS.POLOS, method: 'GET' },
    { name: 'Listar Instalações', endpoint: API_ENDPOINTS.INSTALACOES, method: 'GET' },
    { name: 'Listar Pontos de Medição', endpoint: API_ENDPOINTS.PONTOS_MEDICAO, method: 'GET' },
    { name: 'Listar Placas de Orifício', endpoint: API_ENDPOINTS.PLACAS_ORIFICIO, method: 'GET' },
    { name: 'Listar Incertezas', endpoint: API_ENDPOINTS.INCERTEZAS, method: 'GET' },
    { name: 'Tipos de Equipamentos', endpoint: `${API_ENDPOINTS.EQUIPAMENTOS}/tipos/lista`, method: 'GET' },
    { name: 'Status de Polos', endpoint: `${API_ENDPOINTS.POLOS}/status/lista`, method: 'GET' },
    { name: 'Materiais Placas', endpoint: `${API_ENDPOINTS.PLACAS_ORIFICIO}/materiais/lista`, method: 'GET' }
  ];

  const runTest = async (test) => {
    const startTime = Date.now();
    
    try {
      const data = await apiRequest(test.endpoint, { method: test.method });
      const duration = Date.now() - startTime;
      
      return {
        ...test,
        status: 'success',
        duration,
        response: data,
        error: null
      };
      
    } catch (error) {
      const duration = Date.now() - startTime;
      
      return {
        ...test,
        status: 'error',
        duration,
        response: null,
        error: error.message
      };
    }
  };

  const runAllTests = async () => {
    setIsRunning(true);
    setTestResults([]);
    
    const results = [];
    
    for (const test of tests) {
      const result = await runTest(test);
      results.push(result);
      setTestResults([...results]);
    }
    
    // Calcular resumo
    const successful = results.filter(r => r.status === 'success').length;
    const failed = results.filter(r => r.status === 'error').length;
    
    setSummary({
      total: results.length,
      success: successful,
      failed: failed
    });
    
    setIsRunning(false);
  };

  const formatDuration = (ms) => {
    return `${ms}ms`;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'success':
        return 'bg-green-100 text-green-800';
      case 'error':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>🔗 Teste de Integração Frontend-Backend</span>
            <Button onClick={runAllTests} disabled={isRunning}>
              {isRunning ? '🔄 Executando...' : '▶️ Executar Testes'}
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Configuração da API */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold text-blue-900 mb-2">Configuração</h3>
              <p className="text-sm text-blue-700">
                <strong>URL Backend:</strong> {API_BASE_URL}
              </p>
              <p className="text-sm text-blue-700">
                <strong>Frontend:</strong> {window.location.origin}
              </p>
            </div>

            {/* Resumo dos testes */}
            {summary.total > 0 && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">Resumo</h3>
                <div className="flex gap-4">
                  <span className="text-sm">
                    <strong>Total:</strong> {summary.total}
                  </span>
                  <span className="text-sm text-green-600">
                    <strong>Sucessos:</strong> {summary.success}
                  </span>
                  <span className="text-sm text-red-600">
                    <strong>Falhas:</strong> {summary.failed}
                  </span>
                  <span className="text-sm text-blue-600">
                    <strong>Taxa:</strong> {((summary.success / summary.total) * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
            )}

            {/* Resultados dos testes */}
            <div className="space-y-2">
              {testResults.map((result, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <Badge className={getStatusColor(result.status)}>
                      {result.status === 'success' ? '✅' : '❌'}
                    </Badge>
                    <div>
                      <p className="font-medium">{result.name}</p>
                      <p className="text-sm text-gray-500">
                        {result.method} {result.endpoint}
                      </p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <p className="text-sm font-medium">
                      {formatDuration(result.duration)}
                    </p>
                    {result.error && (
                      <p className="text-xs text-red-500 max-w-xs truncate">
                        {result.error}
                      </p>
                    )}
                    {result.response && result.response.success && (
                      <p className="text-xs text-green-500">
                        {result.response.total !== undefined ? 
                          `${result.response.total} registros` : 
                          'Sucesso'
                        }
                      </p>
                    )}
                  </div>
                </div>
              ))}
              
              {/* Placeholder para testes que ainda não rodaram */}
              {isRunning && testResults.length < tests.length && (
                <div className="space-y-2">
                  {tests.slice(testResults.length).map((test, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 border rounded-lg opacity-50"
                    >
                      <div className="flex items-center gap-3">
                        <Badge className="bg-gray-100 text-gray-500">⏳</Badge>
                        <div>
                          <p className="font-medium">{test.name}</p>
                          <p className="text-sm text-gray-500">
                            {test.method} {test.endpoint}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-400">Aguardando...</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ApiTest;