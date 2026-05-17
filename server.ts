import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { db } from './src/db/index.ts';
import { divisions, districts, tehsils, centers, procurementRecords, farmers, users, settings, bagInventory, bagDispatches, vouchers, bardanaTransactions } from './src/db/schema.ts';
import { eq, and, sql, desc, notExists } from 'drizzle-orm';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Inventory Management
  app.get('/api/inventory/centers', async (req, res) => {
    try {
      if (!db) return res.status(503).json({ error: 'Database not initialized' });
      
      const result = await db.select({
        centerId: centers.id,
        centerName: centers.name,
        centerCode: centers.centerCode,
        juteBags: bagInventory.juteBags,
        ppBags: bagInventory.ppBags,
        updatedAt: bagInventory.updatedAt
      })
      .from(centers)
      .leftJoin(bagInventory, eq(centers.id, bagInventory.centerId));
      
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  });

  app.post('/api/inventory/dispatch', async (req, res) => {
    try {
      if (!db) return res.status(503).json({ error: 'Database not initialized' });
      const { districtId, centerId, bagType, quantity } = req.body;
      
      await db.insert(bagDispatches).values({
        fromDistrictId: districtId,
        toCenterId: centerId,
        bagType,
        quantity,
        status: 'received'
      });
      
      const existing = await db.select().from(bagInventory).where(eq(bagInventory.centerId, centerId)).limit(1);
      
      if (existing.length > 0) {
        const updateData: any = { updatedAt: new Date() };
        if (bagType === 'jute') updateData.juteBags = (existing[0].juteBags || 0) + quantity;
        else updateData.ppBags = (existing[0].ppBags || 0) + quantity;
        
        await db.update(bagInventory).set(updateData).where(eq(bagInventory.centerId, centerId));
      } else {
        await db.insert(bagInventory).values({
          centerId,
          juteBags: bagType === 'jute' ? quantity : 0,
          ppBags: bagType === 'pp' ? quantity : 0,
          updatedAt: new Date()
        });
      }
      
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  });

  // API Routes
  app.get('/api/hierarchy/divisions', async (req, res) => {
    try {
      if (!db) return res.status(503).json({ error: 'Database not initialized' });
      const result = await db.select().from(divisions);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  });

  app.get('/api/hierarchy/districts/:divisionId', async (req, res) => {
    try {
      if (!db) return res.status(503).json({ error: 'Database not initialized' });
      const result = await db.select().from(districts).where(eq(districts.divisionId, parseInt(req.params.divisionId)));
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  });

  app.get('/api/hierarchy/tehsils/:districtId', async (req, res) => {
    try {
      if (!db) return res.status(503).json({ error: 'Database not initialized' });
      const result = await db.select().from(tehsils).where(eq(tehsils.districtId, parseInt(req.params.districtId)));
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  });

  app.get('/api/hierarchy/centers/:tehsilId', async (req, res) => {
    try {
      if (!db) return res.status(503).json({ error: 'Database not initialized' });
      const result = await db.select().from(centers).where(eq(centers.tehsilId, parseInt(req.params.tehsilId)));
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  });

  // Site Settings UPSERT
  app.get('/api/settings', async (req, res) => {
    try {
      if (!db) return res.status(503).json({ error: 'Database not initialized' });
      const result = await db.select().from(siteSettings).limit(1);
      res.json(result[0] || {});
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  });

  app.post('/api/settings', async (req, res) => {
    try {
      if (!db) return res.status(503).json({ error: 'Database not initialized' });
      const data = req.body;
      const existing = await db.select().from(siteSettings).limit(1);
      
      if (existing.length > 0) {
        await db.update(siteSettings).set({
          ...data,
          updatedAt: new Date()
        }).where(eq(siteSettings.id, existing[0].id));
      } else {
        await db.insert(siteSettings).values({
          ...data,
          schemeYear: data.schemeYear || 2025 // Default
        });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  });

  // Staff Management
  app.get('/api/staff', async (req, res) => {
    try {
      if (!db) return res.status(503).json({ error: 'Database not initialized' });
      const result = await db.select().from(users);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  });

  app.get('/api/staff/:id', async (req, res) => {
    try {
      if (!db) return res.status(503).json({ error: 'Database not initialized' });
      const result = await db.select().from(users).where(eq(users.id, parseInt(req.params.id))).limit(1);
      res.json(result[0] || {});
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  });

  app.post('/api/staff', async (req, res) => {
    try {
      if (!db) return res.status(503).json({ error: 'Database not initialized' });
      const { id, ...data } = req.body;
      
      if (id) {
        // Update
        await db.update(users).set(data).where(eq(users.id, id));
        res.json({ success: true, message: 'Staff updated' });
      } else {
        // Create - Check for duplicate username
        const existing = await db.select().from(users).where(eq(users.username, data.username)).limit(1);
        if (existing.length > 0) {
          return res.status(409).json({ error: 'Duplicate username detected' });
        }
        await db.insert(users).values({
          ...data,
          passwordHash: 'PB_STAF_PWD_MOCKED', // In real app, hash this
          createdAt: new Date()
        });
        res.json({ success: true, message: 'Staff created' });
      }
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  });

  // Farmer Management
  app.get('/api/farmers', async (req, res) => {
    try {
      if (!db) return res.status(503).json({ error: 'Database not initialized' });
      const result = await db.select().from(farmers);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  });

  app.get('/api/farmers/search/:cnic', async (req, res) => {
    try {
      if (!db) return res.status(503).json({ error: 'Database not initialized' });
      const result = await db.select().from(farmers).where(eq(farmers.cnic, req.params.cnic)).limit(1);
      res.json(result[0] || null);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  });

  app.post('/api/farmers', async (req, res) => {
    try {
      if (!db) return res.status(503).json({ error: 'Database not initialized' });
      const { id, ...data } = req.body;
      
      if (id) {
        // Update
        await db.update(farmers).set(data).where(eq(farmers.id, id));
        res.json({ success: true, message: 'Farmer record updated' });
      } else {
        // Create - Check for duplicate CNIC in current scheme year
        const currentYear = 2024; // Static for demo
        const existing = await db.select().from(farmers)
          .where(and(eq(farmers.cnic, data.cnic), eq(farmers.schemeYear, currentYear)))
          .limit(1);
          
        if (existing.length > 0) {
          return res.status(409).json({ error: 'Farmer already registered for this scheme year' });
        }
        
        await db.insert(farmers).values({
          ...data,
          schemeYear: currentYear,
          createdAt: new Date()
        });
        res.json({ success: true, message: 'Farmer registered successfully' });
      }
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  });

  // Procurement
  app.get('/api/procurement/daily-summary', async (req, res) => {
    try {
      if (!db) return res.status(503).json({ error: 'Database not initialized' });
      // In a real app, filter by centerId and today's date
      res.json({
        bagsIssuedToday: 1250,
        wheatWeightToday: 50.2, // MT
        paymentsProcessedToday: 4875000
      });
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  });

  app.post('/api/procurement/record', async (req, res) => {
    try {
      if (!db) return res.status(503).json({ error: 'Database not initialized' });
      const record = req.body;
      
      // Basic server-side validation
      if (!/^\d{5}-\d{7}-\d{1}$/.test(record.farmerCnic)) {
        return res.status(400).json({ error: 'Invalid CNIC format' });
      }

      // Add record
      await db.insert(procurementRecords).values({
        ...record,
        timestamp: new Date()
      });

      // Deduct from inventory
      const existing = await db.select().from(bagInventory).where(eq(bagInventory.centerId, record.centerId)).limit(1);
      if (existing.length > 0) {
        const updateData: any = { updatedAt: new Date() };
        if (record.bagType === 'jute') updateData.juteBags = (existing[0].juteBags || 0) - record.bagsIssued;
        else updateData.ppBags = (existing[0].ppBags || 0) - record.bagsIssued;
        
        await db.update(bagInventory).set(updateData).where(eq(bagInventory.centerId, record.centerId));
      }

      res.json({ success: true, message: 'Procurement record saved and inventory updated' });
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  });

  app.get('/api/vouchers/pending', async (req, res) => {
    try {
      if (!db) return res.status(503).json({ error: 'Database not initialized' });
      
      // Get records that don't have a voucher yet
      const result = await db.select({
        recordId: procurementRecords.id,
        farmerCnic: procurementRecords.farmerCnic,
        bagsIssued: procurementRecords.bagsIssued,
        bagType: procurementRecords.bagType,
        centerId: procurementRecords.centerId,
        timestamp: procurementRecords.timestamp,
        farmerName: farmers.name
      })
      .from(procurementRecords)
      .innerJoin(farmers, eq(procurementRecords.farmerCnic, farmers.cnic))
      .where(
        notExists(
          db.select().from(vouchers).where(eq(vouchers.procurementRecordId, procurementRecords.id))
        )
      )
      .orderBy(desc(procurementRecords.timestamp));
      
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  });

  app.post('/api/vouchers/generate', async (req, res) => {
    try {
      if (!db) return res.status(503).json({ error: 'Database not initialized' });
      const { procurementRecordId, grossWeight, tareWeight, moistureContent } = req.body;
      
      // Fetch the record and settings for rates
      const record = await db.select().from(procurementRecords).where(eq(procurementRecords.id, procurementRecordId)).limit(1);
      const appSettings = await db.select().from(settings).limit(1);
      
      if (record.length === 0 || appSettings.length === 0) {
        return res.status(404).json({ error: 'Core data context missing' });
      }

      const netWeight = grossWeight - tareWeight;
      const wheatRateKg = parseFloat(appSettings[0].wheatRate40kg.toString()) / 40;
      
      const basePayment = netWeight * wheatRateKg;
      const bagDeduction = record[0].bagsIssued * (record[0].bagType === 'jute' ? 100 : 50); // Example deduction
      const deliveryAllowance = record[0].bagsIssued * 20; // Example allowance
      
      const netPayment = basePayment - bagDeduction + deliveryAllowance;
      const voucherNum = `VOUCH-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

      await db.insert(vouchers).values({
        procurementRecordId,
        voucherNumber: voucherNum,
        grossWeight: grossWeight.toString(),
        tareWeight: tareWeight.toString(),
        netWeight: netWeight.toString(),
        moistureContent: moistureContent.toString(),
        baseRate: appSettings[0].wheatRate40kg,
        bagDeduction: bagDeduction.toString(),
        deliveryAllowance: deliveryAllowance.toString(),
        netPayment: netPayment.toString(),
      });

      res.json({ success: true, voucherNumber: voucherNum });
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  });

  // Bardana Issuance
  app.post('/api/bardana/issue', async (req, res) => {
    try {
      if (!db) return res.status(503).json({ error: 'Database not initialized' });
      const { farmerId, centerId, bagType, bagsRequested, bagsIssued, representativeName } = req.body;
      
      const result = await db.transaction(async (tx) => {
        // Check stock
        const inventory = await tx.select().from(bagInventory).where(eq(bagInventory.centerId, centerId)).limit(1);
        if (inventory.length === 0) throw new Error('Center inventory record missing');
        
        const currentStock = bagType === 'jute' ? (inventory[0].juteBags || 0) : (inventory[0].ppBags || 0);
        if (currentStock < bagsIssued) throw new Error('Insufficient stock in center');
        
        // Generate slip number
        const slipNum = `SLIP-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        
        // Update inventory
        const updateData: any = { updatedAt: new Date() };
        if (bagType === 'jute') updateData.juteBags = currentStock - bagsIssued;
        else updateData.ppBags = currentStock - bagsIssued;
        await tx.update(bagInventory).set(updateData).where(eq(bagInventory.centerId, centerId));
        
        // Record transaction
        await tx.insert(bardanaTransactions).values({
          farmerId,
          centerId,
          bagType,
          bagsRequested,
          bagsIssued,
          representativeName,
          issuanceSlipNumber: slipNum,
          issuedAt: new Date()
        });
        
        return slipNum;
      });
      
      res.json({ success: true, slipNumber: result });
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  });

  app.get('/api/bardana/history/:farmerId', async (req, res) => {
    try {
      if (!db) return res.status(503).json({ error: 'Database not initialized' });
      const result = await db.select().from(bardanaTransactions)
        .where(eq(bardanaTransactions.farmerId, parseInt(req.params.farmerId)))
        .orderBy(desc(bardanaTransactions.issuedAt));
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  });

  // Analytics
  app.get('/api/analytics/executive-summary', async (req, res) => {
    try {
      if (!db) return res.status(503).json({ error: 'Database not initialized' });
      
      // In a real app, these would be complex group-by queries
      const summary = {
        totalWheatProcured: 45280.5, // MT
        totalBagsIssued: 1132000,
        totalSubsidyDisbursed: 566000000, // PKR
        activeCenters: 245,
        districtPerformance: [
          { district: 'Lahore', target: 50000, achieved: 42000, percentage: 84 },
          { district: 'Faisalabad', target: 80000, achieved: 62000, percentage: 77.5 },
          { district: 'Sargodha', target: 120000, achieved: 105000, percentage: 87.5 },
          { district: 'Multan', target: 95000, achieved: 88000, percentage: 92.6 },
          { district: 'Bahawalpur', target: 110000, achieved: 94000, percentage: 85.4 },
        ],
        procurementTrend: [
          { date: '2024-05-01', weight: 1200 },
          { date: '2024-05-02', weight: 1500 },
          { date: '2024-05-03', weight: 1100 },
          { date: '2024-05-04', weight: 1800 },
          { date: '2024-05-05', weight: 2200 },
          { date: '2024-05-06', weight: 2500 },
          { date: '2024-05-07', weight: 2100 },
          { date: '2024-05-08', weight: 2800 },
          { date: '2024-05-09', weight: 3200 },
          { date: '2024-05-10', weight: 3500 },
          { date: '2024-05-11', weight: 3100 },
          { date: '2024-05-12', weight: 3800 },
          { date: '2024-05-13', weight: 4200 },
          { date: '2024-05-14', weight: 4500 },
        ]
      };
      
      res.json(summary);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  });

  // Comprehensive Executive Analytics
  app.get('/api/analytics/executive-dashboard', async (req, res) => {
    try {
      if (!db) return res.status(503).json({ error: 'Database not initialized' });
      
      // Calculate KPIs
      const farmersCount = await db.select({ count: sql<number>`count(*)` }).from(farmers);
      const inventory = await db.select().from(bagInventory);
      const totalBags = inventory.reduce((acc, curr) => acc + (curr.juteBags || 0) + (curr.ppBags || 0), 0);
      const lowStockCenters = inventory.filter(i => (i.juteBags || 0) + (i.ppBags || 0) < 500).length;

      // Geographic Breakdown (Grouped by Division/District)
      // Mocked for the demo but structured for real results
      const regionalStats = [
        { division: 'Sargodha', districts: 4, target: 450000, achieved: 320000, trend: 'up' },
        { division: 'Lahore', districts: 5, target: 300000, achieved: 210000, trend: 'stable' },
        { division: 'Multan', districts: 4, target: 600000, achieved: 580000, trend: 'up' },
        { division: 'Faisalabad', districts: 3, target: 250000, achieved: 180000, trend: 'down' },
        { division: 'Bahawalpur', districts: 3, target: 500000, achieved: 430000, trend: 'up' },
      ];

      res.json({
        kpis: {
          procurementProgress: 74.2, // Overall %
          activeFarmers: farmersCount[0].count,
          bardanaStock: totalBags,
          systemAlerts: lowStockCenters
        },
        regionalStats,
        policy: {
          wheatRate: 3900,
          jutePrice: 100,
          ppPrice: 50,
          deliveryFee: 20
        }
      });
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  });

  app.patch('/api/staff/:id/status', async (req, res) => {
    try {
      if (!db) return res.status(503).json({ error: 'Database not initialized' });
      const { id } = req.params;
      const { status } = req.body;
      
      await db.update(users)
        .set({ status })
        .where(eq(users.id, parseInt(id)));
        
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  });

  // Seeding endpoint (for dev purposes)
  app.post('/api/dev/seed', async (req, res) => {
    try {
      if (!db) return res.status(503).json({ error: 'Database not initialized' });
      
      const divCount = await db.select().from(divisions);
      if (divCount.length === 0) {
        const [div] = await db.insert(divisions).values({ name: 'Sargodha' }).returning();
        const [dist] = await db.insert(districts).values({ name: 'Sargodha', divisionId: div.id }).returning();
        const [tehsil] = await db.insert(tehsils).values({ name: 'Sargodha City', districtId: dist.id }).returning();
        await db.insert(centers).values({ name: 'Center SB-1', tehsilId: tehsil.id, centerCode: 'CSB1' });
        
        const [div2] = await db.insert(divisions).values({ name: 'Lahore' }).returning();
        const [dist2] = await db.insert(districts).values({ name: 'Lahore', divisionId: div2.id }).returning();
        const [tehsil2] = await db.insert(tehsils).values({ name: 'Model Town', districtId: dist2.id }).returning();
        await db.insert(centers).values({ name: 'Center LH-1', tehsilId: tehsil2.id, centerCode: 'CLH1' });
      }
      
      res.json({ success: true, message: 'Seeded successfully' });
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  });

  app.get('/api/procurement/stats', async (req, res) => {
    // Placeholder for dashboard stats
    res.json({
      totalBags: 125400,
      totalWeight: 5016,
      totalFarmers: 842,
      activeCenters: 45
    });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(console.error);
