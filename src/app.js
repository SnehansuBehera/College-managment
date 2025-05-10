import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import examRoutes from '../routes/examRoute.js';
import resultRoutes from '../routes/resultRoutes.js';
import erpRoutes from '../routes/erpRoutes.js';


const app = express();
const PORT = process.env.PORT || 5000;


app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/api', examRoutes);
app.use('/api', resultRoutes);
app.use('/api', erpRoutes)

app.listen(PORT, () => { 
    console.log(`Server is running on port ${PORT}`);
})