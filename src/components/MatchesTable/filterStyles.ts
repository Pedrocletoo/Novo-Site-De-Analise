import styled from 'styled-components';

export const FilterContainer = styled.div`
  width: 100%;
  background-color: ${({ theme }) => theme.secondary};
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
  margin-bottom: 1.5rem;
`;

export const FiltersWrapper = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 1.5rem;
  align-items: flex-end;
`;

export const FilterGroup = styled.div`
  display: flex;
  flex-direction: column;
  min-width: 150px;
`;

export const FilterLabel = styled.label`
  font-size: 0.9rem;
  color: ${({ theme }) => theme.textLight};
  margin-bottom: 0.5rem;
`;

export const FilterSelect = styled.select`
  padding: 0.6rem;
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 4px;
  background-color: ${({ theme }) => theme.main};
  color: ${({ theme }) => theme.text};
  font-size: 1rem;
  
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.accent};
  }
`;

export const FilterInput = styled.input`
  padding: 0.6rem;
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 4px;
  background-color: ${({ theme }) => theme.main};
  color: ${({ theme }) => theme.text};
  font-size: 1rem;
  
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.accent};
  }
`;

export const FilterButton = styled.button`
  background-color: ${({ theme }) => theme.accent};
  color: #111;
  border: none;
  border-radius: 4px;
  padding: 0.6rem 1.2rem;
  cursor: pointer;
  font-weight: 600;
  height: 38px;
  transition: filter 0.2s, transform 0.1s;
  
  &:hover {
    filter: brightness(1.1);
  }
  
  &:active {
    transform: translateY(2px);
  }
`; 