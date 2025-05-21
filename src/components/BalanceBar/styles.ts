import styled from 'styled-components';

interface WidthProps {
  width: string;
}

export const BalanceBarContainer = styled.div`
  display: flex;
  width: 90%;
  max-width: 600px;
  height: 32px;
  border-radius: 8px;
  overflow: hidden;
  margin: 0 auto 15px;
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.2), inset 0 1px 1px rgba(255, 255, 255, 0.2);
  position: relative;
  z-index: 2;
  border: 1px solid rgba(0, 0, 0, 0.1);
`;

export const GreenBar = styled.div<WidthProps>`
  background: linear-gradient(to bottom, var(--green-cell-lighter, #34E85D) 0%, var(--green-cell, #2FB344) 100%);
  width: ${props => props.width};
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  transition: width 0.3s ease-in-out;
  padding-left: 10px;
  position: relative;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.3);
  
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: rgba(255, 255, 255, 0.5);
  }
`;

export const RedBar = styled.div<WidthProps>`
  background: linear-gradient(to bottom, var(--red-cell-lighter, #FF6868) 0%, var(--red-cell, #E53935) 100%);
  width: ${props => props.width};
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  transition: width 0.3s ease-in-out;
  padding-right: 10px;
  position: relative;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.3);
  
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: rgba(255, 255, 255, 0.5);
  }
`;

export const PercentageLabel = styled.span`
  color: white;
  font-weight: 600;
  font-size: 14px;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.4);
  position: relative;
  z-index: 2;
`; 