const express = require('express');
const mongoose = require('mongoose');

const app = express();
app.use(express.json());

// MongoDB Connection Setup
const mongoURI = process.env.MONGODB_URI; 
if (mongoose.connection.readyState === 0) {
    mongoose.connect(mongoURI).catch(err => console.error("DB Error:", err));
}

// Product Schema
const productSchema = new mongoose.Schema({
    name: String,
    price: Number,
    icon: String,
    category: { type: String, enum: ['gadget', 'family'] }
}, { timestamps: true });

const Product = mongoose.models.Product || mongoose.model('Product', productSchema);

// ---- API Routes ----

// ১. প্রোডাক্ট গেট করা (Frontend Fetch)
app.get('/api/products', async (req, res) => {
    try {
        const { category } = req.query;
        const query = category ? { category } : {};
        const data = await Product.find(query).sort({ createdAt: -1 });
        res.status(200).json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ২. নতুন প্রোডাক্ট অ্যাড করা (Postman/Admin Action)
app.post('/api/products', async (req, res) => {
    try {
        const newProduct = new Product(req.body);
        await newProduct.save();
        res.status(201).json({ message: "Success", product: newProduct });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ৩. প্রোডাক্ট ডিলিট করা
app.delete('/api/products', async (req, res) => {
    try {
        await Product.findByIdAndDelete(req.query.id);
        res.status(200).json({ message: "Deleted" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = app;
