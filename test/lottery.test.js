const assert = require('assert');
const ganache = require('ganache-cli');
const Web3 = require('web3');

const web3 = new Web3(ganache.provider());

const { interface,bytecode } = require('../compile');

let accounts;
let lottery;

beforeEach(async () => {

    accounts = await web3.eth.getAccounts();

    lottery = await new web3.eth.Contract(JSON.parse(interface))
              .deploy({ data: bytecode } )
              .send({ from : accounts[0], gas : '1000000' });

});

describe('Lottery Contract', () => {

  it('deploys contract', () => {
      assert.ok(lottery.options.address);
  });

  it('allows one account to enter in draw', async () => {

    await lottery.methods.enterLottery().send({
      from  : accounts[1],
      value : web3.utils.toWei('0.02','ether')
    });

    const players = await lottery.methods.getPlayers().call({
      from:accounts[0]
    });

    assert.equal(accounts[1],players[0])
    assert.equal(players.length,1);

  });

  it('allows multiple account to enter in draw', async () => {

    await lottery.methods.enterLottery().send({
      from  : accounts[1],
      value : web3.utils.toWei('0.02','ether')
    });

    await lottery.methods.enterLottery().send({
      from : accounts[2],
      value: web3.utils.toWei('0.02','ether')
    });

    const players = await lottery.methods.getPlayers().call({
      from:accounts[0]
    });

    assert.equal(accounts[1],players[0])
    assert.equal(accounts[2],players[1])
    assert.equal(players.length,2);

  });

  it('require minimum amount of ether to enter lottery',async () =>{

    try {
      await lottery.methods.enterLottery().send({
        from  : accounts[1],
        value : 0
      });
    }
    catch (errorMessage) {
      assert(true);
      return;
    }
    assert(false);

  });


    it('allows only manager to pick winner of lottery draw',async () =>{

      try {

// enter player to draw
        await lottery.methods.enterLottery().send({
          from  : accounts[1],
          value : web3.utils.toWei('0.02','ether')
        });

// pick winner
        await lottery.methods.lotteryDraw().send({
          from  : accounts[1]
        });

      }
      catch (errorMessage) {
        assert(true);
        return;
      }
      assert(false);

    });

    it('sends money to winner and reset players',async () =>{

// enter player to draw
        await lottery.methods.enterLottery().send({
          from  : accounts[1],
          value : web3.utils.toWei('1','ether')
        });

// check player initial balance
        const playerInitBal = await web3.eth.getBalance(accounts[1]);

// pick winner
        await lottery.methods.lotteryDraw().send({
          from  : accounts[0]
        });

// check player balance after draw
        const playerAfterBal = await web3.eth.getBalance(accounts[1]);

        assert((playerAfterBal - playerInitBal) > web3.utils.toWei('0.8','ether'));

        const players = await lottery.methods.getPlayers().call({
              from:accounts[0]
        });

        assert.equal(players.length,0);

    });

});
