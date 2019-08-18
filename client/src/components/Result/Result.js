import React from 'react'
import femaleProfile from '../../img/female-profile.svg'
import maleProfile from '../../img/male-profile.svg'
import './Result.scss'

function getResultIcon(result) {
    switch (result.type) {
        case 'candidate':
            return result.gender === 'male' ? maleProfile : femaleProfile
        case 'status':
            return
        default:
            return
    }
}

function Result({ result }) {
    const resultIcon = getResultIcon(result)

    return (
        <div id="result-screen">
            <div className="gradient-circle-2">
                <h1 className="color-white weight-medium">Результат</h1>
            </div>
            <div style={{ padding: '1rem'}}>
                <img className="profile-icon" src={resultIcon} alt="" />
                <h2 className="result-value color-main">{result.value}</h2>
                <p className="color-grey">
                    Якщо результат відрізняється від твого голосу, негайно повідом про це
                    <a className="weight-semi-bold" href="https://t.me/knuvote_bot"> @knuvote_bot</a>
                </p>
            </div>
        </div>
    )
}

export default Result
