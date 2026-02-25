type Props = {
  count?: number;
  isLoading: boolean;
  perPage: number;
  page: number;
  onSetPage: (
    e: React.MouseEvent | React.KeyboardEvent | MouseEvent,
    newPage: number,
  ) => void;
  onPerPageSelect: 
};
