import React from 'react'

function App() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          SGM - Sistema de Gerenciamento Metrológico
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Sistema funcionando corretamente!
        </p>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-4">Status do Sistema</h2>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Frontend:</span>
              <span className="text-green-600 font-semibold">✅ Online</span>
            </div>
            <div className="flex justify-between">
              <span>Backend:</span>
              <span className="text-green-600 font-semibold">✅ Online</span>
            </div>
            <div className="flex justify-between">
              <span>Banco de Dados:</span>
              <span className="text-green-600 font-semibold">✅ Conectado</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App

