import React, { Component } from 'react'
import qrCodeIcon from './img/qr-code.svg'
import arrowBackIcon from './img/arrow_back.svg'
import verifiedIcon from './img/verified_user.svg'
import Scanner from './components/Scanner/Scanner'
import Result from './components/Result/Result'
import Verificator from './verificator';

import './App.scss'
import './theme.css'

function stepClassFromInt(int) {
  switch (int) {
    case 0:
      return 'home'
    case 1:
      return 'started'
    case 2:
      return 'ready-to-scan'
    case 3:
      return 'result'
    default:
      return ''
  }
}

const initialState = {
  gotResult: false,
  loading: false,
  started: false,
  step: 0,
  verificationResult: null,
}
export default class App extends Component {
  state = { ...initialState }

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
    const { verificationResult, step } = this.state

    const stepClass = stepClassFromInt(step)

    console.log(step)

    return (
      <div className="App">
        <div className={'page-content ' + stepClass}>

          <div className="home-content">
            <img alt="Verified Icon" src={verifiedIcon} />
            <div className="text">
              <h2 className="color-main">Перевір свій голос</h2>
              <p className="color-darkgrey">на минулих універських виборах</p>
            </div>
            <button id="start" className="btn-large" onClick={this.start.bind(this)}>Перевірити</button>
          </div>

          <div className="gradient-circle">
            <div className="gradient-circle--container">
              <div className="qr-instructions">
                <p className="size-large weight-medium color-white" style={{ maxWidth: 360, margin: '0 auto' }}>
                  Тобі знадобиться частина бюлетня з минулих виборів з зображенням <strong>QR коду</strong>
                </p>
                <img className="qr-code-icon" alt="QR code icon" src={qrCodeIcon} />
                <p className="size-large weight-regular color-white">
                  Перевірка голосу є <strong>анонімною</strong>
                </p>
              </div>
              <div className="controls-wrapper">
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
          </div>

          {step === 2 &&
            <Scanner
              handleScan={this.handleScan}
              handleError={this.handleError}
              prevStep={this.prevStep.bind(this)}
            />
          }

          {step === 3 && verificationResult &&
            <Result result={verificationResult} />
          }
          
          <a
              href="https://t.me/GoVoteHelpBot"
              className="footer-link weight-semi-bold color-main"
              target="_blank"
              rel="noopener noreferrer"
            >@GoVoteHelpBot</a>
        </div>
      </div>
    )
  }

  goToStart() {
    this.setState(initialState)
  }

  getErrorText(errorName) {
    switch (errorName) {
      case 'unrecognizedChoice':
        return 'Не вдалося перевірити твій голос. Перевір, що завантажуєш вірний QR код.'
      case 'ballotNotFound':
        return 'Не вдалося знайти твій бюлетень.'
      case 'wrongQr':
        return 'Невірний формат QR коду. Перевір, що завантажуєш вірний QR код.'
      default:
        return 'Сталася помилка. Спробуй завантажити інше фото.'
    }
  }

  handleScan = (number, order, salt) => {
    this.setState({ loading: true }, () => {
      Verificator.verify(number, order, salt)
        .then(verificationResult => {
          if (!verificationResult.error) {
            this.setState({ verificationResult })
            this.nextStep()
          } else {
            alert(this.getErrorText(verificationResult.error))
          }
        })
        .finally(() => {
          this.setState({ loading: false })
        })
    })
  }

  handleError = (error) => {
    console.warn(error)
  }

}

