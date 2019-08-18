import { DENVELOPE_SEPARATOR, ENCORDER_SEPARATOR, STATUSES, RSA_NO_PADDING } from './constants'
import PUBLIC_KEY1 from './public-key1'
import PUBLIC_KEY2 from './public-key2'
import axios from 'axios'
import NodeRSA from 'node-rsa'

class Verificator {
  constructor() {

    /**
     * @type {object}
     */
    this.candidates = null

    /**
     * @type {string}
     */
    this.ballot = null

    /**
     * @type {array}
     * @description list of all choices to bruteforce
     */
    this.choiceOptions = []

    this.init()
  }

  init() {
    this.getCandidates()
  }

  bruteforceChoice(realEnvelope, encOrder, choices, key) {
    let len = choices.length
    for (let i = 0; i < len; i++) {
      let choiceGuess = choices[i]
      let envelopeGuess = this.createDoubleEnvelope(encOrder, choiceGuess, key)
      if (envelopeGuess === realEnvelope) return choiceGuess
    }
  }

  async getBallot(number) {
    let ballot
    try {
      let response = await axios.get('/get_ballot/' + number)
      ballot = response.data.ballot
    } catch (err) {
      alert('Error retrieving ballot')
      console.warn(err)
    }
    return ballot
  }

  async getCandidates() {
    try {
      const res = await axios.get('/get_candidates')
      this.candidates = res.data
      this.choiceOptions = [...Object.keys(STATUSES), ...Object.keys(this.candidates)]
    } catch(err) {
      alert('Error retrieving candidates')
      console.warn(err)
    }
  }

  createDoubleEnvelope(encOrder, choice, key) {
    return this.rsaEncrypt(btoa(choice) + DENVELOPE_SEPARATOR + encOrder, key)
  }

  rsaEncrypt(data, key, encoding = 'base64') {
    const k = new NodeRSA()
    k.importKey(key, "public")
    k.setOptions({
      encryptionScheme: {
        scheme: "pkcs1",
        padding: RSA_NO_PADDING,
        toString: function () {
          return "pkcs1-nopadding"
        }
      }
    })
    return k.encrypt(data, encoding)
  }

  verify = async (ballotNum, order, salt) => {
    const doubleEnvelope = await this.getBallot(ballotNum)

    const encryptedOrder = this.rsaEncrypt(
      order + ENCORDER_SEPARATOR + salt,
      PUBLIC_KEY1,
    )

    const choiceValue = this.bruteforceChoice(
      doubleEnvelope,
      encryptedOrder,
      this.choiceOptions,
      PUBLIC_KEY2
    )

    let result = {}

    if (this.candidates[choiceValue]) {
      result.type = 'candidate'
      result.value = this.candidates[choiceValue].name
      result.gender = this.candidates[choiceValue].gender
    } else if (STATUSES[choiceValue]) {
      result.type = 'status'
      result.value = STATUSES[choiceValue]
    } else {
      result.error = 'unrecognizedChoice'
    }

    return result
  }

}


export default Verificator