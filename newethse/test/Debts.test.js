const assert = require('assert');
const ganache = require('ganache-cli');
const Web3 = require('web3');
const web3 = new Web3(ganache.provider());
const compiledDebts = require('../build/Debts.json');

let accounts;
let debtsC;
let borrower;
const value = 100;

beforeEach ( async () => {
    accounts = await web3.eth.getAccounts();   
    debtsC = await new web3.eth.Contract(compiledDebts.abi)
    .deploy({data: compiledDebts.evm.bytecode.object})
    .send ({from: accounts[0], gas: '1000000'});
    
     borrower = accounts[1];
});

describe ("Debts", () => {
    it ("Deploys a contract", () => {
        assert.ok(debtsC.options.address);
    });

    it ('should allow to repay', async () => {
        await debtsC.methods.borrow(value).send({
            from: borrower, gas: '1000000'
        });

        let borrMap = await debtsC.methods.debts(borrower).call();
                console.log(borrMap);

        await debtsC.methods.repay(borrower, value)
              .send({from: accounts[0], gas: '1000000'});

        borrMap = await debtsC.methods.debts(borrower).call();

        assert.equal('0', borrMap);
    });

    it ('should emit Borrowed event on borrow', async () =>{
        const tx = await debtsC.methods.borrow(value).send ({
            from: borrower, gas: '1000000'
        });
        assert.ok( tx.events.Borrowed); 
        assert.equal(borrower, tx.events.Borrowed.returnValues.by);
        assert.equal(value, tx.events.Borrowed.returnValues.value);
    });

    it('should allow to borrow', async() =>{
        await debtsC.methods.borrow(value).send({
            from: borrower, gas: '1000000'
        });
        const borr = await debtsC.methods.debts(borrower).call();
        assert.equal(borr, value)   
      });

    it ('should emit Repayed event on repay', async() => {
        await debtsC.methods.borrow(value).send({
            from: borrower, gas: '1000000'
        });
        const tx = await debtsC.methods.repay(borrower, value).send ({
            from: accounts[0], gas: '1000000'
        });
        assert.ok( tx.events.Repayed); 
        assert.equal(borrower, tx.events.Repayed.returnValues.by);
        assert.equal(value, tx.events.Repayed.returnValues.value);
    
    });

    it ('should not allow owner to borrow', async() => {
        try {
          await debtsC.methods.borrow(value).send({
            from: accounts[0], gas: '1000000'
          });
          assert(false);  
        } catch (error) {
            assert(error);
        }
    });

    it ('should not allow not owner to repay', async() => {
        try {
            await debtsC.methods.borrow(value).send({
                from: borrower, gas: '1000000'
            });
            await debtsC.methods.repay(borrower, value).send({
                from: borrower, gas: '1000000'
            });
            assert(false);
        } catch (error) {
            assert(error);
        }
    });



})