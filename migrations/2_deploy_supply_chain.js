const SupplyChain = artifacts.require("SupplyChain");

module.exports = function (deployer, network, accounts) {
  console.log("Deploying SupplyChain contract...");
  console.log("Network:", network);
  console.log("Deployer account:", accounts[0]);
  
  deployer.deploy(SupplyChain, {
    from: accounts[0],
    gas: 6721975,
    gasPrice: 20000000000 // 20 gwei
  }).then((instance) => {
    console.log("SupplyChain deployed at address:", instance.address);
    console.log("Contract owner:", accounts[0]);
    
    // Save the contract address to a file for frontend use
    const fs = require('fs');
    const contractAddress = {
      SupplyChain: instance.address,
      network: network,
      deployedAt: new Date().toISOString()
    };
    
    // Write to frontend build folder
    try {
      fs.writeFileSync(
        './frontend/src/contracts/contract-address.json',
        JSON.stringify(contractAddress, null, 2)
      );
      console.log("Contract address saved to frontend/src/contracts/contract-address.json");
    } catch (error) {
      console.log("Could not save contract address to frontend folder:", error.message);
    }
    
    // Write to root folder
    try {
      fs.writeFileSync(
        './contract-address.json',
        JSON.stringify(contractAddress, null, 2)
      );
      console.log("Contract address saved to root folder");
    } catch (error) {
      console.log("Could not save contract address to root folder:", error.message);
    }
    
    return instance;
  });
}; 