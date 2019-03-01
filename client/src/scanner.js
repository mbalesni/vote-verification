import React, { useState, useEffect } from 'react'
import QrReader from 'react-qr-reader'
import ErrorMessage from './error-message'

const VER_QR_SEPARATOR = ":"

const initialState = {
    legacy: false,
    error: null,
}

export default class Scanner extends React.Component {
    state = { ...initialState }

    componentDidMount() {
        const ctx = this
        // check camera access
        if (navigator.getUserMedia) {
            navigator.getUserMedia(
                {
                    video: true
                },
                (localMediaStream) => { },
                (err) => {
                    console.log('The following error occurred when trying to access the camera: ' + err)
                    ctx.setState({ legacy: true })
                }
            )
        } else {
            this.setState({ legacy: true })
            console.log('Sorry, browser does not support camera access')
        }
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
        console.log('result', result)
        if (this.state.legacy && !result) {
            // not found QR in loaded image
            return this.setState({ error: 'qrNotFound' })
        }
        if (result) {
            const { number, order, salt, error } = this.parseQR(result, VER_QR_SEPARATOR)
            if (!error) this.props.handleScan(number, order, salt)
        }
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
            this.setState({ error: 'invalidQR' })
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

        const instructionMessage = legacy ? 'Завантаж фото перевірочного QR коду.' : 'Піднеси QR код з відривної частини свого бюлетеня.'

        let scannerClasses = legacy ? 'scanner legacy' : 'scanner'

        let errorText = this.getErrorText(error)

        return (
            <div className="scanner-wrapper">
                <p className="instructions">{instructionMessage}</p>
                {error && <ErrorMessage message={errorText} />}
                <div className={scannerClasses}>
                    <QrReader
                        onScan={this.handleScan}
                        onError={this.props.handleError}
                        showViewFinder={true}
                        legacyMode={legacy}
                        onImageLoad={this.handleImageLoad}
                        ref="qrReader"
                    />
                </div>
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: '1rem' }}>
                    {!legacy && <span style={{ opacity: '0.6', marginRight: '1rem' }}>Або </span>}
                    <button className="btn-primary" onClick={this.openImageDialog}>
                        <i className="fas fa-image" style={{ marginRight: '.5rem' }}></i>
                        Завантажити QR
                    </button>
                </div>

            </div>
        )
    }

}