import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...\n');

  // Clean existing data
  console.log('🧹 Cleaning existing data...');
  await prisma.activityLog.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.workOrder.deleteMany();
  await prisma.maintenanceHistory.deleteMany();
  await prisma.maintenanceRequest.deleteMany();
  await prisma.equipment.deleteMany();
  await prisma.equipmentCategory.deleteMany();
  await prisma.user.deleteMany();
  await prisma.team.deleteMany();
  await prisma.workCenter.deleteMany();
  await prisma.department.deleteMany();
  await prisma.company.deleteMany();

  // Create Company
  console.log('🏢 Creating company...');
  const company = await prisma.company.create({
    data: {
      name: 'TechManufacturing Inc.',
      address: '123 Industrial Blvd, Manufacturing City, MC 12345',
      phone: '+1-555-123-4567',
      email: 'contact@techmanufacturing.com',
    },
  });

  // Create Departments
  console.log('🏛️ Creating departments...');
  const departments = await Promise.all([
    prisma.department.create({
      data: { name: 'Production', description: 'Main production floor operations', companyId: company.id },
    }),
    prisma.department.create({
      data: { name: 'Warehouse', description: 'Storage and logistics', companyId: company.id },
    }),
    prisma.department.create({
      data: { name: 'Quality Control', description: 'Quality assurance and testing', companyId: company.id },
    }),
  ]);

  // Create Work Centers
  console.log('🏭 Creating work centers...');
  const workCenters = await Promise.all([
    prisma.workCenter.create({
      data: { name: 'Assembly Line A', code: 'WC-ASM-A', description: 'Primary assembly line', location: 'Building A, Floor 1', capacity: 50, departmentId: departments[0].id },
    }),
    prisma.workCenter.create({
      data: { name: 'Assembly Line B', code: 'WC-ASM-B', description: 'Secondary assembly line', location: 'Building A, Floor 2', capacity: 40, departmentId: departments[0].id },
    }),
    prisma.workCenter.create({
      data: { name: 'CNC Machining Center', code: 'WC-CNC', description: 'CNC machining operations', location: 'Building B, Floor 1', capacity: 20, departmentId: departments[0].id },
    }),
    prisma.workCenter.create({
      data: { name: 'Packaging Station', code: 'WC-PKG', description: 'Product packaging area', location: 'Building C', capacity: 30, departmentId: departments[1].id },
    }),
    prisma.workCenter.create({
      data: { name: 'Testing Lab', code: 'WC-QC', description: 'Quality control facility', location: 'Building D', capacity: 15, departmentId: departments[2].id },
    }),
  ]);

  // Create Users
  console.log('👥 Creating users...');
  const hashedPassword = await bcrypt.hash('password123', 10);

  const users = await Promise.all([
    prisma.user.create({ data: { email: 'admin@gearguard.com', password: hashedPassword, name: 'John Admin', role: 'ADMIN', phone: '+1-555-001-0001', department: 'IT', companyId: company.id } }),
    prisma.user.create({ data: { email: 'manager1@gearguard.com', password: hashedPassword, name: 'Sarah Manager', role: 'MANAGER', phone: '+1-555-002-0001', department: 'Production', companyId: company.id } }),
    prisma.user.create({ data: { email: 'manager2@gearguard.com', password: hashedPassword, name: 'Mike Wilson', role: 'MANAGER', phone: '+1-555-002-0002', department: 'Warehouse', companyId: company.id } }),
    prisma.user.create({ data: { email: 'tech1@gearguard.com', password: hashedPassword, name: 'David Technician', role: 'TECHNICIAN', phone: '+1-555-003-0001', department: 'Maintenance', companyId: company.id } }),
    prisma.user.create({ data: { email: 'tech2@gearguard.com', password: hashedPassword, name: 'Emily Chen', role: 'TECHNICIAN', phone: '+1-555-003-0002', department: 'Maintenance', companyId: company.id } }),
    prisma.user.create({ data: { email: 'tech3@gearguard.com', password: hashedPassword, name: 'Robert Garcia', role: 'TECHNICIAN', phone: '+1-555-003-0003', department: 'Maintenance', companyId: company.id } }),
    prisma.user.create({ data: { email: 'tech4@gearguard.com', password: hashedPassword, name: 'Lisa Park', role: 'TECHNICIAN', phone: '+1-555-003-0004', department: 'Maintenance', companyId: company.id } }),
    prisma.user.create({ data: { email: 'requester1@gearguard.com', password: hashedPassword, name: 'Tom Operator', role: 'REQUESTER', phone: '+1-555-004-0001', department: 'Production', companyId: company.id } }),
    prisma.user.create({ data: { email: 'requester2@gearguard.com', password: hashedPassword, name: 'Jane Smith', role: 'REQUESTER', phone: '+1-555-004-0002', department: 'Warehouse', companyId: company.id } }),
    prisma.user.create({ data: { email: 'requester3@gearguard.com', password: hashedPassword, name: 'Chris Johnson', role: 'REQUESTER', phone: '+1-555-004-0003', department: 'Quality Control', companyId: company.id } }),
  ]);

  const [admin, manager1, manager2, tech1, tech2, tech3, tech4, requester1, requester2, requester3] = users;

  // Create Teams
  console.log('👷 Creating teams...');
  const teams = await Promise.all([
    prisma.team.create({ data: { name: 'Alpha Maintenance Team', description: 'Primary maintenance team', leaderId: tech1.id, workCenterId: workCenters[0].id, members: { connect: [{ id: tech1.id }, { id: tech2.id }] } } }),
    prisma.team.create({ data: { name: 'Beta Maintenance Team', description: 'CNC and specialized equipment', leaderId: tech3.id, workCenterId: workCenters[2].id, members: { connect: [{ id: tech3.id }, { id: tech4.id }] } } }),
    prisma.team.create({ data: { name: 'Gamma Support Team', description: 'Packaging and warehouse', leaderId: tech2.id, workCenterId: workCenters[3].id, members: { connect: [{ id: tech2.id }] } } }),
  ]);

  // Create Equipment Categories
  console.log('📁 Creating equipment categories...');
  const categories = await Promise.all([
    prisma.equipmentCategory.create({ data: { name: 'Production Machinery', description: 'Main production line equipment', icon: '🏭' } }),
    prisma.equipmentCategory.create({ data: { name: 'Material Handling', description: 'Equipment for moving materials', icon: '🚜' } }),
    prisma.equipmentCategory.create({ data: { name: 'Testing Equipment', description: 'Quality control devices', icon: '🔬' } }),
    prisma.equipmentCategory.create({ data: { name: 'HVAC Systems', description: 'Heating and cooling', icon: '❄️' } }),
    prisma.equipmentCategory.create({ data: { name: 'Electrical Systems', description: 'Power distribution', icon: '⚡' } }),
  ]);

  const subCategories = await Promise.all([
    prisma.equipmentCategory.create({ data: { name: 'CNC Machines', description: 'Computer numerical control', icon: '🔧', parentId: categories[0].id } }),
    prisma.equipmentCategory.create({ data: { name: 'Assembly Robots', description: 'Automated assembly', icon: '🤖', parentId: categories[0].id } }),
    prisma.equipmentCategory.create({ data: { name: 'Conveyors', description: 'Belt and roller conveyors', icon: '➡️', parentId: categories[1].id } }),
    prisma.equipmentCategory.create({ data: { name: 'Forklifts', description: 'Industrial lifts', icon: '🚛', parentId: categories[1].id } }),
  ]);

  // Create Equipment
  console.log('⚙️ Creating equipment...');
  const equipmentList = await Promise.all([
    prisma.equipment.create({ data: { name: 'CNC Lathe Machine #1', code: 'EQ-CNC-001', description: 'High-precision CNC lathe', serialNumber: 'CNC-2021-001', model: 'Haas ST-20', manufacturer: 'Haas Automation', purchaseDate: new Date('2021-03-15'), warrantyExpiry: new Date('2026-03-15'), location: 'Building B, Bay 1', status: 'OPERATIONAL', healthScore: 92, healthStatus: 'HEALTHY', lastMaintenanceDate: new Date('2025-12-01'), nextMaintenanceDate: new Date('2026-01-15'), categoryId: subCategories[0].id, departmentId: departments[0].id, companyId: company.id, workCenterId: workCenters[2].id } }),
    prisma.equipment.create({ data: { name: 'CNC Milling Machine #1', code: 'EQ-CNC-002', description: '5-axis CNC milling machine', serialNumber: 'CNC-2022-002', model: 'DMG MORI DMU 50', manufacturer: 'DMG MORI', purchaseDate: new Date('2022-06-20'), warrantyExpiry: new Date('2027-06-20'), location: 'Building B, Bay 2', status: 'OPERATIONAL', healthScore: 88, healthStatus: 'HEALTHY', lastMaintenanceDate: new Date('2025-11-15'), nextMaintenanceDate: new Date('2026-01-20'), categoryId: subCategories[0].id, departmentId: departments[0].id, companyId: company.id, workCenterId: workCenters[2].id } }),
    prisma.equipment.create({ data: { name: 'Assembly Robot ARM-01', code: 'EQ-ROB-001', description: '6-axis industrial robot arm', serialNumber: 'FANUC-2023-001', model: 'FANUC M-20iD/25', manufacturer: 'FANUC', purchaseDate: new Date('2023-01-10'), warrantyExpiry: new Date('2028-01-10'), location: 'Assembly Line A, Station 3', status: 'OPERATIONAL', healthScore: 95, healthStatus: 'HEALTHY', lastMaintenanceDate: new Date('2025-12-10'), nextMaintenanceDate: new Date('2026-02-10'), categoryId: subCategories[1].id, departmentId: departments[0].id, companyId: company.id, workCenterId: workCenters[0].id } }),
    prisma.equipment.create({ data: { name: 'Assembly Robot ARM-02', code: 'EQ-ROB-002', description: 'Collaborative robot', serialNumber: 'UR-2023-002', model: 'Universal Robots UR10e', manufacturer: 'Universal Robots', purchaseDate: new Date('2023-03-15'), warrantyExpiry: new Date('2028-03-15'), location: 'Assembly Line A, Station 5', status: 'UNDER_MAINTENANCE', healthScore: 65, healthStatus: 'WARNING', lastMaintenanceDate: new Date('2025-12-20'), nextMaintenanceDate: new Date('2025-12-30'), categoryId: subCategories[1].id, departmentId: departments[0].id, companyId: company.id, workCenterId: workCenters[0].id } }),
    prisma.equipment.create({ data: { name: 'Main Production Conveyor', code: 'EQ-CNV-001', description: 'Primary belt conveyor', serialNumber: 'CNV-2020-001', model: 'Dorner 2200 Series', manufacturer: 'Dorner', purchaseDate: new Date('2020-08-01'), warrantyExpiry: new Date('2025-08-01'), location: 'Assembly Line A', status: 'OPERATIONAL', healthScore: 78, healthStatus: 'WARNING', lastMaintenanceDate: new Date('2025-11-01'), nextMaintenanceDate: new Date('2026-01-01'), categoryId: subCategories[2].id, departmentId: departments[0].id, companyId: company.id, workCenterId: workCenters[0].id } }),
    prisma.equipment.create({ data: { name: 'Packaging Line Conveyor', code: 'EQ-CNV-002', description: 'Roller conveyor for packaging', serialNumber: 'CNV-2021-002', model: 'Hytrol EZLogic', manufacturer: 'Hytrol', purchaseDate: new Date('2021-05-15'), warrantyExpiry: new Date('2026-05-15'), location: 'Packaging Station', status: 'OPERATIONAL', healthScore: 85, healthStatus: 'HEALTHY', lastMaintenanceDate: new Date('2025-12-05'), nextMaintenanceDate: new Date('2026-02-05'), categoryId: subCategories[2].id, departmentId: departments[1].id, companyId: company.id, workCenterId: workCenters[3].id } }),
    prisma.equipment.create({ data: { name: 'Electric Forklift #1', code: 'EQ-FLT-001', description: 'Electric counterbalance forklift', serialNumber: 'TOYOTA-2022-001', model: 'Toyota 8FBMT25', manufacturer: 'Toyota Material Handling', purchaseDate: new Date('2022-02-10'), warrantyExpiry: new Date('2027-02-10'), location: 'Warehouse', status: 'OPERATIONAL', healthScore: 90, healthStatus: 'HEALTHY', lastMaintenanceDate: new Date('2025-12-15'), nextMaintenanceDate: new Date('2026-03-15'), categoryId: subCategories[3].id, departmentId: departments[1].id, companyId: company.id, workCenterId: workCenters[3].id } }),
    prisma.equipment.create({ data: { name: 'Electric Forklift #2', code: 'EQ-FLT-002', description: 'Reach truck forklift', serialNumber: 'CROWN-2023-002', model: 'Crown ESR5260', manufacturer: 'Crown Equipment', purchaseDate: new Date('2023-07-20'), warrantyExpiry: new Date('2028-07-20'), location: 'Warehouse', status: 'OPERATIONAL', healthScore: 98, healthStatus: 'HEALTHY', lastMaintenanceDate: new Date('2025-12-01'), nextMaintenanceDate: new Date('2026-04-01'), categoryId: subCategories[3].id, departmentId: departments[1].id, companyId: company.id, workCenterId: workCenters[3].id } }),
    prisma.equipment.create({ data: { name: 'Central HVAC Unit', code: 'EQ-HVAC-001', description: 'Main building HVAC system', serialNumber: 'TRANE-2019-001', model: 'Trane XR15', manufacturer: 'Trane Technologies', purchaseDate: new Date('2019-11-01'), warrantyExpiry: new Date('2029-11-01'), location: 'Building A, Rooftop', status: 'OPERATIONAL', healthScore: 72, healthStatus: 'WARNING', lastMaintenanceDate: new Date('2025-10-15'), nextMaintenanceDate: new Date('2026-01-15'), categoryId: categories[3].id, departmentId: departments[0].id, companyId: company.id, workCenterId: workCenters[0].id } }),
    prisma.equipment.create({ data: { name: 'Coordinate Measuring Machine', code: 'EQ-CMM-001', description: 'Precision measurement device', serialNumber: 'ZEISS-2021-001', model: 'Zeiss CONTURA', manufacturer: 'Carl Zeiss', purchaseDate: new Date('2021-09-01'), warrantyExpiry: new Date('2026-09-01'), location: 'Testing Lab', status: 'OPERATIONAL', healthScore: 94, healthStatus: 'HEALTHY', lastMaintenanceDate: new Date('2025-11-20'), nextMaintenanceDate: new Date('2026-02-20'), categoryId: categories[2].id, departmentId: departments[2].id, companyId: company.id, workCenterId: workCenters[4].id } }),
    prisma.equipment.create({ data: { name: 'Old CNC Router', code: 'EQ-CNC-OLD', description: 'Legacy CNC router - replaced', serialNumber: 'CNC-2015-001', model: 'Legacy Model X', manufacturer: 'Generic', purchaseDate: new Date('2015-01-01'), warrantyExpiry: new Date('2020-01-01'), location: 'Storage', status: 'DECOMMISSIONED', healthScore: 0, healthStatus: 'CRITICAL', decommissionedAt: new Date('2025-06-15'), decommissionedBy: admin.id, decommissionReason: 'End of service life', decommissionNotes: 'Parts salvaged', disposalMethod: 'Parts recycled', categoryId: subCategories[0].id, departmentId: departments[0].id, companyId: company.id, workCenterId: workCenters[2].id } }),
  ]);

  // Create Maintenance Requests
  console.log('🔧 Creating maintenance requests...');
  await Promise.all([
    // Completed
    prisma.maintenanceRequest.create({ data: { requestNumber: 'MR-2025-0001', title: 'CNC Lathe annual calibration', description: 'Perform annual calibration and accuracy check', type: 'CALIBRATION', priority: 'MEDIUM', status: 'COMPLETED', equipmentId: equipmentList[0].id, workCenterId: workCenters[2].id, createdById: requester1.id, assignedToId: tech3.id, teamId: teams[1].id, scheduledDate: new Date('2025-12-01'), completedDate: new Date('2025-12-01'), actualHours: 4, estimatedHours: 5, resolution: 'All parameters within specification' } }),
    prisma.maintenanceRequest.create({ data: { requestNumber: 'MR-2025-0002', title: 'Conveyor belt replacement', description: 'Replace worn belt on main conveyor', type: 'CORRECTIVE', priority: 'HIGH', status: 'COMPLETED', equipmentId: equipmentList[4].id, workCenterId: workCenters[0].id, createdById: requester1.id, assignedToId: tech1.id, teamId: teams[0].id, scheduledDate: new Date('2025-11-15'), completedDate: new Date('2025-11-16'), actualHours: 8, estimatedHours: 6, problemDetails: 'Belt showing significant wear', resolution: 'Belt replaced, tension adjusted' } }),
    prisma.maintenanceRequest.create({ data: { requestNumber: 'MR-2025-0003', title: 'Forklift battery maintenance', description: 'Check and service battery cells', type: 'PREVENTIVE', priority: 'LOW', status: 'COMPLETED', equipmentId: equipmentList[6].id, workCenterId: workCenters[3].id, createdById: requester2.id, assignedToId: tech2.id, teamId: teams[2].id, scheduledDate: new Date('2025-12-10'), completedDate: new Date('2025-12-10'), actualHours: 2, estimatedHours: 2, resolution: 'Battery cells in good condition' } }),
    // In Progress
    prisma.maintenanceRequest.create({ data: { requestNumber: 'MR-2025-0004', title: 'Robot ARM-02 joint repair', description: 'Repair intermittent fault on joint 3', type: 'BREAKDOWN', priority: 'CRITICAL', status: 'IN_PROGRESS', equipmentId: equipmentList[3].id, workCenterId: workCenters[0].id, createdById: requester1.id, assignedToId: tech1.id, teamId: teams[0].id, scheduledDate: new Date('2025-12-26'), startDate: new Date('2025-12-26'), estimatedHours: 6, problemDetails: 'Joint motor erratic behavior' } }),
    prisma.maintenanceRequest.create({ data: { requestNumber: 'MR-2025-0005', title: 'HVAC filter replacement', description: 'Replace all air filters in HVAC unit', type: 'PREVENTIVE', priority: 'MEDIUM', status: 'IN_PROGRESS', equipmentId: equipmentList[8].id, workCenterId: workCenters[0].id, createdById: manager1.id, assignedToId: tech4.id, teamId: teams[1].id, scheduledDate: new Date('2025-12-27'), startDate: new Date('2025-12-27'), estimatedHours: 3 } }),
    // Approved
    prisma.maintenanceRequest.create({ data: { requestNumber: 'MR-2025-0006', title: 'CNC Milling Machine inspection', description: 'Quarterly inspection and lubrication', type: 'INSPECTION', priority: 'MEDIUM', status: 'APPROVED', equipmentId: equipmentList[1].id, workCenterId: workCenters[2].id, createdById: requester1.id, assignedToId: tech3.id, teamId: teams[1].id, scheduledDate: new Date('2026-01-05'), estimatedHours: 4 } }),
    prisma.maintenanceRequest.create({ data: { requestNumber: 'MR-2025-0007', title: 'CMM calibration', description: 'Annual calibration of CMM', type: 'CALIBRATION', priority: 'HIGH', status: 'APPROVED', equipmentId: equipmentList[9].id, workCenterId: workCenters[4].id, createdById: requester3.id, assignedToId: tech4.id, teamId: teams[1].id, scheduledDate: new Date('2026-01-10'), estimatedHours: 6, problemDetails: 'Requires certified specialist' } }),
    // Submitted
    prisma.maintenanceRequest.create({ data: { requestNumber: 'MR-2025-0008', title: 'Conveyor motor noise', description: 'Unusual noise from Packaging conveyor', type: 'CORRECTIVE', priority: 'MEDIUM', status: 'SUBMITTED', equipmentId: equipmentList[5].id, workCenterId: workCenters[3].id, createdById: requester2.id, estimatedHours: 3, problemDetails: 'Noise during high-speed operation' } }),
    prisma.maintenanceRequest.create({ data: { requestNumber: 'MR-2025-0009', title: 'Forklift hydraulic leak', description: 'Hydraulic fluid leak on Forklift #2', type: 'CORRECTIVE', priority: 'HIGH', status: 'SUBMITTED', equipmentId: equipmentList[7].id, workCenterId: workCenters[3].id, createdById: requester2.id, estimatedHours: 4, problemDetails: 'Leak from lift cylinder seal' } }),
    prisma.maintenanceRequest.create({ data: { requestNumber: 'MR-2025-0010', title: 'Robot ARM-01 software update', description: 'Update robot control software', type: 'PREVENTIVE', priority: 'LOW', status: 'SUBMITTED', equipmentId: equipmentList[2].id, workCenterId: workCenters[0].id, createdById: manager1.id, estimatedHours: 2 } }),
    // On Hold
    prisma.maintenanceRequest.create({ data: { requestNumber: 'MR-2025-0011', title: 'CNC Lathe spindle bearings', description: 'Replace main spindle bearings', type: 'PREVENTIVE', priority: 'MEDIUM', status: 'ON_HOLD', equipmentId: equipmentList[0].id, workCenterId: workCenters[2].id, createdById: tech3.id, assignedToId: tech3.id, teamId: teams[1].id, scheduledDate: new Date('2026-01-20'), estimatedHours: 12, problemDetails: 'Waiting for parts - ETA Jan 15' } }),
    // Cancelled
    prisma.maintenanceRequest.create({ data: { requestNumber: 'MR-2025-0012', title: 'Old router maintenance', description: 'Scheduled maintenance for old CNC', type: 'PREVENTIVE', priority: 'LOW', status: 'CANCELLED', equipmentId: equipmentList[10].id, workCenterId: workCenters[2].id, createdById: requester1.id, resolution: 'Cancelled - equipment decommissioned' } }),
    // More completed for reports
    prisma.maintenanceRequest.create({ data: { requestNumber: 'MR-2025-0013', title: 'Assembly Line safety inspection', description: 'Monthly safety inspection', type: 'INSPECTION', priority: 'HIGH', status: 'COMPLETED', equipmentId: equipmentList[2].id, workCenterId: workCenters[0].id, createdById: manager1.id, assignedToId: tech1.id, teamId: teams[0].id, scheduledDate: new Date('2025-12-15'), completedDate: new Date('2025-12-15'), actualHours: 3, estimatedHours: 3, resolution: 'All safety systems operational' } }),
    prisma.maintenanceRequest.create({ data: { requestNumber: 'MR-2025-0014', title: 'Emergency conveyor stop', description: 'Investigate emergency stop cause', type: 'BREAKDOWN', priority: 'CRITICAL', status: 'COMPLETED', equipmentId: equipmentList[4].id, workCenterId: workCenters[0].id, createdById: requester1.id, assignedToId: tech2.id, teamId: teams[0].id, scheduledDate: new Date('2025-12-20'), completedDate: new Date('2025-12-20'), actualHours: 2, estimatedHours: 4, problemDetails: 'Emergency stop triggered', rootCause: 'Faulty proximity sensor', resolution: 'Replaced proximity sensor' } }),
    prisma.maintenanceRequest.create({ data: { requestNumber: 'MR-2025-0015', title: 'Testing lab equipment check', description: 'Quarterly equipment check', type: 'INSPECTION', priority: 'MEDIUM', status: 'COMPLETED', equipmentId: equipmentList[9].id, workCenterId: workCenters[4].id, createdById: requester3.id, assignedToId: tech4.id, teamId: teams[1].id, scheduledDate: new Date('2025-12-18'), completedDate: new Date('2025-12-18'), actualHours: 5, estimatedHours: 4, resolution: 'All equipment calibrated' } }),
  ]);

  console.log('\n✅ Database seeded successfully!\n');
  console.log('📊 Summary:');
  console.log('   • 1 Company');
  console.log('   • 3 Departments');
  console.log('   • 5 Work Centers');
  console.log('   • 10 Users');
  console.log('   • 3 Teams');
  console.log('   • 9 Equipment Categories');
  console.log('   • 11 Equipment Items');
  console.log('   • 15 Maintenance Requests');
  console.log('\n🔐 Login Credentials (password: "password123"):');
  console.log('   • Admin: admin@gearguard.com');
  console.log('   • Manager: manager1@gearguard.com');
  console.log('   • Technician: tech1@gearguard.com');
  console.log('   • Requester: requester1@gearguard.com\n');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
