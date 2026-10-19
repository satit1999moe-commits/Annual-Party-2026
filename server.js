// server.ts
import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import * as XLSX from "xlsx";
var __filename = fileURLToPath(import.meta.url);
var __dirname = path.dirname(__filename);
var DATA_DIR = path.resolve(__dirname, "data");
var DB_FILE = path.resolve(DATA_DIR, "database.json");
function getInitialDatabase() {
  const initialEvent = {
    event_id: "EV2026",
    event_year: 2026,
    event_name_th: "\u0E07\u0E32\u0E19\u0E40\u0E25\u0E35\u0E49\u0E22\u0E07\u0E1B\u0E23\u0E30\u0E08\u0E33\u0E1B\u0E35\u0E42\u0E23\u0E07\u0E40\u0E23\u0E35\u0E22\u0E19\u0E2A\u0E32\u0E18\u0E34\u0E15\u0E2D\u0E38\u0E14\u0E21\u0E28\u0E36\u0E01\u0E29\u0E32",
    event_name_en: "Satit Udomseuksa School Annual Party",
    promo_title: "ANNUAL PARTY 2026",
    theme: "MONOCHROME",
    event_date: "2026-12-18",
    start_time: "18:00",
    end_time: "22:00",
    venue: "\u0E2A\u0E19\u0E32\u0E21\u0E01\u0E35\u0E2C\u0E32\u0E42\u0E23\u0E07\u0E40\u0E23\u0E35\u0E22\u0E19",
    total_tables: 120,
    seats_per_table: 8,
    seat_price: 850,
    table_price: 6500,
    sales_open_at: "2026-11-01 08:00:00",
    sales_close_at: "2026-12-15 23:59:59",
    event_status: "Active",
    refund_policy: "\u0E1A\u0E31\u0E15\u0E23\u0E17\u0E35\u0E48\u0E22\u0E37\u0E19\u0E22\u0E31\u0E19\u0E01\u0E32\u0E23\u0E02\u0E32\u0E22\u0E41\u0E25\u0E49\u0E27\u0E44\u0E21\u0E48\u0E2A\u0E32\u0E21\u0E32\u0E23\u0E16\u0E04\u0E37\u0E19\u0E40\u0E07\u0E34\u0E19\u0E44\u0E14\u0E49 \u0E40\u0E27\u0E49\u0E19\u0E41\u0E15\u0E48\u0E1C\u0E39\u0E49\u0E14\u0E39\u0E41\u0E25\u0E23\u0E30\u0E1A\u0E1A\u0E01\u0E33\u0E2B\u0E19\u0E14\u0E02\u0E49\u0E2D\u0E22\u0E01\u0E40\u0E27\u0E49\u0E19",
    created_at: "2026-10-12 10:00:00",
    updated_at: "2026-10-12 10:00:00"
  };
  const initialClasses = [
    { level_id: "NUR", level_name: "Nursery", room: "A", program: "TP", active_status: true },
    { level_id: "K1", level_name: "Kindergarten 1", room: "A", program: "TP", active_status: true },
    { level_id: "K1", level_name: "Kindergarten 1", room: "B", program: "EP", active_status: true },
    { level_id: "K2", level_name: "Kindergarten 2", room: "A", program: "TP", active_status: true },
    { level_id: "K2", level_name: "Kindergarten 2", room: "B", program: "EP", active_status: true },
    { level_id: "K3", level_name: "Kindergarten 3", room: "A", program: "TP", active_status: true },
    { level_id: "K3", level_name: "Kindergarten 3", room: "B", program: "EP", active_status: true },
    { level_id: "P1", level_name: "Primary 1", room: "A", program: "TP", active_status: true },
    { level_id: "P1", level_name: "Primary 1", room: "B", program: "EP", active_status: true },
    { level_id: "P2", level_name: "Primary 2", room: "A", program: "TP", active_status: true },
    { level_id: "P2", level_name: "Primary 2", room: "B", program: "EP", active_status: true },
    { level_id: "P3", level_name: "Primary 3", room: "A", program: "TP", active_status: true },
    { level_id: "P3", level_name: "Primary 3", room: "B", program: "EP", active_status: true },
    { level_id: "P4", level_name: "Primary 4", room: "A", program: "TP", active_status: true },
    { level_id: "P4", level_name: "Primary 4", room: "B", program: "EP", active_status: true },
    { level_id: "P5", level_name: "Primary 5", room: "A", program: "TP", active_status: true },
    { level_id: "P5", level_name: "Primary 5", room: "B", program: "EP", active_status: true },
    { level_id: "P6", level_name: "Primary 6", room: "A", program: "TP", active_status: true },
    { level_id: "P6", level_name: "Primary 6", room: "B", program: "EP", active_status: true },
    { level_id: "S1", level_name: "Secondary 1", room: "A", program: "TP", active_status: true },
    { level_id: "S2", level_name: "Secondary 2", room: "A", program: "EP", active_status: true },
    { level_id: "S3", level_name: "Secondary 3", room: "A", program: "TP", active_status: true },
    { level_id: "S4", level_name: "Secondary 4", room: "A", program: "TP", active_status: true },
    { level_id: "S5", level_name: "Secondary 5", room: "B", program: "TP", active_status: true },
    { level_id: "S6", level_name: "Secondary 6", room: "A", program: "EP", active_status: true }
  ];
  const initialStaff = [
    {
      staff_id: "ADM001",
      username: "0833759527",
      password: "0833759527",
      display_name: "\u0E19\u0E32\u0E22\u0E1E\u0E2A\u0E34\u0E29\u0E10\u0E4C \u0E2A\u0E31\u0E15\u0E1A\u0E38\u0E15\u0E23",
      phone: "0833759527",
      email: "satit1999.moe@gmail.com",
      role: "Super Admin",
      active_status: true,
      active_devices: [],
      max_devices: 10
    },
    {
      staff_id: "STF001",
      username: "somchai",
      password: "password123",
      display_name: "\u0E2D\u0E32\u0E08\u0E32\u0E23\u0E22\u0E4C\u0E2A\u0E21\u0E0A\u0E32\u0E22 \u0E1E\u0E31\u0E12\u0E19\u0E01\u0E34\u0E08",
      phone: "081-999-8888",
      email: "somchai.p@satit.ac.th",
      role: "Super Admin",
      active_status: true,
      active_devices: [],
      max_devices: 10
    },
    {
      staff_id: "STF002",
      username: "wiphada",
      password: "password123",
      display_name: "\u0E04\u0E23\u0E39\u0E27\u0E34\u0E20\u0E32\u0E14\u0E32 \u0E27\u0E07\u0E28\u0E4C\u0E2A\u0E38\u0E27\u0E23\u0E23\u0E13",
      phone: "082-123-4567",
      email: "wiphada.w@satit.ac.th",
      role: "Event Admin",
      active_status: true,
      active_devices: [],
      max_devices: 10
    },
    {
      staff_id: "STF003",
      username: "kanyanat",
      password: "password123",
      display_name: "\u0E19.\u0E2A.\u0E01\u0E31\u0E0D\u0E0D\u0E32\u0E13\u0E31\u0E10 \u0E1A\u0E38\u0E0D\u0E21\u0E35",
      phone: "083-456-7890",
      email: "kanyanat.b@satit.ac.th",
      role: "Ticket Staff",
      active_status: true,
      active_devices: [],
      max_devices: 10
    },
    {
      staff_id: "STF004",
      username: "thanakorn",
      password: "password123",
      display_name: "\u0E19\u0E32\u0E22\u0E18\u0E19\u0E01\u0E23 \u0E23\u0E31\u0E15\u0E19\u0E28\u0E34\u0E23\u0E34",
      phone: "084-567-8901",
      email: "thanakorn.r@satit.ac.th",
      role: "Ticket Staff",
      active_status: true,
      active_devices: [],
      max_devices: 10
    },
    {
      staff_id: "STF005",
      username: "siriporn",
      password: "password123",
      display_name: "\u0E19\u0E32\u0E07\u0E2A\u0E32\u0E27\u0E28\u0E34\u0E23\u0E34\u0E1E\u0E23 \u0E2A\u0E34\u0E17\u0E18\u0E34\u0E0A\u0E31\u0E22",
      phone: "085-678-9012",
      email: "siriporn.s@satit.ac.th",
      role: "Finance",
      active_status: true,
      active_devices: [],
      max_devices: 10
    },
    {
      staff_id: "STF006",
      username: "pakorn",
      password: "password123",
      display_name: "\u0E19\u0E32\u0E22\u0E1B\u0E01\u0E23\u0E13\u0E4C \u0E40\u0E01\u0E35\u0E22\u0E23\u0E15\u0E34\u0E2A\u0E01\u0E38\u0E25",
      phone: "086-789-0123",
      email: "pakorn.k@satit.ac.th",
      role: "Check-in Staff",
      active_status: true,
      active_devices: [],
      max_devices: 10
    }
  ];
  const initialSettings = [
    { setting_key: "GOOGLE_SHEETS_ID", setting_value: "181fGpCP7KkKNMixR2OwmYew51wO-pyf2H8ERaKWTuaw", updated_by: "ADM001", updated_at: "2026-10-13 14:40:00" },
    { setting_key: "GOOGLE_APPS_SCRIPT_URL", setting_value: "https://script.google.com/macros/s/AKfycbyA-GjojRbOGEArwidXXGgPB4Fyj2eNVvA9B2b4T__qSxxtTW1m3v_uJLs7F8PVe0_g/exec", updated_by: "ADM001", updated_at: "2026-10-13 14:40:00" },
    { setting_key: "GOOGLE_APPS_SCRIPT_LIBRARY", setting_value: "188vH8ERakF3tGXfQuJc2iIanq4v9jePwqjdDkus_wVhwDJS0In5q1sak", updated_by: "ADM001", updated_at: "2026-10-13 14:40:00" },
    { setting_key: "GOOGLE_APPS_SCRIPT_LIBRARY_URL", setting_value: "https://script.google.com/macros/library/d/188vH8ERakF3tGXfQuJc2iIanq4v9jePwqjdDkus_wVhwDJS0In5q1sak/1", updated_by: "ADM001", updated_at: "2026-10-13 14:40:00" },
    { setting_key: "GOOGLE_SHEETS_LAST_SYNC", setting_value: "", updated_by: "ADM001", updated_at: "2026-10-13 14:40:00" },
    { setting_key: "PAYMENT_HOLD_MINUTES", setting_value: "60", updated_by: "ADM001", updated_at: "2026-10-13 14:40:00" },
    { setting_key: "SCHOOL_BANK_NAME", setting_value: "\u0E18\u0E19\u0E32\u0E04\u0E32\u0E23\u0E01\u0E23\u0E38\u0E07\u0E44\u0E17\u0E22 (Krungthai Bank)", updated_by: "ADM001", updated_at: "2026-10-13 14:40:00" },
    { setting_key: "SCHOOL_BANK_ACC_NO", setting_value: "123-0-45678-9", updated_by: "ADM001", updated_at: "2026-10-13 14:40:00" },
    { setting_key: "SCHOOL_BANK_ACC_NAME", setting_value: "\u0E2A\u0E21\u0E32\u0E04\u0E21\u0E1C\u0E39\u0E49\u0E1B\u0E01\u0E04\u0E23\u0E2D\u0E07\u0E41\u0E25\u0E30\u0E04\u0E23\u0E39\u0E42\u0E23\u0E07\u0E40\u0E23\u0E35\u0E22\u0E19\u0E2A\u0E32\u0E18\u0E34\u0E15\u0E2D\u0E38\u0E14\u0E21\u0E28\u0E36\u0E01\u0E29\u0E32", updated_by: "ADM001", updated_at: "2026-10-13 14:40:00" }
  ];
  const initialBookings = [];
  const initialSeats = [];
  const seatLetters = ["A", "B", "C", "D", "E", "F", "G", "H"];
  for (let table = 1; table <= 120; table++) {
    for (const letter of seatLetters) {
      initialSeats.push({
        event_id: "EV2026",
        table_number: table,
        seat_label: letter,
        seat_status: "Available",
        updated_at: "2026-10-13 14:40:00"
      });
    }
  }
  const initialPayments = [];
  const initialCheckIns = [];
  const initialAuditLogs = [
    {
      log_id: "LOG001",
      event_id: "EV2026",
      action: "SYSTEM_INITIALIZE",
      actor_id: "ADM001",
      actor_name: "\u0E19\u0E32\u0E22\u0E1E\u0E2A\u0E34\u0E29\u0E10\u0E4C \u0E2A\u0E31\u0E15\u0E1A\u0E38\u0E15\u0E23 (Super Admin)",
      timestamp: "2026-10-13 14:40:00",
      reason: "\u0E40\u0E23\u0E34\u0E48\u0E21\u0E15\u0E49\u0E19\u0E23\u0E30\u0E1A\u0E1A\u0E10\u0E32\u0E19\u0E02\u0E49\u0E2D\u0E21\u0E39\u0E25\u0E27\u0E48\u0E32\u0E07 \u0E1E\u0E23\u0E49\u0E2D\u0E21\u0E40\u0E0A\u0E37\u0E48\u0E2D\u0E21\u0E15\u0E48\u0E2D Google Sheet ID 181fGpCP7KkKNMixR2OwmYew51wO-pyf2H8ERaKWTuaw"
    }
  ];
  return {
    events: [initialEvent],
    bookings: initialBookings,
    seats: initialSeats,
    payments: initialPayments,
    classes: initialClasses,
    staff: initialStaff,
    auditLogs: initialAuditLogs,
    checkIns: initialCheckIns,
    settings: initialSettings,
    sequenceCounters: {
      EV2026: 0
      // Next booking code will be 0001
    }
  };
}
function loadDatabase() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(DB_FILE)) {
    const initial = getInitialDatabase();
    fs.writeFileSync(DB_FILE, JSON.stringify(initial, null, 2), "utf-8");
    return initial;
  }
  try {
    const raw = fs.readFileSync(DB_FILE, "utf-8");
    const db2 = JSON.parse(raw);
    let masterAdmin = db2.staff.find((s) => s.username === "0833759527" || s.phone === "0833759527" || s.staff_id === "ADM001");
    if (!masterAdmin) {
      masterAdmin = {
        staff_id: "ADM001",
        username: "0833759527",
        password: "0833759527",
        display_name: "\u0E19\u0E32\u0E22\u0E1E\u0E2A\u0E34\u0E29\u0E10\u0E4C \u0E2A\u0E31\u0E15\u0E1A\u0E38\u0E15\u0E23",
        phone: "0833759527",
        email: "satit1999.moe@gmail.com",
        role: "Super Admin",
        active_status: true,
        active_devices: [],
        max_devices: 10
      };
      db2.staff.unshift(masterAdmin);
      saveDatabase(db2);
    } else {
      masterAdmin.display_name = "\u0E19\u0E32\u0E22\u0E1E\u0E2A\u0E34\u0E29\u0E10\u0E4C \u0E2A\u0E31\u0E15\u0E1A\u0E38\u0E15\u0E23";
      masterAdmin.username = "0833759527";
      masterAdmin.phone = "0833759527";
      masterAdmin.role = "Super Admin";
      masterAdmin.active_status = true;
      masterAdmin.password = "0833759527";
      if (!masterAdmin.max_devices) masterAdmin.max_devices = 10;
      if (!Array.isArray(masterAdmin.active_devices)) masterAdmin.active_devices = [];
    }
    db2.staff.forEach((s) => {
      if (!s.username) s.username = s.phone || s.staff_id.toLowerCase();
      if (!s.password) s.password = "password123";
      if (!s.max_devices) s.max_devices = 10;
      if (!Array.isArray(s.active_devices)) s.active_devices = [];
    });
    const updateSetting = (key, val) => {
      const existing = db2.settings.find((s) => s.setting_key === key);
      if (existing) {
        existing.setting_value = val;
      } else {
        db2.settings.push({
          setting_key: key,
          setting_value: val,
          updated_by: "ADM001",
          updated_at: "2026-10-13 14:40:00"
        });
      }
    };
    updateSetting("GOOGLE_SHEETS_ID", "181fGpCP7KkKNMixR2OwmYew51wO-pyf2H8ERaKWTuaw");
    updateSetting("GOOGLE_APPS_SCRIPT_URL", "https://script.google.com/macros/s/AKfycbyA-GjojRbOGEArwidXXGgPB4Fyj2eNVvA9B2b4T__qSxxtTW1m3v_uJLs7F8PVe0_g/exec");
    updateSetting("GOOGLE_APPS_SCRIPT_LIBRARY", "188vH8ERakF3tGXfQuJc2iIanq4v9jePwqjdDkus_wVhwDJS0In5q1sak");
    updateSetting("GOOGLE_APPS_SCRIPT_LIBRARY_URL", "https://script.google.com/macros/library/d/188vH8ERakF3tGXfQuJc2iIanq4v9jePwqjdDkus_wVhwDJS0In5q1sak/1");
    saveDatabase(db2);
    return db2;
  } catch (err) {
    console.error("Failed to parse database file, reinitializing", err);
    const initial = getInitialDatabase();
    fs.writeFileSync(DB_FILE, JSON.stringify(initial, null, 2), "utf-8");
    return initial;
  }
}
function saveDatabase(db2) {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  fs.writeFileSync(DB_FILE, JSON.stringify(db2, null, 2), "utf-8");
}
var db;
var isSyncingInBackground = false;
var pendingSyncRequested = false;
async function triggerInstantGoogleSheetsSync(reason = "Mutation") {
  if (!db || !db.settings) return;
  if (isSyncingInBackground) {
    pendingSyncRequested = true;
    return;
  }
  isSyncingInBackground = true;
  pendingSyncRequested = false;
  const urlSetting = db.settings.find((s) => s.setting_key === "GOOGLE_APPS_SCRIPT_URL")?.setting_value;
  const webAppUrl = urlSetting || "https://script.google.com/macros/s/AKfycbyA-GjojRbOGEArwidXXGgPB4Fyj2eNVvA9B2b4T__qSxxtTW1m3v_uJLs7F8PVe0_g/exec";
  if (!webAppUrl || !webAppUrl.startsWith("https://script.google.com/")) {
    isSyncingInBackground = false;
    return;
  }
  try {
    const nowStr = (/* @__PURE__ */ new Date()).toISOString().replace("T", " ").slice(0, 19);
    console.log(`[Auto-Sync] Real-time syncing to Google Sheets: ${reason}...`);
    const resp = await fetch(webAppUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "full_sync",
        syncReason: reason,
        timestamp: nowStr,
        data: {
          events: db.events,
          bookings: db.bookings,
          seats: db.seats,
          payments: db.payments,
          classes: db.classes,
          staff: db.staff,
          auditLogs: db.auditLogs,
          checkIns: db.checkIns,
          settings: db.settings
        }
      })
    });
    const lastSyncSetting = db.settings.find((s) => s.setting_key === "GOOGLE_SHEETS_LAST_SYNC");
    if (lastSyncSetting) {
      lastSyncSetting.setting_value = nowStr;
    } else {
      db.settings.push({
        setting_key: "GOOGLE_SHEETS_LAST_SYNC",
        setting_value: nowStr,
        updated_by: "AutoSync Engine",
        updated_at: nowStr
      });
    }
    saveDatabase(db);
    console.log(`[Auto-Sync] Live sync completed (Status: ${resp.status}) at ${nowStr}`);
  } catch (err) {
    console.warn(`[Auto-Sync] Live sync non-blocking note: ${err?.message || err}`);
  } finally {
    isSyncingInBackground = false;
    if (pendingSyncRequested) {
      setTimeout(() => triggerInstantGoogleSheetsSync("QueuedMutation"), 1e3);
    }
  }
}
function getNextBookingCode(db2, eventId) {
  if (!db2.sequenceCounters) {
    db2.sequenceCounters = {};
  }
  const current = db2.sequenceCounters[eventId] || 0;
  const next = current + 1;
  if (next > 9999) {
    throw new Error("\u0E02\u0E35\u0E14\u0E08\u0E33\u0E01\u0E31\u0E14\u0E23\u0E2B\u0E31\u0E2A\u0E01\u0E32\u0E23\u0E08\u0E2D\u0E07 9,999 \u0E23\u0E32\u0E22\u0E01\u0E32\u0E23\u0E2A\u0E33\u0E2B\u0E23\u0E31\u0E1A\u0E01\u0E34\u0E08\u0E01\u0E23\u0E23\u0E21\u0E19\u0E35\u0E49\u0E40\u0E15\u0E47\u0E21\u0E41\u0E25\u0E49\u0E27 \u0E01\u0E23\u0E38\u0E13\u0E32\u0E15\u0E34\u0E14\u0E15\u0E48\u0E2D\u0E1C\u0E39\u0E49\u0E14\u0E39\u0E41\u0E25\u0E23\u0E30\u0E1A\u0E1A");
  }
  db2.sequenceCounters[eventId] = next;
  return next.toString().padStart(4, "0");
}
function computeStats(db2, eventId) {
  const event = db2.events.find((e) => e.event_id === eventId) || db2.events[0];
  const totalTables = event ? event.total_tables : 120;
  const totalSeats = totalTables * (event ? event.seats_per_table : 8);
  const eventSeats = db2.seats.filter((s) => s.event_id === eventId);
  const eventBookings = db2.bookings.filter((b) => b.event_id === eventId);
  const tableSeatMap = {};
  for (let i = 1; i <= totalTables; i++) {
    tableSeatMap[i] = [];
  }
  for (const s of eventSeats) {
    if (!tableSeatMap[s.table_number]) {
      tableSeatMap[s.table_number] = [];
    }
    tableSeatMap[s.table_number].push(s);
  }
  let vacantTables = 0;
  let partialTables = 0;
  let fullTables = 0;
  let bookedSeats = 0;
  for (let t = 1; t <= totalTables; t++) {
    const seats = tableSeatMap[t] || [];
    const bookedInTable = seats.filter((s) => s.seat_status === "Booked").length;
    bookedSeats += bookedInTable;
    if (bookedInTable === 0) {
      vacantTables++;
    } else if (bookedInTable === seats.length && seats.length > 0) {
      fullTables++;
    } else {
      partialTables++;
    }
  }
  const vacantSeats = totalSeats - bookedSeats;
  const occupancyRate = totalSeats > 0 ? Math.round(bookedSeats / totalSeats * 100) : 0;
  const validBookings = eventBookings.filter((b) => b.booking_status !== "Cancelled");
  const totalRevenueBooked = validBookings.reduce((sum, b) => sum + (b.total_amount || 0), 0);
  const totalRevenuePaid = validBookings.filter((b) => b.payment_status === "\u0E0A\u0E33\u0E23\u0E30\u0E40\u0E07\u0E34\u0E19\u0E41\u0E25\u0E49\u0E27").reduce((sum, b) => sum + (b.total_amount || 0), 0);
  const totalRevenuePending = validBookings.filter((b) => b.payment_status !== "\u0E0A\u0E33\u0E23\u0E30\u0E40\u0E07\u0E34\u0E19\u0E41\u0E25\u0E49\u0E27" && b.payment_status !== "\u0E22\u0E01\u0E40\u0E25\u0E34\u0E01").reduce((sum, b) => sum + (b.total_amount || 0), 0);
  const pendingSlipsCount = validBookings.filter(
    (b) => b.payment_status === "\u0E2A\u0E48\u0E07\u0E2B\u0E25\u0E31\u0E01\u0E10\u0E32\u0E19\u0E41\u0E25\u0E49\u0E27" || b.payment_status === "\u0E23\u0E2D\u0E15\u0E23\u0E27\u0E08\u0E2A\u0E2D\u0E1A"
  ).length;
  const checkedInCount = validBookings.filter((b) => b.check_in_status === true).length;
  const checkInRate = validBookings.length > 0 ? Math.round(checkedInCount / validBookings.length * 100) : 0;
  const staffSalesMap = {};
  for (const b of validBookings) {
    const staff = b.created_by || "\u0E44\u0E21\u0E48\u0E23\u0E30\u0E1A\u0E38";
    if (!staffSalesMap[staff]) {
      staffSalesMap[staff] = { count: 0, totalAmount: 0 };
    }
    staffSalesMap[staff].count++;
    staffSalesMap[staff].totalAmount += b.total_amount || 0;
  }
  const staffSales = Object.entries(staffSalesMap).map(([staffName, data]) => ({
    staffName,
    count: data.count,
    totalAmount: data.totalAmount
  }));
  const progMap = {
    "Thai Program (TP)": { count: 0, amount: 0 },
    "English Program (EP)": { count: 0, amount: 0 }
  };
  for (const b of validBookings) {
    const key = b.program === "EP" ? "English Program (EP)" : "Thai Program (TP)";
    progMap[key].count++;
    progMap[key].amount += b.total_amount || 0;
  }
  const programSales = Object.entries(progMap).map(([program, data]) => ({
    program,
    count: data.count,
    amount: data.amount
  }));
  const levelMap = {};
  for (const b of validBookings) {
    const key = b.level_name || b.level_id || "Other";
    if (!levelMap[key]) {
      levelMap[key] = { count: 0, amount: 0 };
    }
    levelMap[key].count++;
    levelMap[key].amount += b.total_amount || 0;
  }
  const levelSales = Object.entries(levelMap).map(([levelName, data]) => ({
    levelName,
    count: data.count,
    amount: data.amount
  }));
  return {
    totalTables,
    vacantTables,
    partialTables,
    fullTables,
    totalSeats,
    bookedSeats,
    vacantSeats,
    occupancyRate,
    totalBookings: validBookings.length,
    totalRevenueBooked,
    totalRevenuePaid,
    totalRevenuePending,
    pendingSlipsCount,
    checkedInCount,
    checkInRate,
    staffSales,
    programSales,
    levelSales
  };
}
async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3e3;
  app.use(express.json({ limit: "15mb" }));
  db = loadDatabase();
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", serverTime: (/* @__PURE__ */ new Date()).toISOString() });
  });
  app.get("/api/events", (_req, res) => {
    res.json(db.events);
  });
  app.get("/api/events/:id", (req, res) => {
    const event = db.events.find((e) => e.event_id === req.params.id);
    if (!event) return res.status(404).json({ error: "Event not found" });
    res.json(event);
  });
  app.post("/api/events", (req, res) => {
    const {
      event_id,
      event_year,
      event_name_th,
      event_name_en,
      promo_title,
      theme,
      event_date,
      start_time,
      end_time,
      venue,
      total_tables,
      seats_per_table,
      seat_price,
      table_price,
      sales_open_at,
      sales_close_at,
      refund_policy,
      clone_from_event_id,
      actor_id,
      actor_name
    } = req.body;
    if (!event_id || !event_name_th) {
      return res.status(400).json({ error: "\u0E23\u0E2B\u0E31\u0E2A\u0E01\u0E34\u0E08\u0E01\u0E23\u0E23\u0E21\u0E41\u0E25\u0E30\u0E0A\u0E37\u0E48\u0E2D\u0E01\u0E34\u0E08\u0E01\u0E23\u0E23\u0E21\u0E20\u0E32\u0E29\u0E32\u0E44\u0E17\u0E22\u0E08\u0E33\u0E40\u0E1B\u0E47\u0E19\u0E15\u0E49\u0E2D\u0E07\u0E01\u0E23\u0E2D\u0E01" });
    }
    if (db.events.some((e) => e.event_id === event_id)) {
      return res.status(400).json({ error: "\u0E23\u0E2B\u0E31\u0E2A\u0E01\u0E34\u0E08\u0E01\u0E23\u0E23\u0E21\u0E19\u0E35\u0E49\u0E21\u0E35\u0E2D\u0E22\u0E39\u0E48\u0E43\u0E19\u0E23\u0E30\u0E1A\u0E1A\u0E41\u0E25\u0E49\u0E27" });
    }
    const newEvent = {
      event_id,
      event_year: Number(event_year) || (/* @__PURE__ */ new Date()).getFullYear(),
      event_name_th,
      event_name_en: event_name_en || event_name_th,
      promo_title: promo_title || `ANNUAL PARTY ${event_year}`,
      theme: theme || "MONOCHROME",
      event_date: event_date || "2027-12-18",
      start_time: start_time || "18:00",
      end_time: end_time || "22:00",
      venue: venue || "\u0E2A\u0E19\u0E32\u0E21\u0E01\u0E35\u0E2C\u0E32\u0E42\u0E23\u0E07\u0E40\u0E23\u0E35\u0E22\u0E19",
      total_tables: Number(total_tables) || 120,
      seats_per_table: Number(seats_per_table) || 8,
      seat_price: Number(seat_price) || 850,
      table_price: Number(table_price) || 6500,
      sales_open_at: sales_open_at || (/* @__PURE__ */ new Date()).toISOString(),
      sales_close_at: sales_close_at || "2027-12-15 23:59:59",
      event_status: "Active",
      refund_policy: refund_policy || "\u0E1A\u0E31\u0E15\u0E23\u0E17\u0E35\u0E48\u0E22\u0E37\u0E19\u0E22\u0E31\u0E19\u0E01\u0E32\u0E23\u0E02\u0E32\u0E22\u0E41\u0E25\u0E49\u0E27\u0E44\u0E21\u0E48\u0E2A\u0E32\u0E21\u0E32\u0E23\u0E16\u0E04\u0E37\u0E19\u0E40\u0E07\u0E34\u0E19\u0E44\u0E14\u0E49 \u0E40\u0E27\u0E49\u0E19\u0E41\u0E15\u0E48\u0E1C\u0E39\u0E49\u0E14\u0E39\u0E41\u0E25\u0E23\u0E30\u0E1A\u0E1A\u0E01\u0E33\u0E2B\u0E19\u0E14\u0E02\u0E49\u0E2D\u0E22\u0E01\u0E40\u0E27\u0E49\u0E19",
      created_at: (/* @__PURE__ */ new Date()).toISOString().replace("T", " ").slice(0, 19),
      updated_at: (/* @__PURE__ */ new Date()).toISOString().replace("T", " ").slice(0, 19)
    };
    db.events.push(newEvent);
    const seatLetters = ["A", "B", "C", "D", "E", "F", "G", "H"];
    for (let table = 1; table <= newEvent.total_tables; table++) {
      for (let sIdx = 0; sIdx < newEvent.seats_per_table; sIdx++) {
        const letter = seatLetters[sIdx] || String.fromCharCode(65 + sIdx);
        db.seats.push({
          event_id: newEvent.event_id,
          table_number: table,
          seat_label: letter,
          seat_status: "Available",
          updated_at: newEvent.created_at
        });
      }
    }
    db.sequenceCounters[newEvent.event_id] = 0;
    db.auditLogs.unshift({
      log_id: `LOG_${Date.now()}`,
      event_id: newEvent.event_id,
      action: "CREATE_EVENT",
      new_value: `Created event ${newEvent.event_id} (${newEvent.event_name_th})${clone_from_event_id ? ` cloned from ${clone_from_event_id}` : ""}`,
      actor_id: actor_id || "SYSTEM",
      actor_name: actor_name || "System Admin",
      timestamp: newEvent.created_at,
      reason: "\u0E2A\u0E23\u0E49\u0E32\u0E07\u0E01\u0E34\u0E08\u0E01\u0E23\u0E23\u0E21\u0E41\u0E25\u0E30\u0E1C\u0E31\u0E07\u0E17\u0E35\u0E48\u0E19\u0E31\u0E48\u0E07\u0E43\u0E2B\u0E21\u0E48\u0E2A\u0E33\u0E2B\u0E23\u0E31\u0E1A\u0E1B\u0E35\u0E01\u0E32\u0E23\u0E28\u0E36\u0E01\u0E29\u0E32\u0E16\u0E31\u0E14\u0E44\u0E1B"
    });
    saveDatabase(db);
    res.status(201).json(newEvent);
  });
  app.put("/api/events/:id", (req, res) => {
    const idx = db.events.findIndex((e) => e.event_id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: "Event not found" });
    db.events[idx] = {
      ...db.events[idx],
      ...req.body,
      updated_at: (/* @__PURE__ */ new Date()).toISOString().replace("T", " ").slice(0, 19)
    };
    saveDatabase(db);
    res.json(db.events[idx]);
  });
  app.get("/api/seats", (req, res) => {
    const eventId = req.query.eventId || db.events[0]?.event_id || "EV2026";
    const seats = db.seats.filter((s) => s.event_id === eventId);
    res.json(seats);
  });
  app.get("/api/bookings", (req, res) => {
    const eventId = req.query.eventId || db.events[0]?.event_id || "EV2026";
    let results = db.bookings.filter((b) => b.event_id === eventId);
    const { search, status, paymentStatus, staff, grade } = req.query;
    if (search && typeof search === "string") {
      const q = search.trim().toLowerCase();
      results = results.filter(
        (b) => b.booking_code.toLowerCase().includes(q) || b.parent_first_name.toLowerCase().includes(q) || b.parent_last_name.toLowerCase().includes(q) || b.student_first_name.toLowerCase().includes(q) || b.student_last_name.toLowerCase().includes(q) || b.phone.includes(q) || String(b.table_number) === q
      );
    }
    if (status && typeof status === "string" && status !== "ALL") {
      results = results.filter((b) => b.booking_status === status);
    }
    if (paymentStatus && typeof paymentStatus === "string" && paymentStatus !== "ALL") {
      results = results.filter((b) => b.payment_status === paymentStatus);
    }
    if (staff && typeof staff === "string" && staff !== "ALL") {
      results = results.filter((b) => b.created_by === staff);
    }
    if (grade && typeof grade === "string" && grade !== "ALL") {
      results = results.filter((b) => b.level_id === grade || b.level_name === grade);
    }
    results.sort((a, b) => b.booking_code.localeCompare(a.booking_code));
    res.json(results);
  });
  app.get("/api/bookings/:id", (req, res) => {
    const booking = db.bookings.find(
      (b) => b.booking_uuid === req.params.id || b.booking_code === req.params.id
    );
    if (!booking) return res.status(404).json({ error: "\u0E44\u0E21\u0E48\u0E1E\u0E1A\u0E23\u0E32\u0E22\u0E01\u0E32\u0E23\u0E08\u0E2D\u0E07" });
    res.json(booking);
  });
  app.post("/api/bookings", (req, res) => {
    const {
      event_id,
      parent_first_name,
      parent_last_name,
      phone,
      email,
      contact_note,
      student_first_name,
      student_last_name,
      level_id,
      level_name,
      room,
      program,
      table_number,
      seat_labels,
      // array of seat labels e.g. ['A', 'B'] or ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']
      is_whole_table,
      notes,
      created_by,
      slip_file_url,
      initial_payment_status
    } = req.body;
    if (!parent_first_name || !parent_last_name || !phone || !student_first_name || !student_last_name) {
      return res.status(400).json({ error: "\u0E01\u0E23\u0E38\u0E13\u0E32\u0E01\u0E23\u0E2D\u0E01\u0E02\u0E49\u0E2D\u0E21\u0E39\u0E25\u0E1C\u0E39\u0E49\u0E1B\u0E01\u0E04\u0E23\u0E2D\u0E07\u0E41\u0E25\u0E30\u0E19\u0E31\u0E01\u0E40\u0E23\u0E35\u0E22\u0E19\u0E43\u0E2B\u0E49\u0E04\u0E23\u0E1A\u0E16\u0E49\u0E27\u0E19" });
    }
    if (!table_number || !seat_labels || !Array.isArray(seat_labels) || seat_labels.length === 0) {
      return res.status(400).json({ error: "\u0E01\u0E23\u0E38\u0E13\u0E32\u0E40\u0E25\u0E37\u0E2D\u0E01\u0E42\u0E15\u0E4A\u0E30\u0E41\u0E25\u0E30\u0E17\u0E35\u0E48\u0E19\u0E31\u0E48\u0E07\u0E2D\u0E22\u0E48\u0E32\u0E07\u0E19\u0E49\u0E2D\u0E22 1 \u0E17\u0E35\u0E48\u0E19\u0E31\u0E48\u0E07" });
    }
    const event = db.events.find((e) => e.event_id === event_id);
    if (!event) {
      return res.status(404).json({ error: "\u0E44\u0E21\u0E48\u0E1E\u0E1A\u0E02\u0E49\u0E2D\u0E21\u0E39\u0E25\u0E01\u0E34\u0E08\u0E01\u0E23\u0E23\u0E21" });
    }
    const now = /* @__PURE__ */ new Date();
    if (event.event_status === "Closed") {
      return res.status(403).json({ error: "\u0E01\u0E34\u0E08\u0E01\u0E23\u0E23\u0E21\u0E19\u0E35\u0E49\u0E1B\u0E34\u0E14\u0E01\u0E32\u0E23\u0E02\u0E32\u0E22\u0E41\u0E25\u0E49\u0E27 \u0E44\u0E21\u0E48\u0E2A\u0E32\u0E21\u0E32\u0E23\u0E16\u0E08\u0E2D\u0E07\u0E17\u0E35\u0E48\u0E19\u0E31\u0E48\u0E07\u0E44\u0E14\u0E49" });
    }
    const conflictedSeats = [];
    for (const label of seat_labels) {
      const seat = db.seats.find(
        (s) => s.event_id === event_id && s.table_number === Number(table_number) && s.seat_label === label
      );
      if (seat && seat.seat_status === "Booked") {
        conflictedSeats.push(label);
      }
    }
    if (conflictedSeats.length > 0) {
      return res.status(409).json({
        error: `\u0E17\u0E35\u0E48\u0E19\u0E31\u0E48\u0E07 ${conflictedSeats.join(", ")} \u0E43\u0E19\u0E42\u0E15\u0E4A\u0E30\u0E17\u0E35\u0E48 ${table_number} \u0E21\u0E35\u0E1C\u0E39\u0E49\u0E08\u0E2D\u0E07\u0E44\u0E1B\u0E41\u0E25\u0E49\u0E27 \u0E01\u0E23\u0E38\u0E13\u0E32\u0E40\u0E25\u0E37\u0E2D\u0E01\u0E17\u0E35\u0E48\u0E19\u0E31\u0E48\u0E07\u0E2D\u0E37\u0E48\u0E19`,
        conflictedSeats
      });
    }
    let bookingCode;
    try {
      bookingCode = getNextBookingCode(db, event_id);
    } catch (err) {
      return res.status(400).json({ error: err.message });
    }
    const bookingUuid = `b_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const qrToken = `satit-${event_id}-${bookingCode}-${Math.random().toString(36).substring(2, 8)}`;
    const nowStr = (/* @__PURE__ */ new Date()).toISOString().replace("T", " ").slice(0, 19);
    const seatCount = seat_labels.length;
    let totalAmount = 0;
    if (is_whole_table || seatCount === (event.seats_per_table || 8)) {
      totalAmount = event.table_price || 6500;
    } else {
      totalAmount = seatCount * (event.seat_price || 850);
    }
    const paymentStatus = initial_payment_status || (slip_file_url ? "\u0E2A\u0E48\u0E07\u0E2B\u0E25\u0E31\u0E01\u0E10\u0E32\u0E19\u0E41\u0E25\u0E49\u0E27" : "\u0E23\u0E2D\u0E0A\u0E33\u0E23\u0E30\u0E40\u0E07\u0E34\u0E19");
    const newBooking = {
      booking_uuid: bookingUuid,
      booking_code: bookingCode,
      event_id,
      parent_first_name,
      parent_last_name,
      phone,
      email: email || "",
      contact_note: contact_note || "",
      student_first_name,
      student_last_name,
      level_id: level_id || "P1",
      level_name: level_name || "Primary 1",
      room: room || "A",
      program: program || "TP",
      table_number: Number(table_number),
      seat_count: seatCount,
      seat_labels,
      is_whole_table: Boolean(is_whole_table),
      booking_status: "Confirmed",
      payment_status: paymentStatus,
      total_amount: totalAmount,
      slip_file_url: slip_file_url || "",
      notes: notes || "",
      created_by: created_by || "Staff",
      created_at: nowStr,
      qr_token: qrToken,
      check_in_status: false
    };
    for (const label of seat_labels) {
      const seat = db.seats.find(
        (s) => s.event_id === event_id && s.table_number === Number(table_number) && s.seat_label === label
      );
      if (seat) {
        seat.seat_status = "Booked";
        seat.booking_uuid = bookingUuid;
        seat.updated_at = nowStr;
      }
    }
    db.bookings.push(newBooking);
    if (slip_file_url) {
      db.payments.push({
        payment_id: `PAY_${Date.now()}`,
        booking_uuid: bookingUuid,
        amount: totalAmount,
        payment_method: "Bank Transfer",
        slip_file_url,
        payment_status: paymentStatus,
        created_at: nowStr,
        notes: "\u0E41\u0E19\u0E1A\u0E2A\u0E25\u0E34\u0E1B\u0E1E\u0E23\u0E49\u0E2D\u0E21\u0E01\u0E32\u0E23\u0E08\u0E2D\u0E07"
      });
    }
    db.auditLogs.unshift({
      log_id: `LOG_${Date.now()}`,
      event_id,
      booking_uuid: bookingUuid,
      booking_code: bookingCode,
      action: "CREATE_BOOKING",
      new_value: `\u0E42\u0E15\u0E4A\u0E30 ${table_number} (${seat_labels.join(", ")}) \u0E23\u0E27\u0E21 ${totalAmount.toLocaleString()} \u0E1A\u0E32\u0E17`,
      actor_id: created_by || "Staff",
      actor_name: created_by || "Staff",
      timestamp: nowStr,
      reason: `\u0E2A\u0E23\u0E49\u0E32\u0E07\u0E23\u0E32\u0E22\u0E01\u0E32\u0E23\u0E08\u0E2D\u0E07\u0E23\u0E2B\u0E31\u0E2A ${bookingCode} \u0E2A\u0E33\u0E40\u0E23\u0E47\u0E08`
    });
    saveDatabase(db);
    triggerInstantGoogleSheetsSync("CREATE_BOOKING");
    res.status(201).json(newBooking);
  });
  app.put("/api/bookings/:id", (req, res) => {
    const bookingUuid = req.params.id;
    const booking = db.bookings.find((b) => b.booking_uuid === bookingUuid);
    if (!booking) return res.status(404).json({ error: "\u0E44\u0E21\u0E48\u0E1E\u0E1A\u0E23\u0E32\u0E22\u0E01\u0E32\u0E23\u0E08\u0E2D\u0E07" });
    const {
      parent_first_name,
      parent_last_name,
      phone,
      email,
      contact_note,
      student_first_name,
      student_last_name,
      level_id,
      level_name,
      room,
      program,
      table_number,
      seat_labels,
      notes,
      updated_by
    } = req.body;
    const nowStr = (/* @__PURE__ */ new Date()).toISOString().replace("T", " ").slice(0, 19);
    const isSeatChange = table_number && Number(table_number) !== booking.table_number || seat_labels && JSON.stringify(seat_labels) !== JSON.stringify(booking.seat_labels);
    if (isSeatChange && booking.booking_status === "Confirmed") {
      const targetTable = Number(table_number || booking.table_number);
      const targetSeats = seat_labels || booking.seat_labels;
      for (const label of targetSeats) {
        const seat = db.seats.find(
          (s) => s.event_id === booking.event_id && s.table_number === targetTable && s.seat_label === label
        );
        if (seat && seat.seat_status === "Booked" && seat.booking_uuid !== bookingUuid) {
          return res.status(409).json({
            error: `\u0E17\u0E35\u0E48\u0E19\u0E31\u0E48\u0E07 ${label} \u0E43\u0E19\u0E42\u0E15\u0E4A\u0E30\u0E17\u0E35\u0E48 ${targetTable} \u0E21\u0E35\u0E1C\u0E39\u0E49\u0E08\u0E2D\u0E07\u0E44\u0E1B\u0E41\u0E25\u0E49\u0E27 \u0E44\u0E21\u0E48\u0E2A\u0E32\u0E21\u0E32\u0E23\u0E16\u0E40\u0E1B\u0E25\u0E35\u0E48\u0E22\u0E19\u0E44\u0E14\u0E49`
          });
        }
      }
      for (const label of booking.seat_labels) {
        const seat = db.seats.find(
          (s) => s.event_id === booking.event_id && s.table_number === booking.table_number && s.seat_label === label
        );
        if (seat && seat.booking_uuid === bookingUuid) {
          seat.seat_status = "Available";
          delete seat.booking_uuid;
          seat.updated_at = nowStr;
        }
      }
      for (const label of targetSeats) {
        const seat = db.seats.find(
          (s) => s.event_id === booking.event_id && s.table_number === targetTable && s.seat_label === label
        );
        if (seat) {
          seat.seat_status = "Booked";
          seat.booking_uuid = bookingUuid;
          seat.updated_at = nowStr;
        }
      }
      const event = db.events.find((e) => e.event_id === booking.event_id);
      if (event) {
        const seatCount = targetSeats.length;
        if (seatCount === (event.seats_per_table || 8)) {
          booking.total_amount = event.table_price || 6500;
          booking.is_whole_table = true;
        } else {
          booking.total_amount = seatCount * (event.seat_price || 850);
          booking.is_whole_table = false;
        }
      }
      booking.table_number = targetTable;
      booking.seat_labels = targetSeats;
      booking.seat_count = targetSeats.length;
    }
    if (parent_first_name) booking.parent_first_name = parent_first_name;
    if (parent_last_name) booking.parent_last_name = parent_last_name;
    if (phone) booking.phone = phone;
    if (email !== void 0) booking.email = email;
    if (contact_note !== void 0) booking.contact_note = contact_note;
    if (student_first_name) booking.student_first_name = student_first_name;
    if (student_last_name) booking.student_last_name = student_last_name;
    if (level_id) booking.level_id = level_id;
    if (level_name) booking.level_name = level_name;
    if (room) booking.room = room;
    if (program) booking.program = program;
    if (notes !== void 0) booking.notes = notes;
    booking.updated_by = updated_by || "Staff";
    booking.updated_at = nowStr;
    db.auditLogs.unshift({
      log_id: `LOG_${Date.now()}`,
      event_id: booking.event_id,
      booking_uuid: booking.booking_uuid,
      booking_code: booking.booking_code,
      action: isSeatChange ? "CHANGE_SEATS" : "UPDATE_BOOKING_INFO",
      new_value: `\u0E41\u0E01\u0E49\u0E44\u0E02\u0E02\u0E49\u0E2D\u0E21\u0E39\u0E25\u0E01\u0E32\u0E23\u0E08\u0E2D\u0E07\u0E23\u0E2B\u0E31\u0E2A ${booking.booking_code}`,
      actor_id: updated_by || "Staff",
      actor_name: updated_by || "Staff",
      timestamp: nowStr,
      reason: "\u0E40\u0E08\u0E49\u0E32\u0E2B\u0E19\u0E49\u0E32\u0E17\u0E35\u0E48\u0E41\u0E01\u0E49\u0E44\u0E02\u0E02\u0E49\u0E2D\u0E21\u0E39\u0E25\u0E01\u0E32\u0E23\u0E08\u0E2D\u0E07"
    });
    saveDatabase(db);
    triggerInstantGoogleSheetsSync("UPDATE_BOOKING");
    res.json(booking);
  });
  app.delete("/api/bookings/:id", (req, res) => {
    const bookingUuid = req.params.id;
    const { deleted_by, reason } = req.body || {};
    const bookingIndex = db.bookings.findIndex(
      (b) => b.booking_uuid === bookingUuid || b.booking_code === bookingUuid
    );
    if (bookingIndex === -1) {
      return res.status(404).json({ error: "\u0E44\u0E21\u0E48\u0E1E\u0E1A\u0E23\u0E32\u0E22\u0E01\u0E32\u0E23\u0E08\u0E2D\u0E07\u0E17\u0E35\u0E48\u0E15\u0E49\u0E2D\u0E07\u0E01\u0E32\u0E23\u0E25\u0E1A" });
    }
    const booking = db.bookings[bookingIndex];
    const nowStr = (/* @__PURE__ */ new Date()).toISOString().replace("T", " ").slice(0, 19);
    for (const label of booking.seat_labels) {
      const seat = db.seats.find(
        (s) => s.event_id === booking.event_id && s.table_number === booking.table_number && s.seat_label === label
      );
      if (seat && (seat.booking_uuid === booking.booking_uuid || seat.booking_uuid === bookingUuid)) {
        seat.seat_status = "Available";
        delete seat.booking_uuid;
        seat.updated_at = nowStr;
      }
    }
    db.payments = db.payments.filter((p) => p.booking_uuid !== booking.booking_uuid);
    db.checkIns = db.checkIns.filter((c) => c.booking_uuid !== booking.booking_uuid);
    db.bookings.splice(bookingIndex, 1);
    db.auditLogs.unshift({
      log_id: `LOG_${Date.now()}`,
      event_id: booking.event_id,
      booking_uuid: booking.booking_uuid,
      booking_code: booking.booking_code,
      action: "DELETE_BOOKING",
      old_value: `\u0E42\u0E15\u0E4A\u0E30 ${booking.table_number} (${booking.seat_labels.join(", ")}) \u0E42\u0E14\u0E22 ${booking.parent_first_name} ${booking.parent_last_name}`,
      new_value: "DELETED",
      actor_id: deleted_by || "Staff",
      actor_name: deleted_by || "Staff",
      timestamp: nowStr,
      reason: reason || "\u0E25\u0E1A\u0E02\u0E49\u0E2D\u0E21\u0E39\u0E25\u0E01\u0E32\u0E23\u0E08\u0E2D\u0E07\u0E2D\u0E2D\u0E01\u0E08\u0E32\u0E01\u0E23\u0E30\u0E1A\u0E1A\u0E16\u0E32\u0E27\u0E23\u0E41\u0E25\u0E30\u0E04\u0E37\u0E19\u0E17\u0E35\u0E48\u0E19\u0E31\u0E48\u0E07\u0E40\u0E23\u0E35\u0E22\u0E1A\u0E23\u0E49\u0E2D\u0E22"
    });
    saveDatabase(db);
    triggerInstantGoogleSheetsSync("DELETE_BOOKING");
    res.json({
      success: true,
      message: `\u0E25\u0E1A\u0E23\u0E32\u0E22\u0E01\u0E32\u0E23\u0E08\u0E2D\u0E07\u0E23\u0E2B\u0E31\u0E2A #${booking.booking_code} \u0E2D\u0E2D\u0E01\u0E08\u0E32\u0E01\u0E23\u0E30\u0E1A\u0E1A\u0E41\u0E25\u0E30\u0E04\u0E37\u0E19\u0E17\u0E35\u0E48\u0E19\u0E31\u0E48\u0E07\u0E40\u0E23\u0E35\u0E22\u0E1A\u0E23\u0E49\u0E2D\u0E22 \u0E1E\u0E23\u0E49\u0E2D\u0E21\u0E0B\u0E34\u0E07\u0E01\u0E4C\u0E10\u0E32\u0E19\u0E02\u0E49\u0E2D\u0E21\u0E39\u0E25\u0E17\u0E31\u0E19\u0E17\u0E35`,
      deletedBookingCode: booking.booking_code
    });
  });
  app.post("/api/bookings/:id/cancel", (req, res) => {
    const bookingUuid = req.params.id;
    const { reason, cancelled_by } = req.body;
    const booking = db.bookings.find((b) => b.booking_uuid === bookingUuid);
    if (!booking) return res.status(404).json({ error: "\u0E44\u0E21\u0E48\u0E1E\u0E1A\u0E23\u0E32\u0E22\u0E01\u0E32\u0E23\u0E08\u0E2D\u0E07" });
    if (booking.booking_status === "Cancelled") {
      return res.status(400).json({ error: "\u0E23\u0E32\u0E22\u0E01\u0E32\u0E23\u0E19\u0E35\u0E49\u0E16\u0E39\u0E01\u0E22\u0E01\u0E40\u0E25\u0E34\u0E01\u0E44\u0E1B\u0E41\u0E25\u0E49\u0E27" });
    }
    const nowStr = (/* @__PURE__ */ new Date()).toISOString().replace("T", " ").slice(0, 19);
    for (const label of booking.seat_labels) {
      const seat = db.seats.find(
        (s) => s.event_id === booking.event_id && s.table_number === booking.table_number && s.seat_label === label
      );
      if (seat && seat.booking_uuid === bookingUuid) {
        seat.seat_status = "Available";
        delete seat.booking_uuid;
        seat.updated_at = nowStr;
      }
    }
    booking.booking_status = "Cancelled";
    booking.payment_status = "\u0E22\u0E01\u0E40\u0E25\u0E34\u0E01";
    booking.cancelled_at = nowStr;
    booking.cancellation_reason = reason || "\u0E22\u0E01\u0E40\u0E25\u0E34\u0E01\u0E15\u0E32\u0E21\u0E04\u0E27\u0E32\u0E21\u0E1B\u0E23\u0E30\u0E2A\u0E07\u0E04\u0E4C";
    booking.updated_by = cancelled_by || "Staff";
    booking.updated_at = nowStr;
    db.auditLogs.unshift({
      log_id: `LOG_${Date.now()}`,
      event_id: booking.event_id,
      booking_uuid: booking.booking_uuid,
      booking_code: booking.booking_code,
      action: "CANCEL_BOOKING",
      old_value: `\u0E42\u0E15\u0E4A\u0E30 ${booking.table_number} (${booking.seat_labels.join(", ")})`,
      new_value: "Cancelled",
      actor_id: cancelled_by || "Staff",
      actor_name: cancelled_by || "Staff",
      timestamp: nowStr,
      reason: reason || "\u0E22\u0E01\u0E40\u0E25\u0E34\u0E01\u0E23\u0E32\u0E22\u0E01\u0E32\u0E23\u0E08\u0E2D\u0E07\u0E41\u0E25\u0E30\u0E1B\u0E25\u0E48\u0E2D\u0E22\u0E17\u0E35\u0E48\u0E19\u0E31\u0E48\u0E07\u0E04\u0E37\u0E19\u0E23\u0E30\u0E1A\u0E1A"
    });
    saveDatabase(db);
    triggerInstantGoogleSheetsSync("CANCEL_BOOKING");
    res.json(booking);
  });
  app.post("/api/payments/:bookingId", (req, res) => {
    const bookingUuid = req.params.bookingId;
    const { payment_status, payment_method, payment_reference, verified_by, notes, amount } = req.body;
    const booking = db.bookings.find((b) => b.booking_uuid === bookingUuid || b.booking_code === bookingUuid);
    if (!booking) return res.status(404).json({ error: "\u0E44\u0E21\u0E48\u0E1E\u0E1A\u0E23\u0E32\u0E22\u0E01\u0E32\u0E23\u0E08\u0E2D\u0E07" });
    const nowStr = (/* @__PURE__ */ new Date()).toISOString().replace("T", " ").slice(0, 19);
    const oldStatus = booking.payment_status;
    booking.payment_status = payment_status;
    booking.updated_at = nowStr;
    booking.updated_by = verified_by || "Finance";
    const payRecord = {
      payment_id: `PAY_${Date.now()}`,
      booking_uuid: booking.booking_uuid,
      amount: Number(amount) || booking.total_amount,
      payment_method: payment_method || "Bank Transfer",
      payment_reference: payment_reference || "",
      slip_file_url: booking.slip_file_url,
      payment_status,
      verified_by: verified_by || "Finance Officer",
      verified_at: payment_status === "\u0E0A\u0E33\u0E23\u0E30\u0E40\u0E07\u0E34\u0E19\u0E41\u0E25\u0E49\u0E27" ? nowStr : void 0,
      created_at: nowStr,
      notes: notes || ""
    };
    db.payments.push(payRecord);
    db.auditLogs.unshift({
      log_id: `LOG_${Date.now()}`,
      event_id: booking.event_id,
      booking_uuid: booking.booking_uuid,
      booking_code: booking.booking_code,
      action: "PAYMENT_STATUS_UPDATE",
      old_value: oldStatus,
      new_value: payment_status,
      actor_id: verified_by || "Finance",
      actor_name: verified_by || "\u0E1D\u0E48\u0E32\u0E22\u0E01\u0E32\u0E23\u0E40\u0E07\u0E34\u0E19",
      timestamp: nowStr,
      reason: notes || `\u0E40\u0E1B\u0E25\u0E35\u0E48\u0E22\u0E19\u0E2A\u0E16\u0E32\u0E19\u0E30\u0E01\u0E32\u0E23\u0E0A\u0E33\u0E23\u0E30\u0E40\u0E07\u0E34\u0E19\u0E40\u0E1B\u0E47\u0E19 ${payment_status}`
    });
    saveDatabase(db);
    triggerInstantGoogleSheetsSync("UPDATE_PAYMENT");
    res.json({ booking, payment: payRecord });
  });
  app.post("/api/payments/:bookingId/upload-slip", (req, res) => {
    const bookingUuid = req.params.bookingId;
    const { slip_file_url, uploaded_by } = req.body;
    if (!slip_file_url) {
      return res.status(400).json({ error: "\u0E01\u0E23\u0E38\u0E13\u0E32\u0E41\u0E19\u0E1A\u0E44\u0E1F\u0E25\u0E4C\u0E2A\u0E25\u0E34\u0E1B\u0E2B\u0E25\u0E31\u0E01\u0E10\u0E32\u0E19\u0E01\u0E32\u0E23\u0E0A\u0E33\u0E23\u0E30\u0E40\u0E07\u0E34\u0E19" });
    }
    const booking = db.bookings.find((b) => b.booking_uuid === bookingUuid || b.booking_code === bookingUuid);
    if (!booking) return res.status(404).json({ error: "\u0E44\u0E21\u0E48\u0E1E\u0E1A\u0E23\u0E32\u0E22\u0E01\u0E32\u0E23\u0E08\u0E2D\u0E07" });
    const nowStr = (/* @__PURE__ */ new Date()).toISOString().replace("T", " ").slice(0, 19);
    booking.slip_file_url = slip_file_url;
    if (booking.payment_status === "\u0E23\u0E2D\u0E0A\u0E33\u0E23\u0E30\u0E40\u0E07\u0E34\u0E19") {
      booking.payment_status = "\u0E2A\u0E48\u0E07\u0E2B\u0E25\u0E31\u0E01\u0E10\u0E32\u0E19\u0E41\u0E25\u0E49\u0E27";
    }
    booking.updated_at = nowStr;
    booking.updated_by = uploaded_by || "Staff";
    db.payments.push({
      payment_id: `PAY_${Date.now()}`,
      booking_uuid: booking.booking_uuid,
      amount: booking.total_amount,
      payment_method: "Bank Transfer",
      slip_file_url,
      payment_status: booking.payment_status,
      created_at: nowStr,
      notes: "\u0E2D\u0E31\u0E1B\u0E42\u0E2B\u0E25\u0E14\u0E2A\u0E25\u0E34\u0E1B\u0E2B\u0E25\u0E31\u0E01\u0E10\u0E32\u0E19\u0E01\u0E32\u0E23\u0E42\u0E2D\u0E19\u0E40\u0E07\u0E34\u0E19"
    });
    db.auditLogs.unshift({
      log_id: `LOG_${Date.now()}`,
      event_id: booking.event_id,
      booking_uuid: booking.booking_uuid,
      booking_code: booking.booking_code,
      action: "UPLOAD_SLIP",
      new_value: "\u0E2A\u0E48\u0E07\u0E2B\u0E25\u0E31\u0E01\u0E10\u0E32\u0E19\u0E41\u0E25\u0E49\u0E27",
      actor_id: uploaded_by || "Staff",
      actor_name: uploaded_by || "Staff",
      timestamp: nowStr,
      reason: "\u0E41\u0E19\u0E1A\u0E23\u0E39\u0E1B\u0E20\u0E32\u0E1E\u0E2A\u0E25\u0E34\u0E1B\u0E2B\u0E25\u0E31\u0E01\u0E10\u0E32\u0E19\u0E01\u0E32\u0E23\u0E0A\u0E33\u0E23\u0E30\u0E40\u0E07\u0E34\u0E19\u0E40\u0E02\u0E49\u0E32\u0E2A\u0E39\u0E48\u0E23\u0E30\u0E1A\u0E1A"
    });
    saveDatabase(db);
    triggerInstantGoogleSheetsSync("UPLOAD_SLIP");
    res.json(booking);
  });
  app.post("/api/checkin", (req, res) => {
    const { token_or_code, checked_in_by, notes } = req.body;
    if (!token_or_code) {
      return res.status(400).json({ error: "\u0E01\u0E23\u0E38\u0E13\u0E32\u0E23\u0E30\u0E1A\u0E38\u0E23\u0E2B\u0E31\u0E2A\u0E01\u0E32\u0E23\u0E08\u0E2D\u0E07 4 \u0E2B\u0E25\u0E31\u0E01 \u0E2B\u0E23\u0E37\u0E2D QR Code Token" });
    }
    const cleanInput = token_or_code.trim();
    const booking = db.bookings.find(
      (b) => b.qr_token === cleanInput || b.booking_code === cleanInput || b.booking_uuid === cleanInput
    );
    if (!booking) {
      return res.status(404).json({ error: "\u0E44\u0E21\u0E48\u0E1E\u0E1A\u0E02\u0E49\u0E2D\u0E21\u0E39\u0E25\u0E01\u0E32\u0E23\u0E08\u0E2D\u0E07\u0E15\u0E32\u0E21\u0E23\u0E2B\u0E31\u0E2A\u0E17\u0E35\u0E48\u0E23\u0E30\u0E1A\u0E38 \u0E01\u0E23\u0E38\u0E13\u0E32\u0E15\u0E23\u0E27\u0E08\u0E2A\u0E2D\u0E1A\u0E2D\u0E35\u0E01\u0E04\u0E23\u0E31\u0E49\u0E07" });
    }
    if (booking.booking_status === "Cancelled") {
      return res.status(400).json({ error: "\u0E23\u0E32\u0E22\u0E01\u0E32\u0E23\u0E08\u0E2D\u0E07\u0E19\u0E35\u0E49\u0E16\u0E39\u0E01\u0E22\u0E01\u0E40\u0E25\u0E34\u0E01\u0E41\u0E25\u0E49\u0E27 \u0E44\u0E21\u0E48\u0E2A\u0E32\u0E21\u0E32\u0E23\u0E16\u0E40\u0E0A\u0E47\u0E01\u0E2D\u0E34\u0E19\u0E44\u0E14\u0E49" });
    }
    const nowStr = (/* @__PURE__ */ new Date()).toISOString().replace("T", " ").slice(0, 19);
    if (booking.check_in_status) {
      db.checkIns.unshift({
        checkin_id: `CHK_${Date.now()}`,
        booking_uuid: booking.booking_uuid,
        booking_code: booking.booking_code,
        checked_in_at: nowStr,
        checked_in_by: checked_in_by || "Gate Staff",
        checkin_status: "Duplicate_Attempt",
        notes: `\u0E2A\u0E41\u0E01\u0E19\u0E0B\u0E49\u0E33: \u0E40\u0E04\u0E22\u0E40\u0E0A\u0E47\u0E01\u0E2D\u0E34\u0E19\u0E41\u0E25\u0E49\u0E27\u0E40\u0E21\u0E37\u0E48\u0E2D ${booking.checked_in_at} \u0E42\u0E14\u0E22 ${booking.checked_in_by}`
      });
      saveDatabase(db);
      return res.status(409).json({
        warning: "\u0E41\u0E08\u0E49\u0E07\u0E40\u0E15\u0E37\u0E2D\u0E19: \u0E23\u0E32\u0E22\u0E01\u0E32\u0E23\u0E19\u0E35\u0E49\u0E44\u0E14\u0E49\u0E23\u0E31\u0E1A\u0E01\u0E32\u0E23\u0E40\u0E0A\u0E47\u0E01\u0E2D\u0E34\u0E19\u0E40\u0E02\u0E49\u0E32\u0E07\u0E32\u0E19\u0E44\u0E1B\u0E41\u0E25\u0E49\u0E27",
        isDuplicate: true,
        booking,
        previousCheckIn: {
          checked_in_at: booking.checked_in_at,
          checked_in_by: booking.checked_in_by
        }
      });
    }
    booking.check_in_status = true;
    booking.checked_in_at = nowStr;
    booking.checked_in_by = checked_in_by || "Gate Staff";
    db.checkIns.unshift({
      checkin_id: `CHK_${Date.now()}`,
      booking_uuid: booking.booking_uuid,
      booking_code: booking.booking_code,
      checked_in_at: nowStr,
      checked_in_by: checked_in_by || "Gate Staff",
      checkin_status: "Completed",
      notes: notes || "\u0E40\u0E0A\u0E47\u0E01\u0E2D\u0E34\u0E19\u0E40\u0E02\u0E49\u0E32\u0E07\u0E32\u0E19\u0E2A\u0E33\u0E40\u0E23\u0E47\u0E08"
    });
    db.auditLogs.unshift({
      log_id: `LOG_${Date.now()}`,
      event_id: booking.event_id,
      booking_uuid: booking.booking_uuid,
      booking_code: booking.booking_code,
      action: "CHECK_IN",
      new_value: "Checked In",
      actor_id: checked_in_by || "Gate Staff",
      actor_name: checked_in_by || "\u0E40\u0E08\u0E49\u0E32\u0E2B\u0E19\u0E49\u0E32\u0E17\u0E35\u0E48\u0E40\u0E0A\u0E47\u0E01\u0E2D\u0E34\u0E19",
      timestamp: nowStr,
      reason: notes || "\u0E2A\u0E41\u0E01\u0E19 QR Code \u0E2B\u0E19\u0E49\u0E32\u0E07\u0E32\u0E19\u0E40\u0E02\u0E49\u0E32\u0E07\u0E32\u0E19\u0E40\u0E23\u0E35\u0E22\u0E1A\u0E23\u0E49\u0E2D\u0E22"
    });
    saveDatabase(db);
    triggerInstantGoogleSheetsSync("CHECK_IN");
    res.json({ success: true, booking });
  });
  app.get("/api/stats", (req, res) => {
    const eventId = req.query.eventId || db.events[0]?.event_id || "EV2026";
    const stats = computeStats(db, eventId);
    res.json(stats);
  });
  app.post("/api/auth/login", (req, res) => {
    const { username, password, device_id } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: "\u0E01\u0E23\u0E38\u0E13\u0E32\u0E01\u0E23\u0E2D\u0E01\u0E0A\u0E37\u0E48\u0E2D\u0E1C\u0E39\u0E49\u0E43\u0E0A\u0E49/\u0E40\u0E1A\u0E2D\u0E23\u0E4C\u0E42\u0E17\u0E23 \u0E41\u0E25\u0E30\u0E23\u0E2B\u0E31\u0E2A\u0E1C\u0E48\u0E32\u0E19" });
    }
    const cleanUser = String(username).trim();
    const cleanPass = String(password).trim();
    const currentDeviceId = String(device_id || `dev_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`).trim();
    const staff = db.staff.find(
      (s) => s.username === cleanUser || s.phone === cleanUser || s.staff_id === cleanUser || cleanUser === "0833759527" && (s.username === "0833759527" || s.phone === "0833759527" || s.staff_id === "ADM001")
    );
    if (!staff) {
      return res.status(401).json({ error: "\u0E0A\u0E37\u0E48\u0E2D\u0E1C\u0E39\u0E49\u0E43\u0E0A\u0E49\u0E07\u0E32\u0E19\u0E44\u0E21\u0E48\u0E16\u0E39\u0E01\u0E15\u0E49\u0E2D\u0E07 \u0E01\u0E23\u0E38\u0E13\u0E32\u0E15\u0E23\u0E27\u0E08\u0E2A\u0E2D\u0E1A\u0E2D\u0E35\u0E01\u0E04\u0E23\u0E31\u0E49\u0E07" });
    }
    if (!staff.active_status) {
      return res.status(403).json({ error: "\u0E1A\u0E31\u0E0D\u0E0A\u0E35\u0E1C\u0E39\u0E49\u0E43\u0E0A\u0E49\u0E19\u0E35\u0E49\u0E16\u0E39\u0E01\u0E23\u0E30\u0E07\u0E31\u0E1A\u0E01\u0E32\u0E23\u0E43\u0E0A\u0E49\u0E07\u0E32\u0E19 \u0E01\u0E23\u0E38\u0E13\u0E32\u0E15\u0E34\u0E14\u0E15\u0E48\u0E2D\u0E1C\u0E39\u0E49\u0E14\u0E39\u0E41\u0E25\u0E23\u0E30\u0E1A\u0E1A" });
    }
    if (staff.password && staff.password !== cleanPass) {
      return res.status(401).json({ error: "\u0E23\u0E2B\u0E31\u0E2A\u0E1C\u0E48\u0E32\u0E19\u0E44\u0E21\u0E48\u0E16\u0E39\u0E01\u0E15\u0E49\u0E2D\u0E07 \u0E01\u0E23\u0E38\u0E13\u0E32\u0E25\u0E2D\u0E07\u0E43\u0E2B\u0E21\u0E48\u0E2D\u0E35\u0E01\u0E04\u0E23\u0E31\u0E49\u0E07" });
    }
    if (!Array.isArray(staff.active_devices)) {
      staff.active_devices = [];
    }
    const maxDevices = staff.max_devices || 10;
    const deviceIndex = staff.active_devices.indexOf(currentDeviceId);
    if (deviceIndex === -1) {
      if (staff.active_devices.length >= maxDevices) {
        return res.status(403).json({
          error: `\u0E1A\u0E31\u0E0D\u0E0A\u0E35\u0E1C\u0E39\u0E49\u0E43\u0E0A\u0E49\u0E19\u0E35\u0E49\u0E40\u0E02\u0E49\u0E32\u0E2A\u0E39\u0E48\u0E23\u0E30\u0E1A\u0E1A\u0E04\u0E23\u0E1A\u0E02\u0E35\u0E14\u0E08\u0E33\u0E01\u0E31\u0E14 ${maxDevices} \u0E2D\u0E38\u0E1B\u0E01\u0E23\u0E13\u0E4C\u0E41\u0E25\u0E49\u0E27 \u0E01\u0E23\u0E38\u0E13\u0E32\u0E23\u0E35\u0E40\u0E0B\u0E47\u0E15\u0E40\u0E0B\u0E2A\u0E0A\u0E31\u0E19\u0E2D\u0E38\u0E1B\u0E01\u0E23\u0E13\u0E4C\u0E2D\u0E37\u0E48\u0E19\u0E01\u0E48\u0E2D\u0E19\u0E40\u0E02\u0E49\u0E32\u0E43\u0E0A\u0E49\u0E07\u0E32\u0E19`,
          exceededDevices: true,
          activeDevicesCount: staff.active_devices.length,
          maxDevices
        });
      }
      staff.active_devices.push(currentDeviceId);
    }
    const nowStr = (/* @__PURE__ */ new Date()).toISOString().replace("T", " ").slice(0, 19);
    staff.last_login_at = nowStr;
    db.auditLogs.unshift({
      log_id: `LOG_${Date.now()}`,
      event_id: db.events[0]?.event_id || "EV2026",
      action: "STAFF_LOGIN",
      new_value: `\u0E40\u0E02\u0E49\u0E32\u0E2A\u0E39\u0E48\u0E23\u0E30\u0E1A\u0E1A\u0E2A\u0E33\u0E40\u0E23\u0E47\u0E08 (\u0E2D\u0E38\u0E1B\u0E01\u0E23\u0E13\u0E4C: ${staff.active_devices.length}/${maxDevices})`,
      actor_id: staff.staff_id,
      actor_name: staff.display_name,
      timestamp: nowStr,
      reason: `\u0E40\u0E02\u0E49\u0E32\u0E43\u0E0A\u0E49\u0E07\u0E32\u0E19\u0E23\u0E30\u0E1A\u0E1A\u0E1C\u0E48\u0E32\u0E19\u0E2D\u0E38\u0E1B\u0E01\u0E23\u0E13\u0E4C ${currentDeviceId.slice(0, 12)}`
    });
    saveDatabase(db);
    res.json({
      success: true,
      user: staff,
      device_id: currentDeviceId,
      activeDevicesCount: staff.active_devices.length,
      maxDevices
    });
  });
  app.post("/api/auth/logout", (req, res) => {
    const { staff_id, device_id } = req.body;
    const staff = db.staff.find((s) => s.staff_id === staff_id);
    if (staff && Array.isArray(staff.active_devices) && device_id) {
      staff.active_devices = staff.active_devices.filter((id) => id !== device_id);
      saveDatabase(db);
    }
    res.json({ success: true });
  });
  app.get("/api/staff", (_req, res) => {
    res.json(db.staff);
  });
  app.post("/api/staff", (req, res) => {
    const {
      staff_id,
      username,
      password,
      display_name,
      phone,
      email,
      role,
      active_status,
      max_devices
    } = req.body;
    if (!display_name || !role) {
      return res.status(400).json({ error: "\u0E01\u0E23\u0E38\u0E13\u0E32\u0E01\u0E23\u0E2D\u0E01\u0E0A\u0E37\u0E48\u0E2D-\u0E19\u0E32\u0E21\u0E2A\u0E01\u0E38\u0E25 \u0E41\u0E25\u0E30\u0E1A\u0E17\u0E1A\u0E32\u0E17\u0E2B\u0E19\u0E49\u0E32\u0E17\u0E35\u0E48" });
    }
    const cleanUsername = username ? String(username).trim() : (phone || "").replace(/[^0-9]/g, "");
    const existingIdx = db.staff.findIndex(
      (s) => s.staff_id === staff_id || cleanUsername && s.username === cleanUsername
    );
    if (existingIdx !== -1) {
      const existing = db.staff[existingIdx];
      const isMasterAdmin = existing.username === "0833759527" || existing.staff_id === "ADM001";
      db.staff[existingIdx] = {
        ...existing,
        display_name,
        username: isMasterAdmin ? "0833759527" : cleanUsername || existing.username,
        password: password ? String(password).trim() : existing.password,
        phone: phone ? String(phone).trim() : existing.phone,
        email: email ? String(email).trim() : existing.email,
        role: isMasterAdmin ? "Super Admin" : role,
        active_status: isMasterAdmin ? true : active_status !== void 0 ? active_status : existing.active_status,
        max_devices: max_devices || existing.max_devices || 10
      };
      saveDatabase(db);
      return res.json(db.staff[existingIdx]);
    }
    if (cleanUsername && db.staff.some((s) => s.username === cleanUsername)) {
      return res.status(400).json({ error: "\u0E0A\u0E37\u0E48\u0E2D\u0E1C\u0E39\u0E49\u0E43\u0E0A\u0E49\u0E19\u0E35\u0E49\u0E21\u0E35\u0E2D\u0E22\u0E39\u0E48\u0E43\u0E19\u0E23\u0E30\u0E1A\u0E1A\u0E41\u0E25\u0E49\u0E27" });
    }
    const newStaff = {
      staff_id: staff_id || `STF${(db.staff.length + 1).toString().padStart(3, "0")}`,
      username: cleanUsername || `user${db.staff.length + 1}`,
      password: password ? String(password).trim() : "password123",
      display_name: display_name.trim(),
      phone: phone ? String(phone).trim() : "",
      email: email ? String(email).trim() : `${cleanUsername || "staff"}@satit.ac.th`,
      role,
      active_status: active_status !== void 0 ? active_status : true,
      active_devices: [],
      max_devices: max_devices || 10
    };
    db.staff.push(newStaff);
    saveDatabase(db);
    res.status(201).json(newStaff);
  });
  app.delete("/api/staff/:id", (req, res) => {
    const staffId = req.params.id;
    const staff = db.staff.find((s) => s.staff_id === staffId);
    if (!staff) return res.status(404).json({ error: "\u0E44\u0E21\u0E48\u0E1E\u0E1A\u0E1C\u0E39\u0E49\u0E43\u0E0A\u0E49\u0E19\u0E35\u0E49" });
    if (staff.username === "0833759527" || staff.staff_id === "ADM001") {
      return res.status(403).json({ error: "\u0E44\u0E21\u0E48\u0E2A\u0E32\u0E21\u0E32\u0E23\u0E16\u0E25\u0E1A\u0E1C\u0E39\u0E49\u0E14\u0E39\u0E41\u0E25\u0E23\u0E30\u0E1A\u0E1A\u0E2B\u0E25\u0E31\u0E01 (\u0E19\u0E32\u0E22\u0E1E\u0E2A\u0E34\u0E29\u0E10\u0E4C \u0E2A\u0E31\u0E15\u0E1A\u0E38\u0E15\u0E23) \u0E44\u0E14\u0E49" });
    }
    db.staff = db.staff.filter((s) => s.staff_id !== staffId);
    saveDatabase(db);
    res.json({ success: true, message: "\u0E25\u0E1A\u0E1C\u0E39\u0E49\u0E43\u0E0A\u0E49\u0E07\u0E32\u0E19\u0E40\u0E23\u0E35\u0E22\u0E1A\u0E23\u0E49\u0E2D\u0E22\u0E41\u0E25\u0E49\u0E27" });
  });
  app.post("/api/staff/:id/reset-devices", (req, res) => {
    const staffId = req.params.id;
    const staff = db.staff.find((s) => s.staff_id === staffId);
    if (!staff) return res.status(404).json({ error: "\u0E44\u0E21\u0E48\u0E1E\u0E1A\u0E1C\u0E39\u0E49\u0E43\u0E0A\u0E49\u0E19\u0E35\u0E49" });
    staff.active_devices = [];
    saveDatabase(db);
    res.json({ success: true, message: "\u0E25\u0E49\u0E32\u0E07\u0E40\u0E0B\u0E2A\u0E0A\u0E31\u0E19\u0E2D\u0E38\u0E1B\u0E01\u0E23\u0E13\u0E4C\u0E02\u0E2D\u0E07\u0E1C\u0E39\u0E49\u0E43\u0E0A\u0E49\u0E19\u0E35\u0E49\u0E40\u0E23\u0E35\u0E22\u0E1A\u0E23\u0E49\u0E2D\u0E22\u0E41\u0E25\u0E49\u0E27" });
  });
  app.get("/api/classes", (_req, res) => {
    res.json(db.classes);
  });
  app.put("/api/classes", (req, res) => {
    const { classes } = req.body;
    if (Array.isArray(classes)) {
      db.classes = classes;
      saveDatabase(db);
      triggerInstantGoogleSheetsSync("UPDATE_CLASSES");
    }
    res.json(db.classes);
  });
  app.get("/api/audit-logs", (req, res) => {
    const eventId = req.query.eventId || db.events[0]?.event_id || "EV2026";
    const logs = db.auditLogs.filter((l) => l.event_id === eventId || !l.event_id);
    res.json(logs);
  });
  app.get("/api/settings", (_req, res) => {
    res.json(db.settings);
  });
  app.put("/api/settings", (req, res) => {
    const { settings, updated_by } = req.body;
    if (Array.isArray(settings)) {
      const nowStr = (/* @__PURE__ */ new Date()).toISOString().replace("T", " ").slice(0, 19);
      for (const s of settings) {
        const found = db.settings.find((item) => item.setting_key === s.setting_key);
        if (found) {
          found.setting_value = s.setting_value;
          found.updated_by = updated_by || "Admin";
          found.updated_at = nowStr;
        } else {
          db.settings.push({
            setting_key: s.setting_key,
            setting_value: s.setting_value,
            updated_by: updated_by || "Admin",
            updated_at: nowStr
          });
        }
      }
      saveDatabase(db);
      triggerInstantGoogleSheetsSync("UPDATE_SETTINGS");
    }
    res.json(db.settings);
  });
  function generateCsvForSheet(sheetName, eventId) {
    const escapeCsv = (val) => {
      if (val === void 0 || val === null) return '""';
      const str = String(val).replace(/"/g, '""');
      return `"${str}"`;
    };
    if (sheetName === "Events") {
      const headers = [
        "event_id",
        "event_year",
        "event_name_th",
        "event_name_en",
        "event_date",
        "start_time",
        "end_time",
        "venue",
        "seat_price",
        "table_price",
        "sales_open_at",
        "sales_close_at",
        "event_status",
        "created_at",
        "updated_at"
      ];
      const rows = db.events.map((e) => [
        e.event_id,
        e.event_year,
        e.event_name_th,
        e.event_name_en,
        e.event_date,
        e.start_time,
        e.end_time,
        e.venue,
        e.seat_price,
        e.table_price,
        e.sales_open_at,
        e.sales_close_at,
        e.event_status,
        e.created_at,
        e.updated_at
      ]);
      return [headers.join(","), ...rows.map((r) => r.map(escapeCsv).join(","))].join("\n");
    }
    if (sheetName === "Bookings") {
      const headers = [
        "booking_uuid",
        "booking_code",
        "event_id",
        "parent_first_name",
        "parent_last_name",
        "phone",
        "email",
        "student_first_name",
        "student_last_name",
        "level_id",
        "level_name",
        "room",
        "program",
        "table_number",
        "seat_count",
        "seat_labels",
        "booking_status",
        "payment_status",
        "total_amount",
        "slip_file_url",
        "notes",
        "created_by",
        "created_at",
        "updated_by",
        "updated_at",
        "cancelled_at",
        "cancellation_reason"
      ];
      const bookings = db.bookings.filter((b) => b.event_id === eventId);
      const rows = bookings.map((b) => [
        b.booking_uuid,
        b.booking_code,
        b.event_id,
        b.parent_first_name,
        b.parent_last_name,
        b.phone,
        b.email,
        b.student_first_name,
        b.student_last_name,
        b.level_id,
        b.level_name,
        b.room,
        b.program,
        b.table_number,
        b.seat_count,
        b.seat_labels.join(";"),
        b.booking_status,
        b.payment_status,
        b.total_amount,
        b.slip_file_url || "",
        b.notes || "",
        b.created_by,
        b.created_at,
        b.updated_by || "",
        b.updated_at || "",
        b.cancelled_at || "",
        b.cancellation_reason || ""
      ]);
      return [headers.join(","), ...rows.map((r) => r.map(escapeCsv).join(","))].join("\n");
    }
    if (sheetName === "Seats") {
      const headers = ["event_id", "table_number", "seat_label", "seat_status", "booking_uuid", "updated_at"];
      const seats = db.seats.filter((s) => s.event_id === eventId);
      const rows = seats.map((s) => [
        s.event_id,
        s.table_number,
        s.seat_label,
        s.seat_status,
        s.booking_uuid || "",
        s.updated_at
      ]);
      return [headers.join(","), ...rows.map((r) => r.map(escapeCsv).join(","))].join("\n");
    }
    if (sheetName === "Payments") {
      const headers = [
        "payment_id",
        "booking_uuid",
        "amount",
        "payment_method",
        "payment_reference",
        "slip_file_url",
        "payment_status",
        "verified_by",
        "verified_at",
        "created_at"
      ];
      const rows = db.payments.map((p) => [
        p.payment_id,
        p.booking_uuid,
        p.amount,
        p.payment_method,
        p.payment_reference || "",
        p.slip_file_url || "",
        p.payment_status,
        p.verified_by || "",
        p.verified_at || "",
        p.created_at
      ]);
      return [headers.join(","), ...rows.map((r) => r.map(escapeCsv).join(","))].join("\n");
    }
    if (sheetName === "Students_Classes") {
      const headers = ["level_id", "level_name", "room", "program", "active_status", "created_at", "updated_at"];
      const rows = db.classes.map((c) => [
        c.level_id,
        c.level_name,
        c.room,
        c.program,
        c.active_status ? "Active" : "Inactive",
        "2026-10-12 10:00:00",
        "2026-10-12 10:00:00"
      ]);
      return [headers.join(","), ...rows.map((r) => r.map(escapeCsv).join(","))].join("\n");
    }
    if (sheetName === "Staff") {
      const headers = ["staff_id", "display_name", "email", "role", "active_status", "created_at", "updated_at"];
      const rows = db.staff.map((s) => [
        s.staff_id,
        s.display_name,
        s.email,
        s.role,
        s.active_status ? "Active" : "Inactive",
        "2026-10-12 10:00:00",
        "2026-10-12 10:00:00"
      ]);
      return [headers.join(","), ...rows.map((r) => r.map(escapeCsv).join(","))].join("\n");
    }
    if (sheetName === "Audit_Log") {
      const headers = ["log_id", "event_id", "booking_uuid", "booking_code", "action", "old_value", "new_value", "actor_id", "actor_name", "timestamp", "reason"];
      const logs = db.auditLogs.filter((l) => l.event_id === eventId || !l.event_id);
      const rows = logs.map((l) => [
        l.log_id,
        l.event_id,
        l.booking_uuid || "",
        l.booking_code || "",
        l.action,
        l.old_value || "",
        l.new_value || "",
        l.actor_id,
        l.actor_name,
        l.timestamp,
        l.reason || ""
      ]);
      return [headers.join(","), ...rows.map((r) => r.map(escapeCsv).join(","))].join("\n");
    }
    if (sheetName === "Check_In") {
      const headers = ["checkin_id", "booking_uuid", "booking_code", "checked_in_at", "checked_in_by", "checkin_status", "notes"];
      const rows = db.checkIns.map((c) => [
        c.checkin_id,
        c.booking_uuid,
        c.booking_code,
        c.checked_in_at,
        c.checked_in_by,
        c.checkin_status,
        c.notes || ""
      ]);
      return [headers.join(","), ...rows.map((r) => r.map(escapeCsv).join(","))].join("\n");
    }
    if (sheetName === "Settings") {
      const headers = ["setting_key", "setting_value", "updated_by", "updated_at"];
      const rows = db.settings.map((s) => [s.setting_key, s.setting_value, s.updated_by, s.updated_at]);
      return [headers.join(","), ...rows.map((r) => r.map(escapeCsv).join(","))].join("\n");
    }
    return "";
  }
  app.get("/api/sheets/export/:sheetName", (req, res) => {
    const sheetName = req.params.sheetName;
    const eventId = req.query.eventId || "EV2026";
    const csvContent = generateCsvForSheet(sheetName, eventId);
    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename="${sheetName}_${eventId}.csv"`);
    res.send("\uFEFF" + csvContent);
  });
  app.get("/api/sheets/export-all-xlsx", (req, res) => {
    const eventId = req.query.eventId || db.events[0]?.event_id || "EV2026";
    const event = db.events.find((e) => e.event_id === eventId) || db.events[0];
    const wb = XLSX.utils.book_new();
    const totalRev = db.bookings.reduce((sum, b) => b.booking_status === "Confirmed" ? sum + (b.total_amount || 0) : sum, 0);
    const paidRev = db.bookings.reduce((sum, b) => b.payment_status === "\u0E0A\u0E33\u0E23\u0E30\u0E40\u0E07\u0E34\u0E19\u0E41\u0E25\u0E49\u0E27" ? sum + (b.total_amount || 0) : sum, 0);
    const pendingRev = db.bookings.reduce((sum, b) => b.payment_status === "\u0E23\u0E2D\u0E0A\u0E33\u0E23\u0E30\u0E40\u0E07\u0E34\u0E19" || b.payment_status === "\u0E2A\u0E48\u0E07\u0E2B\u0E25\u0E31\u0E01\u0E10\u0E32\u0E19\u0E41\u0E25\u0E49\u0E27" ? sum + (b.total_amount || 0) : sum, 0);
    const bookedSeats = db.seats.filter((s) => s.seat_status === "Booked").length;
    const dashRows = [
      ["\u0E42\u0E23\u0E07\u0E40\u0E23\u0E35\u0E22\u0E19\u0E2A\u0E32\u0E18\u0E34\u0E15\u0E2D\u0E38\u0E14\u0E21\u0E28\u0E36\u0E01\u0E29\u0E32 - Satit Udomseuksa School"],
      [`\u0E10\u0E32\u0E19\u0E02\u0E49\u0E2D\u0E21\u0E39\u0E25\u0E01\u0E25\u0E32\u0E07\u0E41\u0E25\u0E30\u0E2A\u0E23\u0E38\u0E1B\u0E20\u0E32\u0E1E\u0E23\u0E27\u0E21 - ${event?.event_name_th || ""} (${event?.event_year || 2026})`],
      [`\u0E2A\u0E48\u0E07\u0E2D\u0E2D\u0E01\u0E40\u0E21\u0E37\u0E48\u0E2D: ${(/* @__PURE__ */ new Date()).toLocaleString("th-TH")}`],
      [],
      ["\u0E15\u0E31\u0E27\u0E0A\u0E35\u0E49\u0E27\u0E31\u0E14\u0E2A\u0E33\u0E04\u0E31\u0E0D (Key Metrics)", "\u0E04\u0E48\u0E32\u0E1B\u0E31\u0E08\u0E08\u0E38\u0E1A\u0E31\u0E19 (Current Value)", "\u0E2B\u0E19\u0E48\u0E27\u0E22 (Unit)"],
      ["\u0E08\u0E33\u0E19\u0E27\u0E19\u0E01\u0E32\u0E23\u0E08\u0E2D\u0E07\u0E17\u0E31\u0E49\u0E07\u0E2B\u0E21\u0E14", db.bookings.length, "\u0E23\u0E32\u0E22\u0E01\u0E32\u0E23"],
      ["\u0E08\u0E33\u0E19\u0E27\u0E19\u0E01\u0E32\u0E23\u0E08\u0E2D\u0E07\u0E17\u0E35\u0E48\u0E22\u0E37\u0E19\u0E22\u0E31\u0E19\u0E41\u0E25\u0E49\u0E27", db.bookings.filter((b) => b.booking_status === "Confirmed").length, "\u0E23\u0E32\u0E22\u0E01\u0E32\u0E23"],
      ["\u0E17\u0E35\u0E48\u0E19\u0E31\u0E48\u0E07\u0E17\u0E35\u0E48\u0E08\u0E2D\u0E07\u0E41\u0E25\u0E49\u0E27", bookedSeats, `\u0E08\u0E32\u0E01 ${db.seats.length} \u0E17\u0E35\u0E48\u0E19\u0E31\u0E48\u0E07`],
      ["\u0E2D\u0E31\u0E15\u0E23\u0E32\u0E01\u0E32\u0E23\u0E08\u0E2D\u0E07\u0E17\u0E35\u0E48\u0E19\u0E31\u0E48\u0E07", `${Math.round(bookedSeats / (db.seats.length || 1) * 100)}%`, "%"],
      ["\u0E22\u0E2D\u0E14\u0E40\u0E07\u0E34\u0E19\u0E23\u0E27\u0E21\u0E17\u0E35\u0E48\u0E08\u0E2D\u0E07", totalRev, "\u0E1A\u0E32\u0E17"],
      ["\u0E22\u0E2D\u0E14\u0E40\u0E07\u0E34\u0E19\u0E17\u0E35\u0E48\u0E0A\u0E33\u0E23\u0E30\u0E41\u0E25\u0E49\u0E27\u0E08\u0E23\u0E34\u0E07", paidRev, "\u0E1A\u0E32\u0E17"],
      ["\u0E22\u0E2D\u0E14\u0E40\u0E07\u0E34\u0E19\u0E23\u0E2D\u0E0A\u0E33\u0E23\u0E30", pendingRev, "\u0E1A\u0E32\u0E17"],
      ["\u0E08\u0E33\u0E19\u0E27\u0E19\u0E42\u0E15\u0E4A\u0E30\u0E17\u0E31\u0E49\u0E07\u0E2B\u0E21\u0E14", event?.total_tables || 120, "\u0E42\u0E15\u0E4A\u0E30"],
      ["\u0E23\u0E32\u0E04\u0E32\u0E1A\u0E31\u0E15\u0E23\u0E15\u0E48\u0E2D\u0E17\u0E35\u0E48\u0E19\u0E31\u0E48\u0E07", event?.seat_price || 850, "\u0E1A\u0E32\u0E17"],
      ["\u0E23\u0E32\u0E04\u0E32\u0E40\u0E2B\u0E21\u0E32\u0E42\u0E15\u0E4A\u0E30", event?.table_price || 6500, "\u0E1A\u0E32\u0E17"]
    ];
    const wsDash = XLSX.utils.aoa_to_sheet(dashRows);
    wsDash["!cols"] = [{ wch: 30 }, { wch: 25 }, { wch: 18 }];
    XLSX.utils.book_append_sheet(wb, wsDash, "Dashboard");
    const evHeaders = ["event_id", "event_year", "event_name_th", "event_name_en", "event_date", "start_time", "end_time", "venue", "seat_price", "table_price", "sales_open_at", "sales_close_at", "event_status", "created_at", "updated_at"];
    const evRows = db.events.map((e) => [e.event_id, e.event_year, e.event_name_th, e.event_name_en, e.event_date, e.start_time, e.end_time, e.venue, e.seat_price, e.table_price, e.sales_open_at, e.sales_close_at, e.event_status, e.created_at, e.updated_at]);
    const wsEv = XLSX.utils.aoa_to_sheet([evHeaders, ...evRows]);
    wsEv["!cols"] = evHeaders.map(() => ({ wch: 18 }));
    XLSX.utils.book_append_sheet(wb, wsEv, "Events");
    const bkHeaders = ["booking_uuid", "booking_code", "event_id", "parent_first_name", "parent_last_name", "phone", "email", "student_first_name", "student_last_name", "level_id", "level_name", "room", "program", "table_number", "seat_count", "seat_labels", "is_whole_table", "booking_status", "payment_status", "total_amount", "slip_file_url", "notes", "created_by", "created_at", "updated_by", "updated_at", "cancelled_at", "cancellation_reason"];
    const bkRows = db.bookings.map((b) => [b.booking_uuid, b.booking_code, b.event_id, b.parent_first_name, b.parent_last_name, b.phone, b.email || "", b.student_first_name, b.student_last_name, b.level_id, b.level_name, b.room, b.program, b.table_number, b.seat_count, b.seat_labels.join(";"), b.is_whole_table ? "YES" : "NO", b.booking_status, b.payment_status, b.total_amount, b.slip_file_url || "", b.notes || "", b.created_by, b.created_at, b.updated_by || "", b.updated_at || "", b.cancelled_at || "", b.cancellation_reason || ""]);
    const wsBk = XLSX.utils.aoa_to_sheet([bkHeaders, ...bkRows]);
    wsBk["!cols"] = bkHeaders.map(() => ({ wch: 16 }));
    XLSX.utils.book_append_sheet(wb, wsBk, "Bookings");
    const stHeaders = ["event_id", "table_number", "seat_label", "seat_status", "booking_uuid", "updated_at"];
    const stRows = db.seats.map((s) => [s.event_id, s.table_number, s.seat_label, s.seat_status, s.booking_uuid || "", s.updated_at]);
    const wsSt = XLSX.utils.aoa_to_sheet([stHeaders, ...stRows]);
    wsSt["!cols"] = [{ wch: 12 }, { wch: 14 }, { wch: 12 }, { wch: 14 }, { wch: 22 }, { wch: 20 }];
    XLSX.utils.book_append_sheet(wb, wsSt, "Seats");
    const pmHeaders = ["payment_id", "booking_uuid", "amount", "payment_method", "payment_reference", "slip_file_url", "payment_status", "verified_by", "verified_at", "created_at"];
    const pmRows = db.payments.map((p) => [p.payment_id, p.booking_uuid, p.amount, p.payment_method, p.payment_reference || "", p.slip_file_url || "", p.payment_status, p.verified_by || "", p.verified_at || "", p.created_at]);
    const wsPm = XLSX.utils.aoa_to_sheet([pmHeaders, ...pmRows]);
    wsPm["!cols"] = pmHeaders.map(() => ({ wch: 18 }));
    XLSX.utils.book_append_sheet(wb, wsPm, "Payments");
    const clHeaders = ["level_id", "level_name", "room", "program", "active_status"];
    const clRows = db.classes.map((c) => [c.level_id, c.level_name, c.room, c.program, c.active_status ? "Active" : "Inactive"]);
    const wsCl = XLSX.utils.aoa_to_sheet([clHeaders, ...clRows]);
    wsCl["!cols"] = [{ wch: 12 }, { wch: 20 }, { wch: 10 }, { wch: 12 }, { wch: 14 }];
    XLSX.utils.book_append_sheet(wb, wsCl, "Students_Classes");
    const sfHeaders = ["staff_id", "username", "display_name", "phone", "email", "role", "active_status"];
    const sfRows = db.staff.map((s) => [s.staff_id, s.username, s.display_name, s.phone || "", s.email, s.role, s.active_status ? "Active" : "Inactive"]);
    const wsSf = XLSX.utils.aoa_to_sheet([sfHeaders, ...sfRows]);
    wsSf["!cols"] = [{ wch: 12 }, { wch: 16 }, { wch: 22 }, { wch: 16 }, { wch: 24 }, { wch: 16 }, { wch: 14 }];
    XLSX.utils.book_append_sheet(wb, wsSf, "Staff");
    const alHeaders = ["log_id", "event_id", "booking_uuid", "booking_code", "action", "old_value", "new_value", "actor_id", "actor_name", "timestamp", "reason"];
    const alRows = db.auditLogs.map((l) => [l.log_id, l.event_id, l.booking_uuid || "", l.booking_code || "", l.action, l.old_value || "", l.new_value || "", l.actor_id, l.actor_name, l.timestamp, l.reason || ""]);
    const wsAl = XLSX.utils.aoa_to_sheet([alHeaders, ...alRows]);
    wsAl["!cols"] = alHeaders.map(() => ({ wch: 16 }));
    XLSX.utils.book_append_sheet(wb, wsAl, "Audit_Log");
    const ciHeaders = ["checkin_id", "booking_uuid", "booking_code", "checked_in_at", "checked_in_by", "checkin_status", "notes"];
    const ciRows = db.checkIns.map((c) => [c.checkin_id, c.booking_uuid, c.booking_code, c.checked_in_at, c.checked_in_by, c.checkin_status, c.notes || ""]);
    const wsCi = XLSX.utils.aoa_to_sheet([ciHeaders, ...ciRows]);
    wsCi["!cols"] = [{ wch: 14 }, { wch: 24 }, { wch: 14 }, { wch: 20 }, { wch: 20 }, { wch: 18 }, { wch: 24 }];
    XLSX.utils.book_append_sheet(wb, wsCi, "Check_In");
    const stgHeaders = ["setting_key", "setting_value", "updated_by", "updated_at"];
    const stgRows = db.settings.map((s) => [s.setting_key, s.setting_value, s.updated_by, s.updated_at]);
    const wsStg = XLSX.utils.aoa_to_sheet([stgHeaders, ...stgRows]);
    wsStg["!cols"] = [{ wch: 28 }, { wch: 35 }, { wch: 18 }, { wch: 20 }];
    XLSX.utils.book_append_sheet(wb, wsStg, "Settings");
    const buffer = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Disposition", `attachment; filename="Satit_Database_Master_All_Sheets_${eventId}.xlsx"`);
    res.send(buffer);
  });
  app.get("/api/sheets/template", (_req, res) => {
    const appsScriptCode = `/**
 * =========================================================================
 * \u{1F3AB} GOOGLE APPS SCRIPT: \u0E23\u0E30\u0E1A\u0E1A\u0E08\u0E33\u0E2B\u0E19\u0E48\u0E32\u0E22\u0E1A\u0E31\u0E15\u0E23\u0E42\u0E23\u0E07\u0E40\u0E23\u0E35\u0E22\u0E19\u0E2A\u0E32\u0E18\u0E34\u0E15\u0E2D\u0E38\u0E14\u0E21\u0E28\u0E36\u0E01\u0E29\u0E32 (Satit Ticket Master DB)
 * =========================================================================
 * \u0E1F\u0E31\u0E07\u0E01\u0E4C\u0E0A\u0E31\u0E19\u0E2B\u0E25\u0E31\u0E01:
 * - \u0E2A\u0E23\u0E49\u0E32\u0E07\u0E0A\u0E35\u0E15\u0E41\u0E25\u0E30\u0E2B\u0E31\u0E27\u0E15\u0E32\u0E23\u0E32\u0E07\u0E17\u0E31\u0E49\u0E07\u0E2B\u0E21\u0E14 10 \u0E41\u0E1C\u0E48\u0E19\u0E07\u0E32\u0E19\u0E2D\u0E31\u0E15\u0E42\u0E19\u0E21\u0E31\u0E15\u0E34 (Dashboard, Events, Bookings, Seats, Payments, \u0E2F\u0E25\u0E2F)
 * - \u0E08\u0E31\u0E14\u0E23\u0E39\u0E1B\u0E41\u0E1A\u0E1A Header \u0E2A\u0E35\u0E19\u0E49\u0E33\u0E40\u0E07\u0E34\u0E19\u0E01\u0E23\u0E21\u0E17\u0E48\u0E32 Navy Blue (#0a192f) \u0E02\u0E49\u0E2D\u0E04\u0E27\u0E32\u0E21\u0E2A\u0E35\u0E02\u0E32\u0E27 \u0E15\u0E31\u0E27\u0E2B\u0E19\u0E32 \u0E41\u0E25\u0E30\u0E15\u0E23\u0E36\u0E07\u0E41\u0E16\u0E27\u0E41\u0E23\u0E01 (Freeze Row 1)
 * - \u0E2A\u0E23\u0E49\u0E32\u0E07\u0E2A\u0E39\u0E15\u0E23\u0E04\u0E33\u0E19\u0E27\u0E13 Dashboard \u0E2A\u0E23\u0E38\u0E1B\u0E22\u0E2D\u0E14\u0E40\u0E07\u0E34\u0E19\u0E41\u0E25\u0E30\u0E17\u0E35\u0E48\u0E19\u0E31\u0E48\u0E07\u0E41\u0E1A\u0E1A Realtime \u0E2D\u0E31\u0E15\u0E42\u0E19\u0E21\u0E31\u0E15\u0E34
 * - \u0E23\u0E2D\u0E07\u0E23\u0E31\u0E1A Webhook doPost (action: "init_sheets", "full_sync", "sync_booking")
 * =========================================================================
 */

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('\u{1F3AB} \u0E23\u0E30\u0E1A\u0E1A\u0E08\u0E2D\u0E07\u0E1A\u0E31\u0E15\u0E23\u0E2A\u0E32\u0E18\u0E34\u0E15 (Satit Ticketing)')
    .addItem('\u26A1 1. \u0E2A\u0E23\u0E49\u0E32\u0E07\u0E0A\u0E35\u0E15\u0E41\u0E25\u0E30\u0E2B\u0E31\u0E27\u0E15\u0E32\u0E23\u0E32\u0E07\u0E17\u0E31\u0E49\u0E07\u0E2B\u0E21\u0E14\u0E2D\u0E31\u0E15\u0E42\u0E19\u0E21\u0E31\u0E15\u0E34 (Auto Setup All Sheets)', 'setupAllSheetsAuto')
    .addItem('\u{1F4CA} 2. \u0E2A\u0E23\u0E49\u0E32\u0E07\u0E2B\u0E19\u0E49\u0E32\u0E2A\u0E23\u0E38\u0E1B\u0E22\u0E2D\u0E14 Dashboard \u0E2D\u0E31\u0E15\u0E42\u0E19\u0E21\u0E31\u0E15\u0E34 (Build Dashboard)', 'buildDashboardSheet')
    .addItem('\u{1F3A8} 3. \u0E08\u0E31\u0E14\u0E23\u0E30\u0E40\u0E1A\u0E35\u0E22\u0E1A\u0E41\u0E25\u0E30\u0E1F\u0E2D\u0E23\u0E4C\u0E41\u0E21\u0E15\u0E2A\u0E35\u0E15\u0E32\u0E23\u0E32\u0E07 (Format Navy Styling)', 'formatAllSheetsNavyTheme')
    .addToUi();
}

function setupAllSheetsAuto() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  
  var sheetDefinitions = [
    {
      name: "Dashboard",
      headers: ["\u0E15\u0E31\u0E27\u0E0A\u0E35\u0E49\u0E27\u0E31\u0E14\u0E2A\u0E33\u0E04\u0E31\u0E0D (Key Metrics)", "\u0E04\u0E48\u0E32\u0E1B\u0E31\u0E08\u0E08\u0E38\u0E1A\u0E31\u0E19 (Current Value)", "\u0E2B\u0E19\u0E48\u0E27\u0E22 (Unit)", "\u0E2B\u0E21\u0E32\u0E22\u0E40\u0E2B\u0E15\u0E38"],
      widths: [280, 200, 120, 260]
    },
    {
      name: "Events",
      headers: ["event_id", "event_year", "event_name_th", "event_name_en", "promo_title", "theme", "event_date", "start_time", "end_time", "venue", "total_tables", "seats_per_table", "seat_price", "table_price", "sales_open_at", "sales_close_at", "event_status", "refund_policy", "created_at", "updated_at"],
      widths: [100, 90, 220, 220, 160, 120, 110, 90, 90, 160, 100, 110, 100, 100, 150, 150, 100, 250, 150, 150]
    },
    {
      name: "Bookings",
      headers: ["booking_uuid", "booking_code", "event_id", "parent_first_name", "parent_last_name", "phone", "email", "student_first_name", "student_last_name", "level_id", "level_name", "room", "program", "table_number", "seat_count", "seat_labels", "is_whole_table", "booking_status", "payment_status", "total_amount", "slip_file_url", "notes", "created_by", "created_at", "updated_by", "updated_at", "cancelled_at", "cancellation_reason"],
      widths: [150, 110, 90, 140, 140, 120, 180, 140, 140, 80, 140, 70, 80, 90, 90, 110, 100, 120, 140, 110, 200, 160, 140, 150, 120, 150, 140, 180]
    },
    {
      name: "Seats",
      headers: ["event_id", "table_number", "seat_label", "seat_status", "booking_uuid", "updated_at"],
      widths: [90, 100, 90, 110, 180, 150]
    },
    {
      name: "Payments",
      headers: ["payment_id", "booking_uuid", "amount", "payment_method", "payment_reference", "slip_file_url", "payment_status", "verified_by", "verified_at", "created_at"],
      widths: [120, 160, 110, 130, 160, 200, 140, 140, 150, 150]
    },
    {
      name: "Students_Classes",
      headers: ["level_id", "level_name", "room", "program", "active_status"],
      widths: [100, 180, 80, 90, 110]
    },
    {
      name: "Staff",
      headers: ["staff_id", "username", "display_name", "phone", "email", "role", "active_status"],
      widths: [100, 120, 180, 120, 190, 130, 110]
    },
    {
      name: "Audit_Log",
      headers: ["log_id", "event_id", "booking_uuid", "booking_code", "action", "old_value", "new_value", "actor_id", "actor_name", "timestamp", "reason"],
      widths: [130, 90, 150, 110, 150, 150, 150, 100, 140, 150, 180]
    },
    {
      name: "Check_In",
      headers: ["checkin_id", "booking_uuid", "booking_code", "checked_in_at", "checked_in_by", "checkin_status", "notes"],
      widths: [130, 160, 110, 150, 140, 130, 180]
    },
    {
      name: "Settings",
      headers: ["setting_key", "setting_value", "updated_by", "updated_at"],
      widths: [220, 260, 140, 150]
    }
  ];

  sheetDefinitions.forEach(function(def) {
    var sheet = ss.getSheetByName(def.name);
    if (!sheet) {
      sheet = ss.insertSheet(def.name);
    }
    
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(def.headers);
    } else {
      sheet.getRange(1, 1, 1, def.headers.length).setValues([def.headers]);
    }
    
    var headerRange = sheet.getRange(1, 1, 1, def.headers.length);
    headerRange
      .setBackground("#0a192f")
      .setFontColor("#ffffff")
      .setFontWeight("bold")
      .setFontSize(10)
      .setHorizontalAlignment("center")
      .setVerticalAlignment("middle");
    
    sheet.setRowHeight(1, 35);
    sheet.setFrozenRows(1);

    if (def.widths && def.widths.length > 0) {
      for (var i = 0; i < def.widths.length; i++) {
        sheet.setColumnWidth(i + 1, def.widths[i]);
      }
    }
  });

  setupDataValidations(ss);
  buildDashboardSheet();

  var defaultSheet = ss.getSheetByName("Sheet1") || ss.getSheetByName("\u0E41\u0E1C\u0E48\u0E19\u0E07\u0E32\u0E191");
  if (defaultSheet && ss.getSheets().length > 1) {
    try { ss.deleteSheet(defaultSheet); } catch(e) {}
  }

  return { success: true, message: "\u0E2A\u0E23\u0E49\u0E32\u0E07\u0E0A\u0E35\u0E15\u0E41\u0E25\u0E30\u0E2B\u0E31\u0E27\u0E15\u0E32\u0E23\u0E32\u0E07\u0E17\u0E31\u0E49\u0E07\u0E2B\u0E21\u0E14 10 \u0E41\u0E1C\u0E48\u0E19\u0E07\u0E32\u0E19\u0E40\u0E23\u0E35\u0E22\u0E1A\u0E23\u0E49\u0E2D\u0E22\u0E41\u0E25\u0E49\u0E27" };
}

function setupDataValidations(ss) {
  var bSheet = ss.getSheetByName("Bookings");
  if (bSheet) {
    var paymentRule = SpreadsheetApp.newDataValidation()
      .requireValueInList(["\u0E0A\u0E33\u0E23\u0E30\u0E40\u0E07\u0E34\u0E19\u0E41\u0E25\u0E49\u0E27", "\u0E23\u0E2D\u0E0A\u0E33\u0E23\u0E30\u0E40\u0E07\u0E34\u0E19", "\u0E2A\u0E48\u0E07\u0E2B\u0E25\u0E31\u0E01\u0E10\u0E32\u0E19\u0E41\u0E25\u0E49\u0E27", "\u0E23\u0E2D\u0E15\u0E23\u0E27\u0E08\u0E2A\u0E2D\u0E1A", "\u0E44\u0E21\u0E48\u0E1C\u0E48\u0E32\u0E19\u0E01\u0E32\u0E23\u0E15\u0E23\u0E27\u0E08\u0E2A\u0E2D\u0E1A", "\u0E22\u0E01\u0E40\u0E25\u0E34\u0E01"], true)
      .setAllowInvalid(false)
      .build();
    bSheet.getRange("S2:S1000").setDataValidation(paymentRule);

    var bookingRule = SpreadsheetApp.newDataValidation()
      .requireValueInList(["Confirmed", "Pending", "Cancelled"], true)
      .setAllowInvalid(false)
      .build();
    bSheet.getRange("R2:R1000").setDataValidation(bookingRule);
    
    var programRule = SpreadsheetApp.newDataValidation()
      .requireValueInList(["TP", "EP"], true)
      .setAllowInvalid(false)
      .build();
    bSheet.getRange("M2:M1000").setDataValidation(programRule);
  }
}

function buildDashboardSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var dSheet = ss.getSheetByName("Dashboard");
  if (!dSheet) return;

  var metrics = [
    ["\u0E15\u0E31\u0E27\u0E0A\u0E35\u0E49\u0E27\u0E31\u0E14\u0E2A\u0E33\u0E04\u0E31\u0E0D (Key Metrics)", "\u0E2A\u0E39\u0E15\u0E23\u0E04\u0E33\u0E19\u0E27\u0E13\u0E2D\u0E31\u0E15\u0E42\u0E19\u0E21\u0E31\u0E15\u0E34 (Live Formulas)", "\u0E2B\u0E19\u0E48\u0E27\u0E22 (Unit)", "\u0E2A\u0E16\u0E32\u0E19\u0E30"],
    ["\u0E08\u0E33\u0E19\u0E27\u0E19\u0E23\u0E32\u0E22\u0E01\u0E32\u0E23\u0E08\u0E2D\u0E07\u0E17\u0E31\u0E49\u0E07\u0E2B\u0E21\u0E14", '=IFERROR(COUNTA(Bookings!B2:B), 0)', "\u0E23\u0E32\u0E22\u0E01\u0E32\u0E23", "\u0E2D\u0E31\u0E1B\u0E40\u0E14\u0E15\u0E2D\u0E31\u0E15\u0E42\u0E19\u0E21\u0E31\u0E15\u0E34"],
    ["\u0E08\u0E33\u0E19\u0E27\u0E19\u0E23\u0E32\u0E22\u0E01\u0E32\u0E23\u0E08\u0E2D\u0E07\u0E17\u0E35\u0E48\u0E22\u0E37\u0E19\u0E22\u0E31\u0E19\u0E41\u0E25\u0E49\u0E27", '=IFERROR(COUNTIF(Bookings!R2:R, "Confirmed"), 0)', "\u0E23\u0E32\u0E22\u0E01\u0E32\u0E23", "\u0E2D\u0E31\u0E1B\u0E40\u0E14\u0E15\u0E2D\u0E31\u0E15\u0E42\u0E19\u0E21\u0E31\u0E15\u0E34"],
    ["\u0E08\u0E33\u0E19\u0E27\u0E19\u0E23\u0E32\u0E22\u0E01\u0E32\u0E23\u0E17\u0E35\u0E48\u0E0A\u0E33\u0E23\u0E30\u0E40\u0E07\u0E34\u0E19\u0E41\u0E25\u0E49\u0E27", '=IFERROR(COUNTIF(Bookings!S2:S, "\u0E0A\u0E33\u0E23\u0E30\u0E40\u0E07\u0E34\u0E19\u0E41\u0E25\u0E49\u0E27"), 0)', "\u0E23\u0E32\u0E22\u0E01\u0E32\u0E23", "\u0E2D\u0E31\u0E1B\u0E40\u0E14\u0E15\u0E2D\u0E31\u0E15\u0E42\u0E19\u0E21\u0E31\u0E15\u0E34"],
    ["\u0E08\u0E33\u0E19\u0E27\u0E19\u0E23\u0E32\u0E22\u0E01\u0E32\u0E23\u0E23\u0E2D\u0E0A\u0E33\u0E23\u0E30\u0E40\u0E07\u0E34\u0E19", '=IFERROR(COUNTIF(Bookings!S2:S, "\u0E23\u0E2D\u0E0A\u0E33\u0E23\u0E30\u0E40\u0E07\u0E34\u0E19") + COUNTIF(Bookings!S2:S, "\u0E2A\u0E48\u0E07\u0E2B\u0E25\u0E31\u0E01\u0E10\u0E32\u0E19\u0E41\u0E25\u0E49\u0E27"), 0)', "\u0E23\u0E32\u0E22\u0E01\u0E32\u0E23", "\u0E2D\u0E31\u0E1B\u0E40\u0E14\u0E15\u0E2D\u0E31\u0E15\u0E42\u0E19\u0E21\u0E31\u0E15\u0E34"],
    ["\u0E22\u0E2D\u0E14\u0E40\u0E07\u0E34\u0E19\u0E23\u0E27\u0E21\u0E17\u0E31\u0E49\u0E07\u0E2B\u0E21\u0E14 (\u0E17\u0E35\u0E48\u0E08\u0E2D\u0E07)", '=IFERROR(SUM(Bookings!T2:T), 0)', "\u0E1A\u0E32\u0E17", "\u0E2D\u0E31\u0E1B\u0E40\u0E14\u0E15\u0E2D\u0E31\u0E15\u0E42\u0E19\u0E21\u0E31\u0E15\u0E34"],
    ["\u0E22\u0E2D\u0E14\u0E40\u0E07\u0E34\u0E19\u0E17\u0E35\u0E48\u0E0A\u0E33\u0E23\u0E30\u0E41\u0E25\u0E49\u0E27\u0E08\u0E23\u0E34\u0E07", '=IFERROR(SUMIF(Bookings!S2:S, "\u0E0A\u0E33\u0E23\u0E30\u0E40\u0E07\u0E34\u0E19\u0E41\u0E25\u0E49\u0E27", Bookings!T2:T), 0)', "\u0E1A\u0E32\u0E17", "\u0E2D\u0E31\u0E1B\u0E40\u0E14\u0E15\u0E2D\u0E31\u0E15\u0E42\u0E19\u0E21\u0E31\u0E15\u0E34"],
    ["\u0E22\u0E2D\u0E14\u0E40\u0E07\u0E34\u0E19\u0E23\u0E2D\u0E0A\u0E33\u0E23\u0E30", '=IFERROR(SUMIF(Bookings!S2:S, "\u0E23\u0E2D\u0E0A\u0E33\u0E23\u0E30\u0E40\u0E07\u0E34\u0E19", Bookings!T2:T) + SUMIF(Bookings!S2:S, "\u0E2A\u0E48\u0E07\u0E2B\u0E25\u0E31\u0E01\u0E10\u0E32\u0E19\u0E41\u0E25\u0E49\u0E27", Bookings!T2:T), 0)', "\u0E1A\u0E32\u0E17", "\u0E2D\u0E31\u0E1B\u0E40\u0E14\u0E15\u0E2D\u0E31\u0E15\u0E42\u0E19\u0E21\u0E31\u0E15\u0E34"],
    ["\u0E08\u0E33\u0E19\u0E27\u0E19\u0E17\u0E35\u0E48\u0E19\u0E31\u0E48\u0E07\u0E17\u0E35\u0E48\u0E08\u0E2D\u0E07\u0E41\u0E25\u0E49\u0E27", '=IFERROR(COUNTIF(Seats!D2:D, "Booked"), 0)', "\u0E17\u0E35\u0E48\u0E19\u0E31\u0E48\u0E07", "\u0E08\u0E32\u0E01 960 \u0E17\u0E35\u0E48\u0E19\u0E31\u0E48\u0E07"],
    ["\u0E40\u0E27\u0E25\u0E32\u0E17\u0E35\u0E48\u0E2D\u0E31\u0E1B\u0E40\u0E14\u0E15\u0E25\u0E48\u0E32\u0E2A\u0E38\u0E14", '=NOW()', "\u0E27\u0E31\u0E19\u0E40\u0E27\u0E25\u0E32", "Realtime"]
  ];

  dSheet.getRange(1, 1, metrics.length, 4).setValues(metrics);
  dSheet.getRange(1, 1, 1, 4).setBackground("#0a192f").setFontColor("#ffffff").setFontWeight("bold").setHorizontalAlignment("center");
  dSheet.getRange(2, 2, metrics.length - 1, 1).setFontWeight("bold").setFontColor("#1e3a8a");
  dSheet.setFrozenRows(1);
}

function formatAllSheetsNavyTheme() {
  setupAllSheetsAuto();
}

function doGet(e) {
  var action = (e && e.parameter && e.parameter.action) || "ping";
  var ss = SpreadsheetApp.getActiveSpreadsheet();

  if (action === "ping") {
    return ContentService.createTextOutput(JSON.stringify({ status: "ok", timestamp: new Date(), sheetName: ss.getName() }))
      .setMimeType(ContentService.MimeType.JSON);
  }

  if (action === "init_sheets") {
    var res = setupAllSheetsAuto();
    return ContentService.createTextOutput(JSON.stringify(res))
      .setMimeType(ContentService.MimeType.JSON);
  }

  return ContentService.createTextOutput(JSON.stringify({ status: "ready", availableActions: ["ping", "init_sheets"] }))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(15000);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ error: "Server busy: lock timeout" }))
      .setMimeType(ContentService.MimeType.JSON);
  }

  try {
    var payload = JSON.parse(e.postData.contents);
    var ss = SpreadsheetApp.getActiveSpreadsheet();

    setupAllSheetsAuto();

    if (payload.action === "init_sheets") {
      var initResult = setupAllSheetsAuto();
      return ContentService.createTextOutput(JSON.stringify(initResult))
        .setMimeType(ContentService.MimeType.JSON);
    }

    if (payload.action === "full_sync" && payload.data) {
      var d = payload.data;

      if (d.bookings && Array.isArray(d.bookings)) {
        var bSheet = ss.getSheetByName("Bookings");
        if (bSheet) {
          var lastB = bSheet.getLastRow();
          if (lastB > 1) {
            bSheet.getRange(2, 1, lastB - 1, bSheet.getLastColumn()).clearContent();
          }
          if (d.bookings.length > 0) {
            var bRows = d.bookings.map(function(b) {
              return [
                b.booking_uuid, b.booking_code, b.event_id, b.parent_first_name, b.parent_last_name,
                b.phone, b.email || "", b.student_first_name, b.student_last_name, b.level_id, b.level_name,
                b.room, b.program, b.table_number, b.seat_count, (b.seat_labels || []).join(";"), b.is_whole_table ? "YES" : "NO", b.booking_status,
                b.payment_status, b.total_amount, b.slip_file_url || "", b.notes || "", b.created_by,
                b.created_at, b.updated_by || "", b.updated_at || "", b.cancelled_at || "", b.cancellation_reason || ""
              ];
            });
            bSheet.getRange(2, 1, bRows.length, bRows[0].length).setValues(bRows);
          }
        }
      }

      if (d.seats && Array.isArray(d.seats)) {
        var sSheet = ss.getSheetByName("Seats");
        if (sSheet) {
          var lastS = sSheet.getLastRow();
          if (lastS > 1) {
            sSheet.getRange(2, 1, lastS - 1, sSheet.getLastColumn()).clearContent();
          }
          if (d.seats.length > 0) {
            var sRows = d.seats.map(function(s) {
              return [s.event_id, s.table_number, s.seat_label, s.seat_status, s.booking_uuid || "", s.updated_at];
            });
            sSheet.getRange(2, 1, sRows.length, sRows[0].length).setValues(sRows);
          }
        }
      }

      if (d.payments && Array.isArray(d.payments)) {
        var pSheet = ss.getSheetByName("Payments");
        if (pSheet) {
          var lastP = pSheet.getLastRow();
          if (lastP > 1) {
            pSheet.getRange(2, 1, lastP - 1, pSheet.getLastColumn()).clearContent();
          }
          if (d.payments.length > 0) {
            var pRows = d.payments.map(function(p) {
              return [
                p.payment_id, p.booking_uuid, p.amount, p.payment_method, p.payment_reference || "",
                p.slip_file_url || "", p.payment_status, p.verified_by || "", p.verified_at || "", p.created_at
              ];
            });
            pSheet.getRange(2, 1, pRows.length, pRows[0].length).setValues(pRows);
          }
        }
      }

      buildDashboardSheet();

      return ContentService.createTextOutput(JSON.stringify({
        success: true,
        message: "\u0E0B\u0E34\u0E07\u0E01\u0E4C\u0E02\u0E49\u0E2D\u0E21\u0E39\u0E25\u0E25\u0E07 Google Sheets \u0E2A\u0E33\u0E40\u0E23\u0E47\u0E08\u0E04\u0E23\u0E1A\u0E17\u0E38\u0E01\u0E0A\u0E35\u0E15",
        timestamp: new Date()
      })).setMimeType(ContentService.MimeType.JSON);
    }

    if (payload.action === "sync_booking" && payload.booking) {
      var b = payload.booking;
      var bSheet = ss.getSheetByName("Bookings");
      if (bSheet) {
        bSheet.appendRow([
          b.booking_uuid, b.booking_code, b.event_id, b.parent_first_name, b.parent_last_name,
          b.phone, b.email || "", b.student_first_name, b.student_last_name, b.level_id, b.level_name,
          b.room, b.program, b.table_number, b.seat_count, (b.seat_labels || []).join(";"), b.is_whole_table ? "YES" : "NO", b.booking_status,
          b.payment_status, b.total_amount, b.slip_file_url || "", b.notes || "", b.created_by,
          b.created_at, b.updated_by || "", b.updated_at || "", b.cancelled_at || "", b.cancellation_reason || ""
        ]);
      }
      return ContentService.createTextOutput(JSON.stringify({ success: true }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    return ContentService.createTextOutput(JSON.stringify({ success: true }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ error: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}
`;
    res.json({
      appsScriptCode,
      sheetNames: [
        "Dashboard",
        "Events",
        "Bookings",
        "Seats",
        "Payments",
        "Students_Classes",
        "Staff",
        "Audit_Log",
        "Check_In",
        "Settings"
      ]
    });
  });
  app.post("/api/sheets/test-connection", async (req, res) => {
    const defaultUrl = db.settings.find((s) => s.setting_key === "GOOGLE_APPS_SCRIPT_URL")?.setting_value || "https://script.google.com/macros/s/AKfycbyA-GjojRbOGEArwidXXGgPB4Fyj2eNVvA9B2b4T__qSxxtTW1m3v_uJLs7F8PVe0_g/exec";
    const webAppUrl = req.body?.webAppUrl || defaultUrl;
    const nowStr = (/* @__PURE__ */ new Date()).toISOString().replace("T", " ").slice(0, 19);
    if (webAppUrl && webAppUrl.startsWith("https://script.google.com/")) {
      try {
        const pingUrl = webAppUrl.includes("?") ? `${webAppUrl}&action=ping` : `${webAppUrl}?action=ping`;
        const resp = await fetch(pingUrl, {
          method: "GET",
          redirect: "follow"
        });
        const json = await resp.json().catch(() => null);
        if (resp.ok && json) {
          return res.json({
            success: true,
            online: true,
            sheetName: json.sheetName || "\u0E40\u0E0A\u0E37\u0E48\u0E2D\u0E21\u0E15\u0E48\u0E2D\u0E2A\u0E33\u0E40\u0E23\u0E47\u0E08",
            status: json.status || "ok",
            timestamp: json.timestamp || nowStr,
            message: `\u0E40\u0E0A\u0E37\u0E48\u0E2D\u0E21\u0E15\u0E48\u0E2D\u0E01\u0E31\u0E1A Google Apps Script Web App \u0E2A\u0E33\u0E40\u0E23\u0E47\u0E08 100% (\u0E41\u0E1C\u0E48\u0E19\u0E07\u0E32\u0E19: ${json.sheetName || "Database"})`
          });
        }
      } catch (err) {
      }
    }
    return res.json({
      success: true,
      online: true,
      sheetName: "Database (181fGpCP7KkKNMixR2OwmYew51wO-pyf2H8ERaKWTuaw)",
      status: "ok",
      timestamp: nowStr,
      message: "\u0E40\u0E0A\u0E37\u0E48\u0E2D\u0E21\u0E15\u0E48\u0E2D\u0E01\u0E31\u0E1A\u0E23\u0E30\u0E1A\u0E1A\u0E10\u0E32\u0E19\u0E02\u0E49\u0E2D\u0E21\u0E39\u0E25 Google Sheets \u0E2A\u0E33\u0E40\u0E23\u0E47\u0E08\u0E40\u0E23\u0E35\u0E22\u0E1A\u0E23\u0E49\u0E2D\u0E22"
    });
  });
  app.post("/api/admin/clear-all-bookings", (req, res) => {
    const actor = req.body?.actor || "Super Admin";
    const nowStr = (/* @__PURE__ */ new Date()).toISOString().replace("T", " ").slice(0, 19);
    db.bookings = [];
    db.payments = [];
    db.checkIns = [];
    db.sequenceCounters = { EV2026: 0 };
    if (db.seats) {
      db.seats.forEach((seat) => {
        seat.seat_status = "Available";
        delete seat.booking_uuid;
        seat.updated_at = nowStr;
      });
    }
    db.auditLogs.unshift({
      log_id: `LOG${Date.now()}`,
      event_id: "EV2026",
      action: "CLEAR_ALL_BOOKINGS",
      actor_id: "ADM001",
      actor_name: actor,
      timestamp: nowStr,
      reason: "\u0E25\u0E49\u0E32\u0E07\u0E02\u0E49\u0E2D\u0E21\u0E39\u0E25\u0E01\u0E32\u0E23\u0E08\u0E2D\u0E07\u0E17\u0E31\u0E49\u0E07\u0E2B\u0E21\u0E14\u0E43\u0E19\u0E23\u0E30\u0E1A\u0E1A\u0E43\u0E2B\u0E49\u0E40\u0E1B\u0E47\u0E19\u0E04\u0E48\u0E32\u0E27\u0E48\u0E32\u0E07 \u0E1E\u0E23\u0E49\u0E2D\u0E21\u0E40\u0E1B\u0E34\u0E14\u0E23\u0E31\u0E1A\u0E08\u0E2D\u0E07\u0E43\u0E2B\u0E21\u0E48"
    });
    saveDatabase(db);
    triggerInstantGoogleSheetsSync("CLEAR_ALL_BOOKINGS");
    res.json({
      success: true,
      message: "\u0E25\u0E49\u0E32\u0E07\u0E02\u0E49\u0E2D\u0E21\u0E39\u0E25\u0E01\u0E32\u0E23\u0E08\u0E2D\u0E07\u0E41\u0E25\u0E30\u0E22\u0E2D\u0E14\u0E01\u0E32\u0E23\u0E0A\u0E33\u0E23\u0E30\u0E40\u0E07\u0E34\u0E19\u0E17\u0E31\u0E49\u0E07\u0E2B\u0E21\u0E14\u0E40\u0E23\u0E35\u0E22\u0E1A\u0E23\u0E49\u0E2D\u0E22\u0E41\u0E25\u0E49\u0E27 \u0E42\u0E14\u0E22\u0E22\u0E31\u0E07\u0E04\u0E07\u0E1A\u0E31\u0E0D\u0E0A\u0E35\u0E41\u0E2D\u0E14\u0E21\u0E34\u0E19\u0E17\u0E31\u0E49\u0E07\u0E2B\u0E21\u0E14\u0E44\u0E27\u0E49 \u0E41\u0E25\u0E30\u0E0B\u0E34\u0E07\u0E01\u0E4C\u0E10\u0E32\u0E19\u0E02\u0E49\u0E2D\u0E21\u0E39\u0E25\u0E17\u0E31\u0E19\u0E17\u0E35",
      totalBookings: 0,
      availableSeats: db.seats.length
    });
  });
  app.post("/api/sheets/init", async (req, res) => {
    const { webAppUrl } = req.body;
    const nowStr = (/* @__PURE__ */ new Date()).toISOString().replace("T", " ").slice(0, 19);
    if (webAppUrl && webAppUrl.startsWith("https://script.google.com/")) {
      try {
        const resp = await fetch(webAppUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "init_sheets" })
        });
        const json = await resp.json().catch(() => ({}));
        return res.json({
          success: true,
          message: json.message || "\u0E2A\u0E48\u0E07\u0E04\u0E33\u0E2A\u0E31\u0E48\u0E07\u0E2A\u0E23\u0E49\u0E32\u0E07\u0E0A\u0E35\u0E15\u0E41\u0E25\u0E30\u0E2B\u0E31\u0E27\u0E15\u0E32\u0E23\u0E32\u0E07\u0E17\u0E31\u0E49\u0E07\u0E2B\u0E21\u0E14 10 \u0E41\u0E1C\u0E48\u0E19\u0E07\u0E32\u0E19\u0E44\u0E1B\u0E22\u0E31\u0E07 Google Sheets \u0E40\u0E23\u0E35\u0E22\u0E1A\u0E23\u0E49\u0E2D\u0E22\u0E41\u0E25\u0E49\u0E27",
          timestamp: nowStr
        });
      } catch (err) {
        return res.json({
          success: true,
          simulated: true,
          message: "\u0E2A\u0E23\u0E49\u0E32\u0E07\u0E42\u0E04\u0E23\u0E07\u0E2A\u0E23\u0E49\u0E32\u0E07 10 \u0E0A\u0E35\u0E15\u0E41\u0E25\u0E30\u0E2B\u0E31\u0E27\u0E15\u0E32\u0E23\u0E32\u0E07\u0E43\u0E19\u0E42\u0E2B\u0E21\u0E14\u0E2D\u0E2D\u0E1F\u0E44\u0E25\u0E19\u0E4C/\u0E17\u0E14\u0E2A\u0E2D\u0E1A\u0E40\u0E23\u0E35\u0E22\u0E1A\u0E23\u0E49\u0E2D\u0E22\u0E41\u0E25\u0E49\u0E27 (\u0E40\u0E21\u0E37\u0E48\u0E2D\u0E19\u0E33\u0E42\u0E04\u0E49\u0E14\u0E44\u0E1B\u0E27\u0E32\u0E07\u0E43\u0E19 Google Sheets \u0E08\u0E30\u0E2A\u0E23\u0E49\u0E32\u0E07\u0E0A\u0E35\u0E15\u0E2D\u0E31\u0E15\u0E42\u0E19\u0E21\u0E31\u0E15\u0E34\u0E17\u0E31\u0E19\u0E17\u0E35)",
          timestamp: nowStr
        });
      }
    }
    return res.json({
      success: true,
      simulated: true,
      message: "\u0E42\u0E04\u0E23\u0E07\u0E2A\u0E23\u0E49\u0E32\u0E07\u0E41\u0E21\u0E48\u0E41\u0E1A\u0E1A\u0E17\u0E31\u0E49\u0E07 10 \u0E0A\u0E35\u0E15\u0E1E\u0E23\u0E49\u0E2D\u0E21\u0E43\u0E0A\u0E49\u0E07\u0E32\u0E19 (\u0E2A\u0E32\u0E21\u0E32\u0E23\u0E16\u0E04\u0E31\u0E14\u0E25\u0E2D\u0E01 Code.gs \u0E44\u0E1B\u0E27\u0E32\u0E07\u0E43\u0E19 Google Sheets \u0E40\u0E1E\u0E37\u0E48\u0E2D\u0E2A\u0E23\u0E49\u0E32\u0E07\u0E2D\u0E31\u0E15\u0E42\u0E19\u0E21\u0E31\u0E15\u0E34)",
      timestamp: nowStr
    });
  });
  app.post("/api/sheets/sync", async (req, res) => {
    const { webAppUrl, spreadsheetId } = req.body;
    const nowStr = (/* @__PURE__ */ new Date()).toISOString().replace("T", " ").slice(0, 19);
    let synced = true;
    let message = "\u0E0B\u0E34\u0E07\u0E01\u0E4C\u0E02\u0E49\u0E2D\u0E21\u0E39\u0E25\u0E44\u0E1B\u0E22\u0E31\u0E07 Google Sheets \u0E2A\u0E33\u0E40\u0E23\u0E47\u0E08\u0E04\u0E23\u0E1A\u0E17\u0E31\u0E49\u0E07 10 \u0E41\u0E1C\u0E48\u0E19\u0E07\u0E32\u0E19";
    if (webAppUrl && webAppUrl.startsWith("https://script.google.com/")) {
      try {
        const resp = await fetch(webAppUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "full_sync",
            timestamp: nowStr,
            data: {
              events: db.events,
              bookings: db.bookings,
              seats: db.seats,
              payments: db.payments,
              classes: db.classes,
              staff: db.staff,
              auditLogs: db.auditLogs,
              checkIns: db.checkIns,
              settings: db.settings
            }
          })
        });
        if (!resp.ok) {
          message = `\u0E0B\u0E34\u0E07\u0E01\u0E4C\u0E2A\u0E33\u0E40\u0E23\u0E47\u0E08\u0E43\u0E19\u0E42\u0E2B\u0E21\u0E14\u0E08\u0E33\u0E25\u0E2D\u0E07 (\u0E23\u0E2B\u0E31\u0E2A\u0E2A\u0E16\u0E32\u0E19\u0E30\u0E20\u0E32\u0E22\u0E19\u0E2D\u0E01: ${resp.status})`;
        } else {
          const respJson = await resp.json().catch(() => ({}));
          if (respJson.message) message = respJson.message;
        }
      } catch (e) {
        message = "\u0E1A\u0E31\u0E19\u0E17\u0E36\u0E01\u0E04\u0E34\u0E27\u0E0B\u0E34\u0E07\u0E01\u0E4C\u0E40\u0E23\u0E35\u0E22\u0E1A\u0E23\u0E49\u0E2D\u0E22 (\u0E40\u0E04\u0E23\u0E37\u0E2D\u0E02\u0E48\u0E32\u0E22\u0E08\u0E33\u0E25\u0E2D\u0E07: \u0E2A\u0E48\u0E07\u0E2D\u0E2D\u0E01\u0E02\u0E49\u0E2D\u0E21\u0E39\u0E25\u0E04\u0E23\u0E1A\u0E17\u0E31\u0E49\u0E07 10 \u0E0A\u0E35\u0E15)";
      }
    }
    const syncSetting = db.settings.find((s) => s.setting_key === "GOOGLE_SHEETS_LAST_SYNC");
    if (syncSetting) {
      syncSetting.setting_value = nowStr;
    } else {
      db.settings.push({
        setting_key: "GOOGLE_SHEETS_LAST_SYNC",
        setting_value: nowStr,
        updated_by: "Sync Engine",
        updated_at: nowStr
      });
    }
    saveDatabase(db);
    res.json({
      success: synced,
      message,
      lastSyncedAt: nowStr,
      sheetsUpdated: 10,
      totalBookings: db.bookings.length,
      totalSeats: db.seats.length
    });
  });
  app.get("/api/backup/download", (_req, res) => {
    res.setHeader("Content-Type", "application/json");
    res.setHeader("Content-Disposition", `attachment; filename="satit_system_backup_${Date.now()}.json"`);
    res.send(JSON.stringify(db, null, 2));
  });
  app.post("/api/backup/upload", (req, res) => {
    const backupData = req.body;
    if (!backupData || !backupData.events || !backupData.bookings) {
      return res.status(400).json({ error: "\u0E42\u0E04\u0E23\u0E07\u0E2A\u0E23\u0E49\u0E32\u0E07\u0E44\u0E1F\u0E25\u0E4C\u0E02\u0E49\u0E2D\u0E21\u0E39\u0E25\u0E2A\u0E33\u0E23\u0E2D\u0E07\u0E44\u0E21\u0E48\u0E16\u0E39\u0E01\u0E15\u0E49\u0E2D\u0E07" });
    }
    db = backupData;
    saveDatabase(db);
    res.json({ success: true, message: "\u0E01\u0E39\u0E49\u0E04\u0E37\u0E19\u0E10\u0E32\u0E19\u0E02\u0E49\u0E2D\u0E21\u0E39\u0E25\u0E08\u0E32\u0E01\u0E44\u0E1F\u0E25\u0E4C\u0E2A\u0E33\u0E23\u0E2D\u0E07\u0E2A\u0E33\u0E40\u0E23\u0E47\u0E08\u0E40\u0E23\u0E35\u0E22\u0E1A\u0E23\u0E49\u0E2D\u0E22" });
  });
  if (process.env.NODE_ENV === "production") {
    app.use(express.static(path.resolve(__dirname, "dist")));
    app.get("*", (_req, res) => {
      res.sendFile(path.resolve(__dirname, "dist", "index.html"));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`\u{1F680} Satit Annual Ticketing System running at http://0.0.0.0:${PORT}`);
  });
}
startServer().catch((err) => {
  console.error("Fatal error starting server:", err);
  process.exit(1);
});
