import React, { useState, useEffect } from 'react'
import QrReader from 'react-qr-reader'

export default class Scanner extends React.Component {
    state = { legacy: false }

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
            return this.setState({ qrNotFound: true })
        }
        this.props.handleScan(result)
    }


    render() {
        const { legacy, qrNotFound } = this.state

        const instructionMessage = legacy ? 'Завантаж фото перевірочного QR коду.' : 'Піднеси QR код з відривної частини свого бюлетеня.'

        let scannerClasses = legacy ? 'scanner legacy' : 'scanner'


        return (
            <div className="scanner-wrapper">
                <p className="instructions">{instructionMessage}</p>
                {qrNotFound && <p className="qr-not-found">Не знайдено QR. Спробуй завантажити інше фото.</p>}
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
                <div style={{display: 'flex', justifyContent:'center', alignItems: 'center', marginTop: '1rem'}}>
                    {!legacy && <span style={{opacity: '0.6', marginRight: '1rem'}}>Або </span>}
                    <button className="btn-primary" onClick={this.openImageDialog}>
                        <i className="fas fa-image" style={{ marginRight: '.5rem' }}></i>
                        Завантажити QR
                    </button>
                </div>

            </div>
        )
    }

}