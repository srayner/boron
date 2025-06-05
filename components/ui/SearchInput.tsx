import { Input } from "./input";

type Props = {
  search: string;
  placeholder: string;
  onSearchChange: (value: string) => void;
};

const SearchInput: React.FC<Props> = ({
  search,
  placeholder,
  onSearchChange,
}) => {
  return (
    <Input
      type="search"
      placeholder={placeholder}
      className="flex-1"
      value={search}
      onChange={(e) => onSearchChange(e.target.value)}
    />
  );
};

export default SearchInput;
