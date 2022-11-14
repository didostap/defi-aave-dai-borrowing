const { getNamedAccounts, ethers, network } = require('hardhat');
const { networkConfig } = require('../helper-hardhat-config');
const { getWeth, AMOUNT } = require('./getWeth');

const BORROW_PERCENT = 0.95;

const getLendingPool = async (account, lendingPoolAddressesProviderAddress) => {
    const lendingPoolAddressesProvider = await ethers.getContractAt(
        'ILendingPoolAddressesProvider',
        lendingPoolAddressesProviderAddress,
        account
    );

    const lendingPoolAddress = await lendingPoolAddressesProvider.getLendingPool();
    return await ethers.getContractAt('ILendingPool', lendingPoolAddress, account);
};

const approveERC20 = async ({ erc20Address, spenderAddress, amountToSpend, account }) => {
    const erc20Token = await ethers.getContractAt('IERC20', erc20Address, account);
    const tx = await erc20Token.approve(spenderAddress, amountToSpend);
    tx.wait(1);
    console.log('Approved!');
};

const getBorrowUserData = async (lendingPool, account) => {
    const { totalCollateralETH, totalDebtETH, availableBorrowsETH } = await lendingPool.getUserAccountData(account);
    console.log(`You have ${totalCollateralETH} worth of ETH deposited.`);
    console.log(`You have ${totalDebtETH} worth of ETH borrowed.`);
    console.log(`You can borrow ${availableBorrowsETH} worth of ETH.`);
    return { availableBorrowsETH, totalDebtETH };
};

const getDaiPrice = async (daiEthOracleAddress) => {
    const daiEthPriceFeed = await ethers.getContractAt('AggregatorV3Interface', daiEthOracleAddress);
    const { answer } = await daiEthPriceFeed.latestRoundData();
    console.log('DAI/ETH price: ', answer.toString());
    return answer;
};

const borrowDai = async ({ daiAddress, lendingPool, amountDaiToBorrowWei, account }) => {
    const tx = await lendingPool.borrow(daiAddress, amountDaiToBorrowWei, 1, 0, account);
    await tx.wait(1);
    console.log('Borrowed!');
};

const main = async () => {
    const chainId = network.config.chainId;
    const { wethTokenAddress, daiAddress, daiEthOracleAddress, lendingPoolAddressesProviderAddress } =
        networkConfig[chainId];
    await getWeth(wethTokenAddress);
    const { deployer } = await getNamedAccounts();
    const lendingPool = await getLendingPool(deployer, lendingPoolAddressesProviderAddress);

    await approveERC20({
        erc20Address: wethTokenAddress,
        spenderAddress: lendingPool.address,
        amountToSpend: AMOUNT,
        account: deployer,
    });
    console.log('Depositing...');

    lendingPool.deposit(wethTokenAddress, AMOUNT, deployer, 0);
    console.log('Deposited!');

    const { availableBorrowsETH } = await getBorrowUserData(lendingPool, deployer);
    const daiPrice = await getDaiPrice(daiEthOracleAddress);
    const amountDaiToBorrow = availableBorrowsETH.toString() * BORROW_PERCENT * (1 / daiPrice.toNumber());
    console.log(`You can borrow ${amountDaiToBorrow} DAI`);
    const amountDaiToBorrowWei = ethers.utils.parseEther(amountDaiToBorrow.toString());
    await borrowDai({
        daiAddress,
        lendingPool,
        amountDaiToBorrowWei,
        account: deployer,
    });
};

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
