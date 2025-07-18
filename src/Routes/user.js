const express = require("express");
const userRouter = express.Router();
const { userAuth } = require("../Middleware/Auth");
const ConnectionRequest = require("../models/connectionRequest");
const User = require("../models/user");
const { connect } = require("mongoose");

const USER_SAFE_DATA = "firstName lastName photoUrl age skills about gender";

// get all the pending connection request from the logged in user
userRouter.get("/user/request/received" ,userAuth , async(req,res) => {
    try{
        const loggedInUser = req.user;
        const connectionRequest = await ConnectionRequest.find({
            toUserId: loggedInUser._id,
            status: "interested",
        }).populate("fromUserId", USER_SAFE_DATA);
        if(!connectionRequest || connectionRequest.length === 0){
            return res.status(404).json({
                message: "No connection requests found",
            });
        }
        res.json({
            message: "All the connection requests",
            data: connectionRequest,
        });


    }catch(err){
        res.status(400).send("ERROR :" + err.message);
    }
});

userRouter.get("/user/connections" , userAuth , async(req,res) => {
    try{
        const loggedInUser = req.user;
        const connectionRequests = await ConnectionRequest.find({
            $or:[
                {toUserId: loggedInUser._id, status: "accepted"},
                {fromUserId: loggedInUser._id, status: "accepted"}
            ]
        }).populate("fromUserId", USER_SAFE_DATA).populate("toUserId", USER_SAFE_DATA); 

        const data = connectionRequests.map((row) =>{
            if(row.fromUserId._id.toString() === loggedInUser._id.toString()){
                return  row.toUserId;
            }

            return row.fromUserId;
        });
        res.json({
            message: "All the connections of " + loggedInUser.firstName,
            data: data,
        });

    }catch(err){
        res.status(400).send("ERROR :" + err.message);
    }

});

userRouter.get("/user/feed" , userAuth , async(req,res) => {
    try{
        const loggedInUser = req.user;
        const page = parseInt(req.query.page) || 1;
        let limit = parseInt(req.query.limit) || 10; 
        limit = limit > 50 ? 50 : limit;
        const connectionRequests = await ConnectionRequest.find({
            $or:[
                {fromUserId : loggedInUser._id},
                {toUserId : loggedInUser._id}
            ]
        }).select("fromUserId toUserId");

        const hideUsersFromFeed = new Set();
        connectionRequests.forEach((request) => {
            hideUsersFromFeed.add(request.fromUserId.toString());
            hideUsersFromFeed.add(request.toUserId.toString());
        });

        const user = await User.find({
            $and: [
                { _id: { $ne: loggedInUser._id } }, // Exclude the logged-in user
                { _id: { $nin: Array.from(hideUsersFromFeed) } }, // Exclude users in connection requests
            ]
        }).select(USER_SAFE_DATA).skip((page - 1) * limit).limit(limit);

        res.json({data: user});

    }catch(err){
        res.status(400).send("ERROR :" + err.message);
    }
});



module.exports = userRouter;
