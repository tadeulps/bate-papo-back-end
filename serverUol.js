import express from "express";
import cors from "cors";
import dayjs from "dayjs"
import "dayjs/locale/pt-br.js"

const app = express();
app.use(express.json());
app.use(cors());

let participants=[];
let messages=[];

app.post("/participants",(req,res)=>{
    const participant=req.body
    if(participant.name){
        let newParticipant={
            name:participant.name,
            lastStatus: Date.now()
        }
        let joiningMessage={
        from: participant.name,
        to: 'Todos',
        text: 'entra na sala...',
        type: 'status',
        time: dayjs().format('HH:mm:ss')
        }
        messages.push(joiningMessage)
        participants.push(newParticipant)
        res.send(newParticipant)
        res.sendStatus(200)
    }else{
        res.sendStatus(400)
    }

})

app.get("/participants",(req,res)=>{
    res.json(participants)
})

app.post("/messages",(req,res)=>{
    let message=req.body;
    if((message.to && req.headers.user)
    && (message.type==="message" || message.type==="private_message")
    && participants.find((r)=>r.name===req.headers.user)){
        let newMessage={
            from:req.headers.user,
            to: message.to,
            text: message.text,
            type: message.type,
            time: dayjs().format('HH:mm:ss')
        }
        messages.push(newMessage)
        res.sendStatus(200)
    }else{
        res.sendStatus(400)
    }
})

app.get("/messages",(req,res)=>{
    const limit=req.query.limit
    let messagesThatIShouldSee=messages.filter((r)=>r.to==="Todos" || r.to===req.headers.user || r.from===req.headers.user)
    limit?res.json(messagesThatIShouldSee.slice(-limit)):res.json(messagesThatIShouldSee)
})

app.post("/status",(req,res)=>{
    if(req.headers.user){
        if(participants.find((r)=>r.name===req.headers.user)){
            participants[participants.findIndex((r)=>r.name===req.headers.user)].lastStatus=Date.now()
            res.sendStatus(200)
        }else{
            res.sendStatus(400)
        }
    }
    
})
setInterval(()=>{
    participants.forEach((r,i)=>{
        if((Date.now() - r.lastStatus)>10000){
            messages.push(
            {from:r.name,
            to: 'Todos',
            text: 'sai da sala...',
            type: 'status',
            time: dayjs().format('HH:mm:ss')})
            participants.splice(i,1)
        }
    })
    }
    ,15000)
app.listen(4000);