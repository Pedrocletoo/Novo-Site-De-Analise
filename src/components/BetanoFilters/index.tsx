import React, { useState } from 'react';
// @ts-ignore - Ignora o erro de importação dos estilos
import { 
  FiltersContainer, 
  FilterItem, 
  FilterLabel, 
  SelectWrapper, 
  CustomSelect,
  DownArrow
} from './styles';

const BetanoFilters: React.FC = () => {
  const [liga, setLiga] = useState<string>('todos');
  const [tempo, setTempo] = useState<string>('FT');
  const [mercado, setMercado] = useState<string>('ambas-marcam-sim');
  const [odds, setOdds] = useState<string>('todas');
  const [horas, setHoras] = useState<string>('12');

  const handleLigaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setLiga(e.target.value);
  };

  const handleTempoChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setTempo(e.target.value);
  };

  const handleMercadoChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setMercado(e.target.value);
  };

  const handleOddsChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setOdds(e.target.value);
  };

  const handleHorasChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setHoras(e.target.value);
  };

  return (
    <FiltersContainer>
      <FilterItem>
        <FilterLabel>Ligas</FilterLabel>
        <SelectWrapper>
          <CustomSelect value={liga} onChange={handleLigaChange}>
            <option value="todos">Todos</option>
          </CustomSelect>
          <DownArrow />
        </SelectWrapper>
      </FilterItem>

      <FilterItem>
        <FilterLabel>Tempo</FilterLabel>
        <SelectWrapper>
          <CustomSelect value={tempo} onChange={handleTempoChange}>
            <option value="FT">FT</option>
          </CustomSelect>
          <DownArrow />
        </SelectWrapper>
      </FilterItem>

      <FilterItem>
        <FilterLabel>Mercado</FilterLabel>
        <SelectWrapper>
          <CustomSelect value={mercado} onChange={handleMercadoChange}>
            <option value="ambas-marcam-sim">Ambas Marcam - Sim</option>
          </CustomSelect>
          <DownArrow />
        </SelectWrapper>
      </FilterItem>

      <FilterItem>
        <FilterLabel>Odds</FilterLabel>
        <SelectWrapper>
          <CustomSelect value={odds} onChange={handleOddsChange}>
            <option value="todas">Todas</option>
          </CustomSelect>
          <DownArrow />
        </SelectWrapper>
      </FilterItem>

      <FilterItem>
        <FilterLabel>Últimas horas</FilterLabel>
        <SelectWrapper>
          <CustomSelect value={horas} onChange={handleHorasChange}>
            <option value="12">12 horas</option>
          </CustomSelect>
          <DownArrow />
        </SelectWrapper>
      </FilterItem>
    </FiltersContainer>
  );
};

export default BetanoFilters; 