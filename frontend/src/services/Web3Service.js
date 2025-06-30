class Web3Service {
  constructor() {
    this.web3 = null;
    this.contract = null;
    this.account = null;
    this.contractAddress = process.env.REACT_APP_CONTRACT_ADDRESS || '0x123...'; // Replace with actual deployed address
    this.contractABI = [
      {
        "inputs": [],
        "stateMutability": "nonpayable",
        "type": "constructor"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "internalType": "uint256",
            "name": "medicineId",
            "type": "uint256"
          },
          {
            "indexed": true,
            "internalType": "uint256",
            "name": "distributorId",
            "type": "uint256"
          }
        ],
        "name": "Distributed",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "internalType": "uint256",
            "name": "medicineId",
            "type": "uint256"
          },
          {
            "indexed": true,
            "internalType": "uint256",
            "name": "manufacturerId",
            "type": "uint256"
          }
        ],
        "name": "Manufactured",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "internalType": "uint256",
            "name": "medicineId",
            "type": "uint256"
          },
          {
            "indexed": false,
            "internalType": "string",
            "name": "medicineName",
            "type": "string"
          }
        ],
        "name": "MedicineOrdered",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "internalType": "uint256",
            "name": "medicineId",
            "type": "uint256"
          },
          {
            "indexed": true,
            "internalType": "uint256",
            "name": "rmsId",
            "type": "uint256"
          }
        ],
        "name": "RawMaterialSupplied",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "internalType": "uint256",
            "name": "medicineId",
            "type": "uint256"
          },
          {
            "indexed": true,
            "internalType": "uint256",
            "name": "retailerId",
            "type": "uint256"
          }
        ],
        "name": "Retailed",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "internalType": "uint256",
            "name": "medicineId",
            "type": "uint256"
          }
        ],
        "name": "Sold",
        "type": "event"
      },
      {
        "inputs": [
          {
            "internalType": "uint256",
            "name": "_medicineID",
            "type": "uint256"
          }
        ],
        "name": "Distribute",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "uint256",
            "name": "_medicineID",
            "type": "uint256"
          }
        ],
        "name": "Manufacturing",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "Owner",
        "outputs": [
          {
            "internalType": "address",
            "name": "",
            "type": "address"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "uint256",
            "name": "_medicineID",
            "type": "uint256"
          }
        ],
        "name": "RMSsupply",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "uint256",
            "name": "_medicineID",
            "type": "uint256"
          }
        ],
        "name": "Retail",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "_address",
            "type": "address"
          },
          {
            "internalType": "string",
            "name": "_name",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "_place",
            "type": "string"
          }
        ],
        "name": "addDistributor",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "_address",
            "type": "address"
          },
          {
            "internalType": "string",
            "name": "_name",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "_place",
            "type": "string"
          }
        ],
        "name": "addManufacturer",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "_address",
            "type": "address"
          },
          {
            "internalType": "string",
            "name": "_name",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "_place",
            "type": "string"
          }
        ],
        "name": "addRMS",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "_address",
            "type": "address"
          },
          {
            "internalType": "string",
            "name": "_name",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "_place",
            "type": "string"
          }
        ],
        "name": "addRetailer",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "disCtr",
        "outputs": [
          {
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "getCounts",
        "outputs": [
          {
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "uint256",
            "name": "_disID",
            "type": "uint256"
          }
        ],
        "name": "getDistributor",
        "outputs": [
          {
            "internalType": "address",
            "name": "",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
          },
          {
            "internalType": "string",
            "name": "",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "",
            "type": "string"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "uint256",
            "name": "_manID",
            "type": "uint256"
          }
        ],
        "name": "getManufacturer",
        "outputs": [
          {
            "internalType": "address",
            "name": "",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
          },
          {
            "internalType": "string",
            "name": "",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "",
            "type": "string"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "uint256",
            "name": "_medicineID",
            "type": "uint256"
          }
        ],
        "name": "getMedicine",
        "outputs": [
          {
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
          },
          {
            "internalType": "string",
            "name": "",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "",
            "type": "string"
          },
          {
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
          },
          {
            "internalType": "string",
            "name": "",
            "type": "string"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "getMedicineCount",
        "outputs": [
          {
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "uint256",
            "name": "_rmsID",
            "type": "uint256"
          }
        ],
        "name": "getRMS",
        "outputs": [
          {
            "internalType": "address",
            "name": "",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
          },
          {
            "internalType": "string",
            "name": "",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "",
            "type": "string"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "uint256",
            "name": "_retID",
            "type": "uint256"
          }
        ],
        "name": "getRetailer",
        "outputs": [
          {
            "internalType": "address",
            "name": "",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
          },
          {
            "internalType": "string",
            "name": "",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "",
            "type": "string"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "manCtr",
        "outputs": [
          {
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "medicineCount",
        "outputs": [
          {
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "string",
            "name": "_name",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "_description",
            "type": "string"
          }
        ],
        "name": "orderMedicine",
        "outputs": [
          {
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
          }
        ],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "retCtr",
        "outputs": [
          {
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "rmsCtr",
        "outputs": [
          {
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "uint256",
            "name": "_medicineID",
            "type": "uint256"
          }
        ],
        "name": "showStage",
        "outputs": [
          {
            "internalType": "string",
            "name": "",
            "type": "string"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "uint256",
            "name": "_medicineID",
            "type": "uint256"
          }
        ],
        "name": "sold",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      }
    ];
  }

  // Initialize Web3 and connect to MetaMask
  async initWeb3() {
    try {
      if (typeof window !== 'undefined' && window.ethereum) {
        // For demo purposes without actual Web3 installation
        console.log('MetaMask detected - would initialize Web3 here');
        this.account = '0x123...'; // Mock account
        return true;
      } else {
        console.error('MetaMask not detected');
        return false;
      }
    } catch (error) {
      console.error('Error initializing Web3:', error);
      return false;
    }
  }

  // Set contract address
  setContractAddress(address) {
    this.contractAddress = address;
  }

  // Get current account
  async getCurrentAccount() {
    return this.account || '0x123...';
  }

  // Mock contract interaction methods for demo
  async addRMS(address, name, place) {
    console.log('Adding RMS:', { address, name, place });
    return { transactionHash: '0x123...', status: true };
  }

  async addManufacturer(address, name, place) {
    console.log('Adding Manufacturer:', { address, name, place });
    return { transactionHash: '0x456...', status: true };
  }

  async addDistributor(address, name, place) {
    console.log('Adding Distributor:', { address, name, place });
    return { transactionHash: '0x789...', status: true };
  }

  async addRetailer(address, name, place) {
    console.log('Adding Retailer:', { address, name, place });
    return { transactionHash: '0xabc...', status: true };
  }

  async orderMedicine(name, description) {
    console.log('Ordering Medicine:', { name, description });
    return { transactionHash: '0xdef...', medicineId: Math.floor(Math.random() * 1000) };
  }

  async supplyRawMaterial(medicineId) {
    console.log('Supplying Raw Material for Medicine ID:', medicineId);
    return { transactionHash: '0xghi...', status: true };
  }

  async manufacture(medicineId) {
    console.log('Manufacturing Medicine ID:', medicineId);
    return { transactionHash: '0xjkl...', status: true };
  }

  async distribute(medicineId) {
    console.log('Distributing Medicine ID:', medicineId);
    return { transactionHash: '0xmno...', status: true };
  }

  async retail(medicineId) {
    console.log('Retailing Medicine ID:', medicineId);
    return { transactionHash: '0xpqr...', status: true };
  }

  async sellMedicine(medicineId) {
    console.log('Selling Medicine ID:', medicineId);
    return { transactionHash: '0xstu...', status: true };
  }

  // View methods
  async getMedicine(medicineId) {
    return {
      id: medicineId,
      name: 'Sample Medicine',
      description: 'Sample Description',
      rmsId: 1,
      manufacturerId: 1,
      distributorId: 1,
      retailerId: 1,
      stage: 'Manufacturing Stage'
    };
  }

  async getMedicineCount() {
    return 5; // Mock count
  }

  async getCounts() {
    return [5, 3, 2, 4, 2]; // [medicines, rms, manufacturers, distributors, retailers]
  }

  async getRMS(rmsId) {
    if (!this.contract) throw new Error('Contract not initialized');
    
    return await this.contract.methods.getRMS(rmsId).call();
  }

  async getManufacturer(manId) {
    if (!this.contract) throw new Error('Contract not initialized');
    
    return await this.contract.methods.getManufacturer(manId).call();
  }

  async getDistributor(disId) {
    if (!this.contract) throw new Error('Contract not initialized');
    
    return await this.contract.methods.getDistributor(disId).call();
  }

  async getRetailer(retId) {
    if (!this.contract) throw new Error('Contract not initialized');
    
    return await this.contract.methods.getRetailer(retId).call();
  }

  async getOwner() {
    if (!this.contract) throw new Error('Contract not initialized');
    
    return await this.contract.methods.Owner().call();
  }

  async showStage(medicineId) {
    const stages = [
      'Medicine Ordered',
      'Raw Material Supply Stage', 
      'Manufacturing Stage',
      'Distribution Stage',
      'Retail Stage',
      'Sold'
    ];
    return stages[Math.floor(Math.random() * stages.length)];
  }

  // Utility methods
  isAddress(address) {
    return /^0x[a-fA-F0-9]{40}$/.test(address);
  }

  // Event subscription (mock)
  subscribeToEvents(eventName, callback) {
    console.log('Subscribing to event:', eventName);
    // Mock event emission for demo
    setTimeout(() => {
      callback({
        event: eventName,
        returnValues: { medicineId: 1, participantId: 1 },
        transactionHash: '0x123...'
      });
    }, 2000);
  }
}

const web3Service = new Web3Service();
export default web3Service;