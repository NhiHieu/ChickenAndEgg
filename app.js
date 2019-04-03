const CryptoJS = require("crypto-js");
const express = require("express");
const bodyParser = require('body-parser');

const port = process.env.PORT || 3001

class Block{
    constructor(index, previousHash, timestamp, mssv, name, vote, hash){
        this.index = index
        this.previousHash = previousHash.toString()
        this.timestamp = timestamp
        this.mssv = mssv
        this.name = name
        this.vote = vote
        this.hash = hash.toString()
    }
}


const calculateHash = (index, previousHash, timestamp, mssv, name, vote) =>{
    return CryptoJS.SHA256(index, previousHash, timestamp, mssv, name, vote).toString()
    }

const calculateHashForBlock = (block) =>{
    return calculateHash(block.index, block.previousHash, block.timestamp, block.mssv, block.name, block.vote)
}

const getRootBlock = () =>{
    index = 0
    previousHash = "0"
    timestamp = Date.now()
    mssv = "000000000"
    name = "Author - Hieu Nguyen"
    vote = -1
    hash = calculateHash(index, previousHash, timestamp, mssv, name, vote)
    return new Block(index, previousHash,timestamp,mssv, name, vote, hash)
}

const blockchain = [getRootBlock()]

const initHttpServer = () =>{
    const app = express()
    app.use(bodyParser.urlencoded({ extended: false }))
    app.set()
    app.set('view engine', 'ejs')
    app.use(express.static('public'))
    app.use(bodyParser.json())
    app.get('/', (req, res) => {
        res.render('index', {"title": "Chicken And Egg"})
    })
    app.get('/blocks', (req, res) => {
        res.render('blocks', {"data": blockchain})
    })
    app.post('/mineBlock', (req, res) => {
        console.log("req.body" + typeof(req.body))
        const newBlock = generateNextBlock(req.body)
        addBlock(newBlock)
        console.log("Block added: " + JSON.stringify(newBlock))
        res.redirect('/')
    })
    app.get('/result', (req, res)=>{
        console.log(blockchain);
        // res.send(JSON.stringify(result(blockchain)));
        // res.render()
        res.render('result', {"data": result(blockchain)})
    })
    app.listen(port, ()=> {
        console.log("listening on port " + port)
    })
}

const addBlock = (newBlock) => {
    if (isValidNewBlock(newBlock, getLatestBlock())) {
        blockchain.push(newBlock);
    }
};



const generateNextBlock = (blockData) => {
    console.log(blockData)
    var previousBlock = getLatestBlock();
    var nextIndex = previousBlock.index + 1;
    var nextTimestamp = new Date().getTime() / 1000;
    var nextHash = calculateHash(nextIndex, previousBlock.hash, nextTimestamp,blockData.mssv, blockData.name, blockData.vote);
    return new Block(nextIndex, previousBlock.hash, nextTimestamp,blockData.mssv, blockData.name, blockData.vote, nextHash);
};


var isValidNewBlock = (newBlock, previousBlock) => {
    if (previousBlock.index + 1 !== newBlock.index) {
        console.log('invalid index');
        return false;
    } else if (previousBlock.hash !== newBlock.previousHash) {
        console.log('invalid previoushash');
        return false;
    } else if (calculateHashForBlock(newBlock) !== newBlock.hash) {
        console.log(typeof (newBlock.hash) + ' ' + typeof calculateHashForBlock(newBlock));
        console.log('invalid hash: ' + calculateHashForBlock(newBlock) + ' ' + newBlock.hash);
        return false;
    }
    return true;
};

const getLatestBlock = () => blockchain[blockchain.length - 1];

var chicken = 0;
var egg = 0;
const result = () => {
    blockchain.forEach(element => {
        if(element.vote == 0){
            egg += 1;
        }
        if(element.vote == 1){
            chicken += 1;
        }
    });
    return {
        "egg": egg,
        "chicken": chicken
    }
}

initHttpServer();
