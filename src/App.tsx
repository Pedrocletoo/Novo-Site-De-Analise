import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import VirtualFootball from './pages/VirtualFootball';
import MatchesDataPage from './pages/MatchesData';
import MatchesFiltersPage from './pages/MatchesFilters';
import BR4 from './pages/BR4';
import styled from 'styled-components';
import { ThemeProvider } from './contexts/ThemeContext';
import { FilterProvider } from './components/Filters';
import { WebSocketProvider } from './contexts/WebSocketContext';
import { CacheProvider } from './contexts/CacheContext';

const MainContainer = styled.div`
  display: flex;
  width: 100%;
  max-width: 100%;
  overflow-x: hidden;
  background-color: var(--main-background);
  min-height: 100vh;
`;

const ContentArea = styled.main`
  flex: 1;
  max-width: calc(100% - 250px);
  margin-left: 250px;
  padding: 0;
  display: flex;
  justify-content: center;
  background-color: var(--main-background);
  
  @media (max-width: 768px) {
    margin-left: 0;
    max-width: 100%;
  }
`;

const PageWrapper = styled.div`
  width: 100%;
  padding: 0;
  display: flex;
  justify-content: center;
`;

const CommonContentStyles = styled.div`
  padding: 20px;
  width: 90%;
  max-width: 1400px;
  background-color: var(--main-background);
  border-radius: 6px;
  color: var(--text-color);
  
  h1 {
    color: var(--accent-color);
    margin-bottom: 25px;
    font-size: 24px;
    position: relative;
    
    &::after {
      content: '';
      display: block;
      width: 60px;
      height: 3px;
      background-color: var(--accent-color);
      margin: 12px 0 0;
      opacity: 0.8;
    }
  }
`;

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <CacheProvider>
        <WebSocketProvider>
          <FilterProvider>
            <Router>
              <MainContainer>
                <Sidebar />
                <ContentArea>
                  <Routes>
                    <Route path="/" element={
                      <PageWrapper>
                        <CommonContentStyles>
                          <h1>Dashboard</h1>
                          <p>Bem-vindo à plataforma de análise.</p>
                        </CommonContentStyles>
                      </PageWrapper>
                    } />
                    <Route path="/futebol-virtual" element={<Navigate to="/futebol-virtual/betano" replace />} />
                    <Route path="/futebol-virtual/betano" element={<VirtualFootball />} />
                    <Route path="/futebol-virtual/br4" element={<BR4 />} />
                    <Route path="/partidas" element={<MatchesDataPage />} />
                    <Route path="/filtrar-partidas" element={<MatchesFiltersPage />} />
                    <Route path="/estatisticas" element={
                      <PageWrapper>
                        <CommonContentStyles>
                          <h1>Estatísticas</h1>
                          <p>Visualize estatísticas detalhadas e análises de dados.</p>
                        </CommonContentStyles>
                      </PageWrapper>
                    } />
                    <Route path="/resultados" element={
                      <PageWrapper>
                        <CommonContentStyles>
                          <h1>Resultados</h1>
                          <p>Confira os resultados mais recentes.</p>
                        </CommonContentStyles>
                      </PageWrapper>
                    } />
                    <Route path="/configuracoes" element={
                      <PageWrapper>
                        <CommonContentStyles>
                          <h1>Configurações</h1>
                          <p>Personalize sua experiência na plataforma.</p>
                        </CommonContentStyles>
                      </PageWrapper>
                    } />
                  </Routes>
                </ContentArea>
              </MainContainer>
            </Router>
          </FilterProvider>
        </WebSocketProvider>
      </CacheProvider>
    </ThemeProvider>
  );
};

export default App;
