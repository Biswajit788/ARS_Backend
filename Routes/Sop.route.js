const express = require('express');
const sopRoute = express.Router();
const multer = require('multer');
const { authenticateToken, authorizeRole } = require('../authMiddleware');
const sopModel = require('../models/sopDetails');
const path = require('path');
const fs = require('fs');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  },
});

const upload = multer({ storage });

// GET all SOP files (requires authentication)
sopRoute.route('/files').get(authenticateToken, async (req, res) => {
  try {
    const files = await sopModel.find();
    res.status(200).json(files);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST upload SOP file (requires authentication and 'Admin' role)
sopRoute.route('/upload').post(authenticateToken, authorizeRole('Admin'), upload.single('file'), async (req, res) => {
  const { title, module } = req.body;
  const { filename, path } = req.file;

  try {
    const newFile = new sopModel({
      title,
      fileName: filename,
      filePath: path,
      module,
    });
    await newFile.save();
    res.status(200).json({ status: '200', message: 'File uploaded successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET view SOP file by ID (requires authentication and 'Admin' role)
sopRoute.route('/view/:fileId').get(authenticateToken, authorizeRole('Admin'), async (req, res) => {
  try {
    const file = await sopModel.findById(req.params.fileId);
    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }
    res.json(file);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET download SOP file by ID (requires authentication)
sopRoute.route('/download/:fileId').get(authenticateToken, async (req, res) => {
  try {
    const file = await sopModel.findById(req.params.fileId);
    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }
    res.download(file.filePath, file.fileName);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT update SOP file by ID (requires authentication and 'Admin' role)
sopRoute.route('/update/:id').put(authenticateToken, authorizeRole('Admin'), upload.single('file'), async (req, res) => {
  const { id } = req.params;
  const { title, module } = req.body;

  try {
    const file = await sopModel.findById(id);

    if (!file) {
      return res.status(404).json({ message: 'File not found' });
    }

    file.title = title;
    file.module = module;

    if (req.file) {
      file.filePath = req.file.path;
      file.fileName = req.file.originalname;
    }

    await file.save();
    res.status(200).json({ status: 'Success', message: 'File updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: 'Error', message: 'Server error' });
  }
});

module.exports = sopRoute;
