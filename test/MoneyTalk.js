const {
  loadFixture,
} = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { expect } = require("chai");

describe("MoneyTalk", function () {
  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshot in every test.
  async function deployMoneyTalkFixture() {

    const [owner, otherAccount] = await ethers.getSigners();

    const Contract = await ethers.getContractFactory("MoneyTalk");
    const contract = await Contract.deploy();

    return { contract, owner, otherAccount };
  }

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      const { contract, owner } = await loadFixture(deployMoneyTalkFixture);

      expect(await contract.owner()).to.equal(owner.address);
    });
  });

  describe("Write quote", function () {
    it("Should emit the right event and set the right quote", async function () {
      const { contract, otherAccount } = await loadFixture(deployMoneyTalkFixture);


      await expect(contract.connect(otherAccount).write("Hello world", {value: BigInt(1e18)}))
          .to.emit(contract, "Said")
          .withArgs("Hello world", BigInt(1e18), 0, otherAccount.address); 
      
          const quote = await contract.quotes(0);

      expect(quote.text).to.equal("Hello world");
      expect(quote.tipFee).to.equal(BigInt(1e18));
    });
  });

  describe("Withdraw", function () {
    it("Should transfer the funds to the owner", async function () {
      const { contract, owner, otherAccount } = await loadFixture(
        deployMoneyTalkFixture
      );

      const balance = BigInt(1e18);

      await contract.connect(otherAccount).write("Hello world", {value: balance});

      await expect(await contract.withdrawAll()).to.changeEtherBalances(
        [owner, contract],
        [balance, - balance]
      );
    });
  });
});
