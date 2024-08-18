import express from 'express';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import mongoose from 'mongoose';
import User from './models/User.js';
import bcrypt from 'bcrypt';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import { Router } from 'express';
import Todo from './models/Todo.js';

const secret = 'secret123';

await mongoose.connect('mongodb://127.0.0.1:27017/auth-todo', {useNewUrlParser: true, useUnifiedTopology: true});
const db = mongoose.connection;
db.on('error', console.log);

const app = express();
app.use(cookieParser());
app.use(bodyParser.json({ extended: true }));
app.use(cors({
    credentials: true,
    origin: 'http://localhost:3000',
}));

app.get('/', (req, res) => {
    res.send('Ok');
});

app.get('/user', (req, res) => {
    if (!req.cookies.token) {
        return res.json({});
    }
    try{
        const payload = jwt.verify(req.cookies.token, secret);
        User.findById(payload.id)
            .then(userInfo => {
                if (!userInfo) {
                    return res.json({});
                }
                res.json({ id: userInfo._id, email: userInfo.email });
            })
            .catch(error => {
                console.error('Error fetching user info:', error);
                res.sendStatus(500);
            });
    } catch (error) {
        console.error('Error verifying token:', error);
        res.sendStatus(401);
    }
   
});

app.post('/register', async (req, res) => {
    const { email, password } = req.body;

    try {
        // Check if a user with the given email already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: "Email already exists" });
        }

        // Hash the password and create a new user
        const hashedPassword = bcrypt.hashSync(password, 10);
        const user = new User({ email, password: hashedPassword });
        
        // Save the new user and create a JWT
        const userInfo = await user.save();
        jwt.sign({ id: userInfo._id, email: userInfo.email }, secret, (err, token) => {
            if (err) {
                console.error(err);
                res.sendStatus(500);
            } else {
                res.cookie('token', token).json({ id: userInfo._id, email: userInfo.email });
            }
        });
    } catch (error) {
        console.error('Error during registration:', error);
        res.status(500).json({ error: "Internal server error" });
    }
});

app.post('/login', (req, res) => {
    const { email, password } = req.body;
    User.findOne({ email })
        .then(userInfo => {
            if (!userInfo) {
                return res.status(401).json({ error: "Invalid email or password" });
            }
            const passOk = bcrypt.compareSync(password, userInfo.password);
            if (passOk) {
                jwt.sign({ id: userInfo._id, email }, secret, (err, token) => {
                    if (err) {
                        console.log(err);
                        res.sendStatus(500);
                    } else {
                        res.cookie('token', token).json({ id: userInfo._id, email: userInfo.email });
                    }
                });
            } else {
                res.sendStatus(401).json({ error: "Invalid email or password" });
            }
        });
});

app.post('/logout', (req, res) => {
    res.cookie('token', '').send();
});


app.get('/todos', (req,res) => {
    try{
        const payload = jwt.verify(req.cookies.token, secret);
        const userId = new mongoose.Types.ObjectId(payload.id);

        Todo.find({user:userId}, (err, todos) => {
            if (err) {
                console.error('Error fetching todos:', err);
                return res.sendStatus(500);
            }
            res.json(todos);
        });
    } catch  (error) {
        console.error('Error verifying token:', error);
        res.sendStatus(401);
    }
});

app.put('/todos', (req,res) => {
    try {
        const payload = jwt.verify(req.cookies.token, secret);
        const userId = new mongoose.Types.ObjectId(payload.id);

        const todo = new Todo({
            text:req.body.text,
            done:false,
            user:userId,
        });

        todo.save()
            .then(todo => {
                res.json(todo);
            }).catch(error => {
                console.error('Error saving todo:', error);
                res.sendStatus(500);
            });
    } catch (error) {
        console.error('Error verifying token:', error);
        res.sendStatus(401);
    }
});

app.post('/todos/:id', (req,res) => {
    const payload = jwt.verify(req.cookies.token, secret);
    const userId = new mongoose.Types.ObjectId(payload.id);

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(400).json({ error: 'Invalid todo ID' });
    }

    Todo.updateOne(
        {_id:new mongoose.Types.ObjectId(req.params.id), user:userId},
        {done:req.body.done}
    ).then(result => {
        res.sendStatus(200);
    })
    .catch(error => {
        console.error('Error updating todo:', error);
        res.sendStatus(500);
    });
});

app.delete('/todos/:id', (req, res) => {
    const payload = jwt.verify(req.cookies.token, secret);
    Todo.deleteOne({ _id: req.params.id, user: new mongoose.Types.ObjectId(payload.id) })
        .then(() => res.sendStatus(200))
        .catch(error => {
            console.error('Error deleting todo:', error);
            res.sendStatus(500);
        });
});

app.listen(4000);
