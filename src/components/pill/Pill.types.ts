export type PillProps = {
  data: PillData;
  value: string | number;
  onChange: (value: PillData) => void;
};

export type PillData = {
  label: string;
  value: string | number;
};
