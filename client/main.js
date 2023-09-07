window.connect = async function(){
    if (window.ethereum) {
    
     await window.ethereum.request({ method: "eth_requestAccounts" });
     window.web3 = new Web3(window.ethereum);
     OneSignal.login(window.ethereum.selectedAddress.toLowerCase().slice(2));
     OneSignal.Notifications.requestPermission();
     
    } else {
     console.log("No wallet");
    }
}