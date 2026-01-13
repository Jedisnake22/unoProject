import { useEffect, useState, useRef } from "react";
import Uno from "./uno";
import * as cookie from "cookie";
import Card from "./Card.jsx";
import Wild from "./Wild.jsx";

export function Play() {
    const [gameStart, setGameStart] = useState(false)
    const [gameState, setGameState] = useState({
        deck: [],
        currentCard: "",
        playerHands: [[], [], [], []],
        playerNames: [["Player 1"], ["AI 1"], ["AI 2"], ["AI 3"]],
        playerCount: 1, //if playing with friends is implemented
        turn: 0,
        direction: "left",
        won: false
    });
    const [turnCount, setTurnCount] = useState(0);
    const [pendingWild, setPendingWild] = useState("")
    const [chooseWild, setChooseWild] = useState(false);
    const [loadGame, setLoadGame] = useState(false)
    const [win, setWin] = useState(false)
    const waitWild = useRef(false)
    const uno = new Uno
    const keyVal = useRef(0)
    const initialGameState = {
        deck: [],
        currentCard: "",
        playerHands: [[], [], [], []],
        playerNames: [["Player 1"], ["AI 1"], ["AI 2"], ["AI 3"]],
        playerCount: 1,
        turn: 0,
        direction: "left",
        won: false
    }

    async function autosave(gameState) {
        if (gameState === null) {
            return false
        }
        await fetch("/autosave/save/", {
            method: "POST",
            credentials: "same-origin",
            body: JSON.stringify({ gameState }),
            headers: {
                "X-CSRFToken": cookie.parse(document.cookie).csrftoken
            }
        });
    }

    async function getAutosave() {
        const res = await fetch('/autosave/', {
            credentials: "same-origin",
        })
        const save = await res.json()
        return save.autosave
    }

    async function deleteAutosave(gameState) {
        fetch("/autosave/delete/", {
            method: "POST",
            credentials: "same-origin",
            body: JSON.stringify({ gameState }),
            headers: {
                "Content-Type": "application/json",
                "X-CSRFToken": cookie.parse(document.cookie).csrftoken
            }
        });
    }

    async function resetGame(gameState) {
        await deleteAutosave(gameState)
        setGameStart(() => false)
    }

    async function startNewGame(AiCount) {
        setGameStart(true)
        setChooseWild(false)
        setWin(false)
        let newGameState = { ...initialGameState }
        newGameState.deck = uno.createDeck()
        newGameState.playerHands = []
        for (let i = 0; i < AiCount; i++) {
            newGameState.playerHands.push([]);
        }
        for (let i = 0; i < 7; i++) {
            for (let i = 0; i < newGameState.playerHands.length; i++) {
                uno.drawCard(newGameState, i)
            }
        }
        let newCurrentCard = newGameState.deck.pop()
        if (newCurrentCard[0] === "W") {
            let number = Math.floor(Math.random() * 3 + 1)
            if (number === 1) {
                newCurrentCard = "WR"
            }
            else if (number === 2) {
                newCurrentCard = "WG"
            }
            else if (number === 3) {
                newCurrentCard = "WB"
            }
            else {
                newCurrentCard = "WY"
            }
        }
        newGameState.currentCard = newCurrentCard
        setGameState(newGameState)
        autosave(newGameState)
        
    }

    async function incPlayed() {
        const res = await fetch('/stats/played/', {
        method: "POST",
        credentials: "same-origin",
        headers: {
                    "Content-Type": "application/json",
                    "X-CSRFToken": cookie.parse(document.cookie).csrftoken
                }
        })
        const body = res()
    }

    async function incWon() {
        const res = await fetch('/stats/won/', {
        method: "POST",
        credentials: "same-origin",
        headers: {
                    "Content-Type": "application/json",
                    "X-CSRFToken": cookie.parse(document.cookie).csrftoken
                }
        })
        const body = res()
    }

    async function increment(type) {
        if (type == "won") {
            await incWon()
        }
        else{
            await incPlayed()
        }
    }

    function playCard(card) {
        console.log("Player played " + card)
        if (uno.checkPlayerTurn(gameState) === false) {
            console.log("Not your turn")
            return
        }
        if (!uno.checkValid(gameState.currentCard, card)) {
            console.log("Invalid Move")
            return
        }
        if (card[0] === "W") {
            setChooseWild(() => true)
            setPendingWild(() => card)
            return
        }

        playCardContinue(card, gameState)
    }

    function chooseWildContinue(colorChoice) {
        console.log("Player chose color " + colorChoice)
        let card = pendingWild + colorChoice
        setChooseWild(false)
        playCardContinue(card, gameState)
    }

    function playCardContinue(card, gameState) {
        let newState = { ...gameState }
        newState = uno.playCard(card, newState)
        if (newState.won) {
            deleteAutosave(gameState)
            console.log(newState.playerNames[gameState.turn] + " has won")
            setWin(newState.turn)
        }
        else {
            newState = uno.nextTurn(newState)
            setGameState(newState)
            autosave(newState)
        }
        progress(1000)
    }

    function drawPile(gameState, player) {
        if (gameState.won || chooseWild || !uno.checkPlayerTurn(gameState)) {
            return
        }
        let newGameState = { ...gameState }
        newGameState = uno.drawCard(newGameState, player)
        newGameState = uno.nextTurn(newGameState)
        setGameState(newGameState)
        autosave(newGameState)
        progress(1000)
    }

    async function initialize() {
        console.log("initializing")
        let save = await getAutosave()
        if (save !== null) {
            setGameStart(() => true)
            setGameState(save.gameState)
        }
        setLoadGame(() => true)
    }

    function oppHand(oppNum) {
        let turnBorder = "3px solid black"
        if (gameState.turn == oppNum) {
            turnBorder = "solid 5px yellow"
        }
        else if (gameState.turn == 1 && gameState.playerHands.length == 2) {
            turnBorder = "solid 5px yellow"
        }
        if (gameState.playerHands.length == 2 && oppNum == 1) {
            return
        }
        else if (gameState.playerHands.length == 2 && oppNum == 2) {
            return <div>
                        <div style={{border: turnBorder}} id="Player3Pic">
                            <img id="profSVG" src="./profSymbols/bunny.svg"/>
                            { crown(oppNum - 1) }
                        </div>
                        <div id="Player3Hand">
                            { gameState.playerHands[1].map( (card, index) => {
                            keyVal.current += 1;
                            let keyCard = keyVal.current + "Play" + oppNum
                            return <div key={ keyCard } style={{ left: (index % 10)*14 + "px", top: Math.floor((index/10) + 2) * 20 + "px"}} className="smallCard"><div className="smallCardBackInner"><div className="smallCardText">UNO</div></div></div>
                            }) }
                        </div>
                    </div>
        }
        else if (oppNum > gameState.playerHands.length - 1) {
            return
        }
        else {
            let picID = "Player" + (oppNum + 1) + "Pic"  
            let handID = "Player" + (oppNum + 1) + "Hand"
            return <div>
                        <div style={{border: turnBorder}} id={picID}>
                            <img id="profSVG" src="./profSymbols/bunny.svg"/>
                            { crown(oppNum) }
                        </div>
                        <div id={handID}>
                            { gameState.playerHands[oppNum].map( (card, index) => {
                            keyVal.current += 1;
                            let keyCard = keyVal.current + "Play" + oppNum
                            return <div key={ keyCard } style={{ left: (index % 10)*14 + "px", top: Math.floor((index/10) + 2) * 20 + "px"}} className="smallCard"><div className="smallCardBackInner"><div className="smallCardText">UNO</div></div></div>
                            }) }
                        </div>
                    </div>
        }
    }

    function crown(player) {
        let playerPos = null
        if (Number.isInteger(win) & win == player) {
            if (player === 0) {
                playerPos = {
                    position: "absolute",
                    scale: "3.0",
                    right: "-5%",
                    top: "-5%",
                    transform: "rotate(45deg)"
                }
            }
            else {
                playerPos = {
                    position: "absolute",
                    height: "10%",
                    left: "-60%",
                    top: "-40%",
                    scale: "2.0",
                    transform: "rotate(-45deg)"
                }
            }
            return <div className="crown" style={playerPos}><img src="./crown.svg"/></div>
        }
        return <div></div>
    }

    async function wait(ms) {
        return new Promise(resolve => setTimeout(resolve, ms))
    }

    async function progress(ms) {
        await wait(ms)
        setTurnCount(prev => prev + 1)
    }

    function profPic() {
        let turnBorder = "3px solid black"
        if (gameState.turn == 0) {
            turnBorder = "solid 5px yellow"
        }
        return <div style={{border: turnBorder}} id="profPic">
                    <img  id="profSVG" src="./profSymbols/agent.svg"/>
                    { crown(0) }
                </div>
    }


//////////////////////////////////////////////////


    useEffect(() => {
        if (!loadGame) {
            initialize()
        }

        else if (gameStart === false || gameState.won || chooseWild) {
            return
        }

        setGameState(prevState => {
            
            if (uno.checkPlayerTurn(prevState) && gameStart) { //only autosave on player's turn, no overlapping save requests
                autosave(prevState)
                return prevState
            }

            else if(uno.checkPlayerTurn(prevState)) {
                return prevState
            }

            let newState = { ...prevState }

            newState = uno.aiTurn(newState)
            if (newState.won) {
                deleteAutosave(gameState)
                console.log(gameState.playerNames[gameState.turn] + " has won")
                if (newState.turn == 0) {
                    increment("won")
                }
                else {
                    increment("played")
                }
                setWin(newState.turn)
                return newState
            }
            newState = uno.nextTurn(newState)
            if (newState.turn !== 0) {
                progress(1000)
            }
            else {
                autosave(newState)
            }
            return newState
        })
    }, [gameStart, turnCount, loadGame])


///////////////////////////////////////////////////


    if (gameStart) {
        return (
            <>
                <button id="reset" onClick={ () => resetGame(gameState) }>Restart</button>
                {  oppHand(2) }
                <div>
                    { oppHand(1) }
                    <div id="centerPlayArea">
                        <div id="currentCard"> <Card key={keyVal.current + "Play0"} cardVal={gameState.currentCard} onClick={() => {return}} curCard={gameState.currentCard}/> </div>
                        <button onClick={ () => drawPile(gameState, gameState.turn) } id="drawPile"><div id="cardBackInner"><div id="cardText">UNO</div></div></button>
                    </div>
                    { oppHand(3) }
                </div>
                <Wild show={ chooseWild } onClick={ (color) => chooseWildContinue(color) }/>
                { profPic() }
                <div id="Player1Hand">
                {
                gameState.playerHands[0].map( (card) => {
                    keyVal.current += 1;
                    let keyCard = keyVal.current + "Play0"
                    return <Card key={keyCard} cardVal={card} onClick={() => playCard(card)} curCard={gameState.currentCard}/>
                })
                }
                </div>
            </>
        )
    }
    else {
        return (
            <div id="title">
                <div> How Many AI Opponents: </div>
                <div id="selectAI">
                    <button className="startButton" onClick={() => startNewGame(2)}>1</button>
                    <button className="startButton" onClick={() => startNewGame(3)}>2</button>
                    <button className="startButton" onClick={() => startNewGame(4)}>3</button>
                </div>
            </div>
        )
    }
}
