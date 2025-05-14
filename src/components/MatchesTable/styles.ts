import styled from 'styled-components';

export const TableContainer = styled.div`
  width: 100%;
  overflow-x: auto;
  margin: 1.5rem 0;
  background-color: ${({ theme }) => theme.secondary};
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  padding: 1rem;
`;

export const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;
`;

export const TableHeader = styled.thead`
  border-bottom: 2px solid ${({ theme }) => theme.border};
`;

export const TableBody = styled.tbody``;

export const TableRow = styled.tr`
  border-bottom: 1px solid ${({ theme }) => theme.border};
  transition: background-color 0.2s ease;
  
  &:hover {
    background-color: rgba(0, 0, 0, 0.05);
  }
  
  &:last-child {
    border-bottom: none;
  }
`;

export const TableCell = styled.td`
  padding: 1rem;
  vertical-align: middle;
  text-align: left;
`;

export const TableHeaderCell = styled.th`
  padding: 1rem;
  text-align: left;
  font-weight: 600;
  color: ${({ theme }) => theme.text};
`;

export const TeamName = styled.div`
  display: flex;
  align-items: center;
  
  span {
    font-weight: 500;
    color: ${({ theme }) => theme.text};
    
    &:nth-child(2) {
      margin: 0 0.5rem;
      color: ${({ theme }) => theme.textLight};
      font-size: 0.9rem;
    }
  }
`;

export const Score = styled.div`
  font-weight: 700;
  font-size: 1.1rem;
  color: ${({ theme }) => theme.accent};
  font-family: monospace;
`;

export const TimeDisplay = styled.div`
  font-family: monospace;
  font-weight: 600;
  color: ${({ theme }) => theme.text};
  font-size: 1rem;
`;

export const LoadingIndicator = styled.div`
  width: 100%;
  text-align: center;
  padding: 2rem;
  color: ${({ theme }) => theme.textLight};
`;

export const ErrorMessage = styled.div`
  width: 100%;
  background-color: ${({ theme }) => theme.redCell};
  color: white;
  padding: 1.5rem;
  border-radius: 8px;
  margin: 1rem 0;
  
  p {
    margin-bottom: 1rem;
  }
`;

export const RefreshButton = styled.button`
  background-color: ${({ theme }) => theme.accent};
  color: #111;
  border: none;
  border-radius: 4px;
  padding: 0.5rem 1rem;
  cursor: pointer;
  font-weight: 600;
  margin-bottom: 1rem;
  transition: filter 0.2s, transform 0.1s;
  
  &:hover {
    filter: brightness(1.1);
  }
  
  &:active {
    transform: translateY(2px);
  }
`;

export const NoDataMessage = styled.div`
  width: 100%;
  text-align: center;
  padding: 2rem;
  color: ${({ theme }) => theme.textLight};
  font-style: italic;
`; 