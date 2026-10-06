const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
const PORT = 3000;

const SERVICES = {
    users: 'http://localhost:5001/users',
    products: 'http://localhost:5002/products',
    orders: 'http://localhost:5003/orders'
};

const SERVICE_HEALTH = {
    users: 'http://localhost:5001/ping',
    products: 'http://localhost:5002/ping',
    orders: 'http://localhost:5003/ping'
};

app.use(cors());
app.use(express.json());

app.get('/api/dashboard', async (req, res) => {
    console.log('Dashboard requested - aggregating data...');

    try {
        const [usersRes, productsRes, ordersRes] = await Promise.all([
            axios.get(SERVICES.users),
            axios.get(SERVICES.products),
            axios.get(SERVICES.orders)
        ]);

        const dashboard = {
            timestamp: new Date().toISOString(),
            summary: {
                totalUsers: usersRes.data.count || 0,
                totalProducts: productsRes.data.count || 0,
                totalOrders: ordersRes.data.count || 0
            },
            users: usersRes.data.data || [],
            products: productsRes.data.data || [],
            orders: ordersRes.data.data || []
        };

        console.log(`Dashboard: ${dashboard.summary.totalUsers} users, ${dashboard.summary.totalProducts} products, ${dashboard.summary.totalOrders} orders`);
        res.json(dashboard);
    } catch (error) {
        console.error('Aggregation error:', error.message);
        res.status(500).json({
            error: 'Failed to fetch data from one or more services',
            details: error.message
        });
    }
});

app.get('/api/status', async (req, res) => {
    const services = await Promise.all(
        Object.entries(SERVICE_HEALTH).map(async ([name, url]) => {
            try {
                await axios.get(url);
                return { name, status: 'online' };
            } catch (error) {
                console.error(`Health check failed for ${name}:`, error.message);
                return { name, status: 'offline' };
            }
        })
    );

    res.json({
        gateway: 'online',
        allOnline: services.every((service) => service.status === 'online'),
        services
    });
});

const proxyService = (serviceName) => async (req, res) => {
    try {
        const response = await axios.get(SERVICES[serviceName]);
        res.json(response.data);
    } catch (error) {
        console.error(`Failed to fetch ${serviceName}:`, error.message);
        res.status(500).json({
            error: `Failed to fetch ${serviceName}`,
            details: error.message
        });
    }
};

app.get('/api/users', proxyService('users'));
app.get('/api/products', proxyService('products'));
app.get('/api/orders', proxyService('orders'));

app.get('/ping', (req, res) => {
    res.json({
        status: 'online',
        service: 'API Gateway',
        timestamp: new Date().toISOString()
    });
});

app.listen(PORT, () => {
    console.log('='.repeat(40));
    console.log('API GATEWAY STARTED');
    console.log('='.repeat(40));
    console.log(`Gateway URL: http://localhost:${PORT}`);
    console.log(`Port: ${PORT}`);
    console.log('GET /api/dashboard');
    console.log('GET /api/status');
    console.log('GET /api/users');
    console.log('GET /api/products');
    console.log('GET /api/orders');
    console.log('GET /ping - Gateway health check');
    console.log('='.repeat(40));
    console.log('All services will be called in PARALLEL!');
});
