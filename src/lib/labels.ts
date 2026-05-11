export const statusLabels: Record<string, string> = {
  in_use: 'В эксплуатации',
  repair: 'На ремонте',
  scrapped: 'Списано',
  archived: 'В архиве',
};

export const categoryLabels: Record<string, string> = {
  computing: 'Вычислительная техника',
  office: 'Оргтехника',
  network: 'Сетевое оборудование',
  peripheral: 'Периферия',
  other: 'Прочее',
};

export const componentTypeLabels: Record<string, string> = {
  cpu: 'Процессор',
  motherboard: 'Материнская плата',
  ram: 'Оперативная память',
  storage: 'Накопитель',
  psu: 'Блок питания',
  gpu: 'Видеокарта',
  case: 'Корпус',
  cooler: 'Охлаждение',
};
