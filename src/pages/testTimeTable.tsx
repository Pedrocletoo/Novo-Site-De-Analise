import React from 'react';
import TimeTable from '../components/TimeTable';

const TestTimeTablePage: React.FC = () => {
  return (
    <div className="test-page">
      <header className="test-header">
        <h1>Teste de Posicionamento na Tabela</h1>
        <p>Esta página testa se os resultados da API são posicionados corretamente nas células da tabela</p>
      </header>
      
      <div className="test-explanation">
        <h2>Objetivo do Teste</h2>
        <p>Verificar se jogos com horários específicos são posicionados nas células corretas da tabela.</p>
        <p>Neste teste, estamos visualizando apenas jogos da hora 23 (independente da data).</p>
        <p>A lógica implementada deve garantir que cada jogo apareça exatamente na célula correspondente ao seu minuto de início.</p>
        <p>Por exemplo, um jogo com horário de início às 23:31 deve aparecer na célula da coluna 31 da linha 23.</p>
      </div>
      
      <div className="test-content">
        <TimeTable liga="euro" testMode={true} />
      </div>
      
      <div className="data-explanation">
        <h3>Análise dos Resultados</h3>
        <p>Se a tabela estiver vazia, pode significar que:</p>
        <ul>
          <li>Não existem jogos na API para o horário específico (hora 23)</li>
          <li>Os jogos existentes não passaram na validação (não finalizados ou sem placares)</li>
        </ul>
        <p>Ao clicar em uma célula com jogos, você poderá ver os detalhes completos incluindo hora exata, data e ID.</p>
      </div>
      
      <footer className="test-footer">
        <p>Este teste usa dados reais da API - Os resultados exibidos são partidas finalizadas reais.</p>
      </footer>
      
      <style>
        {`
          .test-page {
            font-family: 'Roboto', sans-serif;
            max-width: 1400px;
            margin: 0 auto;
            padding: 20px;
          }
          
          .test-header {
            background-color: #1a2140;
            color: white;
            padding: 20px;
            border-radius: 6px;
            margin-bottom: 20px;
            text-align: center;
          }
          
          .test-header h1 {
            margin-bottom: 10px;
          }
          
          .test-header p {
            margin: 0;
            opacity: 0.8;
          }
          
          .test-explanation {
            background-color: #f0f9ff;
            border-left: 4px solid #1890ff;
            padding: 15px;
            margin-bottom: 20px;
            border-radius: 0 4px 4px 0;
          }
          
          .test-explanation h2 {
            margin-top: 0;
            color: #1890ff;
            font-size: 18px;
          }
          
          .test-explanation p {
            margin: 8px 0;
            line-height: 1.5;
          }
          
          .test-content {
            margin: 30px 0;
          }
          
          .data-explanation {
            background-color: #f6f6f6;
            padding: 15px;
            border-radius: 4px;
            margin: 20px 0;
          }
          
          .data-explanation h3 {
            margin-top: 0;
            font-size: 16px;
            color: #333;
          }
          
          .data-explanation ul {
            margin: 10px 0;
            padding-left: 20px;
          }
          
          .data-explanation li {
            margin-bottom: 5px;
          }
          
          .test-footer {
            margin-top: 30px;
            text-align: center;
            border-top: 1px solid #eee;
            padding-top: 20px;
            color: #999;
            font-size: 14px;
          }
        `}
      </style>
    </div>
  );
};

export default TestTimeTablePage; 