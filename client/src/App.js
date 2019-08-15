import React, { Component } from 'react'
import { BeatLoader } from 'react-spinners'
import NodeRSA from 'node-rsa'
import PUBLIC_KEY1 from './keys/public-key1'
import PUBLIC_KEY2 from './keys/public-key2'
import successIcon from './img/success-icon.png'
import qrCodeIcon from './img/qr-code.svg'
import arrowBackIcon from './img/arrow_back.svg'
import verifiedIcon from './img/verified_user.svg'
import Scanner from './components/Scanner/Scanner'
import ErrorMessage from './components/ErrorMessage/ErrorMessage'
import axios from 'axios'

import './App.css'
import './theme.css'
import './screens/Home.css'

const ENCORDER_SEPARATOR = "//",
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

function stepClassFromInt(int) {
  switch(int) {
    case 0:
      return ''
    case 1:
      return 'started'
    case 2:
      return 'ready-to-scan'
    default:
      return ''
  }
}

const initialState = {
  gotResult: false,
  loading: false,
  scanning: false,
  started: false,
  step: 0,
  verificationResult: null,
}
export default class App extends Component {
  state = { ...initialState }

  componentDidMount() {
    this.getCandidates()
  }

  start() {
    this.setState({ step: 1, })
  }

  prevStep() {
    this.setState((prevState) => ({ step: prevState.step - 1 }))
  }

  nextStep() {
    this.setState((prevState) => ({ step: prevState.step + 1 }))
  }

  render() {
    const { verificationResult, loading, scanning, scanned, error, step } = this.state

    const errorMessage = error && this.getErrorText(error)

    const stepClass = stepClassFromInt(step)

    return (
      <div className="App">
        <div className={'page-content ' + stepClass}>

          <div className="home-content">
            <img alt="Verified Icon" src={verifiedIcon} />
            <div className="text">
              <h1 className="color-main">Перевір свій голос</h1>
              <p className="color-darkgrey">на минулих універських виборах</p>
            </div>
            <button id="start" className="btn-large" onClick={this.start.bind(this)}>Перевірити</button>
          </div>

          <div className="gradient-circle">
            <div className="gradient-circle--container">
              <div>
                <p className="size-large weight-medium color-white">
                  Тобі знадобиться частина бюлетня з минулих виборів з зображенням <strong>QR коду</strong>
                </p>
                <img className="qr-code-icon" alt="QR code icon" src={qrCodeIcon} />
                <p className="size-large weight-regular color-white">
                  Перевірка голосу є <strong>анонімною</strong>
                </p>
              </div>
              <div className="controls">
                <button className="secondary low-opacity round" onClick={this.prevStep.bind(this)} >
                  <img alt="Стрілка назад" src={arrowBackIcon} />
                </button>
                <button className="secondary" onClick={this.nextStep.bind(this)}>
                  Почати
                </button>
              </div>
            </div>


          </div>

          {step === 2 &&
            <Scanner
              handleScan={this.handleScan}
              handleError={this.handleError}
              prevStep={this.prevStep.bind(this)}
            />
          }

          {error && <ErrorMessage message={errorMessage} />}

          {verificationResult &&
            <>
              <div className="result">
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                  <img src={successIcon} alt="success icon" />
                  <span>{verificationResult.value}</span>
                </div>
              </div>
              <div className="result-message-box">
                <p>Дякуємо, що скористався сервісом ЦВК ;)</p>
              </div>
            </>
          }
        </div>
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
      // alert('Unrecognized choice')
      this.setState({ error: 'unrecognizedChoice', loading: false, scanned: false })
      return
    }

    alert("Твій голос зараховано за: " + verificationResult.value)
    // this.setState({ verificationResult, loading: false })
    this.setState({ loading: false })

    console.log(verificationResult)

  }

  goToStart() {
    this.setState(initialState)
  }

  getErrorText(errorName) {
    switch (errorName) {
      case 'unrecognizedChoice':
        return 'Не вдалося перевірити твій голос. Перевір, що завантажуєш вірний QR код.'
      default:
        return 'Сталася помилка. Спробуй завантажити інше фото.'
    }
  }

  encryptOption = async (option) => {
    return this.rsaEncrypt(option)
  }

  handleScan = (number, order, salt) => {
    this.setState({ loading: true, scanned: true }, () => {
      this.checkVoteByBallotNum(number, order, salt)
    })
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

}

