import React from 'react'
import './Result.scss'
import CONFIG from '../../config'

const { useAvatars } = CONFIG

function Result({ result }) {
    const isCandidate = (result.type === 'candidate')

    return (
        <div id="result-screen">
            <div className="gradient-circle-2">
                <h1 className="color-white weight-medium">Твій голос</h1>
            </div>
            <div style={{ padding: '1rem' }}>
                {isCandidate && useAvatars && 
                    <img className="avatar" src={result.avatarUrl} alt="" />
                }

                {!isCandidate && <div className="bad-result"></div>}
                <h2 className="result-text color-main">{result.text}</h2>
                <p className="color-grey" style={{ maxWidth: 350 }}>
                    Якщо результат перевірки відрізняється від твого голосу, негайно повідом про це
                    <a className="weight-semi-bold" target="_blank" href="https://t.me/knuvote_bot"> @knuvote_bot</a>
                </p>
            </div>
        </div>
    )
}

export default Result
