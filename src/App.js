import React from 'react';
import LoadingOverlay from 'react-loading-overlay';
import './App.css';
import web3 from './web3';
import lottery from './lottery';
import contractInfo from './contractConfig';

class App extends React.Component {
  state = { 
    manager: '', 
    players: [], 
    balance: '', 
    value: '', 
    message: '', 
    isMetaMaskPluginAvailable: false, 
    isTransactionIsRunning: false 
};
  
  async componentDidMount() {
    const isMetaMaskPluginAvailable = web3 && lottery;
    this.setState({ isMetaMaskPluginAvailable });    
    if (isMetaMaskPluginAvailable) {
      this.updateContractInfo();
    }
  }

  async updateContractInfo() {
    const manager = await lottery.methods.manager().call();
    const players = await lottery.methods.getPlayers().call();
    const balance = await web3.eth.getBalance(lottery.options.address);
    this.setState({ manager, players, balance });
  }

  onSubmit = async (event) => {
    event.preventDefault();
    await window.ethereum.enable();
    const accounts = await web3.eth.getAccounts();
    this.setState({ message: 'Transaction is processing. This might take 12 to 30 seconds.', isTransactionIsRunning: true });
    await lottery.methods.enter().send({
      from: accounts[0],
      value: web3.utils.toWei(this.state.value, 'ether')
    });
    this.updateContractInfo();
    this.setState({ message: 'You entered to the lottery', isTransactionIsRunning: false, value: '' });
  };

  onClickPickWinner = async () => {
    await window.ethereum.enable();
    const accounts = await web3.eth.getAccounts();
    this.setState({ message: 'Transaction is processing. This might take 9 to 15 seconds.', isTransactionIsRunning: true });
    await lottery.methods.pickWinner().send({
      from: accounts[0]
    });
    this.setState({ message: 'Winner picked', isTransactionIsRunning: false });
  };

  onClickUpdateAnnouncement = () => {
    this.updateContractInfo();
  }

  mainWindow() {
    return (
      <div className="container-contact100">
        <div className="wrap-contact100">
          <form onSubmit={this.onSubmit} className="contact100-form validate-form">
            <span className="contact100-form-title">
              Try Your Luck
            </span>
            { this.inputForm() }
            { this.announcements() }
          </form>
          { this.rules() }
        </div>
      </div>
    );
  }

  rules() {
    return (
      <div className="contact100-more flex-col-c-m">
        <div className="flex-w size1 p-b-47">
          <div className="txt1 p-r-25">
            <span className="lnr lnr-book"></span>
          </div>

          <div className="flex-col size2">
            <span className="txt1 p-b-20">
              Simple Ethereum Lottery dapp
            </span>

            <span className="txt2">
              This lottery deal has a pool of prizes and a list of people joining the pool of prizes. 
              People send some amount of money to the contract. As soon as people send some amount of money, they are recorded as a player.
              After a certain period of time, the contract manager will make a contract to pick a winner. 
              Then the contract will randomly pick the winner and transfer all the money from the prize pool to the winner. At that point, the lottery contract is reset and ready to accept a new list of players. 
            </span>

            <div className="contract-info-container">
              <div>
                Contract Address: { contractInfo.contractAddress }
              </div>
            </div>
          </div>
        </div>

      </div>
    );
  }

  announcements() {
    const { manager, players, balance } = this.state;
    return (
      <div className="announcement-container">
        <div className="announcement-title">
          Current Stats
          <div className="refresh-button" onClick={this.onClickUpdateAnnouncement}>
            <span className="refresh-text">Refresh</span>
            <span className="lnr lnr-sync refresh-icon"></span>
          </div>
        </div>
        <div className="announcement-section">
          <span className="lnr lnr-bullhorn announcement-icon"></span>
          <div className="announcement-status">
            Minimum <span className="marked-number">0.0001</span> ether is required.
          </div>
        </div>
        <div className="announcement-section">
          <span className="lnr lnr-bullhorn announcement-icon"></span>
          <div className="announcement-status">
            The contract is managed by <span className="manager-address">{ manager }</span>.
          </div>
        </div>
        <div className="announcement-section">
          <span className="lnr lnr-bullhorn announcement-icon"></span>
          <div className="announcement-status">
            Total <span className="marked-number">{ players.length }</span> players already joined here.
          </div>
        </div>
        <div className="announcement-section">
          <span className="lnr lnr-bullhorn announcement-icon"></span>
          <div className="announcement-status">
            You may win <span className="marked-number">{ web3.utils.fromWei(balance, 'ether') }</span> ether !!!.
          </div>
        </div>
        <div className="manager-section">
          <div className="manager-warning">(Only For Contract Manager)</div>
          <button onClick={this.onClickPickWinner} className="custom-button" >Pick Winner</button>
        </div>
      </div>
    );
  }

  inputForm() {
    return (
      <div>
        <div className="wrap-input100 validate-input">
          <input 
            id="email" 
            className="input100" 
            type="text" 
            name="email" 
            placeholder="Example: 0.50"
            value={this.state.value}
            onChange={event => this.setState({ value: event.target.value })} />
          <span className="focus-input100"></span>
        </div>
        <div className="container-contact100-form-btn">
          <button className="contact100-form-btn">
            Join
          </button>
        </div>
      </div>
    );
  }

  render() {
    const { isMetaMaskPluginAvailable, isTransactionIsRunning, message } = this.state;
    if (isMetaMaskPluginAvailable) {
      return (
        <LoadingOverlay
          active={ isTransactionIsRunning }
          spinner
          text={ message }>
            {  this.mainWindow() }
        </LoadingOverlay>
      );
    } else {
      return (
        <LoadingOverlay
          active={!isMetaMaskPluginAvailable}
          spinner
          text='Metamask plugin not found...'
          >
          <p className='no-meta-mask'></p>
        </LoadingOverlay>
      )
    }
  }
}

export default App;
 