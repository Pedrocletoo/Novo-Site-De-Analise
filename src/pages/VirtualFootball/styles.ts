import styled from 'styled-components';

export const VirtualFootballContainer = styled.div`
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 90%;
  max-width: 1400px;
  margin: 0 auto;
  
  @media (max-width: 1600px) {
    width: 85%;
  }
  
  @media (max-width: 1200px) {
    width: 90%;
  }
  
  @media (max-width: 768px) {
    padding: 20px 10px;
    width: 95%;
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