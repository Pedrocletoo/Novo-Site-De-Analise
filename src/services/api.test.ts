import { apiService, IMatch } from './api';

describe('API Service', () => {
  // Mock de uma partida típica que seria retornada pela API
  const mockMatch: IMatch = {
    id: '123456',
    EventId: '67297689',
    RegionId: '189980',
    Liga: 'euro',
    DisplayNameParts: [
      { name: 'Czechia' },
      { name: 'Denmark' }
    ],
    StartTime: '2025-05-12 16:16:00',
    Markets: [
      {
        Name: 'Resultado Final',
        Selections: [
          { Name: '1', FullName: 'Czechia', Price: 2.64 },
          { Name: 'X', FullName: 'Empate', Price: 3.15 },
          { Name: '2', FullName: 'Denmark', Price: 2.73 }
        ]
      }
    ],
    FullTimeHomeTeam: '2',
    FullTimeAwayTeam: '1',
    HalfTimeHomeTeam: '1',
    HalfTimeAwayTeam: '0'
  };

  // Teste de extração de hora e minuto do formato de data da API
  test('extractTimeFromMatch deve extrair hora e minuto corretamente', () => {
    const { hour, minute } = apiService.extractTimeFromMatch(mockMatch.StartTime);
    
    expect(hour).toBe(16);
    expect(minute).toBe(16);
  });

  // Teste de extração de placares da partida
  test('getMatchScore deve extrair os placares corretamente', () => {
    const scores = apiService.getMatchScore(mockMatch);
    
    expect(scores.fullTime.home).toBe(2);
    expect(scores.fullTime.away).toBe(1);
    expect(scores.halfTime.home).toBe(1);
    expect(scores.halfTime.away).toBe(0);
  });

  // Teste de manipulação de erros para formato de data inválido
  test('extractTimeFromMatch deve lidar com formatos de data inválidos', () => {
    const invalidMatch = { ...mockMatch, StartTime: 'formato-inválido' };
    const { hour, minute } = apiService.extractTimeFromMatch(invalidMatch.StartTime);
    
    // Espera valores padrão em caso de erro
    expect(hour).toBe(0);
    expect(minute).toBe(0);
  });

  // Teste de manipulação de placares não numéricos
  test('getMatchScore deve lidar com placares não numéricos', () => {
    const invalidMatch = { 
      ...mockMatch, 
      FullTimeHomeTeam: '', 
      FullTimeAwayTeam: 'não-número',
      HalfTimeHomeTeam: null as any,
      HalfTimeAwayTeam: undefined as any
    };
    
    const scores = apiService.getMatchScore(invalidMatch);
    
    // Espera valores padrão 0 em caso de valores não numéricos
    expect(scores.fullTime.home).toBe(0);
    expect(scores.fullTime.away).toBe(0);
    expect(scores.halfTime.home).toBe(0);
    expect(scores.halfTime.away).toBe(0);
  });
}); 