export type PillProps = {
  data: PillData;
  value: string | number;
  onChange: (value: PillData) => void;
  disabled?: boolean;
};

export type PillData = {
  label: string;
  value: string | number;
};
