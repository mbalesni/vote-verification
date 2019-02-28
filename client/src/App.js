import React, { Component } from 'react'
import QrReader from 'react-qr-reader'
import { BeatLoader } from 'react-spinners'
import NodeRSA from 'node-rsa'
import PUBLIC_KEY1 from './public-key1'
import PUBLIC_KEY2 from './public-key2'
import successIcon from './img/success-icon.png'
import CVKIcon from './img/cvk-logo.png'
import Scanner from './scanner'
import axios from 'axios'

import './App.css'

console.log(successIcon)
console.log(process.env)

const VER_QR_SEPARATOR = ":",
  ENCORDER_SEPARATOR = "//",
  DENVELOPE_SEPARATOR = ":",
  STATUSES = {
    "-3": {
      displayValue: "Дублікат",
      value: "duplicate"
    },
    "-2": {
      displayValue: "Не просканований",
      value: "unscanned"
    },
    "-1": {
      displayValue: "Відкликаний",
      value: "revoked"
    },
    "0": {
      displayValue: "Зіпсований",
      value: "spoilt"
    }
  }
export default class App extends Component {
  state = {
    scanning: false,
    verificationResult: null,
    loading: false
  }

  componentDidMount() {
    this.getCandidates()
  }

  render() {
    const { verificationResult, loading, scanning, scanned } = this.state

    return (
      <div className="App">
        <div className="page-content">

          {!scanning && !verificationResult &&
            <>
              <img className="hero-logo" src={CVKIcon} alt="Логотип ЦВК студентів КНУ" />
              <p className="instructions">Тут ти можеш перевірити правильність зарахування свого голосу на минулих виборах.<br /> Підготов відривну частину свого бюлетеня та відскануй її. </p>
              <button className="btn-primary" onClick={this.onScanStart.bind(this)}>Перевірити голос</button>
            </>
          }

          {scanning && !scanned &&
            <Scanner
              handleScan={this.handleScan}
              handleError={this.handleError}
            />
          }

          <BeatLoader
            className="spinner"
            size={15}
            margin="4px"
            loading={loading}
            color="#1971c2"
          />

          {verificationResult &&
            <>
              <div className="result">
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                  <img src={successIcon} alt="success icon" />
                  <span>{verificationResult.value}</span>
                </div>
              </div>
              <div className="result-message-box">
                <p>Дякуємо, що взяв участь у виборах ;)</p>
              </div>
            </>
          }
        </div>


        <footer>
          {/* <i className="fas fa-user-secret"></i> */}
        </footer>

      </div>
    )
  }

  getCandidates() {
    axios.get('/get_candidates')
      .then(res => {
        if (res.data) this.candidates = res.data
        else {
          alert('Error getting candidates')
        }
      })
      .catch(err => {
        alert('Error getting candidates')
        console.warn(err)

      })
  }

  onScanStart() {
    this.setState({ scanning: true })
  }

  async getBallot(number) {
    let ballot
    try {
      let response = await axios.get('/get_ballot/' + number)
      ballot = response.data.ballot
    } catch (err) {
      console.error(err)
    }
    return ballot
  }

  checkVoteByBallotNum = async (ballotNum, order, salt) => {
    // get double envelope from backend
    let D_ENVELOPE
    try {
      D_ENVELOPE = await this.getBallot(ballotNum)
    } catch (err) { console.error(err) }

    // create encOrder
    let ENC_ORDER = this.rsaEncrypt(
      order + ENCORDER_SEPARATOR + salt,
      PUBLIC_KEY1,
      "base64"
    )

    const CHOICE_OPTIONS = [...Object.keys(STATUSES), ...Object.keys(this.candidates)]

    const choiceValue = this.bruteforceChoice(
      D_ENVELOPE,
      ENC_ORDER,
      CHOICE_OPTIONS,
      PUBLIC_KEY2
    )

    let verificationResult = {}

    if (this.candidates[choiceValue]) {
      verificationResult.type = 'candidate'
      verificationResult.value = this.candidates[choiceValue]
    } else if (STATUSES[choiceValue]) {
      verificationResult.type = 'status'
      verificationResult.value = STATUSES[choiceValue]
    } else {
      // FIXME: handle unrecognized
      alert('Unrecognized choice')
    }

    this.setState({ verificationResult, loading: false })

    console.log(verificationResult)

  }

  encryptOption = async (option) => {
    return this.rsaEncrypt(option)
  }

  handleScan = (verificationQr) => {
    if (verificationQr) {
      this.setState({ loading: true, scanned: true }, () => {
        const { number, order, salt } = this.parseQR(verificationQr, VER_QR_SEPARATOR)
        this.checkVoteByBallotNum(number, order, salt)
      })
    }

  }

  handleError = (error) => {
    console.warn(error)
  }

  rsaEncrypt(data, key, encoding) {
    const k = new NodeRSA()
    k.importKey(key, "public")
    k.setOptions({
      encryptionScheme: {
        scheme: "pkcs1",
        padding: 3, // constants.RSA_NO_PADDING
        toString: function () {
          return "pkcs1-nopadding"
        }
      }
    })
    return k.encrypt(data, encoding)
  }

  bruteforceChoice(realEnvelope, encOrder, choices, key) {
    let len = choices.length
    for (let i = 0; i < len; i++) {
      let choiceGuess = choices[i]
      let envelopeGuess = this.createDoubleEnvelope(encOrder, choiceGuess, key)
      if (envelopeGuess === realEnvelope) return choiceGuess
    }
  }

  createDoubleEnvelope(encOrder, choice, key) {
    return this.rsaEncrypt(btoa(choice) + DENVELOPE_SEPARATOR + encOrder, key, "base64")
  }

  parseQR(content, separator) {
    try {
      const dataArr = content.split(separator)
      const number = dataArr[0]
      const order = atob(dataArr[1])
      const salt = atob(dataArr[2])
      return { number, order, salt }
    } catch (err) {
      console.warn(err)
      throw new Error(err.message)
    }
  }


}

