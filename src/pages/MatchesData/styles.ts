import styled from 'styled-components';

export const PageContainer = styled.div`
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  
  p {
    margin: 1rem 0;
    color: ${({ theme }) => theme.textLight};
  }
`;

export const PageTitle = styled.h1`
  font-size: 2rem;
  color: ${({ theme }) => theme.text};
  margin-bottom: 1.5rem;
  font-weight: 600;
`;

export const ApiDataContainer = styled.div`
  margin-top: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

export const RefreshButton = styled.button`
  background-color: ${({ theme }) => theme.accent};
  color: #111;
  border: none;
  border-radius: 4px;
  padding: 0.6rem 1.2rem;
  font-weight: 600;
  cursor: pointer;
  transition: filter 0.2s, transform 0.1s;
  align-self: flex-start;
  
  &:hover {
    filter: brightness(1.1);
  }
  
  &:active {
    transform: translateY(2px);
  }
`;

export const MatchDetail = styled.div`
  background-color: ${({ theme }) => theme.secondary};
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

export const MatchDetailItem = styled.div`
  display: flex;
  align-items: center;
  padding-bottom: 0.8rem;
  border-bottom: 1px solid ${({ theme }) => theme.border};
  
  &:last-child {
    border-bottom: none;
    padding-bottom: 0;
  }
`;

export const MatchDetailLabel = styled.span`
  color: ${({ theme }) => theme.textLight};
  font-size: 0.9rem;
  width: 140px;
  flex-shrink: 0;
`;

export const MatchDetailValue = styled.span`
  color: ${({ theme }) => theme.text};
  font-weight: 500;
`;

export const TimeInfo = styled.span`
  color: ${({ theme }) => theme.accent};
  font-weight: 600;
  font-family: monospace;
  font-size: 1.1rem;
`; 