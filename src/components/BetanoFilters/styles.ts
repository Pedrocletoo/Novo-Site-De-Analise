import styled from 'styled-components';

export const FiltersContainer = styled.div`
  display: flex;
  justify-content: space-between;
  width: 100%;
  gap: 0px;
  margin-bottom: 0;
  background-color: #071122;
  border-radius: 0;
  padding: 16px 20px;
  box-shadow: none;
  border-top: 1px solid #1a2c43;
  border-bottom: 1px solid #1a2c43;
  
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
  padding: 0 10px;
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
  font-size: 13px;
  font-weight: 600;
  margin-bottom: 8px;
  color: #adff2f;
  white-space: nowrap;
  letter-spacing: 0.5px;
`;

export const SelectWrapper = styled.div`
  position: relative;
  width: 100%;
  height: 34px;
`;

export const CustomSelect = styled.select`
  width: 100%;
  height: 100%;
  background-color: #071122;
  border: 1px solid #1a2c43;
  border-radius: 4px;
  padding: 0 30px 0 10px;
  color: #fff;
  appearance: none;
  font-size: 13px;
  cursor: pointer;
  
  &:hover {
    border-color: #adff2f;
    opacity: 0.9;
  }
  
  &:focus {
    outline: none;
    box-shadow: 0 0 0 1px rgba(173, 255, 47, 0.2);
    border-color: #adff2f;
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
  border-left: 5px solid transparent;
  border-right: 5px solid transparent;
  border-top: 5px solid #adff2f;
  pointer-events: none;
`; 