import { pgTable, serial, text, integer, numeric, timestamp, varchar } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  username: text('username').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  fullName: text('full_name').notNull(),
  hierarchyLevel: text('hierarchy_level', { enum: ['directorate', 'division', 'district', 'center'] }).notNull(),
  divisionId: integer('division_id'),
  districtId: integer('district_id'),
  tehsilId: integer('tehsil_id'),
  centerId: integer('center_id'),
  role: text('role').notNull(), // admin, officer, operator
  status: text('status').default('active').notNull(), // active, inactive
  createdAt: timestamp('created_at').defaultNow(),
});

export const settings = pgTable('settings', {
  id: serial('id').primaryKey(),
  schemeYear: integer('scheme_year').notNull(),
  wheatRate40kg: numeric('wheat_rate_40kg', { precision: 10, scale: 2 }).notNull(),
  deliveryChargesJute: numeric('delivery_charges_jute', { precision: 10, scale: 2 }).notNull(),
  deliveryChargesPp: numeric('delivery_charges_pp', { precision: 10, scale: 2 }).notNull(),
  wheatSaleRate: numeric('wheat_sale_rate', { precision: 10, scale: 2 }).notNull(),
  subsidyAmount: numeric('subsidy_amount', { precision: 10, scale: 2 }).notNull(),
  bagPrices: numeric('bag_prices', { precision: 10, scale: 2 }).notNull(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const bagInventory = pgTable('bag_inventory', {
  id: serial('id').primaryKey(),
  centerId: integer('center_id').references(() => centers.id).notNull(),
  juteBags: integer('jute_bags').default(0).notNull(),
  ppBags: integer('pp_bags').default(0).notNull(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const bagDispatches = pgTable('bag_dispatches', {
  id: serial('id').primaryKey(),
  fromDistrictId: integer('from_district_id').references(() => districts.id).notNull(),
  toCenterId: integer('to_center_id').references(() => centers.id).notNull(),
  bagType: text('bag_type', { enum: ['jute', 'pp'] }).notNull(),
  quantity: integer('quantity').notNull(),
  dispatchedAt: timestamp('dispatched_at').defaultNow(),
  status: text('status').default('dispatched').notNull(), // dispatched, received
});

export const vouchers = pgTable('vouchers', {
  id: serial('id').primaryKey(),
  procurementRecordId: integer('procurement_record_id').references(() => procurementRecords.id).notNull(),
  voucherNumber: varchar('voucher_number', { length: 50 }).notNull().unique(),
  grossWeight: numeric('gross_weight', { precision: 12, scale: 3 }).notNull(),
  tareWeight: numeric('tare_weight', { precision: 12, scale: 3 }).notNull(),
  netWeight: numeric('net_weight', { precision: 12, scale: 3 }).notNull(),
  moistureContent: numeric('moisture_content', { precision: 5, scale: 2 }).notNull(),
  baseRate: numeric('base_rate', { precision: 10, scale: 2 }).notNull(),
  bagDeduction: numeric('bag_deduction', { precision: 10, scale: 2 }).notNull(),
  deliveryAllowance: numeric('delivery_allowance', { precision: 10, scale: 2 }).notNull(),
  netPayment: numeric('net_payment', { precision: 12, scale: 2 }).notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const divisions = pgTable('divisions', {
  id: serial('id').primaryKey(),
  name: text('name').notNull().unique(),
});

export const districts = pgTable('districts', {
  id: serial('id').primaryKey(),
  divisionId: integer('division_id').references(() => divisions.id).notNull(),
  name: text('name').notNull(),
});

export const tehsils = pgTable('tehsils', {
  id: serial('id').primaryKey(),
  districtId: integer('district_id').references(() => districts.id).notNull(),
  name: text('name').notNull(),
});

export const centers = pgTable('centers', {
  id: serial('id').primaryKey(),
  tehsilId: integer('tehsil_id').references(() => tehsils.id).notNull(),
  name: text('name').notNull(),
  centerCode: varchar('center_code', { length: 50 }).notNull().unique(),
});

export const farmers = pgTable('farmers', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  fatherName: text('father_name').notNull(),
  cnic: varchar('cnic', { length: 15 }).notNull().unique(), // Format: 00000-0000000-0
  mobileNumber: varchar('mobile_number', { length: 11 }).notNull(),
  acreage: numeric('acreage', { precision: 10, scale: 2 }).notNull(),
  bankIban: varchar('bank_iban', { length: 34 }).notNull(),
  schemeYear: integer('scheme_year').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const procurementRecords = pgTable('procurement_records', {
  id: serial('id').primaryKey(),
  farmerCnic: varchar('farmer_cnic', { length: 15 }).notNull(),
  bagsIssued: integer('bags_issued').notNull(),
  bagType: text('bag_type', { enum: ['jute', 'pp'] }).default('pp').notNull(),
  wheatWeight: numeric('wheat_weight', { precision: 12, scale: 3 }).notNull(), // in metric tons or maunds
  centerId: integer('center_id').references(() => centers.id).notNull(),
  operatorId: integer('operator_id').references(() => users.id).notNull(),
  timestamp: timestamp('timestamp').defaultNow().notNull(),
});

export const bardanaTransactions = pgTable('bardana_transactions', {
  id: serial('id').primaryKey(),
  farmerId: integer('farmer_id').references(() => farmers.id).notNull(),
  centerId: integer('center_id').references(() => centers.id).notNull(),
  bagType: text('bag_type', { enum: ['jute', 'pp'] }).notNull(),
  bagsRequested: integer('bags_requested').notNull(),
  bagsIssued: integer('bags_issued').notNull(),
  representativeName: text('representative_name'),
  issuanceSlipNumber: varchar('issuance_slip_number', { length: 50 }).notNull().unique(),
  issuedAt: timestamp('issued_at').defaultNow(),
});
