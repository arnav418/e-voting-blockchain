const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3"; // Update with deployed contract address
let contractABI;
let provider;
let signer;
let contract;

// Load contract ABI
async function loadABI() {
    try {
        const response = await fetch('./ElectionABI.json');
        contractABI = await response.json();
        console.log("ABI Loaded Successfully.");
    } catch (error) {
        console.error("Failed to load ABI:", error);
        alert("Failed to load contract ABI. Check if the file exists.");
    }
}

// Initialize contract after loading ABI
async function initContract() {
    if (!window.ethereum) {
        alert("Please install MetaMask!");
        return;
    }

    try {
        provider = new ethers.providers.Web3Provider(window.ethereum);
        await provider.send("eth_requestAccounts", []);
        signer = provider.getSigner();

        if (!contractABI) {
            await loadABI();
        }

        contract = new ethers.Contract(contractAddress, contractABI, signer);
        console.log("Contract Initialized:", contract);
    } catch (error) {
        console.error("Contract initialization error:", error);
        alert("Failed to initialize contract. Check console for details.");
    }
}

// Connect wallet and initialize contract
async function connectWallet() {
    await initContract();
    if (contract) {
        console.log("Connected to wallet successfully.");
        await loadCandidates();
    }
}

async function loadCandidates() {
    try {
        const candidateCountBN = await contract.candidatesCount();
        const candidateCount = candidateCountBN.toNumber(); // Convert BigNumber to integer
        const candidatesList = document.getElementById("candidatesList");
        candidatesList.innerHTML = "";

        for (let i = 1; i <= candidateCount; i++) {
            const candidate = await contract.candidates(i);
            const li = document.createElement("li");
            li.innerHTML = `${candidate.name} 
                <button onclick="vote(${candidate.id.toNumber()})">Vote</button>`;
            candidatesList.appendChild(li);
        }
    } catch (error) {
        console.error("Error loading candidates:", error);
        alert("Failed to load candidates. Make sure the contract is deployed correctly.");
    }
}




// Vote for a candidate
async function vote(candidateId) {
    if (!contract) {
        alert("Contract not initialized properly.");
        return;
    }

    try {
        console.log(`Voting for candidate ID: ${candidateId}...`);
        const button = document.querySelector(`button[onclick="vote(${candidateId})"]`);
        if (button) button.innerText = "Voting...";

        const tx = await contract.vote(candidateId);
        await tx.wait(); // Wait for the transaction to be mined

        alert("Vote cast successfully!");
        await loadCandidates(); // Refresh candidates list
    } catch (error) {
        console.error("Error voting:", error);
        alert("Failed to cast vote. Check console for details.");
    } finally {
        const button = document.querySelector(`button[onclick="vote(${candidateId})"]`);
        if (button) button.innerText = "Vote";
    }
}

document.getElementById("connectWallet").addEventListener("click", connectWallet);

// Load ABI before initializing
loadABI();
