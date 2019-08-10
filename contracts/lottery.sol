pragma solidity ^0.4.17;

contract Lottery
{
    address public manager;
    address[] public players;

    function Lottery() public
    {
        manager = msg.sender;
    }

    function enterLottery() payable public minimumLotteryAmount
    {
        players.push(msg.sender);
    }

    function randomGenerator() private view returns(uint)
    {
        return uint(keccak256(block.difficulty,now,players));
    }

    function selectPlayer() private returns(address)
    {
        return players[uint(randomGenerator()%players.length)];
    }

    function lotteryDraw() public managerCanSelectWinner
    {
        require(players.length > 0);

        address winner = selectPlayer();
        winner.transfer(this.balance); // transfer lottery balance to winner
        players = new address[](0); // reset players array for new lottery draw
    }

    function getPlayers() public view returns (address[])
    {
      return players;
    }

    modifier managerCanSelectWinner
    {
         require(manager == msg.sender); // only manager can select winner of lottery Draw
         _;
    }

    modifier minimumLotteryAmount
    {
        require(msg.value > 0.01 ether); // minimum amount for draw is  0.01 ether
        _;
    }

}
