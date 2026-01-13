import Uno from "./uno"

export default function Card(props) {

    const uno = new Uno()

    function assignCardClass(card) {
        let classValue = "card"
        if (card[1] === "G") {
            classValue += " green"
        }
        else if (card[1] === "R") {
            classValue += " red"
        }
        else if (card[1] === "B") {
            classValue += " blue"
        }
        else if (card[1] === "Y") {
            classValue += " yellow"
        }
        else if (card.length === 3) {
            if (card[2] === "R") {
                classValue += " red"
            }
            else if (card[2] === "G") {
                classValue += " green"
            }
            else if (card[2] === "B") {
                classValue += " blue"
            }
            else if (card[2] === "Y") {
                classValue += " yellow"
            }
        }
        else {
            classValue += " black"
        }

        if (uno.checkValid(props.curCard, card)) {
            classValue += " valid";
        }

        return classValue
    }

    function getCardValue(card) {
        let value = ""
        if (card[0] === "S") {
            value = "./skip.svg"
        }
        else if (card[0] === "D") {
            value = "./draw2.svg"
        }
        else if (card[0] === "R") {
            value = "./reverse.svg"
        }
        else if (card.charAt(0) === "W") {
            if (card.charAt(1) === "4") {
                value = wild4Card()
            }
            else {
                value = wildCard()
            }
        }
        else {
            value = card[0]
        }
        return value
    }

    function wildCard() {  //create styling for wild card
        let wildStyle = <div className="squareWild">
            <div className="blueSquare"></div>
            <div className="redSquare"></div>
            <div className="yellowSquare"></div>
            <div className="greenSquare"></div>
        </div>
        return wildStyle
    }

    function wild4Card() {
        let wildStyle = 
        <div id="wild4Card">
            <div id="plus4">+4</div>
            <div className="squareWild">
                    <div className="blueSquare"></div>
                    <div className="redSquare"></div>
                    <div className="yellowSquare"></div>
                    <div className="greenSquare"></div>
            </div>
        </div>
        return wildStyle
    }

    let classValue = assignCardClass(props.cardVal)
    let cardValue = getCardValue(props.cardVal)
    if (Number.isInteger(Number(cardValue)) || props.cardVal[0] === "W") {
        return <div onClick={ props.onClick } className={classValue}><div id="innerCard" className={props.cardVal}>{ cardValue }</div></div>
    }
    else {
        return <div onClick={ props.onClick } className={classValue}><div id="innerCard"><img src={ cardValue } alt={props.cardVal[0]}/></div></div>
    }
    
}