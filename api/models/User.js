import mongoose from 'mongoose';

const User = mongoose.model('User', new mongoose.Schema({
    email: {type:String, unique:true},
    password: {type:String, unique:true},
}));

export default User;
