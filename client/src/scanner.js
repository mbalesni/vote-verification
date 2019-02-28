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
        this.refs.qrReader.openImageDialog()
    }


    render() {
        const { legacy } = this.state

        const instructionMessage = legacy ? 'Завантаж фото перевірочного QR коду.' : 'Піднеси QR код з відривної частини свого бюлетеня.'

        let classes = legacy ? 'scanner legacy' : 'scanner'


        return (
            <>
                <p className="instructions">{instructionMessage}</p>
                <div className={classes}>
                    <QrReader
                        onScan={this.props.handleScan}
                        onError={this.props.handleError}
                        showViewFinder={true}
                        legacyMode={legacy}
                        onImageLoad={this.handleImageLoad}
                        ref="qrReader"
                    />
                </div>
                {
                    legacy &&
                    <button className="btn-primary" onClick={this.openImageDialog}>
                        <i className="fas fa-image" style={{ marginRight: '.5rem' }}></i>
                        Завантажити QR
                    </button>
                }
            </>
        )
    }

}