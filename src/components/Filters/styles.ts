import styled from 'styled-components';

export const FiltersContainer = styled.div`
  display: flex;
  justify-content: space-between;
  width: 100%;
  gap: 20px;
  margin-bottom: 20px;
  background-color: var(--secondary-background);
  border-radius: 6px;
  padding: 15px 20px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  border: 1px solid var(--border-color);
  
  @media (max-width: 1200px) {
    flex-wrap: wrap;
    gap: 15px 20px;
  }
  
  @media (max-width: 768px) {
    gap: 12px;
    padding: 12px 15px;
  }
`;

export const FilterItem = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 130px;
  background-color: transparent;
  border-radius: 0;
  padding: 0;
  border: none;
  
  @media (max-width: 1200px) {
    flex-basis: calc(50% - 20px);
    min-width: 0;
  }
  
  @media (max-width: 768px) {
    flex-basis: 100%;
  }
`;

export const FilterLabel = styled.label`
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 8px;
  color: var(--accent-color);
  white-space: nowrap;
  letter-spacing: 0.5px;
`;

export const SelectWrapper = styled.div`
  position: relative;
  width: 100%;
  height: 40px;
`;

export const CustomSelect = styled.select`
  width: 100%;
  height: 100%;
  background-color: var(--select-background);
  border: 1px solid var(--border-color);
  border-radius: 4px;
  padding: 0 30px 0 15px;
  color: var(--text-color);
  appearance: none;
  font-size: 14px;
  cursor: pointer;
  
  &:hover {
    border-color: var(--accent-color);
    opacity: 0.8;
  }
  
  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px rgba(88, 116, 94, 0.2);
    border-color: var(--accent-color);
  }
  
  optgroup {
    font-weight: 700;
    color: var(--accent-color);
    font-size: 13px;
    background-color: var(--secondary-background);
    padding-top: 5px;
    padding-bottom: 5px;
  }
  
  option {
    padding: 5px 0;
    background-color: var(--select-background);
    color: var(--text-color);
  }
  
  @media (max-width: 768px) {
    padding: 0 25px 0 10px;
    font-size: 13px;
  }
`;

export const DownArrow = styled.div`
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  width: 0;
  height: 0;
  border-left: 6px solid transparent;
  border-right: 6px solid transparent;
  border-top: 6px solid var(--accent-color);
  pointer-events: none;
`;

export const CheckboxContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  background-color: var(--select-background);
  border: 1px solid var(--border-color);
  border-radius: 4px;
  padding: 8px 12px;
  max-height: 120px;
  overflow-y: auto;
  
  &::-webkit-scrollbar {
    width: 8px;
  }
  
  &::-webkit-scrollbar-track {
    background: var(--scrollbar-track);
    border-radius: 4px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: var(--scrollbar-thumb);
    border-radius: 4px;
  }
  
  &::-webkit-scrollbar-thumb:hover {
    background: var(--accent-color);
  }
`;

export const CheckboxLabel = styled.label`
  display: flex;
  align-items: center;
  font-size: 14px;
  color: var(--text-color);
  cursor: pointer;
  
  &:hover {
    color: var(--accent-color);
  }
`;

export const CheckboxInput = styled.input`
  margin-right: 8px;
  cursor: pointer;
  accent-color: var(--accent-color);
  width: 16px;
  height: 16px;
`; 