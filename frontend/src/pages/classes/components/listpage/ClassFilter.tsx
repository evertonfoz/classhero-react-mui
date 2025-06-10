import SearchFilterBar from '../../../../components/ui/SearchFilterBar';

interface Props {
  searchTerm: string;
  onSearchChange: (value: string) => void;
}

export default function ClassFilter({ searchTerm, onSearchChange }: Props) {
  return (
    <SearchFilterBar
      searchTerm={searchTerm}
      onSearchChange={onSearchChange}
      placeholder="Pesquisar por código..."
    />
  );
}
