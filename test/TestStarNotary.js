const StarNotary = artifacts.require('StarNotary');

contract('StarNotary', (accounts) => {
  let instance;
  const owner = accounts[0];
  const user1 = accounts[1];
  const user2 = accounts[2];

  beforeEach(async () => {
    instance = await StarNotary.new();
  });

  it('can Create a Star', async () => {
    let tokenId = 1;
    await instance.createStar('Awesome Star!', tokenId, { from: owner });
    assert.equal(
      await instance.tokenIdToStarInfo.call(tokenId),
      'Awesome Star!'
    );
  });

  it('lets user1 put up their star for sale', async () => {
    let starId = 2;
    let starPrice = web3.utils.toWei('.01', 'ether');
    await instance.createStar('awesome star', starId, { from: user1 });
    await instance.putStarUpForSale(starId, starPrice, { from: user1 });
    assert.equal(await instance.starsForSale.call(starId), starPrice);
  });

  it('lets user1 get the funds after the sale', async () => {
    let starId = 3;
    let starPrice = web3.utils.toWei('.01', 'ether');
    let balance = web3.utils.toWei('.05', 'ether');
    await instance.createStar('awesome star', starId, { from: user1 });
    await instance.putStarUpForSale(starId, starPrice, { from: user1 });
    let balanceOfUser1BeforeTransaction = await web3.eth.getBalance(user1);
    await instance.buyStar(starId, { from: user2, value: balance });
    let balanceOfUser1AfterTransaction = await web3.eth.getBalance(user1);
    let value1 = Number(balanceOfUser1BeforeTransaction) + Number(starPrice);
    let value2 = Number(balanceOfUser1AfterTransaction);
    assert.equal(value1, value2);
  });

  it('lets user2 buy a star, if it is put up for sale', async () => {
    let starId = 4;
    let starPrice = web3.utils.toWei('.01', 'ether');
    let balance = web3.utils.toWei('.05', 'ether');
    await instance.createStar('awesome star', starId, { from: user1 });
    await instance.putStarUpForSale(starId, starPrice, { from: user1 });
    let balanceOfUser1BeforeTransaction = await web3.eth.getBalance(user2);
    await instance.buyStar(starId, { from: user2, value: balance });
    assert.equal(await instance.ownerOf.call(starId), user2);
  });

  it('lets user2 buy a star and decreases its balance in ether', async () => {
    let starId = 5;
    let starPrice = web3.utils.toWei('.01', 'ether');
    let balance = web3.utils.toWei('.05', 'ether');
    await instance.createStar('awesome star', starId, { from: user1 });
    await instance.putStarUpForSale(starId, starPrice, { from: user1 });
    let balanceOfUser1BeforeTransaction = await web3.eth.getBalance(user2);
    const balanceOfUser2BeforeTransaction = await web3.eth.getBalance(user2);
    await instance.buyStar(starId, {
      from: user2,
      value: balance,
      gasPrice: 0,
    });
    const balanceAfterUser2BuysStar = await web3.eth.getBalance(user2);
    let value =
      Number(balanceOfUser2BeforeTransaction) -
      Number(balanceAfterUser2BuysStar);
    assert.equal(value, starPrice);
  });

  // Implement Task 2 Add supporting unit tests

  it('can add the star name and star symbol properly', async () => {
    // 1. create a Star with different tokenId
    await instance.createStar('MY STAR', 42, { from: owner });
    //2. Call the name and symbol properties in your Smart Contract and compare with the name and symbol provided
    const name = await instance.name();
    assert.equal(name, 'BeardedStarToken');
    const symbol = await instance.symbol();
    assert.equal(symbol, 'BST');
  });

  it('lets 2 users exchange stars', async () => {
    // 1. create 2 Stars with different tokenId
    const id1 = 99;
    const id2 = 100;
    await instance.createStar('MY STAR', id1, { from: user1 });
    await instance.createStar('MY STAR', id2, { from: user2 });
    // 2. Call the exchangeStars functions implemented in the Smart Contract
    await instance.exchangeStars(id1, id2, { from: user1 });
    // 3. Verify that the owners changed
    const owner1 = await instance.ownerOf(id1);
    const owner2 = await instance.ownerOf(id2);

    assert.equal(owner1, user2);
    assert.equal(owner2, user1);
  });

  it('lets a user transfer a star', async () => {
    // 1. create a Star with different tokenId
    const id = 420;
    await instance.createStar('MY STAR', id, { from: user1 });
    // 2. use the transferStar function implemented in the Smart Contract
    await instance.transferStar(user2, id, { from: user1 });
    // 3. Verify the star owner changed.
    const newOwner = await instance.ownerOf(id);
    assert.equal(newOwner, user2);
  });

  it('lookUptokenIdToStarInfo test', async () => {
    // 1. create a Star with different tokenId
    const name = 'Some bearded star :ok_hand:';
    const id = 999;
    await instance.createStar(name, id, { from: user1 });
    // 2. Call your method lookUptokenIdToStarInfo
    const lookedUpName = await instance.lookUptokenIdToStarInfo(id);
    // 3. Verify if you Star name is the same
    assert.equal(name, lookedUpName);
  });
});
