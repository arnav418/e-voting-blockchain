async function main() {
    const Election = await ethers.getContractFactory("Election");
    const election = await Election.deploy();
    
    await election.waitForDeployment(); // ✅ Use this in Ethers v6

    console.log("Election contract deployed at:", await election.getAddress());
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
