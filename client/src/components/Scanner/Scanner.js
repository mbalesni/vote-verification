import React from 'react'
import QrReader from 'react-qr-reader'
import arrowBackIcon from '../../img/arrow_back.svg'
import './Scanner.css'

const VER_QR_SEPARATOR = ":"

const initialState = {
    legacy: false,
    error: null,
}

export default class Scanner extends React.Component {
    state = { ...initialState }

    checkCameraAccess() {
        if (!navigator.getUserMedia) {
            this.setState({ legacy: true })
            console.log('Browser does not support camera access')
        }
    }

    componentWillMount() {
        this.checkCameraAccess()
    }

    handleImageLoad = (stuff) => {
        console.log(stuff)
    }

    openImageDialog = () => {
        this.setState({ legacy: true }, () => {
            this.refs.qrReader.openImageDialog()
        })
    }

    handleScan = (result) => {
        if (this.state.haveResult) return
        console.log('result', result)
        if (this.state.legacy && !result) {
            // not found QR in loaded image
            return alert(this.getErrorText('qrNotFound'))
            // return this.setState({ error: 'qrNotFound' })
        }
        if (result) {
            const { number, order, salt, error } = this.parseQR(result, VER_QR_SEPARATOR)
            if (!error) {
                this.props.handleScan(number, order, salt)
                this.setState({ haveResult: true })
            }
        }
    }

    parseQR(content, separator) {
        try {
            const dataArr = content.split(separator)
            const number = dataArr[0]
            const order = dataArr[1]
            const salt = dataArr[2]
            return { number, order, salt }
        } catch (err) {
            console.warn(err)
            // this.setState({ error: 'invalidQR' })
            alert(this.getErrorText('invalidQR'))
            return { error: true }
        }
    }

    getErrorText(errorName) {
        switch (errorName) {
            case 'invalidQR':
                return 'Невірний QR. Спробуй завантажити інше фото.'
            case 'qrNotFound':
                return 'Не знайдено QR. Спробуй завантажити інше фото.'
            default:
                return 'Сталася помилка. Спробуй завантажити інше фото.'
        }
    }


    render() {
        const { legacy, error } = this.state

        const { prevStep } = this.props

        const instructionMessage = legacy ? 'Завантаж фото перевірочного QR коду.' : 'Піднеси QR код з відривної частини свого бюлетеня.'

        let scannerWrapperClasses = legacy ? 'scanner-wrapper legacy' : 'scanner-wrapper'


        return (
            <div className="scanner-screen">
                <div className="scanner-header weight-semi-bold">
                    Відскануй QR на бюлетні
                </div>
                
                <div className={scannerWrapperClasses}>
                    <div className="scanner-overlay"></div>
                    <div className='scanner'>
                        <QrReader
                            onScan={this.handleScan}
                            onError={this.props.handleError}
                            showViewFinder={true}
                            legacyMode={legacy}
                            onImageLoad={this.handleImageLoad}
                            ref="qrReader"
                        />
                    </div>
                    {legacy &&
                        <div class="legacy">
                            <p className="weight-semi-bold color-grey">Сканування не підтримується </p>
                            <button className="primary" onClick={this.openImageDialog}>
                                <i className="fas fa-image" style={{ marginRight: '.5rem' }}></i>
                                Завантажити QR
                                </button>
                        </div>
                    }
                </div>

                <div className="controls-wrapper">
                    <div className="controls">

                        <button className="primary low-opacity round" onClick={prevStep} >
                            <img alt="Стрілка назад" src={arrowBackIcon} />
                        </button>
                    </div>
                </div>


            </div>
        )
    }

}