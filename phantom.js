class PhantomWallet {
  getInfo() {
    return {
      id: 'PhantomWallet',
      name: 'Phantom Wallet Extension',
      color1: '#91b8ff',
      color2: '#576c91',
      color3: '#2e394d',
      blocks: [
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
        {
          opcode: 'sendPayment',
          blockType: Scratch.BlockType.COMMAND,
          text: 'Send [AMOUNT] SOL to [RECIPIENT]',
          arguments: {
            AMOUNT: {
              type: 'number',
              defaultValue: 0.01
            },
            RECIPIENT: {
              type: 'string',
              defaultValue: 'RecipientAddressHere'
            }
          }
        },
        {
          opcode: 'getLastTxSignature',
          blockType: Scratch.BlockType.REPORTER,
          text: 'Last Transaction Signature'
        },
      ]
    };
  }

  async _ensureWeb3() {
    if (!window.solanaWeb3) {
      await new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = 'https://unpkg.com/@solana/web3.js@latest/lib/index.iife.js';
        script.onload = () => {
          window.solanaWeb3 = solanaWeb3;
          resolve();
        };
        script.onerror = reject;
        document.head.appendChild(script);
      });
    }
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

  async sendPayment(args) {
    await this._ensureWeb3();
    if (!window.solana || !window.solana.isPhantom) {
      alert('Phantom Wallet not found!');
      return;
    }
    if (!this._phantomAddress) {
      alert('Please connect to Phantom first!');
      return;
    }
    const recipient = args.RECIPIENT;
    const amount = Number(args.AMOUNT);
    if (!recipient || isNaN(amount) || amount <= 0) {
      alert('Invalid recipient or amount.');
      return;
    }    try {
      // Use Solana Web3.js to create and send transaction (using devnet for testing)
      const connection = new window.solanaWeb3.Connection('https://api.devnet.solana.com');
      const fromPubkey = new window.solanaWeb3.PublicKey(this._phantomAddress);
      const toPubkey = new window.solanaWeb3.PublicKey(recipient);
      const transaction = new window.solanaWeb3.Transaction().add(
        window.solanaWeb3.SystemProgram.transfer({
          fromPubkey,
          toPubkey,
          lamports: amount * window.solanaWeb3.LAMPORTS_PER_SOL
        })
      );
      transaction.feePayer = fromPubkey;
      const { blockhash } = await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      const signed = await window.solana.signTransaction(transaction);
      const signature = await connection.sendRawTransaction(signed.serialize());
      this._lastTxSignature = signature;
      alert('Transaction sent! Signature: ' + signature);
    } catch (e) {
      alert('Payment failed: ' + e.message);
    }
  }

  getLastTxSignature() {
    return this._lastTxSignature || '';
  }
}

Scratch.extensions.register(new PhantomWallet());
