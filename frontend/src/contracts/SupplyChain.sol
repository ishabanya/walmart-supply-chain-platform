// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

contract SupplyChain {
    // Contract owner
    address public Owner;

    // Medicine count
    uint256 public medicineCount = 0;

    // Raw Material Supplier count
    uint256 public rmsCtr = 0;

    // Manufacturer count
    uint256 public manCtr = 0;

    // Distributor count
    uint256 public disCtr = 0;

    // Retailer count
    uint256 public retCtr = 0;

    // Constructor
    constructor() {
        Owner = msg.sender;
    }

    // Modifier to check if caller is owner
    modifier onlyByOwner() {
        require(msg.sender == Owner, "Only owner can perform this action");
        _;
    }

    // Medicine Structure
    struct Medicine {
        uint256 id;
        string name;
        string description;
        uint256 RMSid;
        uint256 MANid;
        uint256 DISid;
        uint256 RETid;
        string stage;
    }

    // Mapping medicine id to Medicine struct
    mapping(uint256 => Medicine) medicines;

    // Medicine Stage
    string[] medicineStages = [
        "Medicine Ordered",
        "Raw Material Supply Stage",
        "Manufacturing Stage",
        "Distribution Stage",
        "Retail Stage",
        "Sold"
    ];

    // Raw Material Supplier Structure
    struct RawMaterialSupplier {
        address addr;
        uint256 id;
        string name;
        string place;
    }

    // Mapping RMS id to RawMaterialSupplier struct
    mapping(uint256 => RawMaterialSupplier) RMS;

    // Manufacturer Structure
    struct Manufacturer {
        address addr;
        uint256 id;
        string name;
        string place;
    }

    // Mapping Manufacturer id to Manufacturer struct
    mapping(uint256 => Manufacturer) MAN;

    // Distributor Structure
    struct Distributor {
        address addr;
        uint256 id;
        string name;
        string place;
    }

    // Mapping Distributor id to Distributor struct
    mapping(uint256 => Distributor) DIS;

    // Retailer Structure
    struct Retailer {
        address addr;
        uint256 id;
        string name;
        string place;
    }

    // Mapping Retailer id to Retailer struct
    mapping(uint256 => Retailer) RET;

    // Events
    event MedicineOrdered(uint256 indexed medicineId, string medicineName);
    event RawMaterialSupplied(uint256 indexed medicineId, uint256 indexed rmsId);
    event Manufactured(uint256 indexed medicineId, uint256 indexed manufacturerId);
    event Distributed(uint256 indexed medicineId, uint256 indexed distributorId);
    event Retailed(uint256 indexed medicineId, uint256 indexed retailerId);
    event Sold(uint256 indexed medicineId);

    // Add Raw Material Supplier
    function addRMS(address _address, string memory _name, string memory _place) 
        public 
        onlyByOwner 
    {
        rmsCtr++;
        RMS[rmsCtr] = RawMaterialSupplier(_address, rmsCtr, _name, _place);
    }

    // Add Manufacturer
    function addManufacturer(address _address, string memory _name, string memory _place) 
        public 
        onlyByOwner 
    {
        manCtr++;
        MAN[manCtr] = Manufacturer(_address, manCtr, _name, _place);
    }

    // Add Distributor
    function addDistributor(address _address, string memory _name, string memory _place) 
        public 
        onlyByOwner 
    {
        disCtr++;
        DIS[disCtr] = Distributor(_address, disCtr, _name, _place);
    }

    // Add Retailer
    function addRetailer(address _address, string memory _name, string memory _place) 
        public 
        onlyByOwner 
    {
        retCtr++;
        RET[retCtr] = Retailer(_address, retCtr, _name, _place);
    }

    // Order Medicine
    function orderMedicine(string memory _name, string memory _description) 
        public 
        onlyByOwner 
        returns (uint256) 
    {
        medicineCount++;
        medicines[medicineCount] = Medicine(
            medicineCount,
            _name,
            _description,
            0,
            0,
            0,
            0,
            medicineStages[0]
        );
        emit MedicineOrdered(medicineCount, _name);
        return medicineCount;
    }

    // Raw Material Supply
    function RMSsupply(uint256 _medicineID) public {
        require(
            _medicineID > 0 && _medicineID <= medicineCount,
            "Invalid medicine ID"
        );
        
        uint256 _id = findRMS(msg.sender);
        require(_id > 0, "Caller is not authorized RMS");
        
        require(
            keccak256(abi.encodePacked(medicines[_medicineID].stage)) == 
            keccak256(abi.encodePacked(medicineStages[0])),
            "Medicine not in correct stage"
        );
        
        medicines[_medicineID].RMSid = _id;
        medicines[_medicineID].stage = medicineStages[1];
        emit RawMaterialSupplied(_medicineID, _id);
    }

    // Manufacturing
    function Manufacturing(uint256 _medicineID) public {
        require(
            _medicineID > 0 && _medicineID <= medicineCount,
            "Invalid medicine ID"
        );
        
        uint256 _id = findMAN(msg.sender);
        require(_id > 0, "Caller is not authorized Manufacturer");
        
        require(
            keccak256(abi.encodePacked(medicines[_medicineID].stage)) == 
            keccak256(abi.encodePacked(medicineStages[1])),
            "Medicine not in correct stage"
        );
        
        medicines[_medicineID].MANid = _id;
        medicines[_medicineID].stage = medicineStages[2];
        emit Manufactured(_medicineID, _id);
    }

    // Distribution
    function Distribute(uint256 _medicineID) public {
        require(
            _medicineID > 0 && _medicineID <= medicineCount,
            "Invalid medicine ID"
        );
        
        uint256 _id = findDIS(msg.sender);
        require(_id > 0, "Caller is not authorized Distributor");
        
        require(
            keccak256(abi.encodePacked(medicines[_medicineID].stage)) == 
            keccak256(abi.encodePacked(medicineStages[2])),
            "Medicine not in correct stage"
        );
        
        medicines[_medicineID].DISid = _id;
        medicines[_medicineID].stage = medicineStages[3];
        emit Distributed(_medicineID, _id);
    }

    // Retail
    function Retail(uint256 _medicineID) public {
        require(
            _medicineID > 0 && _medicineID <= medicineCount,
            "Invalid medicine ID"
        );
        
        uint256 _id = findRET(msg.sender);
        require(_id > 0, "Caller is not authorized Retailer");
        
        require(
            keccak256(abi.encodePacked(medicines[_medicineID].stage)) == 
            keccak256(abi.encodePacked(medicineStages[3])),
            "Medicine not in correct stage"
        );
        
        medicines[_medicineID].RETid = _id;
        medicines[_medicineID].stage = medicineStages[4];
        emit Retailed(_medicineID, _id);
    }

    // Sell Medicine
    function sold(uint256 _medicineID) public {
        require(
            _medicineID > 0 && _medicineID <= medicineCount,
            "Invalid medicine ID"
        );
        
        uint256 _id = findRET(msg.sender);
        require(_id > 0, "Caller is not authorized Retailer");
        require(
            _id == medicines[_medicineID].RETid,
            "Medicine not available at this retailer"
        );
        
        medicines[_medicineID].stage = medicineStages[5];
        emit Sold(_medicineID);
    }

    // View functions
    function showStage(uint256 _medicineID) 
        public 
        view 
        returns (string memory) 
    {
        require(
            _medicineID > 0 && _medicineID <= medicineCount,
            "Invalid medicine ID"
        );
        return medicines[_medicineID].stage;
    }

    function getMedicineCount() public view returns (uint256) {
        return medicineCount;
    }

    function getMedicine(uint256 _medicineID) 
        public 
        view 
        returns (
            uint256,
            string memory,
            string memory,
            uint256,
            uint256,
            uint256,
            uint256,
            string memory
        ) 
    {
        require(
            _medicineID > 0 && _medicineID <= medicineCount,
            "Invalid medicine ID"
        );
        
        Medicine memory med = medicines[_medicineID];
        return (
            med.id,
            med.name,
            med.description,
            med.RMSid,
            med.MANid,
            med.DISid,
            med.RETid,
            med.stage
        );
    }

    function getRMS(uint256 _rmsID)
        public
        view
        returns (
            address,
            uint256,
            string memory,
            string memory
        )
    {
        require(_rmsID > 0 && _rmsID <= rmsCtr, "Invalid RMS ID");
        RawMaterialSupplier memory rms = RMS[_rmsID];
        return (rms.addr, rms.id, rms.name, rms.place);
    }

    function getManufacturer(uint256 _manID)
        public
        view
        returns (
            address,
            uint256,
            string memory,
            string memory
        )
    {
        require(_manID > 0 && _manID <= manCtr, "Invalid Manufacturer ID");
        Manufacturer memory man = MAN[_manID];
        return (man.addr, man.id, man.name, man.place);
    }

    function getDistributor(uint256 _disID)
        public
        view
        returns (
            address,
            uint256,
            string memory,
            string memory
        )
    {
        require(_disID > 0 && _disID <= disCtr, "Invalid Distributor ID");
        Distributor memory dis = DIS[_disID];
        return (dis.addr, dis.id, dis.name, dis.place);
    }

    function getRetailer(uint256 _retID)
        public
        view
        returns (
            address,
            uint256,
            string memory,
            string memory
        )
    {
        require(_retID > 0 && _retID <= retCtr, "Invalid Retailer ID");
        Retailer memory ret = RET[_retID];
        return (ret.addr, ret.id, ret.name, ret.place);
    }

    // Helper functions
    function findRMS(address _address) private view returns (uint256) {
        for (uint256 i = 1; i <= rmsCtr; i++) {
            if (RMS[i].addr == _address) {
                return RMS[i].id;
            }
        }
        return 0;
    }

    function findMAN(address _address) private view returns (uint256) {
        for (uint256 i = 1; i <= manCtr; i++) {
            if (MAN[i].addr == _address) {
                return MAN[i].id;
            }
        }
        return 0;
    }

    function findDIS(address _address) private view returns (uint256) {
        for (uint256 i = 1; i <= disCtr; i++) {
            if (DIS[i].addr == _address) {
                return DIS[i].id;
            }
        }
        return 0;
    }

    function findRET(address _address) private view returns (uint256) {
        for (uint256 i = 1; i <= retCtr; i++) {
            if (RET[i].addr == _address) {
                return RET[i].id;
            }
        }
        return 0;
    }

    // Get all participants count
    function getCounts() 
        public 
        view 
        returns (
            uint256,
            uint256,
            uint256,
            uint256,
            uint256
        ) 
    {
        return (medicineCount, rmsCtr, manCtr, disCtr, retCtr);
    }
} 