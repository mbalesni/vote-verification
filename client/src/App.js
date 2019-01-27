import React, { Component } from 'react';
import QrReader from 'react-qr-reader'
import { BeatLoader } from 'react-spinners'
import NodeRSA from 'node-rsa'
import constants from 'constants'
import PUBLIC_KEY from './public-key'
import Scanner from './scanner'
import axios from 'axios'

import './App.css';


// left side QR == b64encoded plaintext of `order` + `salt` + `ballotNum`
// WydDIycsICdQeXRob24nLCAnSmF2YScsICdHbycsICdKYXZhU2NyaXB0J10=:abmZbRQMd/ubbNvZH3SLELVyRl/n6OU7KXCxWJau2O8=:MTIzNDU2Nzg=

// encrypted `order` + `salt`
// smlTn8zB2tqvIeQqK7oGTrHzfYxSNZ5snk5Z+pdOyjG50upfKWA/1R7KAK4l+PsehYI/RxNzYPgLthc7K9DM+HYD6oKlJ8XllI7OG/STtpNUWrLEfzvO38sw2iJHIin+PwNk5GkLcMl4rDI7rXUySvXUbrgwTsIxO1RcAwncdsQ=

// right side QR == encrypted(`order` + `salt`) + ballotNum
// smlTn8zB2tqvIeQqK7oGTrHzfYxSNZ5snk5Z+pdOyjG50upfKWA/1R7KAK4l+PsehYI/RxNzYPgLthc7K9DM+HYD6oKlJ8XllI7OG/STtpNUWrLEfzvO38sw2iJHIin+PwNk5GkLcMl4rDI7rXUySvXUbrgwTsIxO1RcAwncdsQ=:MTIzNDU2Nzg=

// doubleEnvelope == encrypted(`choice` + encrypted(`order` + `salt`))
// where `choice` + encrypted(`order` + `salt`) == eyJjaG9pY2UiOjF9:VUdsNFRnWTd3WTZwaEIwNHoxVStJVytia2tBNWwxY1hJeWtESklVbEZaWCtkVzBMeGlqTjdGdWhUN3dQMHVwUkFSbjNWUjZ0c0hSUEZHOUxkT3lLVUErNVMzZkhBbVpORmZUbldTdTQvczkwWmpxK2tXK1psTjc1U2t1aEh2Ujd6ZmNXRW1GeGJpM1EybHJFcW5JT0h5ZVRkZjM0bGxobDB0WWM0bXhYeW04PQ==
//
// KdVCUs2E4R6n3hIWLNhxI5K8gjKgNl7/1Q4DeV6F1L/SFc87btDjTNZdU3VWXMlEP/PSRcUFrT0dK39x6FomykcMTomS7jNww67CTrS78uGij3hSq3FF9rNJs+KwL4hivsG9AEF84GT4ya8MGDt0AyWr7NroJShxGoTRa+Nw7+WHqcoJDOXsiOdmUpSyVtEydHLJzX9PHJhxWxpq7PyTCx5LOiRyCfA2HBU3RzoKgcVEAKSKjTu5YnJq1d8T5xmKvcVpJVrSUT78vCfeqAp4LufA1be0i4qatl6grpywaf11lf4tqfONt09snY/8QP400BRQc0R2dUz6YiSxgZD6OA==


// example QR
// number 00112233-4455-6677-8899-aabbccddeeff
// b64(order) [3,1,2]
// hex(salt) 48656C6C6F20576F726C6421

export default class App extends Component {
  state = {
    scanning: false,
    choice: null,
    loading: false
  }

  componentDidMount() {
    // if (navigator.getUserMedia) {
    //   navigator.getUserMedia(
    //     {
    //       video: true
    //     },
    //     function (localMediaStream) { },
    //     function (err) {
    //       alert('The following error occurred when trying to access the camera: ' + err);
    //     }
    //   );
    // } else {
    //   alert('Sorry, browser does not support camera access');
    // }
  }

  render() {
    const { choice, loading, scanning, scanned } = this.state

    return (
      <div className="App">
        <div className="page-content">

          {scanning && !scanned &&
            <Scanner
              handleScan={this.handleScan}
              handleError={this.handleError}
            />
          }


          {!scanning && !choice &&
            <>
              <p className="instructions">Тут ти можеш перевірити правильність зарахування свого голосу на минулих виборах.<br /> Підготов відривну частину свого бюлетеня та відскануй її. </p>
              <button className="btn-primary" onClick={this.onScanStart.bind(this)}>Перевірити голос</button>
            </>

          }

          <div className="result">
            <BeatLoader
              className="spinner"
              size={15}
              margin="4px"
              loading={loading}
              color="#1971c2"
            />
            {choice &&
              <p>{choice}</p>
            }
          </div>
        </div>


        <footer>
          <i className="fas fa-user-secret"></i>
        </footer>

      </div>
    );
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
    // let doubleEnvelopeFromServer = "KdVCUs2E4R6n3hIWLNhxI5K8gjKgNl7/1Q4DeV6F1L/SFc87btDjTNZdU3VWXMlEP/PSRcUFrT0dK39x6FomykcMTomS7jNww67CTrS78uGij3hSq3FF9rNJs+KwL4hivsG9AEF84GT4ya8MGDt0AyWr7NroJShxGoTRa+Nw7+WHqcoJDOXsiOdmUpSyVtEydHLJzX9PHJhxWxpq7PyTCx5LOiRyCfA2HBU3RzoKgcVEAKSKjTu5YnJq1d8T5xmKvcVpJVrSUT78vCfeqAp4LufA1be0i4qatl6grpywaf11lf4tqfONt09snY/8QP400BRQc0R2dUz6YiSxgZD6OA=="
    console.log('ballot number', ballotNum)
    console.log('order', atob(order))
    console.log('salt', atob(salt))

    try {
      const doubleEnvelope = await this.getBallot(ballotNum)
      console.log('double envelope from server:', doubleEnvelope)

    } catch (err) {
      console.error(err)
    }


    // let possibleOptionsPlaintext = []

    // let encOrder = await rsaEncrypt(atob(order), salt)

    // for (let i = 0; i < 5; i++) {
    //   let choice = JSON.stringify({ choice: i })
    //   choice = btoa(choice)
    //   possibleOptionsPlaintext.push(choice + ':' + encOrder)

    // }
    // console.log(possibleOptionsPlaintext)

    // let doubleEnvelopes = possibleOptionsPlaintext.map(this.encryptOption)

    // let result = await Promise.all(doubleEnvelopes)

    // console.log(result)

    // setTimeout(() => {
    //   let choice = <>Цей голос було віддано за <br /> <span id="choice">Голобородько І. С.</span></>
    //   this.setState({ choice, loading: false })
    // }, 2000)
  }

  encryptOption = async (option) => {
    return rsaEncrypt(option)
  }

  handleScan = (result) => {
    if (result) {
      this.setState({ loading: false, scanned: true }, () => {
        let ballotNum = result.split(':')[0]
        let orderB64 = result.split(':')[1]
        let saltB64 = result.split(':')[2]
        this.checkVoteByBallotNum(ballotNum, orderB64, saltB64)
      })
    }

  }

  handleError = (error) => {
    console.warn(error)
  }


}

async function rsaEncrypt(data, salt) {

  // to base64
  // data = btoa(data)

  // import and set public key
  // const key = new NodeRSA(PUBLIC_KEY, 'public', {'encryptionScheme': 'pkcs1'})
  const key = new NodeRSA()
  key.setOptions({
    encryptionScheme: {
      scheme: 'pkcs1',
      padding: constants.RSA_NO_PADDING,
      toString: function () {
        return 'pkcs1-nopadding';
      }
    }
  })
  let keydata = PUBLIC_KEY
  key.importKey(keydata, 'public')


  console.log('message:\n', data)
  console.log()

  // encrypt order+salt
  let encrypted = key.encrypt(data, 'base64')

  return encrypted

}