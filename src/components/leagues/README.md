# Estrutura de Ligas

Este diretório contém a estrutura de componentes para as diferentes ligas de futebol exibidas na aplicação.

## Arquitetura

A estrutura foi projetada para ser escalável e de fácil manutenção, seguindo os princípios de:

- **Separação de responsabilidades**: Cada liga tem seu próprio módulo
- **Componentização**: Componentes base reutilizáveis
- **Extensibilidade**: Fácil adição de novas ligas

## Estrutura de Diretórios

```
leagues/
├── index.tsx              # Ponto de entrada - gerencia qual liga mostrar
├── shared/                # Componentes compartilhados entre ligas
│   └── LeagueTable.tsx    # Componente base de tabela reutilizado por todas as ligas
├── euro-league/           # Módulo específico para Euro League
│   └── index.tsx          # Implementação específica da Euro League
└── README.md              # Este arquivo
```

## Como Adicionar uma Nova Liga

Para adicionar uma nova liga à aplicação, siga estes passos:

1. **Crie um novo diretório** para a liga:
   ```
   mkdir src/components/leagues/nome-da-liga
   ```

2. **Implemente o componente específico** da liga:
   ```tsx
   // src/components/leagues/nome-da-liga/index.tsx
   import React from 'react';
   import LeagueTable from '../shared/LeagueTable';

   const NomeDaLiga: React.FC = () => {
     return (
       <LeagueTable 
         leagueId="id-da-liga" 
         leagueName="Nome da Liga"
       />
     );
   };

   export default NomeDaLiga;
   ```

3. **Atualize a lista de ligas disponíveis** no arquivo de filtros:
   ```tsx
   // src/components/Filters/index.tsx
   export const availableLeagues = [
     { id: 'euro', name: 'Euro League' },
     { id: 'id-da-liga', name: 'Nome da Liga' } // Nova liga
   ];
   ```

4. **Adicione a liga no componente principal**:
   ```tsx
   // src/components/leagues/index.tsx (no método renderLeagueComponent)
   
   const renderLeagueComponent = (leagueId: string) => {
     switch (leagueId) {
       case 'euro':
         return <EuroLeague key={leagueId} />;
       case 'id-da-liga':
         return <NomeDaLiga key={leagueId} />; // Nova liga
       default:
         return null;
     }
   };
   ```

5. **Importe o novo componente** no arquivo index.tsx:
   ```tsx
   import NomeDaLiga from './nome-da-liga';
   ```

## Personalização

Se a nova liga precisar de comportamentos específicos além do padrão:

1. Você pode estender o componente base `LeagueTable.tsx` e sobrescrever métodos específicos
2. Para estilos personalizados, crie um arquivo `styles.ts` dentro do diretório da liga
3. Para lógica específica, crie hooks ou serviços dedicados à liga

## Considerações para API

- O `leagueId` deve corresponder ao parâmetro usado na API para filtrar os jogos dessa liga
- Verifique se a API suporta a nova liga antes de adicioná-la à interface 