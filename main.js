require('dotenv').config()
var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');
var request = require('request');
var app = express();

app.use(express.static(path.join(__dirname, './client')));
app.use(bodyParser.json());

app.use(express.json());
var port = process.env.PORT || 3000;
let users = [""]

const mockBody = {
  "confirmed": false,
  "chainId": "0xaa36a7",
  "abi": [],
  "streamId": "a27b54a0-004d-4854-895f-87d14e2bd0fe",
  "tag": "notifications",
  "retries": 0,
  "block": {
    "number": "4205330",
    "hash": "0x885fccbd28609084e56d03cf06dde9505317b3701dc38de9271d8238050e3f99",
    "timestamp": "1693587636"
  },
  "logs": [
    {
      "logIndex": "16",
      "transactionHash": "0x4d8798dcbeec7436567445e5e61a271ac47673e14460784e3b6253105ad781ba",
      "address": "0x7439e9bb6d8a84dd3a23fe621a30f95403f87fb9",
      "data": "0x00000000000000000000000000000000000000000000003635c9adc5dea00000",
      "topic0": "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef",
      "topic1": "0x0000000000000000000000000000000000000000000000000000000000000000",
      "topic2": "0x00000000000000000000000034140de4f088364d5929ffbc33eff2dc1472d10c",
      "topic3": null
    }
  ],
  "txs": [
    {
      "hash": "0x4d8798dcbeec7436567445e5e61a271ac47673e14460784e3b6253105ad781ba",
      "gas": "53091",
      "gasPrice": "1704815272",
      "nonce": "1",
      "input": "0x",
      "transactionIndex": "12",
      "fromAddress": "0x34140de4f088364d5929ffbc33eff2dc1472d10c",
      "toAddress": "0x7439e9bb6d8a84dd3a23fe621a30f95403f87fb9",
      "value": "0",
      "type": "2",
      "v": "0",
      "r": "79745447244070640223799461757642427453644670410837636474428485176193047885167",
      "s": "55076998538721609752526482340674483254071906994970627745066499142220706965239",
      "receiptCumulativeGasUsed": "2261648",
      "receiptGasUsed": "35394",
      "receiptContractAddress": null,
      "receiptRoot": null,
      "receiptStatus": "1"
    }
  ],
  "txsInternal": [],
  "erc20Transfers": [
    {
      "transactionHash": "0x4d8798dcbeec7436567445e5e61a271ac47673e14460784e3b6253105ad781ba",
      "logIndex": "16",
      "contract": "0x7439e9bb6d8a84dd3a23fe621a30f95403f87fb9",
      "from": "0x0000000000000000000000000000000000000000",
      "to": "0x34140de4f088364d5929ffbc33eff2dc1472d10c",
      "value": "1000000000000000000000",
      "tokenName": "Weenus 💪",
      "tokenSymbol": "WEENUS",
      "tokenDecimals": "18",
      "valueWithDecimals": "1000",
      "possibleSpam": false
    }
  ],
  "erc20Approvals": [],
  "nftTokenApprovals": [],
  "nftApprovals": {
    "ERC721": [],
    "ERC1155": []
  },
  "nftTransfers": [],
  "nativeBalances": []
}


app.post('/moralis', async function (req, res) {
    res.json({ message: "Thank you for the message" });
    console.log("new hook");
    return handleHook(req.body);
})

function handleHook(body = mockBody){
  if(body.confirmed){
    return;
  }
  let notifications = [];

  //check for incoming erc20s
  body.erc20Transfers.forEach( transfer => {
    if(!transfer.possibleSpam){
      let receiver = users.find((element) => element === transfer.to);
      if(receiver){
        notifications.push({
          type: "erc20",
          sender: transfer.from,
          receiver: receiver,
          amount: transfer.valueWithDecimals,
          tokenName: transfer.tokenName,
  
        })
      }
    }
  })
  //check for native txs
  body.txs.forEach( transaction => {
    if(transaction.value > 0){
      let receiver = users.find((element) => element === transaction.toAddress);
      if(receiver){
        notifications.push({
          type: "native",
          sender: transaction.fromAddress,
          receiver: transaction.toAddress,
          amount: transaction.value,
          tokenName: "ETH"
        })
      }
    }
  })

  console.log(notifications);

  if(notifications.length > 0){
    sendNotifications(notifications);
  }
}

async function sendNotifications(notifications){

  notifications.forEach(notification => {
    console.log((notification));

    var options = {
      json: true,
      'method': 'POST',
      'url': 'https://onesignal.com/api/v1/notifications',
      'headers': {
        'Authorization': 'Basic INSERT_API_KEY',
        'accept': 'application/json',
        'content-type': 'application/json'
      },
      "body": {
        "include_aliases": {"external_id": [notification.receiver.toLowerCase().slice(2)]},
        "target_channel": "push",
        "isAnyWeb": true,
        "contents": {"en": `You've successfully received a deposit`},
        "headings": {"en": `You've received ${notification.amount} ${notification.tokenName}`},
        "name": "Notification",
        "app_id": "INSERT_APP_ID"
      }
      
    };
    request(options, function (error, response) {
      if (error) throw new Error(error);
      console.log(response.body);
    });

    
  })
}



app.listen(port, function () {
   console.log(`App listening at ${port}`)
})
