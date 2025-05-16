import styled from 'styled-components';

export const PageContainer = styled.div`
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
`;

export const PageTitle = styled.h1`
  font-size: 2rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: ${({ theme }) => theme.text};
`;

export const PageDescription = styled.p`
  font-size: 1rem;
  color: ${({ theme }) => theme.textLight};
  margin-bottom: 2rem;
`; 