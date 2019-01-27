import React from 'react'
import QrReader from 'react-qr-reader'

export default class Scanner extends React.PureComponent {
    render() {
        return (
            <>
                <p className="instructions">Піднеси QR код з відривної частини свого бюлетеня.</p>
                <QrReader
                    className="scanner"
                    onScan={this.props.handleScan}
                    onError={this.props.handleError}
                    showViewFinder={true}
                />
            </>
        )
    }
}