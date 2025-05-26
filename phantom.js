class TEMPLATE {
  getInfo() {
    return {
      id: 'Template',
      name: 'Template Extension',
      color1: '#91b8ff',
      color2: '#576c91',
      color3: '#2e394d',

      blocks: [
        {
          opcode: 'tempcom',
          blockType: Scratch.BlockType.COMMAND,
          text: 'Template Command'
        },
        {
          opcode: 'connectPhantom',
          blockType: Scratch.BlockType.COMMAND,
          text: 'Connect to Phantom Wallet'
        },
        {
          opcode: 'getPhantomAddress',
          blockType: Scratch.BlockType.REPORTER,
          text: 'Phantom Wallet Address'
        },
      ]
    };
  }

  tempcom() {
    return '';
  }

  async connectPhantom() {
    if (window.solana && window.solana.isPhantom) {
      try {
        const resp = await window.solana.connect();
        this._phantomAddress = resp.publicKey.toString();
      } catch (e) {
        alert('Connection to Phantom failed: ' + e.message);
      }
    } else {
      alert('Phantom Wallet not found!');
    }
  }

  getPhantomAddress() {
    return this._phantomAddress || '';
  }
}

Scratch.extensions.register(new TEMPLATE());