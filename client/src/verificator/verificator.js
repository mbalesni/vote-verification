import { DENVELOPE_SEPARATOR, ENCORDER_SEPARATOR, STATUSES, RSA_NO_PADDING } from './constants'
import { preloadImages } from '../utils.js'
import PUBLIC_KEY1 from './public-key1'
import PUBLIC_KEY2 from './public-key2'
import NodeRSA from 'node-rsa'
import CONFIG, { API }  from '../config'

const SALT_LENGTH = 96

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

    /**
     * @type {array}
     * @description internal list of preloaded images
     */
    this._avatars = []

    this.init()
  }

  init() {
    this.getCandidates()
  }

  /**
   * Creates double envelopes for each possible choice 
   * or ballot status. If finds the one that matches
   * the real double envelope, returns the guessed choice.
   * 
   * @param {string=base64} realEnvelope 
   * @param {string=base64} encOrder 
   */
  guessChoice(realEnvelope, encOrder) {
    let len = this.choiceOptions.length
    for (let i = 0; i < len; i++) {
      let choiceGuess = this.choiceOptions[i]
      let guessedEnvelope = this.createDoubleEnvelope(encOrder, choiceGuess)
      if (guessedEnvelope === realEnvelope) return choiceGuess
    }
  }

  async getBallot(number) {
    let ballot
    try {
      let response = await API.get('/get_ballot/' + number)
      ballot = response.data.ballot
    } catch (err) {
      console.warn(err)
    }
    return ballot
  }

  async getCandidates() {
    try {
      const res = await API.get('/get_candidates')
      this.candidates = res.data
      this.choiceOptions = [...Object.keys(this.candidates), ...Object.keys(STATUSES),]
      if (CONFIG.useAvatars) this.preloadAvatars(res.data)
    } catch (err) {
      alert('Помилка завантаження кандидатів')
      console.warn(err)
    }
  }

  preloadAvatars(candidates) {
    const candidateObjects = Object.keys(candidates)
    const urls = candidateObjects.map(candidate => candidates[candidate].avatarUrl)
    preloadImages(this._avatars, urls)
  }

  createDoubleEnvelope(encOrder, choice) {
    return this.rsaEncrypt(
      btoa(choice) + DENVELOPE_SEPARATOR + encOrder,
      PUBLIC_KEY2
    )
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

  verify = async (ballotNum, orderB64, saltB64) => {
    const realDoubleEnvelope = await this.getBallot(ballotNum)
    const order = this.decodeB64(orderB64)
    const salt = this.decodeB64(saltB64)
    if (realDoubleEnvelope && this.isValidOrder(order) && this.isValidSalt(salt)) {
      const encryptedOrder = this.createEncryptedOrder(order, salt)
      const choice = this.guessChoice(realDoubleEnvelope, encryptedOrder)
      return this.getResultFromChoice(choice, order)
    } else {
      let error = ''
      if (!realDoubleEnvelope) error = 'ballotNotFound'
      if (!this.isValidOrder(order) || !this.isValidSalt(salt)) error = 'wrongQr'
      return { error }
    }
  }

  getResultFromChoice(choice, order) {
    const result = {}
    if (this.candidates[choice]) {
      const orderArr = JSON.parse(order)
      const realCandidateNumber = orderArr[choice - 1]
      const candidate = this.candidates[realCandidateNumber]
      result.type = 'candidate'
      result.text = candidate.name
      result.gender = candidate.gender
      result.avatarUrl = candidate.avatarUrl
    } else if (STATUSES[choice]) {
      result.type = 'status'
      result.text = STATUSES[choice].displayValue
      result.value = STATUSES[choice].value
    } else {
      result.error = 'unrecognizedChoice'
    }
    return result
  }

  isValidOrder(order) {
    if (!order) return false
    try {
      const numberOfCandidates = Object.keys(this.candidates).length
      const orderArr = JSON.parse(order)
      if (orderArr.length === numberOfCandidates) return true
    } catch(err) {
      console.warn(err.message)
    }
    return false
  }

  isValidSalt(salt) {
    if (!salt) return false
    if (salt.length === SALT_LENGTH) return true
    return false
  }

  /**
   * 
   * @param {plaintext=utf8} order
   * @param {plaintext=utf8} salt
   */
  createEncryptedOrder(order, salt) {
    return this.rsaEncrypt(
      order + ENCORDER_SEPARATOR + salt,
      PUBLIC_KEY1,
    )
  }

  /**
   * Decodes base64-encoded string and handles errors.
   * @param {string=base64} stringB64 
   */
  decodeB64(stringB64) {
    try {
      return atob(stringB64)
    } catch (err) {
      console.error(err)
    }
  }
}

export default Verificator