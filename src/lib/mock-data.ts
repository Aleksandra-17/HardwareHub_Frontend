import { Device, DeviceType, Location, Person, AuditEntry } from './types';

export const deviceTypes: DeviceType[] = [
  { id: 'dt1', name: 'Ноутбук', code: 'NB-001', category: 'computing', description: 'Портативный компьютер', deviceCount: 12 },
  { id: 'dt2', name: 'ПК', code: 'PC-001', category: 'computing', description: 'Настольный компьютер', deviceCount: 8 },
  { id: 'dt3', name: 'МФУ', code: 'MFP-001', category: 'office', description: 'Многофункциональное устройство', deviceCount: 5 },
  { id: 'dt4', name: 'Принтер', code: 'PR-001', category: 'office', description: 'Принтер лазерный/струйный', deviceCount: 4 },
  { id: 'dt5', name: 'Проектор', code: 'PJ-001', category: 'office', description: 'Проектор мультимедийный', deviceCount: 3 },
  { id: 'dt6', name: 'Монитор', code: 'MN-001', category: 'computing', description: 'Монитор для ПК', deviceCount: 10 },
  { id: 'dt7', name: 'Коммутатор', code: 'SW-001', category: 'network', description: 'Сетевой коммутатор', deviceCount: 6 },
  { id: 'dt8', name: 'Сервер', code: 'SRV-001', category: 'computing', description: 'Серверное оборудование', deviceCount: 2 },
];

export const locations: Location[] = [
  { id: 'l1', name: 'Каб. 101', building: 'Корпус А', floor: '1', description: 'Приёмная', deviceCount: 4 },
  { id: 'l2', name: 'Каб. 205', building: 'Корпус А', floor: '2', description: 'Бухгалтерия', deviceCount: 6 },
  { id: 'l3', name: 'Каб. 312', building: 'Корпус Б', floor: '3', description: 'Лаборатория ML', deviceCount: 8 },
  { id: 'l4', name: 'Каб. 110', building: 'Корпус А', floor: '1', description: 'Серверная', deviceCount: 5 },
  { id: 'l5', name: 'Каб. 401', building: 'Корпус Б', floor: '4', description: 'Конференц-зал', deviceCount: 3 },
  { id: 'l6', name: 'Каб. 215', building: 'Корпус А', floor: '2', description: 'IT-отдел', deviceCount: 10 },
];

export const people: Person[] = [
  { id: 'p1', fullName: 'Иванов Иван Иванович', position: 'Системный администратор', department: 'IT-отдел', email: 'ivanov@company.ru', phone: '+7 (999) 111-22-33', deviceCount: 5 },
  { id: 'p2', fullName: 'Петрова Мария Сергеевна', position: 'Бухгалтер', department: 'Бухгалтерия', email: 'petrova@company.ru', phone: '+7 (999) 222-33-44', deviceCount: 3 },
  { id: 'p3', fullName: 'Сидоров Алексей Петрович', position: 'Data Scientist', department: 'Аналитика', email: 'sidorov@company.ru', phone: '+7 (999) 333-44-55', deviceCount: 4 },
  { id: 'p4', fullName: 'Козлова Елена Дмитриевна', position: 'Секретарь', department: 'Администрация', email: 'kozlova@company.ru', phone: '+7 (999) 444-55-66', deviceCount: 2 },
  { id: 'p5', fullName: 'Морозов Дмитрий Александрович', position: 'Инженер', department: 'IT-отдел', email: 'morozov@company.ru', phone: '+7 (999) 555-66-77', deviceCount: 6 },
];

export const devices: Device[] = [
  { id: 'd1', inventoryNumber: 'INV-2024-001', name: 'Ноутбук Lenovo ThinkPad E15', deviceTypeId: 'dt1', serialNumber: 'SN-LNV-001', model: 'ThinkPad E15 Gen 4', manufacturer: 'Lenovo', status: 'in_use', locationId: 'l3', personId: 'p3', commissionDate: '2024-01-15', lastCheckDate: '2025-12-01', notes: 'Для задач ML', purchasePrice: 85000, purchaseDate: '2023-12-20', qrCode: 'INV-2024-001' },
  { id: 'd2', inventoryNumber: 'INV-2024-002', name: 'МФУ HP LaserJet Pro', deviceTypeId: 'dt3', serialNumber: 'SN-HP-002', model: 'LaserJet Pro M428fdn', manufacturer: 'HP', status: 'in_use', locationId: 'l2', personId: 'p2', commissionDate: '2024-02-10', lastCheckDate: '2025-11-15', notes: '', purchasePrice: 42000, purchaseDate: '2024-01-25', qrCode: 'INV-2024-002' },
  { id: 'd3', inventoryNumber: 'INV-2024-003', name: 'ПК Dell OptiPlex 7010', deviceTypeId: 'dt2', serialNumber: 'SN-DELL-003', model: 'OptiPlex 7010 SFF', manufacturer: 'Dell', status: 'in_use', locationId: 'l6', personId: 'p1', commissionDate: '2024-03-01', lastCheckDate: '2025-10-20', notes: 'Рабочая станция сисадмина', purchasePrice: 65000, purchaseDate: '2024-02-15', qrCode: 'INV-2024-003' },
  { id: 'd4', inventoryNumber: 'INV-2024-004', name: 'Монитор Samsung 27"', deviceTypeId: 'dt6', serialNumber: 'SN-SAM-004', model: 'S27A600', manufacturer: 'Samsung', status: 'in_use', locationId: 'l6', personId: 'p1', commissionDate: '2024-03-01', lastCheckDate: '2025-10-20', notes: '', purchasePrice: 25000, purchaseDate: '2024-02-15', qrCode: 'INV-2024-004' },
  { id: 'd5', inventoryNumber: 'INV-2024-005', name: 'Проектор Epson EB-X51', deviceTypeId: 'dt5', serialNumber: 'SN-EPS-005', model: 'EB-X51', manufacturer: 'Epson', status: 'in_use', locationId: 'l5', personId: 'p4', commissionDate: '2024-04-10', lastCheckDate: '2025-09-05', notes: 'Для конференц-зала', purchasePrice: 55000, purchaseDate: '2024-03-28', qrCode: 'INV-2024-005' },
  { id: 'd6', inventoryNumber: 'INV-2023-010', name: 'Принтер Canon LBP226dw', deviceTypeId: 'dt4', serialNumber: 'SN-CAN-010', model: 'i-SENSYS LBP226dw', manufacturer: 'Canon', status: 'repair', locationId: 'l1', personId: 'p4', commissionDate: '2023-06-15', lastCheckDate: '2025-08-10', notes: 'Замена барабана', purchasePrice: 18000, purchaseDate: '2023-05-30', qrCode: 'INV-2023-010' },
  { id: 'd7', inventoryNumber: 'INV-2023-011', name: 'Ноутбук ASUS VivoBook 15', deviceTypeId: 'dt1', serialNumber: 'SN-ASUS-011', model: 'X1500EA', manufacturer: 'ASUS', status: 'archived', locationId: 'l4', personId: '', commissionDate: '2023-07-20', lastCheckDate: '2025-07-01', notes: 'В архиве, исправен', purchasePrice: 55000, purchaseDate: '2023-07-01', qrCode: 'INV-2023-011' },
  { id: 'd8', inventoryNumber: 'INV-2022-005', name: 'ПК HP ProDesk 400', deviceTypeId: 'dt2', serialNumber: 'SN-HP-005', model: 'ProDesk 400 G7', manufacturer: 'HP', status: 'scrapped', locationId: 'l2', personId: '', commissionDate: '2022-01-10', lastCheckDate: '2024-12-15', notes: 'Списан, устарел', purchasePrice: 45000, purchaseDate: '2021-12-20', qrCode: 'INV-2022-005' },
  { id: 'd9', inventoryNumber: 'INV-2024-006', name: 'Коммутатор Cisco SG350', deviceTypeId: 'dt7', serialNumber: 'SN-CSC-006', model: 'SG350-28', manufacturer: 'Cisco', status: 'in_use', locationId: 'l4', personId: 'p5', commissionDate: '2024-05-15', lastCheckDate: '2025-11-20', notes: '', purchasePrice: 35000, purchaseDate: '2024-05-01', qrCode: 'INV-2024-006' },
  { id: 'd10', inventoryNumber: 'INV-2024-007', name: 'Сервер Dell PowerEdge R740', deviceTypeId: 'dt8', serialNumber: 'SN-DELL-007', model: 'PowerEdge R740', manufacturer: 'Dell', status: 'in_use', locationId: 'l4', personId: 'p5', commissionDate: '2024-06-01', lastCheckDate: '2025-12-01', notes: 'Основной сервер', purchasePrice: 350000, purchaseDate: '2024-05-15', qrCode: 'INV-2024-007' },
  { id: 'd11', inventoryNumber: 'INV-2024-008', name: 'Ноутбук HP EliteBook 840', deviceTypeId: 'dt1', serialNumber: 'SN-HP-008', model: 'EliteBook 840 G9', manufacturer: 'HP', status: 'in_use', locationId: 'l2', personId: 'p2', commissionDate: '2024-07-10', lastCheckDate: '2025-11-30', notes: '', purchasePrice: 95000, purchaseDate: '2024-06-25', qrCode: 'INV-2024-008' },
  { id: 'd12', inventoryNumber: 'INV-2024-009', name: 'МФУ Brother DCP-L2550DW', deviceTypeId: 'dt3', serialNumber: 'SN-BRO-009', model: 'DCP-L2550DW', manufacturer: 'Brother', status: 'in_use', locationId: 'l6', personId: 'p5', commissionDate: '2024-08-05', lastCheckDate: '2025-11-10', notes: '', purchasePrice: 22000, purchaseDate: '2024-07-20', qrCode: 'INV-2024-009' },
];

export const auditEntries: AuditEntry[] = [
  { id: 'a1', date: '2025-12-01', action: 'Инвентаризация проведена', user: 'Иванов И.И.' },
  { id: 'a2', date: '2025-11-15', action: 'Статус изменён на "В эксплуатации"', user: 'Морозов Д.А.' },
  { id: 'a3', date: '2025-10-20', action: 'Перемещение в Каб. 312', user: 'Иванов И.И.' },
  { id: 'a4', date: '2025-09-05', action: 'Устройство добавлено', user: 'Система' },
];

export { statusLabels, categoryLabels } from './labels';
