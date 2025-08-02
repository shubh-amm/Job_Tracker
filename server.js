const express = require('express');
const cors = require('cors'); // Import cors middleware

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors()); // Enable CORS for all routes
app.use(express.json()); // For parsing application/json

// In-memory data store for applications
// In a real application, you would use a database (e.g., MongoDB, PostgreSQL, SQLite)
let applications = [
    // Sample data (can be cleared/modified via API)
    { id: '1', company: 'Innovate Corp.', role: 'Software Engineer', deadline: '2025-08-10', status: 'Applied' },
    { id: '2', company: 'Global Tech', role: 'Product Manager', deadline: '2025-08-01', status: 'Interviewed' },
    { id: '3', company: 'Data Solutions', role: 'Data Scientist', deadline: '2025-08-15', status: 'Researching' },
    { id: '4', company: 'Creative Design', role: 'UX Designer', deadline: '2025-07-28', status: 'Rejected' },
    { id: '5', company: 'Future AI Labs', role: 'Machine Learning Engineer', deadline: '2025-09-15', status: 'Interested' },
];

// --- API Endpoints ---

// GET all applications
app.get('/api/applications', (req, res) => {
    res.json(applications);
});

// POST a new application
app.post('/api/applications', (req, res) => {
    const newApplication = {
        id: Date.now().toString(), // Simple unique ID
        ...req.body
    };
    applications.push(newApplication);
    res.status(201).json(newApplication);
});

// PUT (Update) an application by ID
app.put('/api/applications/:id', (req, res) => {
    const { id } = req.params;
    const { status } = req.body; // Assuming only status is updated via this endpoint

    const appIndex = applications.findIndex(app => app.id === id);

    if (appIndex !== -1) {
        applications[appIndex].status = status;
        res.json(applications[appIndex]);
    } else {
        res.status(404).json({ message: 'Application not found' });
    }
});

// DELETE an application by ID
app.delete('/api/applications/:id', (req, res) => {
    const { id } = req.params;
    const initialLength = applications.length;
    applications = applications.filter(app => app.id !== id);

    if (applications.length < initialLength) {
        res.status(200).json({ message: 'Application deleted successfully' });
    } else {
        res.status(404).json({ message: 'Application not found' });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Backend server running on http://localhost:${PORT}`);
});
