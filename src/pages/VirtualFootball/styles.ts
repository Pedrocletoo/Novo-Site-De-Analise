import styled, { css, keyframes } from 'styled-components';

const pulseAnimation = keyframes`
  0% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.6;
    transform: scale(0.85);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
`;

export const VirtualFootballContainer = styled.div`
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 92%;
  max-width: 1400px;
  margin: 0 auto;
  overflow-x: auto;
  color: var(--text-color);
  
  @media (max-width: 1600px) {
    width: 95%;
  }
  
  @media (max-width: 1200px) {
    width: 98%;
  }
  
  @media (max-width: 768px) {
    padding: 20px 10px;
    width: 100%;
  }
`;

export const PageTitle = styled.h1`
  margin-bottom: 25px;
  font-size: 24px;
  text-align: center;
  width: 100%;
  padding-top: 10px;
  color: var(--accent-color);
  font-weight: 700;
  letter-spacing: 0.5px;
  position: relative;
  
  &::after {
    content: '';
    display: block;
    width: 60px;
    height: 3px;
    background-color: var(--accent-color);
    margin: 12px auto 0;
    opacity: 0.8;
  }
`;

export const LeagueSeparator = styled.hr`
  width: 100%;
  margin: 32px 0;
  border: none;
  height: 1px;
  background-color: var(--border-color);
  opacity: 0.5;
`;

export const ConnectionStatus = styled.div<{ status: 'connected' | 'connecting' | 'disconnected' | 'error' }>`
  display: flex;
  align-items: center;
  font-size: 14px;
  font-weight: normal;
  margin-left: 16px;
  
  &::before {
    content: '';
    display: inline-block;
    width: 10px;
    height: 10px;
    border-radius: 50%;
    margin-right: 8px;
    
    ${({ status }) => {
      if (status === 'connected') {
        return css`
          background-color: var(--success-color);
          animation: ${pulseAnimation} 2s infinite ease-in-out;
        `;
      } else if (status === 'connecting') {
        return css`
          background-color: var(--warning-color);
        `;
      } else {
        return css`
          background-color: var(--error-color);
        `;
      }
    }}
  }
  
  ${({ status }) => {
    if (status === 'connected') {
      return css`
        &::after {
          content: 'Tempo real';
          color: var(--success-color);
          font-size: 12px;
        }
      `;
    } else if (status === 'connecting') {
      return css`
        &::after {
          content: 'Conectando...';
          color: var(--warning-color);
          font-size: 12px;
        }
      `;
    } else if (status === 'error') {
      return css`
        &::after {
          content: 'Erro de conexão';
          color: var(--error-color);
          font-size: 12px;
        }
      `;
    } else {
      return css`
        &::after {
          content: 'Desconectado';
          color: var(--error-color);
          font-size: 12px;
        }
      `;
    }
  }}
`; 