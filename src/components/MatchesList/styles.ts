import styled from 'styled-components';

export const MatchesContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1rem;
  
  h2 {
    margin-bottom: 1rem;
    color: ${({ theme }) => theme.text};
    font-size: 1.5rem;
  }
`;

export const MatchItem = styled.div`
  display: flex;
  flex-direction: column;
  padding: 1rem;
  border-radius: 8px;
  background-color: ${({ theme }) => theme.secondary};
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s, box-shadow 0.2s;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
`;

export const TeamNames = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid ${({ theme }) => theme.border};
  
  span {
    font-weight: 600;
    font-size: 1rem;
    color: ${({ theme }) => theme.text};
    
    &:nth-child(2) {
      color: ${({ theme }) => theme.textLight};
      font-size: 0.9rem;
    }
  }
`;

export const MatchTime = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 0.75rem;
  font-size: 0.9rem;
  color: ${({ theme }) => theme.textLight};
  font-weight: 500;
`;

export const MatchScore = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  
  div {
    display: flex;
    align-items: center;
    
    span {
      font-size: 0.9rem;
      color: ${({ theme }) => theme.text};
    }
  }
`;

export const LoadingIndicator = styled.div`
  padding: 2rem;
  text-align: center;
  color: ${({ theme }) => theme.textLight};
  font-size: 1rem;
`;

export const ErrorMessage = styled.div`
  padding: 1.5rem;
  margin: 1rem 0;
  background-color: ${({ theme }) => theme.redCell};
  border-radius: 8px;
  color: white;
  
  p {
    margin-bottom: 1rem;
  }
  
  button {
    padding: 0.5rem 1rem;
    background-color: ${({ theme }) => theme.main};
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-weight: 500;
    
    &:hover {
      filter: brightness(0.9);
    }
  }
`; 