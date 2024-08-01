const express = require('express');
const assetLogRoute = express.Router();
const { authenticateToken, authorizeRole } = require('../authMiddleware');
const assetLogModel = require('../models/assetLocationLog');
const disposedAssetLogModel = require('../models/assetTransferData');

assetLogRoute.get('/assetlogs', authenticateToken, authorizeRole('Admin' , 'Super Admin'), async (req, res) => {
    const { assetId } = req.query;
    try {
        let query = {};
        if (assetId) {
            query.assetId = assetId;
        }
        const logs = await assetLogModel.find(query).sort({ date: -1 }); // Sort by date descending
        res.json(logs);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'An error occurred while fetching logs' });
    }
});

assetLogRoute.get('/disposedassetlogs', authenticateToken, authorizeRole('Admin' , 'Super Admin'), async (req, res) => {
    const { transferCode } = req.query;
    try {
        let query = {};
        if (transferCode) {
            query.transfer_code = transferCode;
        }
        const logs = await disposedAssetLogModel.find(query).sort({ date: -1 }); // Sort by date descending
        res.json(logs);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'An error occurred while fetching logs' });
    }
});

module.exports = assetLogRoute;
