
class Uno {

    createDeck() {
        let newDeck = []
        const colors = ["R", "G", "B", "Y"]
        for (let i = 0; i < colors.length; i++) {
            for (let k = 0; k < 2; k++) { //2 of each color
                for (let j = 0; j < 10; j ++) {
                    newDeck.push(j + colors[i]) 
                }
                newDeck.push("S" + colors[i])
                newDeck.push("D" + colors[i])
                newDeck.push("R" + colors[i])
            }
            newDeck.push("W4") //only 4 of each wild cards
            newDeck.push("W1")
        }
        newDeck = this.shuffle(newDeck);
        return newDeck;
    }
    
    drawCard(gameState, player) {
        let card = gameState.deck.pop()
        gameState.playerHands[player].push(card)
        if (gameState.deck.length === 0) {
            gameState.deck = this.createDeck()
        }
        gameState.playerHands[player].sort((a, b) =>{
            let secondVal = b[1].localeCompare(a[1])
            if (secondVal !== 0) return secondVal //if one is more or less, then not same color

            return a[0].localeCompare(b[0])
        })
        return gameState;
    }

    shuffle(deck) {
        for (let i = 0; i < ((Math.random() * 999) + 999); i++) {
            let place = Math.floor(Math.random() * deck.length)
            let card = deck[place]
            deck.splice(place, 1)
            deck.push(card)
        }
        return deck
    }

    checkValid(currentCard, card) {
        if (currentCard[0] + currentCard[1] == "W4") {
            curColor = currentCard[2]
        }
        else {
            var curColor = currentCard[1]
        }
        var curNumber = currentCard[0]
        var cardColor = card[1]
        var cardNumber = card[0]
        if (curColor === cardColor) {
            return true;
        }
        else if (curNumber === cardNumber) {
            return true;
        }
        else if (cardNumber === "W") {
            return true;
        }
        else {
            return false;
        }
    }

    playCard(card, gameState) {
        if (card[0] === "W") {
            gameState.playerHands[gameState.turn].splice(gameState.playerHands[gameState.turn].indexOf((card[0] + card[1])), 1)
        }
        else {
            gameState.playerHands[gameState.turn].splice(gameState.playerHands[gameState.turn].indexOf(card), 1)
        }
        if (this.checkWin(gameState.playerHands[gameState.turn])) {
            gameState.won = true
            gameState.currentCard = card;
            return gameState;
        }
        gameState = this.cardEffect(card, gameState)
        return gameState;
    }

    nextTurn(gameState) {
        let newTurn
        if (gameState.direction === "right") {
            newTurn = gameState.turn - 1
        }
        else {
            newTurn = gameState.turn + 1
        }
        if (newTurn > gameState.playerHands.length - 1) {
            newTurn = 0;
        }
        if (newTurn < 0) {
            newTurn = gameState.playerHands.length - 1
        }
        gameState.turn = newTurn
        return gameState;
    }

    cardEffect(card, gameState) {
        let victim
        if (gameState.direction === "right") {
            victim = gameState.turn - 1
            if (victim < 0) {
                victim = gameState.playerHands.length - 1
            }
        }
        else {
            victim = gameState.turn + 1
            if (victim > gameState.playerHands.length - 1) {
                victim = 0
            }
        }
        if (card[0] === "W") {
            if (card[1] === "4") {
                for (let i = 0; i < 4; i++) {
                    gameState = this.drawCard(gameState, victim)
                }
                gameState.currentCard = card
                gameState = this.nextTurn(gameState)
            }
            else {

                gameState.currentCard = card[0] + card[2]
            }
        }
        else if (card[0] == "S") {
            gameState = this.nextTurn(gameState)
            gameState.currentCard = card
        }
        else if (card[0] == "D") {
            gameState = this.drawCard(gameState, victim)
            gameState = this.drawCard(gameState, victim)
            gameState = this.nextTurn(gameState)
            gameState.currentCard = card
        }
        else if (card[0] == "R") {
            if (gameState.direction === "right") {
                gameState.direction = "left"
            }
            else {
                gameState.direction = "right"
            }
            if (gameState.playerHands.length === 2) {
                gameState = this.nextTurn(gameState)
            }
            gameState.currentCard = card
        }
        else {
            gameState.currentCard = card
        }
        return gameState
    }
    
    aiChooseColor(card, gameState) {
        let colorCount = {"R":0, "G":0, "B":0, "Y":0}
        for (let k = 0; k < gameState.playerHands[gameState.turn].length; k++) { //check if there is a number card that matches color of current card
            let checkCard = gameState.playerHands[gameState.turn][k]
            if (checkCard[0] === "W") {
                continue
            }
            else {
                colorCount[checkCard[1]] += 1
            }
        }
        
        let maxColor = "R"
        let maxCount = 0
        for (let color in colorCount) {
            if (colorCount[color] > maxCount) {
                maxColor = color
                maxCount = colorCount[color]
            }
        }
        let newWild = card + maxColor
        console.log("AI chose color: " + maxColor)
        return newWild          
    }

    aiTurn(gameState) {
        let bestCard = ""
        for (let j = 0; j < gameState.playerHands[gameState.turn].length; j++) { //look through each card in hand, select "best" one first
            let card = gameState.playerHands[gameState.turn][j]
            if (this.checkValid(gameState.currentCard, card)){
                if (Number.isInteger(parseInt(bestCard[0]))) {
                    null
                }
                else {
                    if (Number.isInteger(parseInt(card[0]))) {
                        bestCard = card
                    }
                    else if (!Number.isInteger(parseInt(card[1]))) {
                        bestCard = card
                    }
                    else if (bestCard[0] === "W") { //don't go through loops again
                        continue
                    }
                    else {//if wild
                        bestCard = this.aiChooseColor(card, gameState)
                    }
                }
            }
        }
        if (bestCard !== "") {
            console.log(gameState.playerNames[gameState.turn] + " played " + bestCard)
            gameState = this.playCard(bestCard, gameState)
        }
        else {
            let drawCard = gameState.deck.pop()
            console.log("AI drew a card")
            if (this.checkValid(gameState.currentCard, drawCard)) {
                if (drawCard[0] === "W") {
                    drawCard = this.aiChooseColor(drawCard, gameState)
                }
                gameState = this.playCard(drawCard, gameState)
                console.log("AI played " + drawCard)
            }
            else {
                gameState.playerHands[gameState.turn].push(drawCard)
            }
        }
        return gameState
    }

    checkWin(hand) {
        if (hand.length === 0) {
            return true
        }
        else {
            return false
        }
    }

    checkPlayerTurn(gameState) {
        if (gameState.turn >= gameState.playerCount) {
            return false
        }
        return true
    }
}

export default Uno;
