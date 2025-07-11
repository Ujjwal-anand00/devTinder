const mongoose = require('mongoose');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
    firstName : {
        type : String,
        index: true,
        required: true,
        minLength: 3,
        maxLength: 10,
    },
    lastName : {
        type : String
    },
    emailId : {
        type : String,
        required: true,
        unique: true,
        lowercase : true,
        trim: true,
        validate(value){
            if(!validator.isEmail(value))
            {
                throw new Error("Your Email Id is not correct !!!!" + value);
            }
        }
    },
    password : {
        type : String,
        required: true,
        validate(value){
            if(!validator.isStrongPassword(value))
            {
                throw new Error("Your password is weak !!!!" + value);
            }
        }
    },
    age : {
        type : Number,
        min : 18,
    },
    gender : {
        type : String,
        validate(value){
            if(!["male", "female" , "others"].includes(value)){
                throw new Error("Gender data is not valid !!!!"); 
            }
        }
    },
    photoUrl:{
        type:String,
        default : "https://www.pnrao.com/wp-content/uploads/2023/06/dummy-user-male.jpg",
        validate(value){
            if(!validator.isURL(value))
            {
                throw new Error("Invalid Photo URL !!!!" + value);
            }
        }
    },
    about:{
        type:String,
        default : "This is default about of a user !!",
    },
    skills:{
        type:[String],
    },

},
{
    timestamps:true,
}
);

userSchema.methods.getJWT = async function() {
    const user = this;
    const token = await jwt.sign({ _id: user._id }, "DEV@Tinder$790", {
        expiresIn: "7d",
    });

    return token;

    
};
userSchema.methods.validatePassword = async function(passwordInputByUser) {
    const user = this;
    const passwordHash = user.password;
    const isPasswordIsValid = await bcrypt.compare(passwordInputByUser, passwordHash);
    return isPasswordIsValid;
    
}

const User = mongoose.model("User" , userSchema);

module.exports = User;