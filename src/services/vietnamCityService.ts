export type VietnamCity = {
  id: string;
  label: string;
  searchName: string;
};

// Keep the largest initial markets first, but let the user search anywhere in
// Vietnam through the "Other city" option.
export const vietnamCities: VietnamCity[] = [
  { id: 'ho-chi-minh-city', label: 'TP. Hồ Chí Minh', searchName: 'Ho Chi Minh City' },
  { id: 'ha-noi', label: 'Hà Nội', searchName: 'Hanoi' },
  { id: 'da-nang', label: 'Đà Nẵng', searchName: 'Đà Nẵng' },
  { id: 'can-tho', label: 'Cần Thơ', searchName: 'Cần Thơ' },
];
