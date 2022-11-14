const { getNamedAccounts, ethers } = require('hardhat');

const AMOUNT = ethers.utils.parseEther('0.01');

const getWeth = async (wethTokenAddress) => {
    const { deployer } = await getNamedAccounts();

    const iWeth = await ethers.getContractAt('IWeth', wethTokenAddress, deployer);

    const tx = await iWeth.deposit({ value: AMOUNT });
    await tx.wait(1);

    const wethBalance = await iWeth.balanceOf(deployer);
    console.log('wethBalance', wethBalance.toString());
};

module.exports = { getWeth, AMOUNT };
