require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const xlsx = require('xlsx');
const path = require('path');
const fs = require('fs');
const { DateTime } = require('luxon');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const app = express();
const PORT = process.env.PORT || 5000;
const SECRET = process.env.JWT_SECRET || 'fallback_secret';

app.use(cors());
app.use(bodyParser.json());

// Middleware: Removed authentication to allow direct access
const authenticate = (req, res, next) => {
    next();
};

const DATA_DIR = path.join(__dirname, 'data');
if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR);
}

// Helper to get or create Excel file
const getExcelFile = (type) => {
    const month = DateTime.now().toFormat('yyyy_MM');
    const filename = `${type}_${month}.xlsx`;
    const filePath = path.join(DATA_DIR, filename);

    let workbook;
    if (fs.existsSync(filePath)) {
        workbook = xlsx.readFile(filePath);
    } else {
        workbook = xlsx.utils.book_new();
    }
    return { workbook, filePath };
};

// API: Save Billing
app.post('/api/bill', authenticate, (req, res) => {
    try {
        const data = req.body;
        const { workbook, filePath } = getExcelFile('billing');

        let sheetName = 'Bills';
        let worksheet = workbook.Sheets[sheetName];

        const rows = worksheet ? xlsx.utils.sheet_to_json(worksheet) : [];
        rows.push(data);

        const newWorksheet = xlsx.utils.json_to_sheet(rows);
        if (!worksheet) {
            xlsx.utils.book_append_sheet(workbook, newWorksheet, sheetName);
        } else {
            workbook.Sheets[sheetName] = newWorksheet;
        }

        xlsx.writeFile(workbook, filePath);
        res.status(200).json({ message: 'Success', file: filePath });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
});

// API: Save Pawn
app.post('/api/pawn', authenticate, (req, res) => {
    try {
        const data = req.body;
        const { workbook, filePath } = getExcelFile('pawn');

        let sheetName = 'PawnRecords';
        let worksheet = workbook.Sheets[sheetName];

        const rows = worksheet ? xlsx.utils.sheet_to_json(worksheet) : [];
        rows.push(data);

        const newWorksheet = xlsx.utils.json_to_sheet(rows);
        if (!worksheet) {
            xlsx.utils.book_append_sheet(workbook, newWorksheet, sheetName);
        } else {
            workbook.Sheets[sheetName] = newWorksheet;
        }

        xlsx.writeFile(workbook, filePath);
        res.status(200).json({ message: 'Success', file: filePath });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
});

// API: Get Data (Live Spreadsheet View)
app.get('/api/data/:type', authenticate, (req, res) => {
    try {
        const { type } = req.params;
        const { workbook } = getExcelFile(type);
        const sheetName = type === 'billing' ? 'Bills' : 'PawnRecords';
        const worksheet = workbook.Sheets[sheetName];

        if (!worksheet) {
            return res.status(200).json([]);
        }

        const data = xlsx.utils.sheet_to_json(worksheet);
        res.status(200).json(data);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
});

// API: Download Excel
app.get('/api/download/:type/:filename', (req, res) => {
    try {
        const { type, filename } = req.params;
        const filePath = path.join(DATA_DIR, filename);

        if (fs.existsSync(filePath)) {
            res.download(filePath, filename);
        } else {
            res.status(404).json({ error: 'File not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
